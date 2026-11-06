// 실행: npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const COMMON = require("../js/data.common.js");
const PHONE = require("../js/data.phone.js");
const PC = require("../js/data.pc.js");
const { score } = require("../js/scoring.js");

const MODES = { 휴대폰: PHONE, PC };
const asData = (D) => ({ AXES: COMMON.AXES, AXIS_TO_TYPE: COMMON.AXIS_TO_TYPE, ITEMS: D.ITEMS });

function play(D, phishOver = {}, legitOutcome = "handled") {
  return D.ITEMS.filter((s) => s.kind !== "ambient").map((s) => {
    if (s.kind === "legit") return { id: s.id, outcome: typeof legitOutcome === "function" ? legitOutcome(s) : legitOutcome };
    const o = phishOver[s.id] || {};
    return { id: s.id, result: o.result || "safe", verify: !!o.verify, reported: !!o.reported, risky: !!o.risky, rtMs: o.rtMs ?? 5000, readMs: o.readMs ?? 4000 };
  });
}

for (const [name, D] of Object.entries(MODES)) {
  const PHISH = D.ITEMS.filter((s) => s.kind === "phish");
  const LEGIT = D.ITEMS.filter((s) => s.kind === "legit");
  const byId = (id) => D.ITEMS.find((i) => i.id === id);

  test(`[${name}] 미끼 8개, 진짜 연락 9개 이상`, () => {
    assert.equal(PHISH.length, 8);
    assert.ok(LEGIT.length >= 9, String(LEGIT.length));
  });

  test(`[${name}] 네 심리 축마다 주축 미끼가 2개씩`, () => {
    for (const a of COMMON.AXES) assert.equal(PHISH.filter((p) => p.weights[a] === 1).length, 2, a);
  });

  test(`[${name}] 미끼와 진짜 연락이 섞여 온다 (같은 종류 연속 3개 이하)`, () => {
    const timed = D.ITEMS.filter((s) => s.at != null && s.kind !== "ambient").sort((a, b) => a.at - b.at).map((s) => s.kind);
    let run = 1;
    for (let i = 1; i < timed.length; i++) { run = timed[i] === timed[i - 1] ? run + 1 : 1; assert.ok(run <= 3); }
  });

  test(`[${name}] 가짜는 진짜 대화방에 섞이지 않고, 새 방은 기록 없이 시작`, () => {
    const legitThreads = new Set(LEGIT.filter((i) => i.thread).map((i) => i.thread));
    for (const p of PHISH.filter((i) => i.thread)) {
      assert.ok(!legitThreads.has(p.thread), p.id);
      assert.equal(D.THREADS[p.thread].saved, false, p.id);
      assert.equal(D.THREADS[p.thread].history.length, 0, p.id);
    }
  });

  test(`[${name}] 쓰던 기기처럼 지난 기록이 있는 대화방이 5개 이상`, () => {
    assert.ok(Object.values(D.THREADS).filter((t) => t.history.length).length >= 5);
  });

  test(`[${name}] 도메인은 예약 도메인(.example)만, 전화번호는 가린 형태만`, () => {
    const json = JSON.stringify(D);
    assert.deepEqual(json.match(/[a-z0-9.-]+\.(com|net|kr|org|io|co)\b/gi) || [], []);
    assert.doesNotMatch(json, /\b0\d{1,2}-\d{3,4}-\d{4}\b/);
    assert.doesNotMatch(json, /\b1[5-9]\d{2}-\d{4}\b/);
  });

  test(`[${name}] 모든 미끼에 원래 채널로 확인할 방법이 있다`, () => {
    const keys = new Set(["moamall_orders", "moamall_notice", "bank_notice", "bank_lost"]);
    Object.values(D.PAGES).forEach((p) => p.verify && keys.add(p.verify));
    (D.CONTACTS || []).forEach((c) => Object.values(c.dialog.nodes).forEach((n) => (n.choices || []).forEach((ch) => ch.verify && keys.add(ch.verify))));
    Object.values(D.THREADS).forEach((t) => (t.asks || []).forEach((a) => a.verify && keys.add(a.verify)));
    for (const p of PHISH) assert.ok(p.verifyBy.some((k) => keys.has(k)), p.id);
  });

  test(`[${name}] 통화 대화와 질문은 존재하는 장면·연락으로만 이어진다`, () => {
    const dialogs = D.ITEMS.filter((i) => i.dialog).map((i) => i.dialog).concat((D.CONTACTS || []).map((c) => c.dialog));
    for (const d of dialogs) {
      assert.ok(d.nodes[d.start]);
      for (const n of Object.values(d.nodes)) {
        assert.ok(n.end || (n.choices && n.choices.length));
        for (const c of n.choices || []) assert.ok(d.nodes[c.to], c.to);
      }
    }
    Object.values(D.THREADS).forEach((t) => (t.asks || []).forEach((a) => {
      if (a.ifArrived) assert.ok(byId(a.ifArrived), a.ifArrived);
      if (a.deliver) assert.ok(byId(a.deliver), a.deliver);
    }));
  });

  test(`[${name}] 볼일 다 보고 미끼 안 물면 분별형, 진짜 연락 절반 넘게 놓치면 일단 차단형`, () => {
    assert.equal(score(play(D), asData(D)).typeKey, "fortress");
    assert.equal(score(play(D, {}, "ignored"), asData(D)).typeKey, "blocker");
  });

  test(`[${name}] 노출 1번이면 분별형이 아니다`, () => {
    const r = score(play(D, { [PHISH[0].id]: { result: "exposed" } }), asData(D));
    assert.notEqual(r.typeKey, "fortress");
  });

  test(`[${name}] 전부 노출이면 위험 지수 100, 동점은 권위 우선`, () => {
    const over = Object.fromEntries(PHISH.map((p) => [p.id, { result: "exposed" }]));
    const r = score(play(D, over), asData(D));
    assert.equal(r.R, 100);
    assert.equal(r.typeKey, "authority");
  });
}

