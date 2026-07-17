# 操作備忘

日常會用到的所有步驟都在這裡，照抄即可。

---

## 一、日常上傳（每次更新都是這三行）

在 VS Code 按 <code>Ctrl + `</code> 打開終端機，依序執行：

```
git add .
git commit -m "這次改了什麼"
git push
```

- 第一行：把所有變更加入
- 第二行：提交，引號裡簡短寫明內容，例如 `透視課 第2堂作業：兩點透視街景`
- 第三行：推上 GitHub，等一分鐘左右網站就會更新

### push 被拒絕（email privacy）時

```
git config --global user.email "你的匿名信箱@users.noreply.github.com"
git commit --amend --reset-author --no-edit
git push
```

匿名信箱到 https://github.com/settings/emails 的
「Keep my email addresses private」段落複製，長得像 `12345678+帳號@users.noreply.github.com`。
設定一次即可，之後不會再遇到。

---

## 二、新增一張圖片

### 1. 輸出圖檔

- 從繪圖軟體輸出 JPG 或 PNG，寬約 2000px、品質 80%
- 原始檔（PSD、CLIP）不要放進來，.gitignore 已自動擋掉
- 檔名規則：日期開頭、全英文、用連字號、不要空格和中文

```
2026-08-03_two-point-box_01.jpg
```

### 2. 放進對應資料夾

直接拖進 VS Code 左邊的檔案樹：

| 內容 | 資料夾 |
|------|--------|
| 透視課作業 | `courses/krenz-perspective/homework/` |
| 團練作業 | `courses/krenz-training-2026-08/homework/` |
| 自主研究 | `studies/`（每個主題開一個子資料夾） |
| 完成作品 | `works/` |

### 3. 顯示在畫冊上

打開對應的章節頁（透視課是 `perspective.html`），
把佔位的整段 `<svg> ... </svg>` 刪掉，換成一行 `<img>`；
四行 `corner` 是相角，要留著：

```html
<div class="mount">
  <span class="corner tl"></span><span class="corner tr"></span>
  <span class="corner bl"></span><span class="corner br"></span>
  <img src="courses/krenz-perspective/homework/2026-08-03_two-point-box_01.jpg" alt="兩點透視箱體練習">
</div>
```

再改下方 `figcaption` 的四行圖說：編號日期、標題、媒材、一句檢討。

### 4. 要加更多張圖

複製整個區塊（從 `<figure class="plate reveal">` 到 `</figure>`）
貼在下面，改路徑和圖說，圖版編號往下編（圖版 二、圖版 三）。

完成後回到「一、日常上傳」推上去。

---

## 三、開一門新課程

1. 複製 `_template-course.html`，改名（例：`figure-2026-10.html`，全英文）
2. 打開新檔案，照裡面的註解改：輯數、課程名稱、說明、V.P. 位置
3. 打開 `index.html`，在目次複製一列 `<a class="toc-row">`，改連結和名稱
4. 在 `courses/` 底下開對應的新資料夾放筆記和作業
5. 上傳

---

## 四、本機預覽

- 直接雙擊 `index.html` 就能在瀏覽器看，不需要伺服器
- 要「存檔自動刷新」的話，裝擴充功能 Live Server，
  對 `index.html` 右鍵選 Open with Live Server

---

## 五、常見問題

| 狀況 | 原因與解法 |
|------|-----------|
| 本機看得到圖，上線變破圖 | 路徑或大小寫不符。GitHub 分大小寫，`Box.JPG` 和 `box.jpg` 是兩個檔，檢查 `src` 是否和檔名一字不差 |
| push 被拒（email privacy） | 見「一、日常上傳」的處理方式 |
| push 說沒有遠端（no remote） | `git remote add origin https://github.com/帳號/repo名.git` 之後 `git push -u origin main` |
| 網頁沒更新 | 等一兩分鐘；還是舊的就按 Ctrl + F5 強制刷新，或到 repo 的 Actions 分頁看部署是否完成 |
| repo 越來越肥 | 檢查是否誤傳原始檔或超大圖；單檔上限 100MB，整個 repo 建議壓在 1GB 內 |
