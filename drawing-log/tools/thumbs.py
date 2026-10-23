"""幫展覽的圖做縮圖（展廳列表與牆上用小圖，點開才載入原圖）。

用法（在 repo 根目錄）：
    python3 drawing-log/tools/thumbs.py 圖片資料夾 [圖片資料夾 ...]

資料夾裡的 jpg／png 會縮到 640×960 以內，存成 drawing-log/thumbs/同檔名.jpg。
已經有縮圖且原圖沒更新的會跳過。
"""
import sys
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / 'thumbs'


def main(folders):
    OUT.mkdir(exist_ok=True)
    made = 0
    for folder in folders:
        for f in sorted(Path(folder).iterdir()):
            if f.suffix.lower() not in ('.jpg', '.jpeg', '.png'):
                continue
            dst = OUT / (f.stem + '.jpg')
            if dst.exists() and dst.stat().st_mtime >= f.stat().st_mtime:
                continue
            im = Image.open(f)
            if im.mode != 'RGB':
                bg = Image.new('RGB', im.size, 'white')
                bg.paste(im, mask=im.convert('RGBA').split()[3])
                im = bg
            im.thumbnail((640, 960), Image.LANCZOS)
            im.save(dst, 'JPEG', quality=80, optimize=True, progressive=True)
            made += 1
    print(f'做好 {made} 張縮圖 → {OUT}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
