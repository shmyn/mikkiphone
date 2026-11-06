/*
 * 미끼폰 점수 계산 (기획서 6장)
 * - 순수 함수: 같은 기록을 넣으면 항상 같은 결과가 나온다. 화면·시간·난수에 의존하지 않는다.
 * - 피싱 record: { id, result, verify, reported, risky, rtMs, readMs }
 *     result : "safe" | "entered" | "exposed"
 * - 진짜 연락 record: { id, outcome }
 *     outcome: "handled"(읽거나 답하거나 받음) | "ignored"(손대지 않음) | "blocked"(삭제·신고)
 *     risky  : 1단계에서 위험 쪽(링크 열기·받기·답장)을 골랐는가
 *     rtMs   : 알림이 뜬 뒤 1단계 첫 탭까지 걸린 시간
 *     readMs : 그 알림의 읽기 기준시간(글자 수 × READ_MS_PER_CHAR)
 */
(function (root) {
  "use strict";

  var POINTS = { safe: 0, entered: 1, exposed: 3 };
  var OUTCOMES = { handled: 1, ignored: 1, blocked: 1 };
  var MAX_POINT = 3;
  var FORTRESS_R = 15;            // 6-4 규칙 1
  var FAST_RATIO = 0.5;           // 6-5 번개손 기준
  var READ_MS_PER_CHAR = 100;     // 6-5 읽기 계수(가정, 내부 테스트로 보정)
  var PRIORITY = ["권위", "긴급", "이득", "친밀"]; // 6-4 규칙 4 동점 순서

  function round1(x) { return Math.round(x * 10) / 10; }

  function readMsFor(text) {
    return String(text || "").length * READ_MS_PER_CHAR;
  }

  function score(records, data) {
    var byId = {};
    data.ITEMS.forEach(function (s) { byId[s.id] = s; });
    var has = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

    var phish = [], legit = [];
    records.forEach(function (rec) {
      var s = byId[rec.id];
      if (!s) throw new Error("unknown item: " + rec.id);
      if (s.kind === "phish") {
        if (!has(POINTS, rec.result)) throw new Error("bad result: " + rec.result);
        phish.push({ rec: rec, s: s });
      } else {
        if (!has(OUTCOMES, rec.outcome)) throw new Error("bad outcome: " + rec.outcome);
        legit.push({ rec: rec, s: s });
      }
    });

    // 6-3 축별 반응도
    var axes = {};
    data.AXES.forEach(function (a) { axes[a] = { got: 0, max: 0, exposures: 0 }; });
    var total = 0, exposures = 0, verifies = 0;
    phish.forEach(function (p) {
      var r = POINTS[p.rec.result];
      total += r;
      if (p.rec.result === "exposed") exposures += 1;
      if (p.rec.verify) verifies += 1;
      Object.keys(p.s.weights).forEach(function (a) {
        var w = p.s.weights[a];
        axes[a].got += w * r;
        axes[a].max += w * MAX_POINT;
        if (p.rec.result === "exposed") axes[a].exposures += 1;
      });
    });
    var S = {};
    data.AXES.forEach(function (a) {
      S[a] = axes[a].max > 0 ? round1(axes[a].got / axes[a].max * 100) : 0;
    });
    var R = phish.length ? round1(total / (phish.length * MAX_POINT) * 100) : 0;

    // 6-4 유형 판정
    var typeKey, tieBroken = false, topAxis = null;
    // 진짜 연락 처리(분별력): 의심만 잘하는 것과 구분하기 위한 지표
    var handled = legit.filter(function (l) { return l.rec.outcome === "handled"; }).length;
    var blocked = legit.filter(function (l) { return l.rec.outcome === "blocked"; }).length;
    var missedMost = legit.length > 0 && handled < legit.length / 2;
    if (R < FORTRESS_R && exposures === 0) {
      typeKey = missedMost ? "blocker" : "fortress";
    } else {
      var ranked = data.AXES.slice().sort(function (a, b) {
        if (S[b] !== S[a]) return S[b] - S[a];
        var ea = axes[a].exposures > 0 ? 1 : 0, eb = axes[b].exposures > 0 ? 1 : 0;
        if (eb !== ea) return eb - ea;
        return PRIORITY.indexOf(a) - PRIORITY.indexOf(b);
      });
      topAxis = ranked[0];
      tieBroken = S[ranked[0]] === S[ranked[1]];
      typeKey = data.AXIS_TO_TYPE[topAxis];
    }

    // 6-5 손 속도
    var risky = records.filter(function (r) { return r.risky; });
    var fast = risky.filter(function (r) { return r.rtMs < r.readMs; });
    var fastRatio = risky.length ? fast.length / risky.length : 0;
    var badge = risky.length > 0 && fastRatio >= FAST_RATIO ? "번개손" : "신중손";

    // 공유용 이모지(피싱만, 진행 순서)
    var EMOJI = { safe: "🟩", entered: "🟨", exposed: "🟥" };
    var emoji = phish.map(function (p) { return EMOJI[p.rec.result]; }).join("");

    return {
      typeKey: typeKey, topAxis: topAxis, tieBroken: tieBroken,
      R: R, S: S, total: total, exposures: exposures,
      phishCount: phish.length, verifies: verifies,
      badge: badge, fastCount: fast.length, riskyCount: risky.length,
      legitCount: legit.length, handled: handled, blocked: blocked, missedMost: missedMost,
      reported: phish.filter(function (p) { return p.rec.reported; }).length,
      emoji: emoji
    };
  }

  var API = { score: score, readMsFor: readMsFor, POINTS: POINTS, FORTRESS_R: FORTRESS_R, READ_MS_PER_CHAR: READ_MS_PER_CHAR };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.MK_SCORING = API;
})(this);
