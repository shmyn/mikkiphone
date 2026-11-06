// 보안 점검: 바이브코딩 결과물에서 자주 생기는 실수를 자동으로 막는다.
// 실행: npm test
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const list = (dir, ext) =>
  fs.existsSync(path.join(ROOT, dir))
    ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(ext)).map((f) => path.join(dir, f))
    : [];

const JS = list("js", ".js");
const HTML = ["index.html", ...list("r", ".html")];
const SHIPPED = [...JS, ...HTML, "css/style.css", "css/apps.css"];

test("XSS 위험 API를 쓰지 않는다 (innerHTML, eval 등)", () => {
  const banned = [/\.innerHTML\b/, /\.outerHTML\b/, /insertAdjacentHTML/, /document\.write/, /\beval\s*\(/, /new\s+Function\s*\(/, /set(Timeout|Interval)\s*\(\s*["'`]/];
  for (const f of JS) for (const re of banned) assert.doesNotMatch(read(f), re, `${f}: ${re}`);
});

test("브라우저 저장소에 아무것도 남기지 않는다", () => {
  for (const f of JS) assert.doesNotMatch(read(f), /\b(localStorage|sessionStorage|indexedDB|document\.cookie)\b/, f);
});

test("입력칸·폼을 만들지 않는다 (가짜 로그인 화면 오해 방지)", () => {
  for (const f of [...JS, ...HTML]) {
    assert.doesNotMatch(read(f), /<\s*(input|textarea|form)\b/i, f);
    assert.doesNotMatch(read(f), /createElement\(\s*["'](input|textarea|form)["']/, f);
  }
});

test("HTML에 인라인 스크립트·인라인 이벤트·인라인 스타일이 없다 (엄격한 CSP 유지)", () => {
  for (const f of HTML) {
    const html = read(f);
    assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i, `${f}: inline <script>`);
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i, `${f}: inline handler`);
    assert.doesNotMatch(html, /\sstyle\s*=/i, `${f}: inline style`);
    assert.doesNotMatch(html, /<style\b/i, `${f}: <style>`);
  }
});

test("모든 HTML에 CSP와 no-referrer가 있다", () => {
  for (const f of HTML) {
    const html = read(f);
    assert.match(html, /http-equiv="Content-Security-Policy"/, f);
    assert.match(html, /script-src 'self'/, f);
    assert.doesNotMatch(html, /unsafe-(inline|eval)/, f);
    assert.match(html, /name="referrer" content="no-referrer"/, f);
  }
});

test("외부 스크립트·스타일을 불러오지 않는다 (공급망 위험 0)", () => {
  for (const f of HTML) {
    assert.doesNotMatch(read(f), /<script[^>]+src=["']https?:/i, f);
    assert.doesNotMatch(read(f), /<link[^>]+href=["']https?:/i, f);
  }
});

test("코드에 등장하는 외부 주소는 허용 목록뿐이다", () => {
  const allowed = ["https://x.com/intent/tweet", "http://www.w3.org/2000/svg"]; // 두 번째는 SVG 이름공간(네트워크 요청 아님)
  for (const f of JS) {
    const urls = read(f).match(/https?:\/\/[^\s"'`)]+/g) || [];
    for (const u of urls) {
      const ok = allowed.some((a) => u.startsWith(a)) || u.includes(".github.io/");
      assert.ok(ok, `${f}: 허용되지 않은 주소 ${u}`);
    }
  }
});

test("비밀 값(API 키·토큰)이 저장소에 없다", () => {
  const secret = [/sk-[A-Za-z0-9_-]{20,}/, /AKIA[0-9A-Z]{16}/, /ghp_[A-Za-z0-9]{30,}/, /AIza[0-9A-Za-z_-]{30,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /api[_-]?key\s*[:=]\s*["'][^"']+["']/i];
  for (const f of SHIPPED) for (const re of secret) assert.doesNotMatch(read(f), re, `${f}: ${re}`);
});

test("새 창은 opener를 끊고 연다", () => {
  for (const f of JS) {
    const opens = read(f).match(/window\.open\([^)]*\)/g) || [];
    for (const o of opens) assert.match(o, /noopener/, `${f}: ${o}`);
  }
});
