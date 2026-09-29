"""把 drafts/ 裡的 Markdown 原稿轉成思考錄的文章頁。

用法（在 repo 根目錄）：
    pip install markdown
    python3 mind-journal/tools/md2piece.py mind-journal/drafts/原稿.md 文章代號
    python3 mind-journal/tools/md2piece.py --lines mind-journal/drafts/原稿.md 文章代號

--lines（逐行模式）給「一行一句、段落間不空行」的原稿用：
  每一行各自成段；整行是【…】的變成大標題；⬛ 開頭的變成小標題；
  「EXAMPLE.1放置處」（EAMPLE 也可）換成 drafts/ 裡的 EXAMPLE1.jpg，
  圖會縮到寬 2000px 以內，存到 pieces/img/文章代號-example1.jpg。

會輸出 mind-journal/pieces/文章代號.html，並印出字數。
原稿第一行的「# 標題」會略過（標題由 posts.js 管）；
## 以下的標題自動降一級，並產生文章開頭的目次。
"""
import hashlib
import html
import re
import sys
from pathlib import Path

import markdown
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def count_words(md_text):
    """中文字一字算一字，英文與數字一個詞算一字（與一般中文字數統計一致）。"""
    text = re.sub(r'```.*?```', lambda m: m.group(0).strip('`'), md_text, flags=re.S)
    text = re.sub(r'^\s*(#+|>|[-*]|\d+\.)\s*|\*\*|[|`]|^-{3,}\s*$|^[\s|:-]+$', '', text, flags=re.M)
    cjk = len(re.findall(r'[㐀-鿿豈-﫿]', text))
    latin = len(re.findall(r'[A-Za-z0-9]+(?:[.\'-][A-Za-z0-9]+)*', text))
    return cjk + latin


def build_toc(tokens):
    """## 標題（Part）一層、### 小節一層，做成可收合的目次。"""
    out = []
    for t in tokens:
        subs = ''.join(f'<li><a href="#{c["id"]}">{c["name"]}</a></li>' for c in t['children'])
        out.append(f'<li><a href="#{t["id"]}">{t["name"]}</a>' + (f'<ol>{subs}</ol>' if subs else '') + '</li>')
    return out


def slug(text, sep):
    """標題錨點：用內容算固定代號，重新轉檔也不會變。"""
    return 's-' + hashlib.md5(text.encode('utf-8')).hexdigest()[:8]


def place_image(src_dir, piece_id, n):
    """把 drafts/EXAMPLE{n}.jpg|png 縮成網頁用 JPG，回傳插圖的 HTML。"""
    for ext in ('jpg', 'jpeg', 'png'):
        f = src_dir / f'EXAMPLE{n}.{ext}'
        if f.exists():
            break
    else:
        sys.exit(f'找不到 {src_dir}/EXAMPLE{n}.jpg')
    out = ROOT / 'pieces' / 'img' / f'{piece_id}-example{n}.jpg'
    out.parent.mkdir(exist_ok=True)
    im = Image.open(f)
    if im.mode != 'RGB':
        bg = Image.new('RGB', im.size, 'white')
        bg.paste(im, mask=im.convert('RGBA').split()[3])
        im = bg
    im.thumbnail((2000, 2000), Image.LANCZOS)
    im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    rel = f'img/{out.name}'
    return (f'<figure class="md-fig"><a href="{rel}" target="_blank" rel="noopener">'
            f'<img src="{rel}" alt="圖 {n}" loading="lazy"></a>'
            f'<figcaption>圖 {n}　點圖看大圖</figcaption></figure>')


def lines_to_md(text, src_dir, piece_id):
    """逐行模式：把「一行一句」的原稿整理成一般 Markdown。"""
    out, prev_list = [], False
    for line in text.splitlines():
        s = line.strip()
        is_list = bool(re.match(r'(\d+\.|[-*])\s', s))
        if prev_list and not is_list:
            out.append('')
        if not s:
            out.append('')
        elif m := re.fullmatch(r'\**【([^】]+)】\**', s):
            out += ['', '## ' + m.group(1).strip(), '']
        elif s.startswith('⬛'):
            out += ['', '### ' + s.lstrip('⬛').strip(), '']
        elif m := re.fullmatch(r'E?X?AMPLE\.?(\d+)放置處', s, flags=re.I):
            out += ['', place_image(src_dir, piece_id, int(m.group(1))), '']
        elif is_list:
            if not prev_list:
                out.append('')
            out.append(s)
        else:
            out += [s, '']
        prev_list = is_list
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out))


def main(src, piece_id, lines=False):
    md_text = Path(src).read_text(encoding='utf-8')
    body_md = re.sub(r'\A\s*# .*\n', '', md_text)          # 去掉一級標題
    if lines:
        body_md = lines_to_md(body_md, Path(src).resolve().parent, piece_id)
    md = markdown.Markdown(
        extensions=['tables', 'fenced_code', 'sane_lists', 'toc'],
        extension_configs={'toc': {'baselevel': 2, 'slugify': slug}},
    )
    body = md.convert(body_md)
    body = re.sub(r'<table>', '<div class="table-wrap"><table>', body)
    body = body.replace('</table>', '</table></div>')

    toc_items = build_toc(md.toc_tokens)
    toc = ('<details class="work-toc">\n      <summary>目次</summary>\n      <ol>'
           + ''.join(toc_items) + '</ol>\n    </details>') if toc_items else ''

    template = (ROOT / 'pieces' / '_template-piece.html').read_text(encoding='utf-8')
    page = re.sub(r'<!--\n  =+\n  文章模板.*?-->\n', '', template, flags=re.S)
    page = page.replace('data-id="thinking-00"', f'data-id="{html.escape(piece_id)}"')
    page = re.sub(
        r'<!-- =+ 正文 =+ -->\n    <div class="essay-body">.*?</div>\n  </article>',
        lambda _: ('<!-- ============ 正文（由 tools/md2piece.py 從 Markdown 原稿轉出） ============ -->\n    '
                   + toc + '\n    <div class="essay-body md">\n' + body
                   + '\n      <p class="essay-sign">──猩其一</p>\n    </div>\n  </article>'),
        page, flags=re.S)
    out = ROOT / 'pieces' / f'{piece_id}.html'
    out.write_text(page, encoding='utf-8')
    print(f'寫出 {out.relative_to(ROOT.parent)}　字數 {count_words(body_md):,}')


if __name__ == '__main__':
    args = sys.argv[1:]
    lines = '--lines' in args
    args = [a for a in args if a != '--lines']
    if len(args) != 2:
        sys.exit(__doc__)
    main(args[0], args[1], lines)
