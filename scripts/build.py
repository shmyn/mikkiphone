#!/usr/bin/env python3
"""
미끼폰 빌드 스크립트 (개발용, 배포 사이트에는 포함되지 않아도 됨)

하는 일
1. 유형별 결과 페이지 r/<유형>.html 6개 생성
   - 공유 링크를 X에 올렸을 때 미리보기에 '내 유형'이 보이게 하려는 목적.
   - 서버 없이 정적 파일로 해결한다.
2. 미리보기 이미지 og/*.png 생성 (기본 1장 + 유형 6장 + 파비콘)
3. 단일 파일 미리보기 dist/preview.html 생성 (CSS·JS 인라인. 배포용 아님)

사용법
  python3 scripts/build.py --site https://<아이디>.github.io/mikkiphone/
  --site 를 주면 js/config.js 의 SITE_URL 도 함께 바꾼다.
"""
import argparse, json, re, subprocess, base64, mimetypes
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent.parent
FONT_BOLD = next((str(p) for p in [Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"), Path("C:/Windows/Fonts/malgunbd.ttf")] if p.exists()), "")
FONT_REG = next((str(p) for p in [Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"), Path("C:/Windows/Fonts/malgun.ttf")] if p.exists()), "")

CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; "
       "font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; "
       "frame-src 'none'; manifest-src 'self'; upgrade-insecure-requests")


def load_types():
    # data.js 를 node 로 읽어 JSON 으로 받는다(데이터를 두 번 쓰지 않기 위해)
    out = subprocess.check_output(["node", "-e", "process.stdout.write(JSON.stringify(require('./js/data.common.js').TYPES))"], cwd=ROOT)
    return json.loads(out)


def set_site(site):
    if not re.match(r"^https://[A-Za-z0-9.-]+(/[A-Za-z0-9._~/-]*)?/$", site):
        raise SystemExit("--site 는 https:// 로 시작하고 / 로 끝나야 합니다.")
    cfg = ROOT / "js/config.js"
    text = cfg.read_text(encoding="utf-8")
    text = re.sub(r'SITE_URL: "[^"]*"', f'SITE_URL: "{site}"', text)
    cfg.write_text(text, encoding="utf-8")
    # 링크 미리보기는 절대 주소가 필요하다
    idx = ROOT / "index.html"
    html = idx.read_text(encoding="utf-8")
    html = re.sub(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{site}og/default.png">', html)
    if 'property="og:url"' not in html:
        html = html.replace('<meta name="twitter:card"', f'<meta property="og:url" content="{site}">\n  <meta name="twitter:card"', 1)
    idx.write_text(html, encoding="utf-8")


def result_page(key, t, site):
    img = f"{site}og/{key}.png" if site else f"../og/{key}.png"
    url = f"{site}r/{key}.html" if site else ""
    og_url = f'\n  <meta property="og:url" content="{escape(url)}">' if url else ""
    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="{CSP}">
  <meta name="referrer" content="no-referrer">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>미끼폰 결과: {escape(t['name'])}</title>
  <meta property="og:type" content="website">
  <meta property="og:title" content="미끼폰 결과: {escape(t['name'])}">
  <meta property="og:description" content="{escape(t['line'])} 진짜와 미끼를 가를 수 있을까?">
  <meta property="og:image" content="{escape(img)}">{og_url}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../og/favicon.png">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <main class="stage">
    <section class="startcard">
      <div class="bobber" aria-hidden="true"></div>
      <h1 class="wordmark">미끼폰</h1>
      <p class="lede">친구의 결과: {escape(t['name'])}</p>
      <div class="modes"><a class="modebtn" href="../index.html">나도 해보기</a></div>
    </section>
  </main>
</body>
</html>
"""


def og_image(path, title, sub):
    from PIL import Image, ImageDraw, ImageFont
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), "#dbe6ea")
    d = ImageDraw.Draw(im)
    for y in range(46, H, 47):
        d.line([(0, y), (W, y)], fill="#c6d6dc")
    # 낚시찌
    cx, cy = 120, 150
    d.rectangle([cx - 2, cy - 70, cx + 2, cy - 30], fill="#15242c")
    d.pieslice([cx - 36, cy - 40, cx + 36, cy + 56], 180, 360, fill="#e0412b")
    d.pieslice([cx - 36, cy - 20, cx + 36, cy + 48], 0, 180, fill="#f7f7f2")
    fb = ImageFont.truetype(FONT_BOLD, 40, index=(1 if FONT_BOLD.endswith(".ttc") else 0))
    d.text((190, 120), "미끼폰", font=fb, fill="#15242c")
    size = 84
    ft = ImageFont.truetype(FONT_BOLD, size, index=(1 if FONT_BOLD.endswith(".ttc") else 0))
    while d.textlength(title, font=ft) > W - 200 and size > 48:
        size -= 4
        ft = ImageFont.truetype(FONT_BOLD, size, index=(1 if FONT_BOLD.endswith(".ttc") else 0))
    d.text((100, 280), title, font=ft, fill="#15242c")
    fs = ImageFont.truetype(FONT_REG, 38, index=(1 if FONT_BOLD.endswith(".ttc") else 0))
    d.text((100, 280 + size + 36), sub, font=fs, fill="#4b5f69")
    colors = ["#2b8659", "#d6971b", "#e0412b", "#2b8659", "#2b8659", "#d6971b", "#2b8659", "#e0412b"]
    for i, c in enumerate(colors):
        x = 100 + i * 66
        d.rounded_rectangle([x, 520, x + 52, 572], radius=10, fill=c)
    im.save(path, optimize=True)


def favicon(path):
    from PIL import Image, ImageDraw
    im = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([31, 2, 33, 14], fill="#15242c")
    d.pieslice([14, 12, 50, 62], 180, 360, fill="#e0412b")
    d.pieslice([14, 22, 50, 58], 0, 180, fill="#f7f7f2")
    im.save(path)


def preview():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "css/style.css").read_text(encoding="utf-8")
    html = re.sub(r'\s*<meta http-equiv="Content-Security-Policy"[^>]*>', "", html)
    html = html.replace('<link rel="stylesheet" href="css/style.css">', f"<style>\n{css}\n</style>")
    html = html.replace('<link rel="stylesheet" href="css/apps.css">', "<style>\n" + (ROOT / "css/apps.css").read_text(encoding="utf-8") + "\n</style>")
    html = re.sub(r'\s*<link rel="icon"[^>]*>', "", html)
    html = re.sub(r'\s*<meta property="og:image"[^>]*>', "", html)
    for js in ["config", "icons", "data.common", "data.phone", "data.pc", "scoring", "core", "world", "social", "phone", "pc", "main"]:
        code = (ROOT / f"js/{js}.js").read_text(encoding="utf-8")
        html = html.replace(f'<script src="js/{js}.js"></script>', f"<script>\n{code}\n</script>")
    images = {}
    for image_path in (ROOT / "assets").rglob("*"):
        if image_path.is_file() and image_path.suffix.lower() in (".jpg", ".png", ".svg"):
            relative = image_path.relative_to(ROOT).as_posix()
            mime = mimetypes.guess_type(relative)[0] or "application/octet-stream"
            images[relative] = "data:" + mime + ";base64," + base64.b64encode(image_path.read_bytes()).decode("ascii")
    # DOM helper covers photos; the icon module sets brand image src directly.
    asset_code = "var previewAssets = " + json.dumps(images) + ";"
    html = html.replace('  function el(tag, opts) {', '  ' + asset_code + '\n  function el(tag, opts) {')
    html = html.replace('if (opts.attrs) Object.keys(opts.attrs)', 'if (opts.attrs && opts.attrs.src && previewAssets[opts.attrs.src]) opts.attrs.src = previewAssets[opts.attrs.src];\n    if (opts.attrs) Object.keys(opts.attrs)')
    html = html.replace('MK.asset = function (path) { return path; };', 'MK.asset = function (path) { return previewAssets[path] || path; };')
    brand_code = "var previewBrands = " + json.dumps({key: value for key, value in images.items() if key.startswith("assets/brands/")}) + ";"
    html = html.replace('  var BRAND_ASSETS =', '  ' + brand_code + '\n  var BRAND_ASSETS =')
    html = html.replace('img.setAttribute("src", "assets/brands/" + file);', 'img.setAttribute("src", previewBrands["assets/brands/" + file]);')
    out = ROOT / "dist/preview.html"
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default="")
    a = ap.parse_args()
    if a.site:
        set_site(a.site)
    types = load_types()
    (ROOT / "r").mkdir(exist_ok=True)
    (ROOT / "og").mkdir(exist_ok=True)
    for key, t in types.items():
        (ROOT / f"r/{key}.html").write_text(result_page(key, t, a.site), encoding="utf-8")
        og_image(ROOT / f"og/{key}.png", t["name"], t["line"])
    og_image(ROOT / "og/default.png", "나는 어떻게 낚이는 사람일까", "가상 휴대폰·PC 피싱 시뮬레이션")
    favicon(ROOT / "og/favicon.png")
    preview()
    print("built:", ", ".join(sorted(types)))


if __name__ == "__main__":
    main()
