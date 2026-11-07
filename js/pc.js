/* 미끼폰 PC 화면 */
(function () {
  "use strict";
  var MK = window.MK, el = MK.el, btn = MK.btn, iconBtn = MK.iconBtn, avatar = MK.avatar;
  function icon(name, size, app) { return MK.icon(name, size, app, "desktop"); }
  var APPS = { files: "파일 탐색기", browser: "Chrome", mail: "Gmail", chat: "카카오톡", calendar: "캘린더", gallery: "갤러리", settings: "설정" };
  var FILE_ICON = { pdf: "file", doc: "file", img: "photos", zip: "zip", exe: "exe", lnk: "file" };
  var screenEl, deskEl, toastEl, P;

  var UI = MK.UI.pc = {};

  UI.mount = function () {
    P = { app: null, max: false, windowPositions: {}, replyTo: null, chatTab: "chats", chatUnread: false, chatMenu: false, galleryFilter: "all", chatScroll: {}, sel: { mail: null, chat: null }, folder: "다운로드", zip: null,
      browser: { page: null, item: null, stack: [], clickfix: null, done: {}, dl: null, shopTab: "home", companyTab: "home" },
      files: MK.D.FILES["다운로드"].map(function (f) { return { name: f.name, type: f.type }; }),
      modal: null, popup: null, notifs: [], center: false, start: false, dnd: false };
    deskEl = el("div", { cls: "desk" });
    toastEl = el("div", { cls: "toasts", attrs: { "aria-live": "polite" } });
    screenEl = el("div", { cls: "pc-screen" }, deskEl, toastEl);
    MK.root.replaceChildren(el("div", { cls: "pc" }, screenEl, el("div", { cls: "pc-chin", attrs: { "aria-hidden": "true" } })));
    lock();
  };

  function lock() {
    var d = new Date();
    var v = el("div", { cls: "pc-lock" },
      el("div", { cls: "lock-time", text: MK.clockText() }),
      el("div", { cls: "lock-date", text: (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + "일월화수목금토"[d.getDay()] + "요일" }),
      el("div", { cls: "pc-user" }, avatar("김하늘", true, "big"), el("div", { cls: "name", text: "김하늘" }), el("div", { cls: "soft", text: "영업팀" })),
      btn("btn lockbtn", "로그인", function () { MK.begin(); render(true); }, "start"),
      el("span", { cls: "sim-badge", text: "시뮬레이션" }));
    deskEl.replaceChildren(v);
    MK.focusView(v);
  }

  // ---------- 엔진 연결 ----------
  UI.onDeliver = function (it) {
    if (it.channel === "popup") {
      P.popup = { item: it, stage: 0 };
      MK.markOpened(it);
      render(true);
      return;
    }
    if (it.channel === "page") return;
    var th = it.thread ? MK.D.THREADS[it.thread] : null;
    var app = th ? th.app : "system";
    var n = { id: it.id, app: app, title: th ? th.name : it.source, text: it.subject || MK.cleanText(it.body) };
    P.notifs.unshift(n);
    toast(n, it);
    if (!P.modal && !P.popup) render();
  };
  UI.render = function () { render(); };
  UI.blocksResultPrompt = function () { return !!P.popup; };
  UI.browserBack = function () {
    if (P.popup) P.popup = null;
    else if (P.modal) P.modal = null;
    else if (P.center || P.start) { P.center = false; P.start = false; }
    else if (P.app === "browser" && P.browser.stack.length) {
      var prev = P.browser.stack.pop(); P.browser.page = prev.page; P.browser.item = prev.item;
      P.browser.clickfix = null; P.browser.dl = null;
    } else if (P.app) P.app = null;
    else return false;
    render(true); return true;
  };
  UI.refreshThread = function (id) { if (P.sel.mail === id || P.sel.chat === id) render(); };

  function toast(n, it) {
    if (P.dnd) return;
    var appIcon = n.app === "system" ? el("span", { cls: "bicon app-settings" }, icon(it.source === "캘린더" ? "calendar" : "shield", 14)) : el("span", { cls: "bicon app-" + n.app }, icon(n.app, 14, true));
    var card = el("div", { cls: "toast-card" });
    var head = el("button", { cls: "toast-body", attrs: { "data-act": "toast" }, onClick: function () { card.remove(); openNotif(n); } },
      el("span", { cls: "bhead" }, appIcon, el("span", { text: n.app === "system" ? it.source : APPS[n.app] }), el("span", { cls: "bwhen", text: "지금" })),
      el("span", { cls: "who", text: n.title }), el("span", { cls: "peek", text: n.text }));
    card.appendChild(head);
    if (it.actions) {
      var row = el("div", { cls: "toast-acts" });
      it.actions.forEach(function (a) { row.appendChild(btn("mini", a.label, function () { card.remove(); notificationAction(it, a); }, "toast-act")); });
      card.appendChild(row);
    }
    toastEl.appendChild(card);
    while (toastEl.children.length > 3) toastEl.firstChild.remove();
    setTimeout(function () { if (card.parentNode) card.remove(); }, MK.CONFIG.BANNER_MS + 1500);
  }
  function openNotif(n) {
    var it = MK.ITEM[n.id];
    P.center = false;
    if (n.app === "mail" || n.app === "chat") { P.app = n.app; P.sel[n.app] = it.thread; }
    else { MK.markOpened(it); if (it.id === "Lp4") P.app = "settings"; else if (it.id === "Lp7") P.app = "calendar"; }
    render(true);
  }
  function notificationAction(it, action) {
    MK.markOpened(it);
    if (action.open) { openApp(action.open); return; }
    render(true);
  }

  // ---------- 그리기 ----------
  function render(moved) {
    if (!MK.S || MK.S.ended || !MK.S.running) return;
    if (P.dragging) { P.redrawAfterDrag = true; return; }
    var kids = [desktop()];
    if (P.app) kids.push(windowView());
    if (P.start) kids.push(startMenu());
    if (P.center) kids.push(centerPanel());
    kids.push(taskbar());
    if (P.modal) kids.push(modalView());
    if (P.popup) kids.push(popupView());
    deskEl.replaceChildren.apply(deskEl, kids);
    if (moved) {
      var focusTarget = deskEl.querySelector(".scam-popup") || deskEl.querySelector(".modal, .win") || deskEl;
      MK.focusView(focusTarget);
    }
  }
  function openApp(a) { P.app = a; P.start = false; P.center = false; render(true); }

  function desktop() {
    var S = MK.S;
    var icons = el("div", { cls: "desk-icons" });
    [["gallery", "갤러리", "gallery"], ["files", "내 PC", "folder"], ["browser", "Chrome", "browser"], ["mail", "Gmail", "mail"], ["chat", "카카오톡", "chat"], ["trash", "휴지통", "trash"]].forEach(function (d) {
      icons.appendChild(el("button", { cls: "desk-icon", attrs: { "data-act": "desk-" + d[0] }, onClick: function () {
        if (d[0] === "trash") { P.folder = "휴지통"; openApp("files"); } else openApp(d[0]);
      } }, el("i", { cls: "app-" + (d[0] === "trash" ? "settings" : d[0]) }, icon(d[2], 38, true)), el("span", { text: d[1] })));
    });
    icons.appendChild(el("button", { cls: "desk-icon", attrs: { "data-act": "desk-doc" }, onClick: function () { P.modal = { kind: "view", file: { name: "주간보고_11월2주.docx", type: "doc" } }; render(true); } },
      el("i", { cls: "app-doc" }, icon("file", 34, true)), el("span", { text: "주간보고_11월2주" })));
    var memo = el("div", { cls: "memo pcmemo" }, el("div", { cls: "memo-h", text: "오늘 할 일" }));
    MK.visibleTasks().forEach(function (t) {
      memo.appendChild(el("div", { cls: "task" + (S.tasks[t.id] ? " done" : "") }, el("span", { cls: "box", attrs: { "aria-hidden": "true" } }), el("span", { text: t.text })));
    });
    return el("div", { cls: "desktop" }, icons, memo);
  }

  function taskbar() {
    var bar = el("div", { cls: "taskbar" });
    bar.appendChild(iconBtn("tb-start", "start", "시작", function () { P.start = !P.start; P.center = false; render(); }, "start-menu", 20));
    var mid = el("div", { cls: "tb-apps" });
    ["files", "browser", "mail", "chat", "gallery", "calendar", "settings"].forEach(function (a) {
      var n = (a === "mail" || a === "chat") ? MK.unreadIn(a) : 0;
      mid.appendChild(el("button", { cls: "tb-app" + (P.app === a ? " on" : ""), attrs: { "data-act": "tb-" + a, "aria-label": APPS[a] + (n ? ", 읽지 않음 " + n : ""), title: APPS[a] }, onClick: function () { openApp(a); } },
        el("i", { cls: "app-" + a }, icon(a === "files" ? "folder" : a, 25, true)), n ? el("b", { cls: "badge", text: String(n) }) : null));
    });
    bar.appendChild(mid);
    var unreadN = P.notifs.filter(function (n) { return MK.S.unread[n.id]; }).length;
    var d = new Date();
    bar.appendChild(el("div", { cls: "tray" },
      el("span", { cls: "sim-badge", text: "시뮬레이션" }),
      el("button", { cls: "tray-bell", attrs: { "data-act": "bell", "aria-label": "알림 " + unreadN }, onClick: function () { P.center = !P.center; P.start = false; render(); } },
        icon("bell", 16), unreadN ? el("b", { cls: "badge", text: String(unreadN) }) : null),
      el("span", { cls: "tray-time" }, el("span", { text: MK.clockText() }), el("span", { text: (d.getMonth() + 1) + "/" + d.getDate() }))));
    return bar;
  }
  function startMenu() {
    var m = el("div", { cls: "startmenu" }, el("div", { cls: "sm-h", text: "앱" }));
    Object.keys(APPS).forEach(function (a) {
      m.appendChild(el("button", { cls: "sm-app", onClick: function () { openApp(a); } }, el("i", { cls: "app-" + a }, icon(a === "files" ? "folder" : a, 25, true)), el("span", { text: APPS[a] })));
    });
    m.appendChild(el("div", { cls: "sm-user" }, avatar("김하늘", true), el("span", { text: "김하늘" })));
    return m;
  }
  function centerPanel() {
    var c = el("div", { cls: "center" }, el("div", { cls: "sm-h", text: "알림" }));
    if (!P.notifs.length) c.appendChild(el("p", { cls: "soft small", text: "새 알림이 없어요" }));
    P.notifs.forEach(function (n) {
      var it = MK.ITEM[n.id];
      var row = el("div", { cls: "center-row" + (MK.S.unread[n.id] ? " unread" : "") },
        el("button", { cls: "toast-body", onClick: function () { openNotif(n); } },
          el("span", { cls: "bhead" }, el("span", { text: n.app === "system" ? it.source : APPS[n.app] })), el("span", { cls: "who", text: n.title }), el("span", { cls: "peek", text: n.text })));
      if (it.actions && MK.S.unread[n.id]) {
        var acts = el("div", { cls: "toast-acts" });
        it.actions.forEach(function (a) { acts.appendChild(btn("mini", a.label, function () { notificationAction(it, a); }, "toast-act")); });
        row.appendChild(acts);
      }
      c.appendChild(row);
    });
    return c;
  }

  // ---------- 창 ----------
  function windowView() {
    var a = P.app;
    var body = a === "mail" ? mailView() : a === "chat" ? chatView() : a === "browser" ? browserView() : a === "files" ? filesView() : a === "calendar" ? calendarView() : a === "gallery" ? galleryView() : settingsView();
    var title = el("div", { cls: "win-title" }, el("i", { cls: "app-" + a }, icon(a === "files" ? "folder" : a, 18, true)), el("span", { text: APPS[a] }),
      el("span", { cls: "win-ctrls" },
        iconBtn("win-btn", "minimize", "최소화", function () { P.app = null; render(true); }, "minimize", 16),
        iconBtn("win-btn", P.max ? "restore" : "maximize", P.max ? "이전 크기로" : "최대화", function () { P.max = !P.max; render(); }, "maximize", 16),
        iconBtn("win-btn win-close", "close", "닫기", function () { P.app = null; render(true); }, "close", 16)));
    title.addEventListener("dblclick", function (event) {
      if (!event.target.closest("button")) { P.max = !P.max; render(); }
    });
    var win = el("section", { cls: "win win-" + a + (P.max ? " max" : ""), attrs: { "aria-label": APPS[a] } }, title, body);
    if (!P.max) enableWindowMove(win, title, a);
    return win;
  }

  function enableWindowMove(win, title, app) {
    var position = P.windowPositions[app] || { x: 0, y: 0 };
    function applyPosition() {
      win.style.setProperty("--win-x", position.x + "px");
      win.style.setProperty("--win-y", position.y + "px");
    }
    if (P.windowPositions[app]) applyPosition();
    var drag;
    title.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 || !event.isPrimary || event.target.closest("button") ||
          !window.matchMedia("(min-width: 821px) and (pointer: fine)").matches) return;
      var rect = win.getBoundingClientRect();
      var desk = deskEl.getBoundingClientRect();
      drag = {
        id: event.pointerId, x: event.clientX, y: event.clientY,
        offsetX: rect.left - desk.left - win.offsetLeft,
        offsetY: rect.top - desk.top - win.offsetTop,
        minX: desk.left - rect.left, maxX: desk.right - rect.right,
        minY: desk.top - rect.top, maxY: deskEl.querySelector(".taskbar").getBoundingClientRect().top - rect.bottom
      };
      title.setPointerCapture(drag.id);
      P.dragging = true;
    });
    title.addEventListener("pointermove", function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      position.x = drag.offsetX + Math.max(drag.minX, Math.min(drag.maxX, event.clientX - drag.x));
      position.y = drag.offsetY + Math.max(drag.minY, Math.min(drag.maxY, event.clientY - drag.y));
      P.windowPositions[app] = position;
      applyPosition();
    });
    title.addEventListener("lostpointercapture", function () {
      drag = null;
      P.dragging = false;
      if (P.redrawAfterDrag) { P.redrawAfterDrag = false; render(); }
    });
  }

  // 메일
  function mailView() {
    if(P.sel.mail && !MK.S.deletedThreads[P.sel.mail]) MK.threadItems(P.sel.mail).forEach(MK.markOpened);
    var list = el("div", { cls: "pane-list" }, el("div", { cls: "inbox-title", text: "받은 편지함" }));
    MK.threadsOf("mail").forEach(function (id) {
      var th = MK.D.THREADS[id], last = MK.threadLast(id), un = MK.threadUnread(id);
      list.appendChild(el("button", { cls: "mrow" + (P.sel.mail === id ? " sel" : "") + (un ? " unread" : ""), attrs: { "data-act": "open-" + id }, onClick: function () { P.sel.mail = id; render(); } },
        el("span", { cls: "mfrom", text: th.name }), el("span", { cls: "mwhen", text: last.when }), el("span", { cls: "msub", text: last.text })));
    });
    return el("div", { cls: "panes" }, list, P.sel.mail && MK.D.THREADS[P.sel.mail] && !MK.S.deletedThreads[P.sel.mail] ? mailRead(P.sel.mail) : el("div", { cls: "pane-read empty", text: "메일을 선택하세요" }));
  }
  function mailRead(id) {
    var th = MK.D.THREADS[id], items = MK.threadItems(id);
    items.forEach(function (it) { MK.markOpened(it); });
    var r = el("div", { cls: "pane-read" });
    r.appendChild(el("div", { cls: "read-head" },
      avatar(th.name, th.saved),
      el("div", { cls: "rh-text" }, el("div", { cls: "rt", text: th.name }), el("div", { cls: "addr", text: "<" + th.from + ">" })),
      btn("mini", "삭제", function () { MK.removeThread(id); P.sel.mail = null; render(); }, "delete"),
      btn("mini", "스팸 신고", function () { MK.removeThread(id); P.sel.mail = null; render(); }, "report")));
    var c = el("div", { cls: "read-body" });
    r.appendChild(el("div", { cls: "mail-context", text: "받는 사람: 김하늘 <haneul@company.example>" }));
    th.history.forEach(function (h) { c.appendChild(el("div", { cls: "mailcard old" }, el("div", { cls: "when", text: h.when }), el("div", { cls: "subject", text: h.subject }), el("p", { text: h.text }))); });
    (MK.S.timeline[id] || []).forEach(function (entry) {
      if (!entry.item) {
        c.appendChild(el("div", { cls: "mailcard" + (entry.me ? " mine" : "") },
          el("div", { cls: "when", text: entry.me ? "나 → " + th.name : th.name + " → 나" }), el("p", { text: entry.text })));
        return;
      }
      var it = MK.ITEM[entry.item];
      var card = el("div", { cls: "mailcard" }, el("div", { cls: "when", text: "오늘" }), el("div", { cls: "subject", text: it.subject }), el("p", { text: it.body }));
      (it.attachments || []).forEach(function (f) { card.appendChild(attachChip(f, it)); });
      if (it.link) card.appendChild(btn("fakebutton", it.link.text, function () { openLink(it); }, "link"));
      if (it.replies && MK.S.st[it.id].stage < it.replies.length) card.appendChild(btn("mail-reply-target", "이 메일에 답장", function () { P.replyTo = it.id; render(); }, "reply-to-" + it.id));
      c.appendChild(card);
    });
    r.appendChild(c);
    setTimeout(function () { c.scrollTop = c.scrollHeight; }, 0);
    r.appendChild(chipsBar(id, "답장", P.replyTo && MK.ITEM[P.replyTo].thread === id ? P.replyTo : null));
    return r;
  }
  function attachChip(f, it) {
    var file = { name: f.name, type: f.type, item: it.id, inner: f.inner, task: f.task, taskStep: f.taskStep };
    var open = function () { MK.enter(it); openFile(file); };
    return el("div", { cls: "attach" },
      el("button", { cls: "attach-main", attrs: { "aria-label": f.name + " 열기" }, onClick: open },
        el("i", { cls: "ficon f-" + f.type }, icon(FILE_ICON[f.type], 18)), el("span", { cls: "fname", text: f.name })),
      btn("mini", "열기", open, "att-open"),
      iconBtn("mini icononly", "download", "저장", function () { MK.enter(it); saveFile(file); }, "att-save", 16));
  }
  function chipsBar(id, placeholder, replyItemId) {
    var bar = el("div", { cls: "chips-bar" });
    if (replyItemId && MK.S.st[replyItemId].stage >= MK.ITEM[replyItemId].replies.length) { P.replyTo = null; replyItemId = null; }
    var chips = MK.replyChips(id, replyItemId);
    if (replyItemId) bar.appendChild(el("p", { cls: "reply-target-label", text: "답장 대상: " + MK.ITEM[replyItemId].subject }));
    chips.forEach(function (ch) { bar.appendChild(btn("chipbtn", ch.label, ch.run, ch.act)); });
    if (!chips.length) bar.appendChild(el("span", { cls: "soft small", attrs: { role: "status" }, text: MK.S.pending[id] ? "답장을 기다리는 중…" : "보낼 답장이 없습니다" }));
    return bar;
  }

  // 메신저
  function chatView() {
    if(P.chatTab === "chats" && P.sel.chat && !MK.S.deletedThreads[P.sel.chat]) MK.threadItems(P.sel.chat).forEach(MK.markOpened);
    var rail = el("nav", { cls: "pc-chat-rail", attrs: { "aria-label": "카카오톡 탐색" } });
    [["person", "친구", "friends"], ["chat", "채팅", "chats"], ["more", "더보기", "more"]].forEach(function (tab) {
      rail.appendChild(iconBtn("pc-chat-rail-button" + (P.chatTab === tab[2] ? " active" : ""), tab[0], tab[1], function () { P.chatTab = tab[2]; P.chatUnread = false; P.chatMenu = false; render(); }, "chat-tab-" + tab[2], 22));
    });
    var list = el("div", { cls: "pc-chat-list" });
    list.appendChild(el("header", { cls: "pc-chat-list-header" }, el("strong", { text: P.chatTab === "friends" ? "친구" : P.chatTab === "more" ? "더보기" : "채팅" }),
      iconBtn("navbtn", "search", P.chatUnread ? "전체 대화 보기" : "안 읽은 대화 모아보기", function () { P.chatUnread = !P.chatUnread; P.chatTab = "chats"; render(); }, "chat-filter", 17)));
    if (P.chatTab === "chats" && P.chatUnread) list.appendChild(el("p", { cls: "pc-chat-filter-label", text: "안 읽은 대화" }));
    if (P.chatTab === "more") {
      list.appendChild(el("div", { cls: "pc-chat-profile" }, avatar("김하늘", true), el("strong", { text: "김하늘" }), el("small", { text: "haneul@company.example" })));
      list.appendChild(btn("pc-chat-setting", "알림 설정", function () { openApp("settings"); }));
    } else {
      MK.threadsOf("chat").filter(function (id) { return (P.chatTab !== "friends" || (MK.D.THREADS[id].saved && MK.D.THREADS[id].name.indexOf("(")<0)) && (P.chatTab !== "chats" || !P.chatUnread || MK.threadUnread(id)); }).forEach(function (id) {
        var th = MK.D.THREADS[id], last = MK.threadLast(id), un = MK.threadUnread(id);
        list.appendChild(el("button", { cls: "pc-chat-row" + (P.chatTab === "chats" && P.sel.chat === id ? " selected" : ""), attrs: { "data-act": "open-" + id }, onClick: function () { P.sel.chat = id; P.chatMenu = false; P.chatTab = "chats"; render(); } },
          avatar(th.name, th.saved), el("span", { cls: "pc-chat-row-text" }, el("strong", { text: th.name }), P.chatTab === "chats" ? el("small", { text: last.text }) : null),
          P.chatTab === "chats" ? el("span", { cls: "pc-chat-row-meta" }, el("small", { text: last.when }), un ? el("b", { text: "1" }) : null) : null));
      });
    }
    if(P.chatTab !== "chats") return el("div", {cls:"pc-chat-shell list-only"},rail,list);
    var read = P.sel.chat && !MK.S.deletedThreads[P.sel.chat] ? chatRead(P.sel.chat) : el("div", { cls: "pc-chat-empty", attrs:{"aria-label":"선택한 대화 없음"} });
    return el("div", { cls: "pc-chat-shell" }, rail, list, read);
  }
  function chatRead(id) {
    var th = MK.D.THREADS[id], items = MK.threadItems(id);
    items.forEach(function (it) { MK.markOpened(it); });
    var r = el("div", { cls: "pane-read pc-chat-read" });
    r.appendChild(el("header", { cls: "pc-chat-header" }, avatar(th.name, th.saved), el("strong", { text: th.name }),
      iconBtn("navbtn", "menu", "대화방 메뉴", function () { P.chatMenu = !P.chatMenu; render(); }, "pc-chat-menu", 19)));
    if (P.chatMenu) r.appendChild(el("div", { cls: "pc-chat-menu" }, el("span", { text: th.saved ? "기존 연락처" : "등록되지 않은 연락처" }),
      btn("mini", "차단", function () { MK.removeThread(id); P.sel.chat = null; render(); }, "report"), btn("mini", "대화 나가기", function () { MK.removeThread(id); P.sel.chat = null; render(); }, "delete")));
    var c = el("div", { cls: "read-body chat pc-chat-messages" });
    function message(text, me, when, attachment) {
      var content = el("div", { cls: "pc-message-content" }, el("div", { cls: "bubble" + (me ? " me" : ""), text: text }));
      if (attachment) content.appendChild(attachment);
      c.appendChild(el("div", { cls: "pc-message-row" + (me ? " outgoing" : "") }, !me ? avatar(th.name, th.saved) : null, content, el("small", { cls: "pc-message-time", text: when || "오후 2:12" })));
    }
    var lastWhen = null;
    th.history.forEach(function (h) { if (h.when !== lastWhen) { c.appendChild(el("div", { cls: "daysep", text: h.when })); lastWhen = h.when; } message(h.text, h.me, h.time); });
    if (items.length) c.appendChild(el("div", { cls: "daysep", text: "오늘" }));
    (MK.S.timeline[id] || []).forEach(function (entry) {
      if (!entry.item) { message(entry.text, entry.me, entry.when); return; }
      var it = MK.ITEM[entry.item], attachment = null;
      if (it.photo) attachment = el("img", { cls: "pc-chat-photo", attrs: { src: it.photoSrc || "assets/photos/mountain.jpg", alt: it.photo } });
      if (it.link) attachment = btn("pc-chat-link", it.link.text, function () { openLink(it); }, "link");
      message(it.body, false, entry.when, attachment);
    });
    r.appendChild(c);
    var previous = P.chatScroll[id], count = (MK.S.timeline[id] || []).length;
    c.addEventListener("scroll", function () { P.chatScroll[id] = { top:c.scrollTop, nearEnd:c.scrollHeight-c.clientHeight-c.scrollTop<55, count:count }; });
    setTimeout(function () { c.scrollTop = !previous || (previous.count!==count && previous.nearEnd) ? c.scrollHeight : previous.top; }, 0);
    var chips = MK.replyChips(id), composer = el("div",{cls:"pc-chat-composer"});
    chips.forEach(function(chip){composer.appendChild(btn("pc-chat-reply",chip.label,chip.run,chip.act));});
    if(!chips.length) composer.appendChild(el("span",{cls:"pc-chat-placeholder",text:MK.S.pending[id]?"답장을 기다리는 중":"메시지 입력"}));
    r.appendChild(composer); return r;
  }

  // 브라우저
  function openLink(it) {
    MK.enter(it);
    P.browser.stack = [];
    P.browser.page = it.link.page; P.browser.item = it.id; P.browser.clickfix = null; P.browser.dl = null;
    openApp("browser");
  }
  function nav(page, item) {
    if (P.browser.page) P.browser.stack.push({ page: P.browser.page, item: P.browser.item });
    P.browser.page = page; P.browser.item = item || null; P.browser.clickfix = null; P.browser.dl = null;
    render();
  }
  function browserView() {
    var B = P.browser;
    var bm = el("div", { cls: "bookmarks" });
    MK.D.BOOKMARKS.forEach(function (b) { bm.appendChild(btn("bm", b.name, function () { nav(b.page, null); }, "bm")); });
    bm.appendChild(btn("bm", "네이버 블로그", function () { nav("social_blog", null); }, "bm-blog"));
    var p = B.page ? MK.D.PAGES[B.page] : null;
    var bar = el("div", { cls: "br-bar" },
      iconBtn("navbtn", "back", "뒤로", function () { var prev = B.stack.pop(); if (prev) { B.page = prev.page; B.item = prev.item; B.clickfix = null; B.dl = null; render(); } }, "back", 18),
      el("div", { cls: "br-url" }, p && p.secure ? icon("lock", 12) : null, el("span", { text: p ? p.url : (B.page === "social_blog" ? "blog.naver.example/haneul" : "새 탭") })));
    var content = el("div", { cls: "br-page" });
    if (B.page === "pc_moamall") {
      content.classList.add("br-rich");
      content.appendChild(MK.shopView({surface:"pc",tab:B.shopTab||"home",onNavigate:function(tab){B.shopTab=tab;render();},onVisit:function(tab){if(tab==="notice-detail:security")MK.verify("moamall_notice_pc");}}));
    } else if (B.page === "pc_partner") {
      content.classList.add("br-rich");
      content.appendChild(MK.companyView({tab:B.companyTab||"home",onNavigate:function(tab){B.companyTab=tab;render();},onDownload:function(){pageAction(p,p.actions[0],null);},onContact:function(){pageAction(p,p.actions[1],null);}}));
      if(B.clickfix)content.appendChild(clickfixView());
    } else if (B.page === "social_blog") {
      content.appendChild(MK.socialView("blog"));
    } else if (!p) {
      content.appendChild(el("div", { cls: "newtab" }, el("div", { cls: "searchbox" }, icon("web", 16), el("span", { text: "검색" })), el("p", { cls: "soft", text: "즐겨찾기에서 사이트를 고르세요" })));
    } else {
      if (p.verify) MK.verify(p.verify);
      var it = B.item ? MK.ITEM[B.item] : null;
      var done = B.done[B.page + ":" + (B.item || "")];
      var page = el("div", { cls: "webpage web-" + B.page }, el("h3", { text: p.title }), el("p", { text: done || p.text }));
      if (B.page === "pc_partner") page.appendChild(el("div", { cls: "company-brand", text: "HANBIT / 한빛상사" }));
      if (B.page === "pc_portal_home") {
        page.classList.add("portal-dashboard");
        page.appendChild(el("div",{cls:"portal-welcome"},el("strong",{text:"김하늘님, 안녕하세요"}),el("span",{text:"영업팀 · 이번 주 업무를 확인해 보세요"})));
        var tiles=el("div",{cls:"portal-tiles"});[["남은 연차","8.5일"],["대기 결재","2건"],["오늘 회의","15:00"]].forEach(function(tile){tiles.appendChild(el("div",null,el("small",{text:tile[0]}),el("strong",{text:tile[1]})));});page.appendChild(tiles);
        page.appendChild(el("section",{cls:"portal-board"},el("h4",{text:"사내 소식"}),el("p",{text:"[총무] 2층 회의실 프로젝터 교체 · 다음 주 월요일"}),el("p",{text:"[인사] 11월 교육 신청 접수 안내"}),el("p",{text:"[영업] 4분기 거래처 방문 일정 공유"})));
      }
      if (B.page === "pc_news") {
        page.classList.add("news-page");
        page.appendChild(el("img",{cls:"news-hero",attrs:{src:"assets/photos/mountain.jpg",alt:"주말 여행 풍경"}}));
        [["라이프","속도를 늦추고 걷는 여행, 가벼운 주말 트레킹","일정표를 비워 두고 걷는 여행을 즐기는 사람들. 무리하지 않고 풍경을 즐기는 방법을 소개합니다."],["생활","추워진 날씨, 작은 조명 하나로 달라지는 방","해가 짧아지는 계절, 눈이 편한 작업 공간을 만드는 소소한 방법."],["문화","출근길에 읽기 좋은 짧은 책 세 권","하루 열 쪽을 읽는 습관에서 시작하는 작은 독서 기록."]].forEach(function(article){page.appendChild(el("details",{cls:"news-story"},el("summary",{text:article[0]+" · "+article[1]}),el("p",{text:article[2]})));});
      }
      if (!done) p.actions.forEach(function (a) {
        page.appendChild(btn("btn webaction", a.label, function () { pageAction(p, a, it); }, a.effect === "exposed" ? "expose" : (a.download ? "download" : (a.clickfix ? "clickfix" : "page-act"))));
      });
      content.appendChild(page);
      if (B.clickfix) content.appendChild(clickfixView());
    }
    var v = el("div", { cls: "browser" }, bar, bm, content);
    if (B.dl) v.appendChild(el("div", { cls: "dlbar" }, el("i", { cls: "ficon f-" + B.dl.type }, icon(FILE_ICON[B.dl.type], 16)), el("span", { text: B.dl.name + " 다운로드 완료" }),
      btn("mini", "열기", function () { openFile(B.dl); }, "dl-open"), btn("mini", "닫기", function () { B.dl = null; render(); })));
    return v;
  }
  function pageAction(p, a, it) {
    var B = P.browser;
    if (a.contact) {
      P.sel.mail = a.contact;
      P.replyTo = null;
      openApp("mail");
      var request = deskEl.querySelector('[data-act="ask-company-profile"]');
      if (request) request.focus();
      return;
    }
    if (a.goto) { if (a.task) MK.doneTask(a.task); nav(a.goto, B.item); return; }
    if (a.clickfix) {
      var p1 = MK.ITEM.P1;
      if (!MK.S.delivered.P1) MK.deliver(p1);
      MK.markOpened(p1);
      B.stack.push({ page: B.page, item: B.item });
      B.page = "pc_partner_download"; B.item = "P1"; B.clickfix = "check"; render(); return;
    }
    if (a.download) {
      var f = { name: a.download.name, type: a.download.type, item: it ? it.id : null };
      if (it) MK.enter(it);
      addFile(f); B.dl = f; render(); return;
    }
    if (a.effect === "exposed" && it) { MK.expose(it); B.done[B.page + ":" + it.id] = "로그인되었습니다. 잠시 후 문서로 이동합니다."; render(); }
  }
  function clickfixView() {
    var B = P.browser, p1 = MK.ITEM.P1;
    var label = B.clickfix === "done" ? "다운로드 중단" : "보안 확인";
    var box = el("div", { cls: "cf-box", attrs: { role: "dialog", "aria-label": label } }, el("div", { cls: "cf-h" }, icon("shield", 18), el("span", { text: label })));
    if (B.clickfix === "check") {
      box.appendChild(el("p", { text: "계속하려면 로봇이 아님을 확인하세요." }));
      box.appendChild(el("button", { cls: "cf-check", attrs: { "data-act": "cf-check" }, onClick: function () { MK.enter(p1); B.clickfix = "steps"; render(); } }, el("span", { cls: "cf-tick" }), el("span", { text: "로봇이 아닙니다" })));
    } else if (B.clickfix === "steps") {
      box.appendChild(el("p", { text: "인증을 마치려면 아래 단계를 따라 하세요." }));
      box.appendChild(el("ol", { cls: "cf-steps" }, el("li", { text: "키보드에서 Win + R 을 누르세요" }), el("li", { text: "Ctrl + V 를 누르세요" }), el("li", { text: "Enter 를 누르세요" })));
      box.appendChild(btn("btn", "안내대로 실행", function () { MK.expose(p1); B.clickfix = "done"; showToastText("Windows 보안 · 알 수 없는 프로그램 실행 감지"); render(); }, "expose"));
    } else {
      box.appendChild(el("strong", { text: "보안 정책 알림" }));
      box.appendChild(el("p", { text: "브라우저에서 시작된 알 수 없는 프로그램 실행이 감지됐습니다. 회사 소개서는 내려받지 않았습니다. IT지원팀에 실행 사실을 알리세요." }));
    }
    box.appendChild(btn("btn ghost", "페이지 나가기", function () { B.clickfix = null; var prev = B.stack.pop(); B.page = prev ? prev.page : null; B.item = prev ? prev.item : null; render(); }, "cf-leave"));
    return el("div", { cls: "cf-overlay" }, box);
  }

  // 파일
  function addFile(f) {
    if (!P.files.some(function (x) { return x.name === f.name; })) P.files.unshift(f);
  }
  function saveFile(f) {
    addFile(f);
    if (f.task) MK.doneTask(f.task);
    var card = el("div", { cls: "toast-card dl-toast", attrs: { role: "status" } },
      el("div", { cls: "dl-head" }, el("i", { cls: "ficon f-" + f.type }, icon(FILE_ICON[f.type], 18)),
        el("div", null, el("div", { cls: "who", text: "다운로드 완료" }), el("div", { cls: "peek", text: f.name }))),
      el("div", { cls: "toast-acts" },
        btn("mini", "열기", function () { card.remove(); openFile(f); }, "dl-open"),
        btn("mini", "폴더에서 보기", function () { card.remove(); P.folder = "다운로드"; P.zip = null; openApp("files"); }, "dl-folder")));
    toastEl.appendChild(card);
    while (toastEl.children.length > 3) toastEl.firstChild.remove();
    setTimeout(function () { if (card.parentNode) card.remove(); }, 6000);
    render();
  }
  function showToastText(text) {
    var card = el("div", { cls: "toast-card mini-toast", text: text, attrs: { role: "status" } });
    toastEl.appendChild(card);
    setTimeout(function () { if (card.parentNode) card.remove(); }, 1800);
  }
  function openFile(f) {
    if (f.type === "zip") { addFile(f); P.zip = f; P.folder = "다운로드"; openApp("files"); return; }
    if (f.type === "exe" || f.type === "lnk") { P.modal = { kind: "run", file: f }; render(true); return; }
    if (f.item) MK.handle(MK.ITEM[f.item]);
    if (f.task) MK.doneTask(f.task);
    if (f.taskStep) MK.taskStep(f.taskStep);
    P.modal = { kind: "view", file: f };
    render(true);
  }
  function filesView() {
    var side = el("div", { cls: "pane-list folders" });
    ["다운로드", "문서", "사진", "휴지통"].forEach(function (fd) {
      side.appendChild(el("button", { cls: "mrow" + (P.folder === fd ? " sel" : ""), attrs: { "data-act": "folder-" + fd }, onClick: function () { P.folder = fd; P.zip = null; render(); } },
        el("i", { cls: "ficon" }, icon(fd === "휴지통" ? "trash" : "folder", 16)), el("span", { cls: "mfrom", text: fd })));
    });
    var main = el("div", { cls: "pane-read" });
    var files;
    if (P.zip) {
      main.appendChild(el("div", { cls: "read-head" }, iconBtn("navbtn", "back", "뒤로", function () { P.zip = null; render(); }, "back", 18), el("div", { cls: "rh-text" }, el("div", { cls: "rt", text: P.zip.name }), el("div", { cls: "addr", text: "압축 파일" }))));
      files = (P.zip.inner || []).map(function (f) { return { name: f.name, type: f.type, item: P.zip.item }; });
    } else {
      main.appendChild(el("div", { cls: "read-head" }, el("div", { cls: "rh-text" }, el("div", { cls: "rt", text: P.folder }))));
      files = P.folder === "다운로드" ? P.files : (MK.D.FILES[P.folder] || []);
    }
    var list = el("div", { cls: "filelist" });
    if (!files.length) list.appendChild(el("p", { cls: "soft small", text: "비어 있어요" }));
    files.forEach(function (f) {
      list.appendChild(el("button", { cls: "frow", attrs: { "data-act": "file-" + f.type }, onClick: function () { openFile(f); } },
        el("i", { cls: "ficon f-" + f.type }, icon(FILE_ICON[f.type] || "file", 18)), el("span", { cls: "fname", text: f.name }), el("span", { cls: "ftype", text: f.type.toUpperCase() })));
    });
    main.appendChild(list);
    return el("div", { cls: "panes" }, side, main);
  }

  function calendarView() {
    var c = el("div", { cls: "cal" }, el("div", { cls: "rt", text: "오늘 일정" }));
    [["10:00", "팀 스탠드업", true], ["12:00", "점심", false], ["15:00", "주간 회의 · 2번 회의실", false], ["17:30", "거래처 견적 회신 마감", false]].forEach(function (e) {
      c.appendChild(el("div", { cls: "calrow" + (e[2] ? " past" : "") }, el("span", { cls: "ctime", text: e[0] }), el("span", { text: e[1] })));
    });
    c.appendChild(btn("btn small", MK.S.tasks.t4 ? "회의 장소 확인 완료" : "주간 회의 장소 확인", function () { MK.doneTask("t4"); render(); }, "calendar-confirm"));
    return c;
  }
  function galleryView() {
    var items=[{name:"워크숍 단체사진",src:"assets/photos/friends.jpg",album:"work"},{name:"프로젝트 회의",src:"assets/photos/team.jpg",album:"work"},{name:"바닷가 산책",src:"assets/photos/sea.jpg",album:"daily"},{name:"고양이 발견",src:"assets/photos/cat.jpg",album:"daily"},{name:"여행 때 찍은 산",src:"assets/photos/mountain.jpg",album:"daily"},{name:"회사 앞 카페",src:"assets/photos/cafe.jpg",album:"daily"}];
    var view=el("div",{cls:"pc-gallery"},el("header",null,el("h2",{text:"갤러리"}),el("span",{text:"사진과 앨범"})));
    var filters=el("nav",{cls:"pc-gallery-filters"});[["all","모든 사진"],["work","업무"],["daily","일상"]].forEach(function(tab){filters.appendChild(btn(P.galleryFilter===tab[0]?"active":"",tab[1],function(){P.galleryFilter=tab[0];render();},"gallery-filter-"+tab[0]));});view.appendChild(filters);
    var grid=el("div",{cls:"pc-gallery-grid"});items.filter(function(item){return P.galleryFilter==="all"||item.album===P.galleryFilter;}).forEach(function(item,i){grid.appendChild(el("button",{attrs:{"data-act":"gallery-photo-"+i},onClick:function(){openFile({name:item.name+".jpg",type:"img",src:item.src});}},el("img",{attrs:{src:item.src,alt:item.name,loading:"lazy"}}),el("span",{text:item.name})));});view.appendChild(grid);return view;
  }
  function settingsView() {
    var c = el("div", { cls: "cal" }, el("div", { cls: "rt", text: "설정" }));
    c.appendChild(el("div", { cls: "row static setrow" }, el("span", { cls: "rt", text: "알림 끄기(방해 금지)" }),
      el("button", { cls: "switch" + (P.dnd ? " on" : ""), attrs: { role: "switch", "aria-checked": String(P.dnd), "aria-label": "방해 금지", "data-act": "set-dnd" }, onClick: function () { P.dnd = !P.dnd; render(); } }, el("span"))));
    var up = MK.ITEM.Lp4, ready = MK.S.delivered.Lp4;
    c.appendChild(el("div", { cls: "row static setrow" }, el("span", { cls: "rt", text: "Windows 업데이트" }),
      el("span", { cls: "rs", text: ready ? "보안 업데이트 설치됨 · 재시작 필요" : "재시작이 필요한 업데이트 없음" })));
    if (ready) c.appendChild(MK.S.taskSteps.update_reserved ? el("p", { cls: "soft", text: "오늘 22:00 재시작 예약됨" }) :
      btn("btn small", "오늘 22:00 재시작 예약", function () { MK.markOpened(up); MK.taskStep("update_reserved"); render(); }, "update"));
    c.appendChild(el("div", { cls: "row static setrow" }, el("span", { cls: "rt", text: "기기 이름" }), el("span", { cls: "rs", text: "SALES-PC-07" })));
    return c;
  }

  // ---------- 대화상자 ----------
  function modalView() {
    var m = P.modal, f = m.file, box;
    if (m.kind === "run") {
      box = el("div", { cls: "modal uac", attrs: { role: "dialog", "aria-label": "사용자 계정 컨트롤" } },
        el("div", { cls: "uac-h" }, icon("shield", 18), el("span", { text: "사용자 계정 컨트롤" })),
        el("p", { cls: "uac-q", text: "이 앱이 디바이스를 변경하도록 허용하시겠어요?" }),
        el("div", { cls: "uac-file" }, el("i", { cls: "ficon f-" + f.type }, icon(FILE_ICON[f.type], 22)), el("div", null, el("div", { cls: "rt", text: f.name }), el("div", { cls: "soft small", text: "게시자: 알 수 없음" }))),
        el("div", { cls: "uac-btns" },
          btn("btn", "예", function () { if (f.item) MK.expose(MK.ITEM[f.item]); P.modal = { kind: "msg", text: f.name + " 실행 중…" }; render(); MK.later(1500, function () { P.modal = null; render(); }); }, "run-yes"),
          btn("btn ghost", "아니요", function () { P.modal = null; render(true); }, "run-no")));
    } else if (m.kind === "msg") {
      box = el("div", { cls: "modal", attrs: { role: "status" } }, el("p", { text: m.text }));
    } else {
      box = el("div", { cls: "modal viewer", attrs: { role: "dialog", "aria-label": f.name } },
        el("div", { cls: "win-title" }, el("span", { text: f.name }), iconBtn("win-close", "close", "닫기", function () { P.modal = null; render(true); }, "close", 16)),
        f.type === "img" ? el("img", { cls: "photo big", attrs: { src: f.src || "assets/photos/friends.jpg", alt: f.name } }) : docPage(f));
    }
    return el("div", { cls: "modal-back", onClick: m.kind === "view" ? function (event) {
      if (event.target === event.currentTarget && P.modal === m) { P.modal = null; render(true); }
    } : null }, box);
  }
  function docPage(f) {
    var d = MK.D.DOCS[f.name] || { title: f.name.replace(/\.[a-z]+$/, ""), meta: "", lines: ["내용을 불러왔어요."] };
    var page = el("div", { cls: "docpage" }, el("div", { cls: "doc-title", text: d.title }), d.meta ? el("div", { cls: "doc-meta", text: d.meta }) : null);
    var table = null;
    d.lines.forEach(function (line, i) {
      if (line.indexOf(" | ") >= 0) {
        if (!table) { table = el("table", { cls: "doc-table" }); page.appendChild(table); }
        var tr = el("tr");
        line.split(" | ").forEach(function (cell) { tr.appendChild(el(i === 0 || !table.rows.length ? "th" : "td", { text: cell })); });
        table.appendChild(tr);
      } else { table = null; page.appendChild(el("p", { text: line })); }
    });
    return page;
  }

  function popupView() {
    var it = P.popup.item, pp = it.popup, stage = P.popup.stage;
    var close = function () { P.popup = null; render(true); };
    var box = el("div", { cls: "scam-popup", attrs: { role: "alertdialog", "aria-label": pp.title } },
      el("div", { cls: "sp-bar" }, el("span", { text: "tech-alert.example" }), iconBtn("win-close", "close", "창 닫기", close, "popup-close", 16)),
      el("div", { cls: "sp-body" },
        el("div", { cls: "sp-title" }, icon("shield", 28), el("span", { text: pp.title })),
        el("p", { text: stage === 0 ? pp.text : (stage === 1 ? pp.next : "원격 지원을 연결하고 있습니다…") }),
        stage === 0 ? el("p", { cls: "sp-phone", text: pp.phone }) : null));
    var acts = el("div", { cls: "sp-acts" });
    if (stage === 0) acts.appendChild(btn("btn danger", pp.enter, function () { MK.enter(it); P.popup.stage = 1; render(); }, "popup-enter"));
    if (stage === 1) acts.appendChild(btn("btn danger", pp.expose, function () { MK.expose(it); P.popup.stage = 2; render(); MK.later(1800, close); }, "expose"));
    box.querySelector(".sp-body").appendChild(acts);
    return el("div", { cls: "modal-back dark" }, box);
  }
})();