test("[휴대폰] 진짜 택배 문자는 같은 대화방, 010 진짜 연락과 010이 아닌 미끼가 모두 있다", () => {
  const f = (id) => PHONE.ITEMS.find((i) => i.id === id);
  assert.equal(f("L9").thread, f("L3").thread);
  assert.ok(PHONE.ITEMS.some((i) => i.kind === "legit" && /^010/.test(i.caller || "")));
  assert.ok(PHONE.ITEMS.some((i) => i.kind === "phish" && i.thread && !/^010/.test(PHONE.THREADS[i.thread].name)));
});

test("[PC] 거래처 사칭 메일은 진짜와 이름이 같고 주소만 다르다", () => {
  assert.equal(PC.THREADS.pm_p2.name, PC.THREADS.pm_partner.name);
  assert.notEqual(PC.THREADS.pm_p2.from, PC.THREADS.pm_partner.from);
});

test("동점이면 노출이 나온 축이 우선순위보다 먼저", () => {
  const fake = { AXES: COMMON.AXES, AXIS_TO_TYPE: COMMON.AXIS_TO_TYPE, ITEMS: [
    { id: "a", kind: "phish", weights: { "권위": 1 } },
    { id: "c1", kind: "phish", weights: { "친밀": 1 } }, { id: "c2", kind: "phish", weights: { "친밀": 1 } }, { id: "c3", kind: "phish", weights: { "친밀": 1 } }] };
  const recs = [{ id: "a", result: "entered" }, { id: "c1", result: "exposed" }, { id: "c2", result: "safe" }, { id: "c3", result: "safe" }]
    .map((x) => ({ ...x, risky: false, rtMs: 0, readMs: 0 }));
  const r = score(recs, fake);
  assert.equal(r.S["권위"], r.S["친밀"]);
  assert.equal(r.typeKey, "intimacy");
});

test("손 속도: 위험 선택 절반 이상이 기준시간보다 빠르면 번개손", () => {
  const D = PHONE, P = D.ITEMS.filter((s) => s.kind === "phish");
  const r = score(play(D, { [P[0].id]: { result: "entered", risky: true, rtMs: 1000, readMs: 5000 }, [P[1].id]: { result: "entered", risky: true, rtMs: 9000, readMs: 5000 } }), asData(D));
  assert.equal(r.badge, "번개손");
});

test("알 수 없는 항목이나 값은 거부한다", () => {
  const d = asData(PHONE);
  assert.throws(() => score([{ id: "zz", result: "safe" }], d));
  assert.throws(() => score([{ id: "s1", result: "hacked" }], d));
  assert.throws(() => score([{ id: "L1", outcome: "maybe" }], d));
});
