# 作畫紀錄

猴零士的畫畫練習，做成一座美術館。與舊館「習作輯」（`art-journal/`）並存。

| 頁面 | 內容 |
|------|------|
| `index.html` | 大廳：樓層平面圖、展廳目錄、現正展出 |
| `gallery.html?g=class` | 展廳：class 上課筆記／daily 日常練習／study 自主研究／works 完成作品 |
| `exhibit.html?id=…` | 展覽：牆上文字、作品（點圖看大圖）、創作者自述 |

所有內容都來自 **`data.js`**，頁面本身不用改。

## 新增一檔展覽（例如開一門新課）

1. 在 `data.js` 的 `EXHIBITS` 照抄一段，改 `id`、`gallery`、`title`、`teacher`、`period`、`intro`
2. `status`：`open` 上課中／還在畫，`closed` 已完課（變成常設展），`soon` 即將開展
3. 圖片放進 `dir` 指的資料夾（建議 `drawing-log/works/展覽代號/`）

## 掛上新的畫

1. 圖片（JPG／PNG，寬約 2000px）放進該展覽的資料夾
2. 在那檔展覽的 `sections` 裡加一行：`{ f:"檔名.jpg", title:"標題", date:"2026.10.23", medium:"數位", note:"一句話" }`
3. 做縮圖：`python3 drawing-log/tools/thumbs.py 圖片資料夾`
4. 有課後心得就寫進 `essay`

> KK速寫團練第2期的圖是直接引用舊館 `art-journal/courses/krenz-training-2026-08/homework/` 的檔案，沒有搬動。
