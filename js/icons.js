/*
 * 미끼폰 아이콘
 * - 앱 표지는 로컬 브랜드 에셋을 사용한다. 출처는 ASSET_CREDITS.md 참고.
 * - 실제 폰에서 흔히 쓰는 일반 모양(말풍선, 수화기, 봉투, 지구본, 쇼핑백, 은행)을 직접 그렸다.
 * - 수화기 모양은 Google Material Icons(Apache License 2.0)의 call 아이콘 경로를 사용.
 * - SVG도 createElementNS + setAttribute로만 만든다(innerHTML 금지 원칙 유지).
 */
(function (root) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  var HANDSET = "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z";

  // [태그, 속성] 목록. fill/stroke는 currentColor라 버튼 글자색을 따른다.
  var SHAPES = {
    phone: [["path", { d: HANDSET, fill: "currentColor" }]],
    hangup: [["path", { d: HANDSET, fill: "currentColor", transform: "rotate(135 12 12)" }]],
    messages: [["path", { d: "M12 4C7 4 3 7.1 3 11c0 2.2 1.3 4.2 3.4 5.5L5.6 20l4.1-2.3c.75.13 1.5.2 2.3.2 5 0 9-3.1 9-7s-4-6.9-9-6.9z", fill: "currentColor" }]],
    talk: [
      ["path", { d: "M3 6.5A2.5 2.5 0 0 1 5.5 4h8A2.5 2.5 0 0 1 16 6.5v4a2.5 2.5 0 0 1-2.5 2.5H9l-3.5 2.6V13A2.5 2.5 0 0 1 3 10.5z", fill: "currentColor" }],
      ["path", { d: "M18 8.5h.5A2.5 2.5 0 0 1 21 11v4a2.5 2.5 0 0 1-2.5 2.5V20L15 17.5h-3.5a2.5 2.5 0 0 1-2.3-1.5", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" }]],
    mail: [
      ["rect", { x: "3", y: "5.5", width: "18", height: "13", rx: "2", fill: "none", stroke: "currentColor", "stroke-width": "1.9" }],
      ["path", { d: "M4 7l8 6 8-6", fill: "none", stroke: "currentColor", "stroke-width": "1.9", "stroke-linejoin": "round" }]],
    web: [
      ["circle", { cx: "12", cy: "12", r: "8.5", fill: "none", stroke: "currentColor", "stroke-width": "1.8" }],
      ["path", { d: "M3.5 12h17M12 3.5c2.4 2.4 3.5 5.3 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.3-3.5-8.5s1.1-6.1 3.5-8.5z", fill: "none", stroke: "currentColor", "stroke-width": "1.6" }]],
    moamall: [
      ["path", { d: "M5 8.5h14l-1.2 11a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z", fill: "currentColor" }],
      ["path", { d: "M8.5 10V7a3.5 3.5 0 0 1 7 0v3", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" }]],
    bank: [
      ["path", { d: "M12 3l9 5H3z", fill: "currentColor" }],
      ["path", { d: "M5.5 10v7M10 10v7M14 10v7M18.5 10v7", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round" }],
      ["rect", { x: "3", y: "18.5", width: "18", height: "2.3", rx: "1", fill: "currentColor" }]],
    mute: [
      ["rect", { x: "9", y: "3", width: "6", height: "11", rx: "3", fill: "none", stroke: "currentColor", "stroke-width": "1.8" }],
      ["path", { d: "M6 11a6 6 0 0 0 12 0M12 17v4M4 4l16 16", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" }]],
    keypad: [["path", { d: "M6 5h.01M12 5h.01M18 5h.01M6 11h.01M12 11h.01M18 11h.01M6 17h.01M12 17h.01M18 17h.01M12 22h.01", stroke: "currentColor", "stroke-width": "3.2", "stroke-linecap": "round" }]],
    speaker: [
      ["path", { d: "M4 9.5h3.5L12 5.5v13l-4.5-4H4z", fill: "currentColor" }],
      ["path", { d: "M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" }]],
    signal: [["path", { d: "M3 18h2.5v-3H3zM7.5 18H10v-6H7.5zM12 18h2.5V9H12zM16.5 18H19V6h-2.5z", fill: "currentColor" }]],
    battery: [
      ["rect", { x: "2.5", y: "7", width: "17", height: "10", rx: "2.2", fill: "none", stroke: "currentColor", "stroke-width": "1.5" }],
      ["rect", { x: "4.5", y: "9", width: "11", height: "6", rx: "1", fill: "currentColor" }],
      ["path", { d: "M21 10.5v3", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" }]],
    back: [["path", { d: "M15 5l-7 7 7 7", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" }]],
    camera: [
      ["path", { d: "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z", fill: "currentColor" }],
      ["circle", { cx: "12", cy: "13", r: "3.6", fill: "none", stroke: "#000", "stroke-opacity": "0.35", "stroke-width": "1.8" }]],
    photos: [
      ["rect", { x: "3", y: "5", width: "18", height: "14", rx: "2", fill: "none", stroke: "currentColor", "stroke-width": "1.8" }],
      ["path", { d: "M4.5 17l5-5.5 3.5 3.5 2.5-2.5 4 4.5z", fill: "currentColor" }],
      ["circle", { cx: "16", cy: "9", r: "1.6", fill: "currentColor" }]],
    map: [
      ["path", { d: "M12 2.5a6.5 6.5 0 0 0-6.5 6.5c0 4.8 6.5 12.5 6.5 12.5s6.5-7.7 6.5-12.5A6.5 6.5 0 0 0 12 2.5z", fill: "currentColor" }],
      ["circle", { cx: "12", cy: "9", r: "2.4", fill: "#000", "fill-opacity": "0.3" }]],
    settings: [
      ["circle", { cx: "12", cy: "12", r: "3", fill: "none", stroke: "currentColor", "stroke-width": "2" }],
      ["path", { d: "M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round" }]],
    folder: [["path", { d: "M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2h8A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z", fill: "currentColor" }]],
    file: [["path", { d: "M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", fill: "currentColor" }], ["path", { d: "M14 3v5h5", fill: "none", stroke: "#000", "stroke-opacity": "0.25", "stroke-width": "1.5" }]],
    zip: [["path", { d: "M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", fill: "currentColor" }], ["path", { d: "M11 4h2M11 7h2M11 10h2M10.5 13h3v3h-3z", stroke: "#000", "stroke-opacity": "0.35", "stroke-width": "1.4" }]],
    exe: [["rect", { x: "3", y: "4", width: "18", height: "16", rx: "2", fill: "currentColor" }], ["path", { d: "M3 8h18", stroke: "#000", "stroke-opacity": "0.3", "stroke-width": "1.5" }], ["path", { d: "M8 12l3 2-3 2", fill: "none", stroke: "#000", "stroke-opacity": "0.4", "stroke-width": "1.5" }]],
    start: [["path", { d: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", fill: "currentColor" }]],
    bell: [["path", { d: "M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zM10 19a2 2 0 0 0 4 0", fill: "currentColor" }]],
    calendar: [["rect", { x: "3.5", y: "5", width: "17", height: "15", rx: "2", fill: "none", stroke: "currentColor", "stroke-width": "1.8" }], ["path", { d: "M3.5 9.5h17M8 3v4M16 3v4", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" }], ["rect", { x: "7", y: "12", width: "4", height: "4", rx: "1", fill: "currentColor" }]],
    browser: [["circle", { cx: "12", cy: "12", r: "8.5", fill: "none", stroke: "currentColor", "stroke-width": "1.8" }], ["path", { d: "M12 3.5a8.5 8.5 0 0 1 7.4 4.3H12M4.6 7.8 8.3 14.2M12 20.5l3.7-6.3", fill: "none", stroke: "currentColor", "stroke-width": "1.6" }], ["circle", { cx: "12", cy: "12", r: "3", fill: "currentColor" }]],
    chat: [
      ["path", { d: "M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 3.5V17H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", fill: "currentColor" }],
      ["path", { d: "M7.5 10h9M7.5 13h6", stroke: "#000", "stroke-opacity": "0.3", "stroke-width": "1.6", "stroke-linecap": "round" }]],
    minimize: [["path", { d: "M6 12h12", stroke: "currentColor", "stroke-width": "1.6", "stroke-linecap": "round" }]],
    maximize: [["rect", { x: "6", y: "6", width: "12", height: "12", rx: "1.5", fill: "none", stroke: "currentColor", "stroke-width": "1.6" }]],
    restore: [
      ["rect", { x: "5.5", y: "8.5", width: "10", height: "10", rx: "1.5", fill: "none", stroke: "currentColor", "stroke-width": "1.6" }],
      ["path", { d: "M8.5 8.5V6.5A1 1 0 0 1 9.5 5.5h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2", fill: "none", stroke: "currentColor", "stroke-width": "1.6" }]],
    download: [["path", { d: "M12 4v11M7 10.5l5 5 5-5M5 19.5h14", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" }]],
    close: [["path", { d: "M6 6l12 12M18 6L6 18", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round" }]],
    shield: [["path", { d: "M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z", fill: "currentColor" }]],
    trash: [["path", { d: "M5 7h14M9 7V4.5h6V7M7 7l1 13h8l1-13", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linejoin": "round" }]],
    lock: [
      ["rect", { x: "5", y: "10.5", width: "14", height: "10", rx: "2", fill: "currentColor" }],
      ["path", { d: "M8 10.5V8a4 4 0 0 1 8 0v2.5", fill: "none", stroke: "currentColor", "stroke-width": "1.8" }]]
  };

  SHAPES.search = [["circle", {cx:10, cy:10, r:6.5, fill:"none", stroke:"currentColor", "stroke-width":1.7}], ["path", {d:"m15 15 5 5", stroke:"currentColor", "stroke-width":1.7, "stroke-linecap":"round"}]];
  SHAPES.menu = [["path", {d:"M4 6h16M4 12h16M4 18h16", stroke:"currentColor", "stroke-width":1.8, "stroke-linecap":"round"}]];
  SHAPES.more = [["path", {d:"M5 12h.01M12 12h.01M19 12h.01", stroke:"currentColor", "stroke-width":3, "stroke-linecap":"round"}]];
  SHAPES.plus = [["path", {d:"M12 4v16M4 12h16", stroke:"currentColor", "stroke-width":1.6, "stroke-linecap":"round"}]];
  SHAPES.home = [["path", {d:"m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10", fill:"none", stroke:"currentColor", "stroke-width":1.7, "stroke-linejoin":"round"}]];
  SHAPES.person = [["circle", {cx:12,cy:7,r:4,fill:"none",stroke:"currentColor","stroke-width":1.7}], ["path", {d:"M4 21v-2a8 7 0 0 1 16 0v2",fill:"none",stroke:"currentColor","stroke-width":1.7}]];
  SHAPES.heart = [["path", {d:"M12 21 3 12C-2 5 8 0 12 7c4-7 14-2 9 5z",fill:"none",stroke:"currentColor","stroke-width":1.5,"stroke-linejoin":"round"}]];
  SHAPES.card = [["rect", {x:2,y:4,width:20,height:16,rx:3,fill:"none",stroke:"currentColor","stroke-width":1.7}], ["path", {d:"M2 9h20M6 15h5",stroke:"currentColor","stroke-width":1.7}]];
  SHAPES.gallery = SHAPES.photos;
  // 앱 타일 안에서는 여러 층과 색을 가진 전용 아이콘을 쓴다. 도구 버튼은 기존 단색을 유지한다.
  var APP_SHAPES = {
    mail: [
      ["rect", { x: 2, y: 5, width: 20, height: 15, rx: 2, fill: "#cce9ff" }],
      ["path", { d: "M2 7l10 7L22 7V5H2z", fill: "#83c8ff" }],
      ["path", { d: "M2 20V8l10 7L22 8v12z", fill: "#2984df" }],
      ["path", { d: "M2 20l8-7 2 2 2-2 8 7z", fill: "#429df2" }]],
    folder: [
      ["path", { d: "M2 5h8l2 2h10v13H2z", fill: "#d69018" }],
      ["path", { d: "M3 8h18v10H3z", fill: "#fff0c9" }],
      ["path", { d: "M1 10h22l-2 11H3z", fill: "#ffd15b" }],
      ["path", { d: "M1 10h22v2H1z", fill: "#ffe7a3" }]],
    browser: [
      ["circle", { cx: 12, cy: 12, r: 10, fill: "#22a7d8" }],
      ["path", { d: "M2 13C3 3 20 0 22 12c-5-7-14-4-14 2z", fill: "#45dbce" }],
      ["path", { d: "M22 12c0 13-20 13-20 1 4 6 14 7 18 0-6 4-13 0-11-4 5-3 11-2 13 3z", fill: "#2574d4" }],
      ["path", { d: "M3 15c4 5 13 6 18 0-4 9-16 8-18 0z", fill: "#1259ac" }]],
    chat: [
      ["path", { d: "M8 3h14v13h-4l-4 4v-4H8z", fill: "#42cfb1" }],
      ["path", { d: "M1 7h16v12H7l-4 3v-3H1z", fill: "#e9fff9" }],
      ["path", { d: "M5 11h8M5 14h6", stroke: "#269c8d", "stroke-width": 1.5, "stroke-linecap": "round" }]],
    calendar: [
      ["rect", { x: 3, y: 3, width: 18, height: 19, rx: 2, fill: "#f4f8ff" }],
      ["path", { d: "M3 3h18v6H3z", fill: "#4b9af1" }],
      ["path", { d: "M7 1v5M17 1v5", stroke: "#b8d9ff", "stroke-width": 2 }],
      ["path", { d: "M7 12h3v3H7zM13 12h3v3h-3zM7 17h3v3H7zM13 17h3v3h-3z", fill: "#347cce" }]],
    trash: [
      ["path", { d: "M5 6h14l-2 16H7z", fill: "#dceaf0", stroke: "#8babbc", "stroke-width": 1 }],
      ["path", { d: "M4 5h16M9 5V2h6v3", fill: "none", stroke: "#bfd5e1", "stroke-width": 2 }],
      ["path", { d: "M9 10v7M12 10v7M15 10v7", stroke: "#7d9aa9", "stroke-width": 1.3 }]]
  };
  APP_SHAPES.photos = [];
  for (var petal = 0; petal < 6; petal++) APP_SHAPES.photos.push(["ellipse", {cx:12,cy:7,rx:3.4,ry:5.1,fill:"#fff",transform:"rotate(" + petal*60 + " 12 12)"}]);
  APP_SHAPES.photos.push(["circle",{cx:12,cy:12,r:2.2,fill:"#f25e7c"}]);
  APP_SHAPES.gallery = APP_SHAPES.photos.map(function(shape){var attrs=Object.assign({},shape[1]);attrs.fill=attrs.fill==="#fff"?"#ed6385":"#ffe39a";return [shape[0],attrs];});
  APP_SHAPES.web = APP_SHAPES.browser;
  APP_SHAPES.talk = APP_SHAPES.chat;

  var BRAND_ASSETS = { talk: "kakao-app.png", chat: "kakao-app.png", web: "chrome.svg", browser: "chrome.svg", mail: "gmail-transparent.svg", moamall: "coupang-app.png", x: "x-app.png", blog: "blog-app.png", bank: "toss-app.png", map: "map-app.png" };
  var DESKTOP_ASSETS = { talk: "kakao-app.png", chat: "kakao-app.png", web: "chrome.svg", browser: "chrome.svg", mail: "gmail-transparent.svg" };
  function icon(name, size, app, surface) {
    if (app && BRAND_ASSETS[name]) {
      var img = document.createElement("img");
      var file = (surface === "desktop" && DESKTOP_ASSETS[name]) || BRAND_ASSETS[name];
      img.setAttribute("src", "assets/brands/" + file);
      img.setAttribute("alt", "");
      img.setAttribute("width", String(size || 24)); img.setAttribute("height", String(size || 24));
      img.setAttribute("class", "brand-art brand-" + name + (file.slice(-4) === ".svg" ? " logo-vector" : "") + (surface === "desktop" ? " desktop-art" : ""));
      return img;
    }
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size || 24));
    svg.setAttribute("height", String(size || 24));
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    if (app) svg.setAttribute("class", "app-art");
    ((app && APP_SHAPES[name]) || SHAPES[name] || []).forEach(function (s) {
      var n = document.createElementNS(NS, s[0]);
      Object.keys(s[1]).forEach(function (k) { n.setAttribute(k, s[1][k]); });
      svg.appendChild(n);
    });
    return svg;
  }

  root.MK_ICON = icon;
})(this);
