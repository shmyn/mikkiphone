/* 미끼폰 휴대폰 화면 */
(function () {
  "use strict";
  var MK = window.MK, el = MK.el, btn = MK.btn, iconBtn = MK.iconBtn, avatar = MK.avatar, icon = MK.icon;
  var APPS = {
    phone: "전화", messages: "메시지", talk: "카카오톡", web: "Chrome",
    mail: "Gmail", moamall: "쿠팡", bank: "토스",
    camera: "카메라", photos: "갤러리", map: "네이버 지도", settings: "설정", x: "X", blog: "네이버 블로그"
  };
  var statusEl, hostEl, layerEl, P;

  var UI = MK.UI.phone = {};

  UI.mount = function () {
    P = { call: null, bankAuth: "idle", recent: MK.D.CALL_HISTORY.map(function (c) { return { name: c.name, label: c.label, seen: true }; }),
      photos: MK.D.PHOTOS.map(function (ph) { return Object.assign({}, ph); }), camera: { scene: "workspace", zoom: 1, flash: false, capturing: false }, threadMenu: null, threadLinks: null, threadScroll: {}, place: null, settings: { wifi: true, bt: false, dnd: false } };
    statusEl = el("div", { cls: "status" });
    hostEl = el("div", { cls: "host" });
    layerEl = el("div", { cls: "layer" });
    var frame = el("div", { cls: "phone" }, el("div", { cls: "screen", attrs: { "aria-live": "polite" } }, statusEl, hostEl, layerEl, el("button", { cls: "phone-home-indicator", attrs: { "aria-label": "홈 화면", "data-act": "home" }, onClick: home })));
    MK.root.replaceChildren(frame);
    lockScreen();
  };

  function lockScreen() {
    setStatus();
    var d = new Date();
    var v = el("div", { cls: "view lock" },
      el("div", { cls: "lock-time", text: MK.clockText() }),
      el("div", { cls: "lock-date", text: (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + "일월화수목금토"[d.getDay()] + "요일" }),
      el("div", { cls: "lock-note" }, el("span", { cls: "bicon app-messages" }, icon("messages", 14)), el("span", { text: "오늘 할 일 3개 · 평소처럼 써 주세요" })),
      btn("btn lockbtn", "열기", function () { MK.S.route = { name: "home" }; MK.begin(); render(true); }, "start"));
    hostEl.replaceChildren(v);
    MK.focusView(v);
  }

  function setStatus() {
    var route = MK.S.route || {};
    statusEl.className = "status" + (P.call || route.app === "camera" || (route.app === "photos" && typeof route.tab === "number") ? " dark" : "");
    statusEl.replaceChildren(
      el("span", { cls: "clock", text: MK.clockText() }),
      el("span", { cls: "sim-badge", text: "시뮬레이션" }),
      el("span", { cls: "sys" }, P.settings.dnd ? el("span", { cls: "dnd", text: "방해금지" }) : null, icon("signal", 16), icon("battery", 20)));
  }

  // ---------- 엔진 연결 ----------
  UI.canDeliver = function (it) { return !(it.channel === "call" && P.call); };
  UI.onDeliver = function (it) {
    if (it.channel === "call") { startIncoming(it); return; }
    if (it.channel === "task") {
      MK.S.tasks.t4visible = true;
      banner("메모", "메모", it.body, function () { go({ name: "home" }, true); });
    } else {
      var th = it.thread ? MK.D.THREADS[it.thread] : null;
      var app = th ? th.app : it.app;
      banner(app, it.subject || (th ? th.name : it.sender), MK.cleanText(it.body), function () { openItem(it); });
    }
    var r = MK.S.route && MK.S.route.name;
    if (!P.call && (r === "home" || r === "app" || (r === "thread" && MK.S.route.id === it.thread))) render();
  };
  UI.tick = function (t) { if (P.call) callTick(t); };
  UI.render = function () { render(); };
  UI.refreshThread = function (id) { if (MK.S.route.name === "thread" && MK.S.route.id === id && !P.call) render(); };

  function banner(app, who, text, onOpen) {
    if (P.call || P.settings.dnd) return;
    var appIcon = APPS[app] ? el("span", { cls: "bicon app-" + app }, icon(app, 14, true)) : el("span", { cls: "bicon app-memo" });
    var b = el("button", { cls: "banner", attrs: { "data-act": "banner", "aria-label": (APPS[app] || app) + " 알림 열기" }, onClick: function () { b.remove(); onOpen(); } },
      el("span", { cls: "bhead" }, appIcon, el("span", { text: APPS[app] || app }), el("span", { cls: "bwhen", text: "지금" })),
      el("span", { cls: "who", text: who }),
      el("span", { cls: "peek", text: text }));
    layerEl.replaceChildren(b);
    setTimeout(function () { if (b.parentNode) b.remove(); }, MK.CONFIG.BANNER_MS);
  }
  function toast(text) {
    var t = el("div", { cls: "phone-toast", text: text, attrs: { role: "status" } });
    layerEl.replaceChildren(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, 1800);
  }

  // ---------- 이동 ----------
  function go(route, reset) {
    if (reset) MK.S.stack = []; else MK.S.stack.push(MK.S.route);
    MK.S.route = route;
    render(true);
  }
  function back() { MK.S.route = MK.S.stack.pop() || { name: "home" }; render(true); }
  function home() { go({ name: "home" }, true); }
  function setRoute(r) { MK.S.route = r; render(); }

  function render(moved) {
    if (!MK.S || MK.S.ended || !MK.S.route) return;
    setStatus();
    var v = P.call ? callView() : routeView(MK.S.route);
    hostEl.replaceChildren(v);
    if (moved) MK.focusView(v); // 선택지에 미리 초점을 주지 않는다
  }
  function routeView(r) {
    switch (r.name) {
      case "kakao": return kakaoTab(r.tab);
      case "app": return appView(r.app, r.tab);
      case "thread": return threadView(r.id);
      case "page": return pageView(r);
      case "search": return searchView(r.q);
      default: return homeView();
    }
  }
  function topbar(title, sub, right, av, backAction) {
    return el("div", { cls: "topbar" },
      iconBtn("navbtn", "back", "뒤로", backAction || back, "back"),
      av || null,
      el("div", { cls: "tb-title" }, title === "쿠팡" ? el("img", { cls: "shop-wordmark", attrs: { src: "assets/brands/coupang.png", alt: "쿠팡" } }) : el("div", { cls: "t", text: title }), sub ? el("div", { cls: "s", text: sub }) : null),
      right || null);
  }

  function phoneTabs(app, active) {
    var specs = app === "talk" ? [["person", "친구", "friends"], ["chat", "채팅", "chats"], ["more", "더보기", "more"]] : [["home", "홈", null], ["card", "자산", "account"], ["calendar", "소비", "bill"], ["menu", "전체", "all"]];
    var nav = el("nav", { cls: "app-bottom-nav" + (app === "talk" ? " kakao-bottom-nav" : ""), attrs: { "aria-label": app === "talk" ? "카카오톡 탭" : "토스 탭" } });
    specs.forEach(function (spec) {
      nav.appendChild(el("button", { cls: "app-tab" + (active === spec[1] ? " active" : ""), attrs: { "data-act": app + "-tab-" + spec[2] }, onClick: function () {
        if (app === "talk") { if (spec[2] === "chats") go({ name: "app", app: "talk" }); else go({ name: "kakao", tab: spec[2] }); }
        else setRoute({ name: "app", app: "bank", tab: spec[2] });
      } }, icon(spec[0], 22), el("span", { text: spec[1] })));
    });
    return nav;
  }
  function kakaoTab(tab) {
    var friends = tab === "friends";
    var v = el("div", { cls: "view app app-list-talk" }, topbar(friends ? "친구" : "더보기"));
    var c = el("div", { cls: "content kakao-friends-content" });
    c.appendChild(el("div", { cls: "kakao-profile-row" }, avatar("김하늘", true), el("div", { cls:"kakao-profile-copy" }, el("strong", { text:"김하늘" }), el("small", { text:"좋은 하루 :)" }))));
    if (friends) {
      var ids = MK.threadsOf("talk").filter(function(id){var th=MK.D.THREADS[id];return th.saved && th.name.indexOf("(")<0;}).sort(function(a,b){return MK.D.THREADS[a].name.localeCompare(MK.D.THREADS[b].name,"ko");});
      c.appendChild(el("p",{cls:"kakao-friends-count",text:"친구 "+ids.length}));
      ids.forEach(function(id){var th=MK.D.THREADS[id];
        c.appendChild(el("button", { cls:"kakao-friend-row", attrs:{"data-act":"friend-"+id}, onClick:function(){go({name:"thread",id:id});} },avatar(th.name,true),el("span",{cls:"kakao-friend-name",text:th.name})));
      });
    } else {
      var services = el("div", { cls:"kakao-services" });
      services.appendChild(el("button", { attrs:{"data-act":"kakao-gallery"},onClick:function(){openApp("photos");} },icon("photos",25),el("span",{text:"갤러리"})));
      services.appendChild(el("button", { attrs:{"data-act":"kakao-settings"},onClick:function(){openApp("settings");} },icon("settings",25),el("span",{text:"설정"})));
      c.appendChild(services);
    }
    v.appendChild(c);v.appendChild(phoneTabs("talk",friends?"친구":"더보기"));return v;
  }
  // ---------- 홈 ----------
  function unread(app) {
    var n = MK.unreadIn(app);
    if (app === "phone") P.recent.forEach(function (c) { if (c.missed && !c.seen) n++; });
    return n;
  }
  function appIcon(a) {
    var n = unread(a);
    return el("button", { cls: "icon", attrs: { "data-act": "app-" + a, "aria-label": APPS[a] + (n ? ", 읽지 않음 " + n : "") }, onClick: function () { openApp(a); } },
      el("i", { cls: "app-" + a }, icon(a, 36, true), n ? el("b", { cls: "badge", text: String(n) }) : null),
      el("span", { text: APPS[a] }));
  }
  function openApp(a) {
    if (a === "phone") P.recent.forEach(function (c) { c.seen = true; });
    go({ name: "app", app: a, tab: a === "phone" ? "recent" : null });
  }
  function homeView() {
    var S = MK.S;
    var memo = el("div", { cls: "memo" }, el("div", { cls: "memo-h", text: "오늘 할 일" }));
    MK.D.TASKS.forEach(function (t) {
      if (t.appearsWith && !S.tasks.t4visible) return;
      memo.appendChild(el("div", { cls: "task" + (S.tasks[t.id] ? " done" : "") },
        el("span", { cls: "box", attrs: { "aria-hidden": "true" } }), el("span", { text: t.text })));
    });
    if (S.tasks.t4visible) memo.appendChild(el("p", { cls: "memo-note", text: MK.ITEM.s8.body }));
    var grid = el("div", { cls: "grid" });
    ["mail", "moamall", "bank", "camera", "photos", "map", "settings", "x", "blog"].forEach(function (a) { grid.appendChild(appIcon(a)); });
    var dock = el("div", { cls: "dock" });
    ["phone", "messages", "talk", "web"].forEach(function (a) { dock.appendChild(appIcon(a)); });
    var view = el("div", { cls: "view home" }, memo, grid);
    view.appendChild(dock);
    return view;
  }

  // ---------- 대화방 ----------
  function appView(app, tab) {
    if (app === "x" || app === "blog") return el("div", { cls: "view app social-app" }, MK.socialView(app));
    if (app === "messages" || app === "talk" || app === "mail") return listView(app);
    if (app === "phone") return phoneView(tab);
    if (app === "web") return webHome();
    if (app === "moamall") return moamallView(tab);
    if (app === "bank") return bankView(tab);
    if (app === "camera") return cameraView();
    if (app === "photos") return photosView(tab);
    if (app === "map") return mapView();
    if (app === "settings") return settingsView();
    return homeView();
  }
  function listView(app) {
    var v = el("div", { cls: "view app app-list-" + app });
    v.appendChild(topbar(app === "talk" ? "채팅" : APPS[app]));
    if (app === "talk") v.appendChild(el("div", { cls: "kakao-filter" }, el("strong", { text: "전체" }), el("span", { text: "안 읽은 대화 " + MK.unreadIn("talk") })));

    var box = el("div", { cls: "list" });
    MK.threadsOf(app).forEach(function (id) {
      var th = MK.D.THREADS[id], last = MK.threadLast(id), un = MK.threadUnread(id);
      box.appendChild(el("button", { cls: "row", attrs: { "data-act": "open-" + id }, onClick: function () { go({ name: "thread", id: id }); } },
        avatar(th.name, th.saved),
        el("span", { cls: "rtext" }, el("span", { cls: "rt" + (un ? " strong" : ""), text: th.name }), el("span", { cls: "rs", text: last.text })),
        el("span", { cls: "rwhen" }, el("span", { text: last.when }), un ? el("span", { cls: "rdot on" }) : null)));
    });
    v.appendChild(box);
    if (app === "talk") v.appendChild(phoneTabs("talk", "채팅"));
    return v;
  }
  function openItem(it) {
    if (it.channel === "push") { MK.markOpened(it); go({ name: "app", app: "moamall", tab: "orders" }); return; }
    go({ name: "thread", id: it.thread });
  }
  function threadView(id) {
    var th = MK.D.THREADS[id], items = MK.threadItems(id), isTalk = th.app === "talk", isMail = th.app === "mail";
    items.forEach(function (it) { MK.markOpened(it); });
    var v = el("div", { cls: "view thread" + (isTalk ? " kakao-thread" : "") });
    var actions = function () { return el("div", { cls: "chat-menu" },
      el("strong", { text: th.name }), el("p", { text: th.from || th.number || "카카오톡 친구" }),
      btn("mini", "대화 삭제", function () { MK.removeThread(id); back(); }, "delete"),
      btn("mini", isTalk ? "차단하기" : "스팸 신고", function () { MK.removeThread(id); back(); }, "report")); };
    if (isTalk) {
      v.appendChild(el("div", { cls: "kakao-titlebar" }, iconBtn("navbtn", "back", "뒤로", back, "back"),
        el("strong", { text: th.name }),
        iconBtn("navbtn", "search", "공유 링크 모아보기", function () { P.threadLinks = P.threadLinks === id ? null : id; render(); }, "thread-links"),
        iconBtn("navbtn", "menu", "대화방 메뉴", function () { P.threadMenu = P.threadMenu === id ? null : id; render(); }, "thread-menu")));
    } else v.appendChild(topbar(th.name, isMail ? th.from : th.number, iconBtn("navbtn", "more", "메시지 메뉴", function () { P.threadMenu = P.threadMenu === id ? null : id; render(); }, "thread-menu"), avatar(th.name, th.saved)));
    if (P.threadMenu === id) v.appendChild(actions());
    if (P.threadLinks === id) {
      var links = el("div", { cls: "chat-menu" }, el("strong", { text: "공유된 링크" }));
      items.filter(function (it) { return it.link; }).forEach(function (it) { links.appendChild(btn("fakelink", it.link.text, function () { followLink(it); }, "link")); });
      if (!items.some(function (it) { return it.link; })) links.appendChild(el("p", { text: "공유된 링크가 없습니다." }));
      v.appendChild(links);
    }
    var c = el("div", { cls: "content" + (isTalk ? " kakao-messages" : "") });
    function message(text, me, when, attachment, sender) {
      var row = el("div", { cls: "message-row" + (me ? " outgoing" : "") });
      var body = el("div", { cls: "message-content" }, isTalk && sender ? el("small", { cls:"message-author",text:sender }) : null, el("div", { cls: "bubble" + (me ? " me" : ""), text: text }));
      if (attachment) body.appendChild(attachment);
      if (isTalk && !me) row.appendChild(avatar(sender || th.name, th.saved));
      row.appendChild(body); row.appendChild(el("span", { cls: "message-time", text: when || "오후 8:14" })); c.appendChild(row);
    }
    var lastWhen = null;
    th.history.forEach(function (h) {
      if (h.when !== lastWhen) { c.appendChild(el("div", { cls: "daysep", text: h.when })); lastWhen = h.when; }
      if (isMail) c.appendChild(el("div", { cls: "mailcard old" }, el("div", { cls: "subject", text: h.subject }), el("p", { text: h.text })));
      else message(h.text, h.me, h.time, null, h.sender);
    });
    if (items.length) c.appendChild(el("div", { cls: "daysep", text: "오늘" }));
    (MK.S.timeline[id] || []).forEach(function (entry) {
      if (!entry.item) { message(entry.text, entry.me, entry.when || MK.clockText()); return; }
      var it = MK.ITEM[entry.item];
      if (isMail) {
        var card = el("div", { cls: "mailcard" }, el("div", { cls: "subject", text: it.subject }), el("div", { cls: "from", text: th.from }), el("p", { text: it.body }));
        if (it.link) card.appendChild(btn("fakebutton", it.link.text, function () { followLink(it); }, "link"));
        c.appendChild(card); return;
      }
      var link = null;
      if (it.link) {
        link = el("button", { cls: "chat-link-card", attrs: { "data-act": "link", "aria-label": it.link.text }, onClick: function () { followLink(it); } });
        if (it.id === "L6") {
          link.appendChild(el("img", { attrs: { src: "assets/photos/wedding.jpg", alt: "서연과 민준의 청첩장 미리보기" } }));
          link.appendChild(el("strong", { text: "서연 · 민준, 결혼합니다" })); link.appendChild(el("span", { text: "12월 12일 토요일 오후 1시" }));
        } else link.appendChild(el("strong", { text: it.link.text }));
        link.appendChild(el("small", { text: it.link.text }));
      }
      message(MK.cleanText(it.body), false, entry.when || MK.clockText(), link, it.sender);
    });
    v.appendChild(c);
    var position = P.threadScroll[id], count = (MK.S.timeline[id] || []).length;
    c.addEventListener("scroll", function () { P.threadScroll[id] = { top:c.scrollTop, nearEnd:c.scrollHeight-c.clientHeight-c.scrollTop<55, count:count }; });
    setTimeout(function () {
      c.scrollTop = !position || (position.count !== count && position.nearEnd) ? c.scrollHeight : position.top;
      P.threadScroll[id] = { top:c.scrollTop, nearEnd:c.scrollHeight-c.clientHeight-c.scrollTop<55, count:count };
    }, 0);
    if (isTalk) {
      var bar = el("div", { cls: "kakao-compose" }, el("span", { cls: "compose-plus", attrs: { "aria-hidden": "true" } }, icon("plus", 18)));
      var chips = MK.replyChips(id), choices = el("div", { cls: "reply-options" });
      chips.forEach(function (ch) { choices.appendChild(btn("chipbtn", ch.label, ch.run, ch.act)); });
      if (!chips.length) choices.appendChild(el("span", { cls: "compose-placeholder", text: MK.S.pending[id] ? "답장을 기다리는 중" : "메시지 입력" }));
      bar.appendChild(choices); v.appendChild(bar);
    }
    return v;
  }
  function followLink(it) { MK.enter(it); go({ name: "page", page: it.link.page, item: it.id }); }

  // ---------- 웹 ----------
  function pageView(r) {
    var p = MK.D.PAGES[r.page];
    if (p.verify) MK.verify(p.verify);
    var it = r.item ? MK.ITEM[r.item] : null;
    var v = el("div", { cls: "view page" });
    var secure = /^www\./.test(p.url) || /^(weather|news)\.example/.test(p.url);
    v.appendChild(el("div", { cls: "browserbar" },
      iconBtn("navbtn", "back", "뒤로", back, "back"),
      el("span", { cls: "url" }, secure ? icon("lock", 12) : null, el("span", { text: p.url })),
      btn("navbtn homebtn", "홈", home, "home")));
    var body = el("div", { cls: "webpage" }, el("h3", { text: p.title }), el("p", { text: r.done || p.text }));
    if (!r.done) p.actions.forEach(function (a) {
      body.appendChild(btn("btn webaction", a.label, function () {
        if (it) MK.expose(it);
        if (it && it.id === "s8") MK.doneTask("t4");
        setRoute({ name: "page", page: r.page, item: r.item, done: "처리됐어요." });
      }, "expose"));
    });
    v.appendChild(el("div", { cls: "content" }, body));
    return v;
  }
  function webHome() {
    var v = el("div", { cls: "view app" });
    v.appendChild(topbar("Chrome"));
    var c = el("div", { cls: "content" }, el("div", { cls: "searchbox" }, icon("web", 16), el("span", { text: "검색" })), el("p", { cls: "context", text: "추천 검색어" }));
    MK.D.SEARCHES.forEach(function (s) { c.appendChild(btn("chipbtn wide", s.q, function () { go({ name: "search", q: s.q }); }, "search")); });
    v.appendChild(c);
    return v;
  }
  function searchView(q) {
    var s = MK.D.SEARCHES.filter(function (x) { return x.q === q; })[0];
    var v = el("div", { cls: "view app" });
    v.appendChild(topbar(q));
    var c = el("div", { cls: "content" });
    s.results.forEach(function (res) {
      if (res.phish) { var st = MK.S.st[res.phish]; if (st.openedAt == null) st.openedAt = MK.now(); }
      c.appendChild(el("button", { cls: "searchres", attrs: { "data-act": res.ad ? "ad" : "result" }, onClick: function () {
        if (res.phish) MK.enter(MK.ITEM[res.phish]);
        go({ name: "page", page: res.page, item: res.phish || null });
      } }, el("div", null, res.ad ? el("span", { cls: "ad", text: "광고" }) : null, el("span", { cls: "rt", text: res.title })), el("div", { cls: "ru", text: res.url })));
    });
    v.appendChild(c);
    return v;
  }

  // ---------- 쿠팡 ----------
  function moamallView(tab) {
    var v = el("div", { cls:"view app shopping-app" });
    var navigate = function(next) { setRoute({name:"app",app:"moamall",tab:next}); };
    v.appendChild(topbar("쿠팡",null,null,null,tab && tab !== "home" ? function(){navigate("home");} : back));
    v.appendChild(MK.shopView({surface:"phone",tab:tab||"home",onNavigate:navigate,onVisit:function(view){
      if(view==="orders") { MK.verify("moamall_orders");MK.doneTask("t2");if(MK.S.delivered.L2) MK.markOpened(MK.ITEM.L2); }
      if(view==="notice-detail:security") MK.verify("moamall_notice");
    }}));return v;
  }

  // ---------- 토스뱅크 ----------
  function bankView(tab) {
    var S = MK.S, v = el("div", { cls: "view app banking-app" });
    var t = function (x) { return function () { setRoute({ name: "app", app: "bank", tab: x }); }; };
    var title = !tab ? "토스" : tab === "bill" ? "이번 달 카드 사용액" : tab === "all" ? "전체" : tab === "lost" ? "카드 분실신고" : tab === "notice" ? "공지사항" : "내 계좌";
    if (!tab) v.appendChild(el("header", { cls:"toss-header" }, el("strong", {text:"toss"}), iconBtn("navbtn", "bell", "알림과 공지", t("notice"))));
    else v.appendChild(topbar(title, null, iconBtn("navbtn", "bell", "알림과 공지", t("notice")), null, t(null)));
    var c = el("div", { cls: "content toss-content" });
    function accountRow(label, amount, dest, symbol) {
      return el("button", { cls: "toss-account", onClick: t(dest) },
        el("span", { cls: "toss-account-symbol", text: symbol || "₩" }),
        el("span", { cls: "toss-account-info" }, el("small", { text: label }), el("strong", { text: amount })),
        el("span", { cls: "toss-row-action", text: "보기" }));
    }
    if (!tab) {
      c.appendChild(btn("toss-bank-link", "토스뱅크", t("account")));
      var accounts = el("section", { cls: "toss-panel" }, el("h3", { text: "최근 본 계좌" }));
      accounts.appendChild(accountRow("토스뱅크 통장", "1,284,000원", "account"));
      accounts.appendChild(accountRow("입출금 통장", "324,500원", "history", "통장"));
      accounts.appendChild(btn("toss-panel-link", "내 계좌 내역 보기", t("history")));
      c.appendChild(accounts);
      var spending = el("section", { cls: "toss-panel" });
      spending.appendChild(accountRow("이번 달 카드 사용액", P.bankAuth === "done" ? "412,300원" : "확인하기", "bill", "카드"));
      spending.appendChild(btn("toss-panel-link", "카드 관리", t("all"))); c.appendChild(spending);
      c.appendChild(el("section", { cls: "toss-small-banner" }, el("strong", { text: "이번 달 소비, 한눈에" }), el("p", { text: "결제 내역과 카드 정보를 모아서 확인해요" }), btn("toss-inline", "사용액 확인", t("bill"))));
    } else if (tab === "bill") {
      if (P.bankAuth === "idle") {
        P.bankAuth = "sent";
        MK.later(2000, function () { MK.deliver(MK.ITEM.L4); P.bankAuth = "ready"; if (MK.S.route.tab === "bill" && !P.call) render(); });
      }
      if (P.bankAuth !== "done") {
        c.appendChild(el("section", { cls: "toss-panel toss-auth" }, el("span", { cls: "toss-security", text: "본인 확인" }),
          el("h2", { text: "이 기기에서 처음 확인해요" }), el("p", { text: P.bankAuth === "sent" ? "등록한 휴대폰으로 인증 문자를 보내고 있어요." : "본인이 요청한 인증 문자의 번호를 확인해 주세요." }),
          P.bankAuth === "ready" ? btn("btn", "인증번호 자동 입력", function () { P.bankAuth = "done"; MK.markOpened(MK.ITEM.L4); MK.doneTask("t3"); render(); }, "bank-auth") : null));
      } else {
        c.appendChild(el("section", { cls: "toss-panel" }, el("p", { cls: "toss-eyebrow", text: "11월 카드 사용액" }), el("h2", { cls: "toss-amount", text: "412,300원" }), el("p", { text: "체크카드 결제 내역을 합산했어요." }), btn("toss-panel-link", "거래 내역 보기", t("history"))));
      }
    } else if (tab === "all") {
      var menu = el("section", { cls: "toss-panel" }, el("h3", { text: "카드" }));
      [["이번 달 카드 사용액", "bill", "bank-bill"], ["카드 분실신고", "lost", "bank-lost"], ["거래 내역", "history", "bank-history"], ["공지사항", "notice", "bank-notice"]].forEach(function (item) { menu.appendChild(btn("toss-menu", item[0], t(item[1]), item[2])); });
      menu.appendChild(btn("toss-menu", "고객센터 전화", function () { callOut("bank"); }, "bank-call")); c.appendChild(menu);
    } else if (tab === "lost") {
      var ready = !!S.tasks.t4visible;
      c.appendChild(el("section", { cls: "toss-panel" }, el("h2", { text: S.tasks.t4 ? "분실신고를 접수했어요" : "토스뱅크 체크카드" }), el("p", { text: S.tasks.t4 ? "이 카드의 사용을 정지했어요." : "카드를 잃어버렸다면 사용을 정지할 수 있어요." }),
        !S.tasks.t4 ? btn("btn", "분실신고 접수", function () {
          if (!ready) { toast("카드 분실 상황이 발생하면 이곳에서 신고할 수 있어요."); return; }
          MK.verify("bank_lost"); MK.doneTask("t4"); render();
        }, "bank-report-lost") : null));
    } else if (tab === "history") {
      var history = el("section", { cls: "toss-panel" }, el("h3", { text: "거래 내역" }));
      (S.delivered.L8 ? [["오늘", "편의점", "-12,000원"]] : []).concat([["어제", "마트", "-32,000원"], ["어제", "카페", "-8,900원"], ["11월 1일", "급여", "+2,850,000원"]]).forEach(function (r) {
        history.appendChild(el("div", { cls: "toss-transaction" }, el("div", null, el("strong", { text: r[1] }), el("small", { text: r[0] })), el("strong", { text: r[2] })));
      }); c.appendChild(history);
    } else if (tab === "account") {
      c.appendChild(el("section", { cls: "toss-panel" }, el("p", { cls: "toss-eyebrow", text: "토스뱅크 통장" }), el("h2", { cls: "toss-amount", text: "1,284,000원" }), el("p", { text: "김하늘 · 1000-●●●●-●●●●" }), btn("toss-menu", "거래 내역", t("history")), btn("toss-menu", "카드 관리", t("all"))));
    } else if (tab === "notice") {
      MK.verify("bank_notice");
      c.appendChild(el("section", { cls: "toss-panel" }, el("h3", { text: "사칭 문자 주의" }), el("p", { text: "문자 속 발신자 이름만으로는 진위를 확인할 수 없어요. 앱 공지와 기존 고객센터를 통해 확인해 주세요. 원격 지원 앱을 설치하라는 안내는 따르지 마세요." })));
    }
    v.appendChild(c); v.appendChild(phoneTabs("bank", tab === "all" ? "전체" : tab === "bill" ? "소비" : tab === "account" ? "자산" : "홈"));
    return v;
  }

  // ---------- 일상 앱 ----------
  function cameraView() {
    var camera = P.camera, src = "assets/photos/" + camera.scene + ".jpg";
    var v = el("div", { cls: "view camera camera-app" });
    v.appendChild(el("div", { cls: "camera-controls" }, btn("camera-control", camera.flash ? "플래시 켜짐" : "플래시 꺼짐", function () { camera.flash = !camera.flash; render(); }, "camera-flash"), el("span", { text: "3:4" }), btn("camera-control", "장면 변경", function () { camera.scene = camera.scene === "workspace" ? "cat" : "workspace"; render(); }, "camera-scene")));
    var image = el("img", { cls: "camera-scene", attrs: { src: src, alt: "촬영용 " + (camera.scene === "workspace" ? "작업실" : "고양이") + " 장면" } });
    image.style.transform = "scale(" + camera.zoom + ")";
    var finder = el("div", { cls: "camera-viewfinder" }, image, el("span", { cls: "camera-focus", attrs: { "aria-hidden": "true" } }));
    v.appendChild(finder);
    var zooms = el("div", { cls: "camera-zooms" });
    [1, 2].forEach(function (z) { zooms.appendChild(btn("camera-zoom" + (camera.zoom === z ? " active" : ""), z + "×", function () { camera.zoom = z; render(); }, "camera-zoom-" + z)); });
    v.appendChild(zooms);
    v.appendChild(el("div", { cls: "camera-modes" }, el("span", { text: "인물" }), el("strong", { text: "사진" }), el("span", { text: "동영상" })));
    var last = P.photos[0];
    var shutter = el("button", { cls: "shutter", attrs: { "aria-label": camera.capturing ? "사진 저장 중" : "사진 찍기", "data-act": "shutter" }, onClick: capturePhoto });
    if (camera.capturing) shutter.setAttribute("disabled", "");
    v.appendChild(el("div", { cls: "shutterbar" },
      el("button", { cls: "camera-last-shot", attrs: { "aria-label": "갤러리 열기", "data-act": "camera-photos" }, onClick: function () { openApp("photos"); } }, last ? el("img", { attrs: { src: last.src, alt: "최근 사진" } }) : null),
      shutter, el("span", { cls: "camera-lens-label", text: "후면" })));
    v.appendChild(el("p", { cls: "camera-scene-note", text: "샘플 장면으로 촬영" })); return v;
  }
  function capturePhoto() {
    if (P.camera.capturing) return;
    var session = MK.S, scene = P.camera.scene, zoom = P.camera.zoom, flash = P.camera.flash;
    P.camera.capturing = true; render();
    var photo = new window.Image();
    photo.onload = function () {
      if (MK.S !== session || session.ended) return;
      try {
      var canvas = document.createElement("canvas"); canvas.width = 900; canvas.height = 1200;
      var g = canvas.getContext("2d"), ratio = 3 / 4;
      var w = photo.naturalWidth, h = photo.naturalHeight;
      if (w / h > ratio) w = h * ratio; else h = w / ratio;
      w /= zoom; h /= zoom;
      g.drawImage(photo, (photo.naturalWidth - w) / 2, (photo.naturalHeight - h) / 2, w, h, 0, 0, 900, 1200);
      if (flash) { g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(0,0,900,1200); }
      P.photos.unshift({ name: "오늘 " + MK.clockText() + " · " + (scene === "workspace" ? "작업실" : "고양이"), src: canvas.toDataURL("image/jpeg", 0.88), captured: true, zoom: zoom });
      P.camera.capturing = false; render(); toast("갤러리에 저장했어요.");
      } catch (error) { P.camera.capturing = false; render(); toast("사진을 저장하지 못했어요. 다시 시도해 주세요."); }
    };
    photo.onerror = function () { if (MK.S !== session || session.ended) return; P.camera.capturing = false; render(); toast("사진을 불러오지 못했어요. 다시 시도해 주세요."); };
    photo.src = MK.asset("assets/photos/" + scene + ".jpg");
  }
  function photosView(sel) {
    if (typeof sel === "number" && P.photos[sel]) {
      var ph = P.photos[sel], full = el("div", { cls: "view photo-detail" }, topbar(ph.captured ? "오늘" : "최근 사진"));
      full.appendChild(el("div", { cls: "gallery-viewer" }, el("img", { attrs: { src: ph.src, alt: ph.name } })));
      full.appendChild(el("p", { cls: "photo-caption", text: ph.name }));
      full.appendChild(btn("gallery-favorite" + (ph.favorite ? " active" : ""), ph.favorite ? "즐겨찾기 해제" : "즐겨찾기", function () { ph.favorite = !ph.favorite; render(); }, "photo-favorite"));
      return full;
    }
    var v = el("div", { cls: "view app gallery-app" }, topbar("갤러리"));
    var c = el("div", { cls: "content gallery-content" });
    if (sel === "albums") {
      [["최근 사진", null], ["카메라", "camera"], ["즐겨찾기", "favorites"]].forEach(function (album) {
        var photos = P.photos.filter(function (ph) { return album[1] === "camera" ? ph.captured : album[1] === "favorites" ? ph.favorite : true; });
        c.appendChild(el("button", { cls: "gallery-album", onClick: function () { setRoute({name:"app",app:"photos",tab:album[1]}); } },
          photos.length ? el("img", { attrs: { src: photos[0].src, alt: "" } }) : el("span", { cls:"gallery-album-empty" }, icon("photos",30)),
          el("strong", { text: album[0] }), el("span", { text: photos.length + "장" })));
      });
    } else {
      var shown = P.photos.map(function (ph, index) { return {photo:ph,index:index}; }).filter(function (entry) { return sel === "camera" ? entry.photo.captured : sel === "favorites" ? entry.photo.favorite : true; });
      c.appendChild(el("h2", { cls: "gallery-heading", text: sel === "camera" ? "카메라" : sel === "favorites" ? "즐겨찾기" : "최근 사진" }));
      c.appendChild(el("p", { cls: "gallery-count", text: shown.length + "장의 사진" }));
      var grid = el("div", { cls: "photogrid" });
      shown.forEach(function (entry) { grid.appendChild(el("button", { cls: "photo", attrs: { "aria-label": entry.photo.name, "data-act": "photo-" + entry.index }, onClick: function () { go({name:"app",app:"photos",tab:entry.index}); } }, el("img", { attrs: { src: entry.photo.src, alt: "", loading: "lazy" } }))); });
      c.appendChild(grid);
      if (!shown.length) c.appendChild(el("p", { cls: "gallery-empty", text: sel === "camera" ? "카메라에서 찍은 사진이 여기에 표시돼요." : "즐겨찾기에 추가한 사진이 없습니다." }));
    }
    v.appendChild(c);
    v.appendChild(el("nav", { cls: "gallery-nav", attrs: { "aria-label": "갤러리 탭" } }, btn("gallery-nav-tab" + (sel !== "albums" ? " active" : ""), "사진", function () { setRoute({name:"app",app:"photos"}); }, "gallery-photos"), btn("gallery-nav-tab" + (sel === "albums" ? " active" : ""), "앨범", function () { setRoute({name:"app",app:"photos",tab:"albums"}); }, "gallery-albums")));
    return v;
  }
  function mapView() {
    var v = el("div", { cls: "view app" });
    v.appendChild(topbar("지도"));
    var c = el("div", { cls: "content" });
    c.appendChild(el("div", { cls: "mapbox", attrs: { "aria-hidden": "true" } }, el("span", { cls: "pin" }, icon("map", 26))));
    MK.D.PLACES.forEach(function (pl) { c.appendChild(btn("chipbtn wide" + (P.place === pl.q ? " on" : ""), pl.q, function () { P.place = pl.q; render(); }, "place")); });
    if (P.place) MK.D.PLACES.filter(function (x) { return x.q === P.place; })[0].results.forEach(function (r) {
      c.appendChild(el("div", { cls: "card" }, el("p", { text: r })));
    });
    v.appendChild(c);
    return v;
  }
  function settingsView() {
    var v = el("div", { cls: "view app" });
    v.appendChild(topbar("설정"));
    var c = el("div", { cls: "content" });
    [["wifi", "Wi-Fi"], ["bt", "블루투스"], ["dnd", "방해 금지"]].forEach(function (s) {
      var on = P.settings[s[0]];
      c.appendChild(el("div", { cls: "row static setrow" }, el("span", { cls: "rt", text: s[1] }),
        el("button", { cls: "switch" + (on ? " on" : ""), attrs: { role: "switch", "aria-checked": String(on), "aria-label": s[1], "data-act": "set-" + s[0] }, onClick: function () {
          P.settings[s[0]] = !P.settings[s[0]]; render();
        } }, el("span"))));
    });
    c.appendChild(el("div", { cls: "row static" }, el("span", { cls: "rt", text: "휴대전화 정보" }), el("span", { cls: "rs", text: "소프트웨어 최신 버전" })));
    v.appendChild(c);
    return v;
  }

  // ---------- 전화 ----------
  function phoneView(tab) {
    var v = el("div", { cls: "view app" });
    v.appendChild(topbar("전화"));
    var c = el("div", { cls: "content" });
    var t = function (x) { return function () { setRoute({ name: "app", app: "phone", tab: x }); }; };
    c.appendChild(el("div", { cls: "tabs" },
      btn("tab" + (tab === "recent" ? " on" : ""), "최근 기록", t("recent"), "phone-recent"),
      btn("tab" + (tab === "contacts" ? " on" : ""), "연락처", t("contacts"), "phone-contacts")));
    if (tab === "recent") {
      P.recent.slice().reverse().forEach(function (r) {
        var known = MK.D.CONTACTS.some(function (ct) { return ct.name === r.name; }) || r.name === "박 팀장" || r.name === "엄마";
        c.appendChild(el("div", { cls: "row static" + (r.missed ? " missed" : "") }, avatar(r.name, known),
          el("span", { cls: "rtext" }, el("span", { cls: "rt", text: r.name }), el("span", { cls: "rs", text: r.label }))));
      });
    } else {
      MK.D.CONTACTS.forEach(function (ct) {
        c.appendChild(el("div", { cls: "row static" }, avatar(ct.name, true),
          el("span", { cls: "rtext" }, el("span", { cls: "rt", text: ct.name }), el("span", { cls: "rs", text: ct.number })),
          iconBtn("callmini", "phone", ct.name + "에게 전화", function () { callOut(ct.key); }, "call-" + ct.key, 18)));
      });
    }
    v.appendChild(c);
    return v;
  }
  function newCall(o) {
    P.call = { who: o.who, number: o.number || "", saved: o.saved, item: o.item || null, dialog: o.dialog, mode: o.mode,
      start: MK.now(), node: null, queue: [], lines: [], lastLine: MK.now(), endAt: null };
    layerEl.replaceChildren();
  }
  function startIncoming(it) {
    newCall({ who: it.caller, number: it.saved ? "휴대전화" : "", saved: it.saved, item: it, dialog: it.dialog, mode: "ring" });
    render(true);
  }
  function callOut(key) {
    var ct = MK.D.CONTACTS.filter(function (x) { return x.key === key; })[0];
    newCall({ who: ct.name, number: ct.number, saved: true, dialog: ct.dialog, mode: "out" });
    P.recent.push({ name: ct.name, label: "오늘 · 발신", seen: true });
    startNode(ct.dialog.start);
    render(true);
  }
  function answer() {
    var c = P.call, it = c.item, st = MK.S.st[it.id];
    if (!st.opened) { st.opened = true; st.openedAt = c.start; }
    if (it.kind === "phish") MK.enter(it, c.start); else MK.handle(it);
    c.mode = "talk";
    P.recent.push({ name: it.caller, label: "오늘 · 받음", seen: true });
    startNode(c.dialog.start);
    render();
  }
  function startNode(id) {
    var c = P.call;
    c.node = id;
    c.queue = c.dialog.nodes[id].say.slice();
    c.lastLine = MK.now() - MK.CONFIG.LINE_MS + 700;
  }
  function callTick(t) {
    var c = P.call;
    if (c.mode === "ring") { if (t - c.start > MK.CONFIG.RING_SECONDS * 1000) endCall("missed"); return; }
    if (c.queue.length && t - c.lastLine >= MK.CONFIG.LINE_MS) { c.lines.push({ me: false, text: c.queue.shift() }); c.lastLine = t; render(); }
    else if (!c.queue.length && c.dialog.nodes[c.node].end) {
      if (c.endAt == null) c.endAt = t; else if (t - c.endAt > 1600) endCall("done");
    }
  }
  function choose(ch) {
    var c = P.call;
    if (!c || c.queue.length || !MK.choiceAvailable(ch) || !c.dialog.nodes[c.node].choices || c.dialog.nodes[c.node].choices.indexOf(ch) < 0) return;
    c.lines.push({ me: true, text: ch.label });
    if (c.item) { if (ch.effect === "exposed") MK.expose(c.item); else if (ch.effect === "handled") MK.handle(c.item); }
    if (ch.verify) MK.verify(ch.verify);
    if (ch.task) MK.doneTask(ch.task);
    startNode(ch.to);
    render();
  }
  function endCall(how) {
    var c = P.call;
    if (c.item && (how === "missed" || how === "declined")) P.recent.push({ name: c.item.caller, label: how === "missed" ? "오늘 · 부재중" : "오늘 · 거절", missed: true, seen: false });
    P.call = null;
    render(true);
  }
  function callView() {
    var c = P.call;
    var v = el("div", { cls: "view callscreen" });
    var state = c.mode === "ring" ? "수신 전화" : (c.mode === "out" && !c.lines.length ? "발신 중…" : "통화 중");
    v.appendChild(el("div", { cls: "callhead" },
      el("div", { cls: "lbl", text: state }),
      avatar(c.who, c.saved, "big"),
      el("div", { cls: "num", text: c.who }),
      el("div", { cls: "lbl", text: c.saved ? c.number : "저장되지 않은 번호" })));
    if (c.mode === "ring") {
      v.appendChild(el("div", { cls: "callbtns" },
        el("div", { cls: "cb" }, iconBtn("callbtn decline", "hangup", "거절", function () { endCall("declined"); }, "decline"), el("span", { text: "거절" })),
        el("div", { cls: "cb" }, iconBtn("callbtn accept", "phone", "받기", answer, "answer"), el("span", { text: "받기" }))));
      return v;
    }
    var t = el("div", { cls: "transcript" });
    c.lines.forEach(function (l) { t.appendChild(el("p", { cls: l.me ? "me" : "", text: l.text })); });
    v.appendChild(t);
    setTimeout(function () { t.scrollTop = t.scrollHeight; }, 0);
    var node = c.dialog.nodes[c.node], acts = el("div", { cls: "callacts" });
    if (!c.queue.length && node.choices) node.choices.forEach(function (ch) {
      if (!MK.choiceAvailable(ch)) return;
      acts.appendChild(btn("saybtn", ch.label, function () { choose(ch); }, ch.effect === "exposed" ? "say-expose" : (ch.verify ? "say-verify" : "say")));
    });
    v.appendChild(acts);
    v.appendChild(el("div", { cls: "incall-tools", attrs: { "aria-hidden": "true" } },
      el("span", null, icon("mute", 22), el("small", { text: "소리 끔" })),
      el("span", null, icon("keypad", 22), el("small", { text: "키패드" })),
      el("span", null, icon("speaker", 22), el("small", { text: "스피커" }))));
    v.appendChild(el("div", { cls: "callbtns single" }, iconBtn("callbtn decline", "hangup", "통화 종료", function () { endCall("hangup"); }, "hangup")));
    return v;
  }
})();
