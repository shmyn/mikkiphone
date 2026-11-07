/*
 * 미끼폰 공통 엔진 (휴대폰·PC 모드가 함께 쓴다)
 * - 세션 시계, 연락 도착, 행동 기록, 결과 계산·화면, 공유
 * - 화면 그리기는 MK.UI.phone / MK.UI.pc 가 맡는다.
 *
 * 보안 원칙
 * - 화면 글은 textContent로만, SVG는 createElementNS로만 만든다. innerHTML·eval·인라인 이벤트 금지.
 * - 입력칸(input, textarea, form)을 만들지 않는다. 모든 선택은 미리 정한 버튼으로 한다.
 * - 외부로 나가는 요청은 사용자가 누른 X 공유 창 하나뿐이다.
 * - 기록은 메모리에만 있고 저장·전송하지 않는다.
 */
(function () {
  "use strict";

  var MK = window.MK = { UI: {} };
  var COMMON = window.MK_COMMON, SC = window.MK_SCORING, CONFIG = window.MK_CONFIG;
  MK.icon = window.MK_ICON;
  MK.CONFIG = CONFIG;
  MK.DATA = { phone: window.MK_PHONE, pc: window.MK_PC };
  MK.root = document.getElementById("app");

  var LABEL = { safe: "안 물었음", entered: "들어갔다가 멈춤", exposed: "끝까지 감" };
  var OUT_LABEL = { handled: "확인함", ignored: "놓침", blocked: "지우거나 신고함" };

  // ---------- DOM 도우미 ----------
  function el(tag, opts) {
    var node = document.createElement(tag);
    opts = opts || {};
    if (opts.cls) node.className = opts.cls;
    if (opts.text != null) node.textContent = String(opts.text);
    if (opts.attrs) Object.keys(opts.attrs).forEach(function (k) { node.setAttribute(k, opts.attrs[k]); });
    if (opts.onClick) node.addEventListener("click", opts.onClick);
    Array.prototype.slice.call(arguments, 2).forEach(function (k) {
      if (k) node.appendChild(typeof k === "string" ? document.createTextNode(k) : k);
    });
    return node;
  }
  function btn(cls, text, onClick, act) {
    var b = el("button", { cls: cls, text: text, onClick: onClick });
    if (act) b.setAttribute("data-act", act);
    return b;
  }
  function iconBtn(cls, name, label, onClick, act, size) {
    var b = el("button", { cls: cls, attrs: { "aria-label": label, title: label }, onClick: onClick }, MK.icon(name, size || 22));
    if (act) b.setAttribute("data-act", act);
    return b;
  }
  function avatar(name, saved, cls) {
    var photo = saved && MK.WORLD && MK.WORLD.profiles[name];
    if (photo) return el("img", { cls: "avatar avatar-photo" + (cls ? " " + cls : ""), attrs: { src: "assets/photos/" + photo + ".jpg", alt: "", "aria-hidden": "true", loading: "lazy" } });
    return el("span", { cls: "avatar" + (saved ? "" : " unknown") + (cls ? " " + cls : ""), text: saved ? Array.from(name)[0] : "?", attrs: { "aria-hidden": "true" } });
  }
  function clockText() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    return ((h % 12) || 12) + ":" + (m < 10 ? "0" : "") + m;
  }
  function focusView(v) { v.setAttribute("tabindex", "-1"); v.focus({ preventScroll: true }); }
  MK.asset = function (path) { return path; };
  MK.el = el; MK.btn = btn; MK.iconBtn = iconBtn; MK.avatar = avatar; MK.clockText = clockText; MK.focusView = focusView;

  // ---------- 시작 화면 ----------
  MK.home = function () {
    stopTicker();
    MK.S = null;
    document.body.className = "";
    var card = el("section", { cls: "startcard" },
      el("div", { cls: "bobber", attrs: { "aria-hidden": "true" } }),
      el("h1", { cls: "wordmark", text: "미끼폰" }),
      el("p", { cls: "lede", text: "나는 어떻게 낚이는 사람일까" }),
      el("p", { cls: "intro-purpose", text: "일상에서 마주칠 수 있는 피싱 위험에 대한 내 취약점을 진단하는 시뮬레이션" }),
      el("p", { cls: "intro-instruction", text: "평소처럼 일상생활을 수행해보세요" }),
      el("div", { cls: "modes" },
        btn("modebtn", "휴대폰 시작 · 3분", function () { MK.prepare("phone"); }, "mode-phone"),
        btn("modebtn", "PC 시작 · 3분", function () { MK.prepare("pc"); }, "mode-pc")),
      el("p", { cls: "fineprint", text: "가상 대화 · 실제 설치·전송 없음 · 진행 중 언제든 끝내고 결과 확인 가능" }),
      el("p", { cls: "copyright", text: "© 2026 KARGI. All rights reserved." }));
    MK.root.replaceChildren(card);
    focusView(card);
  };

  // ---------- 세션 ----------
  MK.prepare = function (dev) {
    MK.dev = dev;
    MK.D = MK.DATA[dev];
    MK.ui = MK.UI[dev];
    MK.ITEM = {};
    MK.D.ITEMS.forEach(function (it) { MK.ITEM[it.id] = it; });
    var S = MK.S = {
      used: 0, last: performance.now(), ticker: null, running: false,
      delivered: {}, order: [], st: {}, unread: {}, tasks: {}, taskSteps: {}, deletedThreads: {}, askUsed: {}, timeline: {}, pending: {}, sequence: 0,
      route: null, stack: [], ended: false, dnd: false, schedule: {}, visibleTasks: {}, taskOrder: []
    };
    // 모드별 시간표 간격을 보장한다. 폰은 주요 피싱 사이에 일반 연락을 배치한다.
    var gap = MK.D.EVENT_GAP_SEC || 18;
    var lastArrival = -gap;
    MK.D.ITEMS.filter(function (it) { return it.at != null; }).sort(function (a, b) { return a.at - b.at; }).forEach(function (it) {
      lastArrival = Math.max(it.at, lastArrival + gap);
      S.schedule[it.id] = lastArrival * 1000;
    });
    MK.D.ITEMS.forEach(function (it) {
      S.st[it.id] = { opened: false, openedAt: null, arrivedAt: null, result: "safe", risky: false, rtMs: 0,
        verify: false, reported: false, handled: false, blocked: false,
        stage: 0, used: {} };
    });
    MK.revealTasks(0);
    document.body.className = "mode-" + dev;
    MK.ui.mount();
    MK.syncOrientation();
  };
  MK.begin = function () {
    var S = MK.S;
    if (S.running || MK.orientationBlocked()) { MK.syncOrientation(); return; }
    S.running = true;
    S.last = performance.now();
    S.progress = el("progress", { cls: "session-progress", attrs: { max: MK.D.SESSION_END_SEC, value: 0, "aria-label": "시뮬레이션 진행도" } });
    var toolbar = el("div", { cls: "session-toolbar", attrs: { "aria-label": "시뮬레이션 진행" } },
      el("span", { cls: "session-label", text: "진행" }), S.progress, btn("session-finish", "끝내고 결과 보기", MK.finish, "finish"));
    MK.root.replaceChildren.apply(MK.root, [toolbar].concat(Array.prototype.slice.call(MK.root.children)));
    S.ticker = setInterval(tick, 250);
  };
  function stopTicker() { if (MK.S && MK.S.ticker) clearInterval(MK.S.ticker); }

  MK.orientationBlocked = function () {
    return MK.dev === "pc" && !!window.matchMedia && window.matchMedia("(orientation: portrait)").matches &&
      !!(window.matchMedia("(any-pointer: coarse)").matches || navigator.maxTouchPoints > 0 ||
        (navigator.userAgentData && navigator.userAgentData.mobile) || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || ""));
  };
  MK.syncOrientation = function () { document.body.setAttribute("data-pc-portrait", String(MK.orientationBlocked())); };
  if (window.addEventListener) window.addEventListener("resize", MK.syncOrientation);
  MK.now = function () { var S = MK.S; return S.used + (document.hidden || MK.orientationBlocked() ? 0 : performance.now() - S.last); };
  function tick() {
    var S = MK.S, p = performance.now();
    if (!document.hidden && !MK.orientationBlocked()) S.used += p - S.last;
    S.last = p;
    var t = S.used;
    MK.D.ITEMS.forEach(function (it) {
      if (it.at == null || S.delivered[it.id] || S.schedule[it.id] > t) return;
      if (MK.ui.canDeliver && !MK.ui.canDeliver(it)) return;
      MK.deliver(it);
    });
    if (MK.ui.tick) MK.ui.tick(t);
    if (MK.revealTasks(t)) MK.ui.render();
    S.progress.setAttribute("value", Math.min(MK.D.SESSION_END_SEC, t / 1000));
    if (t >= MK.D.SESSION_END_SEC * 1000) MK.finish();
  }
  document.addEventListener("visibilitychange", function () { if (MK.S) MK.S.last = performance.now(); });

  MK.deliver = function (it) {
    var S = MK.S, st = S.st[it.id];
    if (S.delivered[it.id]) return;
    S.delivered[it.id] = true;
    S.order.push(it.id);
    if (it.thread) (S.timeline[it.thread] = S.timeline[it.thread] || []).push({ item: it.id, seq: ++S.sequence, when: clockText() });
    st.arrivedAt = MK.now();
    if (it.thread) delete S.deletedThreads[it.thread];
    if (it.thread || it.channel === "push" || it.channel === "toast") S.unread[it.id] = true;
    MK.ui.onDeliver(it);
    if (MK.revealTasks(MK.now())) MK.ui.render();
  };

  // ---------- 기록 ----------
  MK.markOpened = function (it) {
    var st = MK.S.st[it.id];
    MK.S.unread[it.id] = false;
    if (!st.opened) { st.opened = true; st.openedAt = MK.now(); }
    if (it.kind === "legit" && !st.blocked) st.handled = true;
    if (it.kind === "legit" && it.taskStep) MK.taskStep(it.taskStep);
  };
  MK.enter = function (it, fromMs) {
    var st = MK.S.st[it.id];
    if (it.kind === "legit") { if (!st.blocked) st.handled = true; return; }
    if (it.kind !== "phish") return;
    if (!st.risky) {
      st.risky = true;
      var base = fromMs != null ? fromMs : (st.openedAt != null ? st.openedAt : (st.arrivedAt != null ? st.arrivedAt : MK.now()));
      st.rtMs = Math.max(0, Math.round(MK.now() - base));
    }
    if (st.result === "safe") st.result = "entered";
  };
  MK.expose = function (it) { if (it.kind !== "phish") return; MK.enter(it); MK.S.st[it.id].result = "exposed"; };
  MK.handle = function (it) { if (it.kind === "legit" && !MK.S.st[it.id].blocked) MK.S.st[it.id].handled = true; };
  MK.verify = function (key) {
    MK.D.ITEMS.forEach(function (it) {
      if (it.kind === "phish" && MK.S.delivered[it.id] && it.verifyBy.indexOf(key) >= 0) MK.S.st[it.id].verify = true;
    });
  };
  MK.taskStep = function (key) {
    MK.S.taskSteps[key] = true;
    MK.D.TASKS.forEach(function (task) {
      if (task.requires && task.requires.every(function (step) { return MK.S.taskSteps[step]; })) MK.doneTask(task.id);
    });
  };
  MK.revealTasks = function (time) {
    var changed = false, S = MK.S;
    MK.D.TASKS.forEach(function (task, index) {
      if (S.visibleTasks[task.id] || time < (task.revealAt != null ? task.revealAt : index * 15) * 1000) return;
      if ((task.waitsFor && !S.delivered[task.waitsFor]) || (task.appearsWith && !S.delivered[task.appearsWith])) return;
      S.visibleTasks[task.id] = true;
      S.taskOrder.push(task.id);
      changed = true;
    });
    return changed;
  };
  MK.visibleTasks = function () {
    return MK.S.taskOrder.map(function (id) { return MK.D.TASKS.filter(function (task) { return task.id === id; })[0]; });
  };
  MK.doneTask = function (id) {
    var t = MK.D.TASKS.filter(function (x) { return x.id === id; })[0];
    if (t && (!t.appearsWith || MK.S.delivered[t.appearsWith])) MK.S.tasks[id] = true;
  };

  // ---------- 대화방 ----------
  MK.threadItems = function (id) {
    return MK.S.order.filter(function (iid) { return MK.ITEM[iid].thread === id; }).map(function (iid) { return MK.ITEM[iid]; });
  };
  MK.threadUnread = function (id) {
    return MK.D.ITEMS.some(function (it) { return it.thread === id && MK.S.unread[it.id]; });
  };
  MK.cleanText = function (t) { return String(t).replace(/^\[(Web|국제)발신\]\n/, ""); };
  MK.itemBody = function (it) { return MK.ui.itemBody ? MK.ui.itemBody(it) : it.body; };
  MK.threadLast = function (id) {
    var th = MK.D.THREADS[id], items = MK.threadItems(id);
    var timeline = MK.S.timeline[id] || [], latest = timeline[timeline.length - 1];
    if (items.length) {
      var it = items[items.length - 1], st = MK.S.st[it.id];
      var t = th.app === "mail" ? it.subject : MK.itemBody(it);
      if (latest && !latest.item && th.app !== "mail") t = latest.text;
      return { text: MK.cleanText(t), when: "지금", rank: (latest ? latest.seq : MK.S.order.indexOf(it.id)) + 1000 };
    }
    var h = th.history[th.history.length - 1];
    if (latest && !latest.item) return { text: latest.text, when: "지금", rank: latest ? latest.seq + 1000 : 999 };
    return { text: h ? (h.subject || h.text) : "", when: h ? h.when : "", rank: -Object.keys(MK.D.THREADS).indexOf(id) };
  };
  MK.threadsOf = function (app) {
    return Object.keys(MK.D.THREADS).filter(function (id) {
      var th = MK.D.THREADS[id];
      return th.app === app && !MK.S.deletedThreads[id] && (th.history.length || MK.threadItems(id).length);
    }).sort(function (a, b) { return MK.threadLast(b).rank - MK.threadLast(a).rank; });
  };
  MK.appOf = function (it) { return it.thread ? MK.D.THREADS[it.thread].app : it.app; };
  MK.unreadIn = function (app) {
    var n = 0;
    MK.D.ITEMS.forEach(function (it) { if (MK.S.unread[it.id] && MK.appOf(it) === app) n++; });
    return n;
  };

  // 답장 칩: 연락에 딸린 답장(replies)과 대화방에서 물어볼 수 있는 말(asks)
  MK.choiceAvailable = function (choice) {
    return (!choice.ifArrived || !!MK.S.delivered[choice.ifArrived]) &&
      (!choice.ifOpened || !!(MK.S.delivered[choice.ifOpened] && MK.S.st[choice.ifOpened].opened)) &&
      (!choice.ifAsked || !!MK.S.askUsed[choice.ifAsked]);
  };
  MK.replyChips = function (threadId, replyItemId) {
    var out = [];
    if (MK.S.pending[threadId]) return out;
    var threadItems = MK.threadItems(threadId);
    if (replyItemId) threadItems = threadItems.filter(function (item) { return item.id === replyItemId; });
    else if (MK.D.THREADS[threadId].app === "mail") threadItems = threadItems.slice(-1);
    var items = threadItems.filter(function (it) { return it.replies && MK.S.st[it.id].stage < it.replies.length; });
    var it = items[items.length - 1];
    if (it) {
      var st = MK.S.st[it.id];
      it.replies[st.stage].forEach(function (rp, i) {
        if (!st.used[st.stage + ":" + i] && MK.choiceAvailable(rp)) out.push({ label: rp.label, act: rp.effect === "exposed" ? "reply-expose" : "reply", run: function () { MK.reply(it, rp, i); } });
      });
    }
    if (replyItemId) return out;
    ((MK.D.THREADS[threadId].asks) || []).forEach(function (a, i) {
      if (MK.S.askUsed[threadId + ":" + i]) return;
      if (!MK.choiceAvailable(a)) return;
      out.push({ label: a.label, act: a.verify ? "ask-verify" : "ask", run: function () { MK.ask(threadId, a, i); } });
    });
    return out;
  };
  function responseDelay(reply, index, base) { return reply.delays && reply.delays[index] != null ? reply.delays[index] : base * (index + 1); }
  MK.reply = function (it, rp, i) {
    var st = MK.S.st[it.id];
    if (!MK.S.delivered[it.id] || !MK.choiceAvailable(rp) || MK.S.pending[it.thread] || st.stage >= it.replies.length || st.used[st.stage + ":" + i] || it.replies[st.stage][i] !== rp) return;
    pushLog(it.thread, true, rp.label);
    if (rp.effect === "entered") MK.enter(it);
    else if (rp.effect === "exposed") MK.expose(it);
    else if (rp.effect === "handled") MK.handle(it);
    if (rp.task) MK.doneTask(rp.task);
    if (rp.taskStep) MK.taskStep(rp.taskStep);
    if (rp.effect) st.stage += 1; else st.used[st.stage + ":" + i] = true;
    MK.S.pending[it.thread] = !!(rp.then && rp.then.length);
    MK.ui.render();
    (rp.then || []).forEach(function (line, k) {
      later(responseDelay(rp, k, 900), function () {
        pushLog(it.thread, false, line);
        if (k === rp.then.length - 1) {
          if (rp.deliver) MK.deliver(MK.ITEM[rp.deliver]);
          delete MK.S.pending[it.thread];
        }
        MK.ui.refreshThread(it.thread);
      });
    });
  };
  MK.ask = function (threadId, a, i) {
    if (MK.S.pending[threadId] || MK.S.askUsed[threadId + ":" + i] || !MK.choiceAvailable(a)) return;
    MK.S.askUsed[threadId + ":" + i] = true;
    pushLog(threadId, true, a.label);
    if (a.verify) MK.verify(a.verify);
    MK.S.pending[threadId] = !!((a.then && a.then.length) || a.deliver);
    MK.ui.render();
    (a.then || []).forEach(function (line, k) {
      later(responseDelay(a, k, 1100), function () {
        pushLog(threadId, false, line);
        if (k === a.then.length - 1 && !a.deliver) delete MK.S.pending[threadId];
        MK.ui.refreshThread(threadId);
      });
    });
    var responseEnd = (a.then || []).reduce(function (last, line, k) { return Math.max(last, responseDelay(a, k, 1100)); }, 0);
    if (a.deliver) later(Math.max(2600, responseEnd + 800), function () {
      delete MK.S.pending[threadId]; MK.deliver(MK.ITEM[a.deliver]);
    });
  };
  function pushLog(id, me, text) {
    var message = { me: me, text: text, seq: ++MK.S.sequence, when: clockText() };
    (MK.S.timeline[id] = MK.S.timeline[id] || []).push(message);
  }
  function later(ms, fn) {
    var session = MK.S;
    setTimeout(function () { if (MK.S === session && !session.ended) fn(); }, ms);
  }
  MK.later = later;

  // 대화방 삭제·신고·차단: 방 전체에 적용. 미끼면 '알아봄', 진짜 연락이면 '차단'
  MK.removeThread = function (id) {
    MK.threadItems(id).forEach(function (it) {
      var st = MK.S.st[it.id];
      MK.S.unread[it.id] = false;
      if (it.kind === "phish") st.reported = true;
      else if (it.kind === "legit") { st.blocked = true; st.handled = false; }
    });
    MK.S.deletedThreads[id] = true;
  };

  // ---------- 끝내기와 결과 ----------
  MK.finish = function () {
    var S = MK.S;
    if (!S || S.ended) return;
    stopTicker();
    S.ended = true;
    var recs = [];
    MK.D.ITEMS.forEach(function (it) {
      if (!S.delivered[it.id] || it.kind === "ambient") return;
      var st = S.st[it.id];
      if (it.kind === "phish") {
        var text = (it.subject || "") + (it.body || "");
        if (it.dialog) Object.keys(it.dialog.nodes).forEach(function (k) { text += it.dialog.nodes[k].say.join(""); });
        if (it.popup) text += it.popup.text;
        recs.push({ id: it.id, result: st.result, verify: st.verify, reported: st.reported, risky: st.risky, rtMs: st.rtMs, readMs: SC.readMsFor(text) });
      } else {
        recs.push({ id: it.id, outcome: st.blocked ? "blocked" : (st.handled ? "handled" : "ignored") });
      }
    });
    showResult(recs);
  };

  function showResult(recs) {
    var r = SC.score(recs, { AXES: COMMON.AXES, AXIS_TO_TYPE: COMMON.AXIS_TO_TYPE, ITEMS: MK.D.ITEMS });
    var T = COMMON.TYPES[r.typeKey];
    var shareUrl = buildShareUrl(r.typeKey);
    var phishRecs = recs.filter(function (x) { return MK.ITEM[x.id].kind === "phish"; });
    var legitRecs = recs.filter(function (x) { return MK.ITEM[x.id].kind === "legit"; });
    var modeName = MK.dev === "pc" ? "PC" : "휴대폰";
    var shareText = "미끼폰(" + modeName + ") 결과: " + T.name + "\n" + r.emoji +
      "\n미끼 " + r.phishCount + "개 중 " + r.exposures + "개 물림 · 진짜 연락 " + r.handled + "/" + r.legitCount;
    document.body.className = "";

    var page = el("section", { cls: "resultpage" });
    page.appendChild(el("header", { cls: "r-head" },
      el("p", { cls: "r-mode", text: "미끼폰 · " + modeName + " 결과" }),
      el("h2", { text: T.name }), el("p", { cls: "r-line", text: T.line }),
      el("div", { cls: "result-stats" },
        el("div", null, el("strong", { text: String(r.R) }), el("span", { text: "위험 지수 / 100" })),
        el("div", null, el("strong", { text: r.exposures + "/" + r.phishCount }), el("span", { text: "설치·정보 제공" })),
        el("div", null, el("strong", { text: r.handled + "/" + r.legitCount }), el("span", { text: "진짜 연락 확인" })))));
    page.appendChild(el("p", { cls: "result-takeaway", text: T.tips[0] }));
    var detail = el("details", { cls: "r-detail", attrs: { open: "" } }, el("summary", { text: "내 행동 자세히 보기" }));
    var content = el("div", { cls: "result-detail-content" });
    content.appendChild(el("p", { cls: "r-caption", text: r.badge + " · 의심 연락 직접 확인 " + r.verifies + "회" }));
    var bars = el("div", { cls: "bars" });
    COMMON.AXES.forEach(function (a) {
      var fill = el("span"); fill.style.width = r.S[a] + "%";
      bars.appendChild(el("div", { cls: "barrow" }, el("span", { text: a }), el("div", { cls: "bartrack" }, fill), el("span", { cls: "v", text: String(r.S[a]) })));
    });
    content.appendChild(el("h3", { text: "심리별 반응" })); content.appendChild(bars);
    content.appendChild(el("h3", { text: "미끼와 내 행동" }));
    phishRecs.forEach(function (x) {
      var it = MK.ITEM[x.id];
      content.appendChild(el("div", { cls: "logitem" }, el("span", { cls: "dot " + x.result }),
        el("div", null, el("div", { cls: "lt", text: it.title + " · " + LABEL[x.result] + (x.verify ? " · 직접 확인" : "") }), el("div", { cls: "ls", text: it.redFlags.join(" / ") }))));
    });
    content.appendChild(el("h3", { text: "진짜 연락" }));
    legitRecs.forEach(function (x) {
      content.appendChild(el("div", { cls: "lgitem" }, el("span", { cls: "dot legit-" + x.outcome }), el("span", { text: MK.ITEM[x.id].title }), el("span", { cls: "ls", text: OUT_LABEL[x.outcome] })));
    });
    content.appendChild(el("h3", { text: "기억할 습관" }));
    var tips = el("ul", { cls: "tips" }); T.tips.forEach(function (tip) { tips.appendChild(el("li", { text: tip })); }); content.appendChild(tips);
    var box = el("pre", { cls: "sharebox", text: shareText + (shareUrl ? "\n" + shareUrl : "") });
    content.appendChild(el("h3", { text: "공유할 결과 문구" })); content.appendChild(box);
    detail.appendChild(content); page.appendChild(detail);
    var note = el("p", { cls: "toast", attrs: { role: "status" } });
    page.appendChild(el("div", { cls: "sharebtns" },
      btn("btn", "결과 복사", function () { copy(box.textContent, note); }, "copy"),
      btn("btn ghost", "이미지 저장", function () { saveCard(r, T, phishRecs, note, modeName); }),
      btn("btn ghost", "X에 공유", function () { shareX(shareText, shareUrl); })));
    page.appendChild(note);
    var other = MK.dev === "pc" ? "phone" : "pc";
    page.appendChild(el("div", { cls: "r-foot" },
      btn("btn ghost", "다시 하기", function () { MK.prepare(MK.dev); }, "again"),
      btn("btn ghost", (other === "pc" ? "PC" : "휴대폰") + " 모드", function () { MK.prepare(other); }, "other"),
      el("p", { cls: "fineprint", text: "교육·오락용 자가진단" })));
    MK.root.replaceChildren(page);
    focusView(page);
  }

  // 공유 링크는 정해진 유형 이름 6개 중 하나만 붙인다(사용자 입력이 URL에 섞이지 않음)
  function buildShareUrl(typeKey) {
    if (!Object.prototype.hasOwnProperty.call(COMMON.TYPES, typeKey)) return "";
    if (CONFIG.SITE_URL && /^https:\/\//.test(CONFIG.SITE_URL)) return CONFIG.SITE_URL + "r/" + typeKey + ".html";
    return "";
  }
  function copy(text, t) {
    var fail = function () { t.textContent = "복사 실패 · ‘내 행동 자세히 보기’에서 결과 문구를 선택해 복사"; };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { t.textContent = "복사 완료"; }, fail);
    else fail();
  }
  function shareX(text, url) {
    var q = "text=" + encodeURIComponent(text) + (url ? "&url=" + encodeURIComponent(url) : "");
    window.open("https://x.com/intent/tweet?" + q, "_blank", "noopener,noreferrer");
  }
  // ---------- 결과 카드(캔버스) ----------
  function saveCard(r, T, phishRecs, t, modeName) {
    var W = 1080, c = document.createElement("canvas");
    c.width = W; c.height = W;
    var g = c.getContext("2d");
    var font = "\"Apple SD Gothic Neo\", \"Malgun Gothic\", \"Noto Sans KR\", sans-serif";
    g.fillStyle = "#dbe6ea"; g.fillRect(0, 0, W, W);
    g.fillStyle = "#c6d6dc";
    for (var y = 46; y < W; y += 47) g.fillRect(0, y, W, 1);
    g.save(); g.translate(120, 150);
    g.fillStyle = "#15242c"; g.fillRect(-2, -60, 4, 40);
    g.beginPath(); g.ellipse(0, 20, 34, 48, 0, Math.PI, 0); g.fillStyle = "#e0412b"; g.fill();
    g.beginPath(); g.ellipse(0, 20, 34, 40, 0, 0, Math.PI); g.fillStyle = "#f7f7f2"; g.fill();
    g.restore();
    g.fillStyle = "#15242c"; g.font = "800 44px " + font; g.fillText("미끼폰 · " + modeName, 180, 168);
    g.font = "800 84px " + font; wrap(g, T.name, 96, 360, W - 192, 100);
    g.font = "500 40px " + font; g.fillStyle = "#4b5f69"; g.fillText(T.line, 96, 590);
    var colors = { safe: "#2b8659", entered: "#d6971b", exposed: "#e0412b" };
    phishRecs.forEach(function (x, i) { g.fillStyle = colors[x.result]; roundRect(g, 96 + i * 112, 660, 92, 92, 16); });
    g.fillStyle = "#15242c"; g.font = "700 40px " + font;
    g.fillText("미끼 " + r.phishCount + "개 중 " + r.exposures + "개 물림", 96, 830);
    g.font = "500 36px " + font; g.fillStyle = "#4b5f69";
    g.fillText("진짜 연락 " + r.handled + "/" + r.legitCount + "  ·  " + r.badge, 96, 890);
    c.toBlob(function (blob) {
      if (!blob) { t.textContent = "이미지 생성 실패"; return; }
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "mikkiphone-result.png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      t.textContent = "이미지 저장 완료";
    }, "image/png");
  }
  function wrap(g, text, x, y, maxW, lh) {
    var line = "", lines = [];
    Array.from(text).forEach(function (ch) {
      if (g.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch; } else line += ch;
    });
    lines.push(line);
    lines.forEach(function (l, i) { g.fillText(l, x, y + i * lh); });
  }
  function roundRect(g, x, y, w, h, rad) {
    g.beginPath(); g.moveTo(x + rad, y); g.arcTo(x + w, y, x + w, y + h, rad); g.arcTo(x + w, y + h, x, y + h, rad);
    g.arcTo(x, y + h, x, y, rad); g.arcTo(x, y, x + w, y, rad); g.closePath(); g.fill();
  }
})();
