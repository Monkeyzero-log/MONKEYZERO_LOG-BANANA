/* ================================================================
   作畫紀錄 · 館藏資料（全館唯一要手動維護的檔案）
   ----------------------------------------------------------------
   GALLERIES：四個展廳。EXHIBITS：每一檔展覽（一門課、一個系列）。

   新增一檔展覽：在 EXHIBITS 加一段 { … }，照抄現有的改內容。
     id       網址用的代號（英文、連字號）
     gallery  放在哪個展廳：class 上課筆記／daily 日常練習／study 自主研究／works 完成作品
     status   open 展出中（上課中、還在畫）／closed 常設展（已完課、已完成）／soon 即將開展
     dir      這檔展覽的圖放在哪個資料夾（相對於 drawing-log/）
     cover    封面用哪張圖（填檔名）
     sections 牆面分區；每區的 pieces 是一張張作品：
              f 檔名、title 標題、date 日期、medium 媒材、note 一句話（可省略）
     essay    課後心得（可省略）
   新增圖片：放進 dir 指的資料夾，再跑 python3 drawing-log/tools/thumbs.py 資料夾 做縮圖。
   ================================================================ */

var GALLERIES = [
  { id:'class', no:'01', name:'上課筆記', en:'Class Notes',    desc:'每門課一檔展覽：課程資訊、每次作業、課後心得。' },
  { id:'daily', no:'02', name:'日常練習', en:'Daily Practice', desc:'速寫、臨摹、每日一練，依日期陳列。' },
  { id:'study', no:'03', name:'自主研究', en:'Self Study',     desc:'自己出題、自己找答案：某位畫師的用色、手的畫法……' },
  { id:'works', no:'04', name:'完成作品', en:'Finished Works', desc:'畫完了，可以拿出來見人的。' }
];

var EXHIBITS = [
  {
    id:'kk-speed-2', gallery:'class', status:'closed',
    title:'KK速寫團練第2期', en:'KK Gesture Drawing Camp · Vol. 2',
    teacher:'Krenz', period:'2026.08.11 – 2026.09.23',
    dir:'../art-journal/courses/krenz-training-2026-08/homework/',
    cover:'2026-09_camp-last-day.jpg',
    intro:'八月開營、九月完課的速寫團練。開營試畫之後拖了一個月，最後兩週一口氣追完——從只會畫頭，到開始看懂衣服的走向、四肢怎麼分。以下依時間陳列全部作業，最後附上課後心得。',
    legacy:'../art-journal/training-2026-08.html',
    sections:[
      { title:'開營 ／ 結營對照', note:'同一個題目，第一天和最後一天。', layout:'pair', pieces:[
        { f:"2026-09_camp-first-day.jpg", title:"開營試畫", date:"2026.08.11", medium:"數位", note:"第一天" },
        { f:"2026-09_camp-last-day.jpg", title:"結營", date:"2026.09", medium:"數位", note:"最後一天" },
      ]},
      { title:'速寫 · 一', note:'', pieces:[
        { f:"2026-09_sketch-a-01.jpg", title:"速寫 A-01", date:"2026.09.10", medium:"數位" },
        { f:"2026-09_sketch-a-02.jpg", title:"速寫 A-02", date:"2026.09.11", medium:"數位" },
        { f:"2026-09_sketch-a-03.jpg", title:"速寫 A-03", date:"2026.09.11", medium:"數位" },
        { f:"2026-09_sketch-a-04.jpg", title:"速寫 A-04", date:"2026.09.12", medium:"數位" },
        { f:"2026-09_sketch-a-05.jpg", title:"速寫 A-05", date:"2026.09.12", medium:"數位" },
        { f:"2026-09_sketch-a-06.jpg", title:"速寫 A-06", date:"2026.09.13", medium:"數位" },
        { f:"2026-09_sketch-a-07.jpg", title:"速寫 A-07", date:"", medium:"數位" },
        { f:"2026-09_sketch-a-08.jpg", title:"速寫 A-08", date:"2026.09.14", medium:"數位" },
      ]},
      { title:'速寫 · 二', note:'', pieces:[
        { f:"2026-09_sketch-b-01.jpg", title:"速寫 B-01", date:"2026.09.14", medium:"數位" },
        { f:"2026-09_sketch-b-02.jpg", title:"速寫 B-02", date:"2026.09.15", medium:"數位" },
        { f:"2026-09_sketch-b-03.jpg", title:"速寫 B-03", date:"2026.09.15", medium:"數位" },
        { f:"2026-09_sketch-b-04.jpg", title:"速寫 B-04", date:"2026.09.16", medium:"數位" },
        { f:"2026-09_sketch-b-05.jpg", title:"速寫 B-05", date:"2026.09.16", medium:"數位" },
        { f:"2026-09_sketch-b-06.jpg", title:"速寫 B-06", date:"2026.09.16", medium:"數位" },
        { f:"2026-09_sketch-b-07.jpg", title:"速寫 B-07", date:"2026.09.17", medium:"數位" },
        { f:"2026-09_sketch-b-08.jpg", title:"速寫 B-08", date:"2026.09.17", medium:"數位" },
        { f:"2026-09_sketch-b-09.jpg", title:"速寫 B-09", date:"2026.09.17", medium:"數位" },
        { f:"2026-09_sketch-b-10.jpg", title:"速寫 B-10", date:"2026.09.17", medium:"數位" },
        { f:"2026-09_sketch-b-11.jpg", title:"速寫 B-11", date:"", medium:"數位" },
        { f:"2026-09_sketch-b-12.jpg", title:"速寫 B-12", date:"", medium:"數位" },
        { f:"2026-09_sketch-b-13.jpg", title:"速寫 B-13", date:"2026.09.18", medium:"數位" },
        { f:"2026-09_sketch-b-14.jpg", title:"速寫 B-14", date:"", medium:"數位" },
        { f:"2026-09_sketch-b-15.jpg", title:"速寫 B-15", date:"2026.09.22", medium:"數位" },
        { f:"2026-09_sketch-b-16.jpg", title:"速寫 B-16", date:"2026.09.22", medium:"數位" },
        { f:"2026-09_sketch-b-17.jpg", title:"速寫 B-17", date:"2026.09.22", medium:"數位" },
        { f:"2026-09_sketch-b-18.jpg", title:"速寫 B-18", date:"2026.09.23", medium:"數位" },
        { f:"2026-09_sketch-b-19.jpg", title:"速寫 B-19", date:"", medium:"數位" },
        { f:"2026-09_sketch-b-20.jpg", title:"速寫 B-20", date:"", medium:"數位" },
        { f:"2026-09_sketch-b-21.jpg", title:"速寫 B-21", date:"", medium:"數位" },
        { f:"2026-09_sketch-b-22.jpg", title:"速寫 B-22", date:"", medium:"數位" },
        { f:"2026-09_sketch-b-23.jpg", title:"速寫 B-23", date:"", medium:"數位" },
        { f:"2026-09_sketch-b-24.jpg", title:"速寫 B-24", date:"", medium:"數位" },
      ]}
    ],
    essay:{
      title:'KK 速寫團練 2 期・心得',
      lead:"先坦白一下呀，開營試畫是 8/11，但我真正畫第一張是 9/10。（咳）<br>然後才在最後兩週，把拖了一個月的份一口氣追完。",
      parts:[
        { h:"開課前的我", html:"<ul> <li>只有畫頭的經驗，而且只會畫正臉和正側臉，完全不懂畫耳朵</li> <li>不懂畫全身，每次都是參考 3D 人偶，然後修改無限次</li> <li>不懂畫手腳，真的要畫就是照描 3D 人偶</li> <li>不懂畫布料，要麼只畫肩膀以上，要麼上色時用色塊糊弄過去</li> <li>完全沒有速寫經驗，無從入手，加上眼高手低</li> <li>線條永遠一樣，沒有主次，也沒有粗幼</li> <li>沒有勇氣犯錯、永遠只想畫正確，於是一直在狹窄的舒適圈徘徊</li> </ul>" },
        { h:"學習過程", html:"<div> <p>W1–W2 畫衣服時，我是完全照著老師的褶皺、一二三級型去畫，因為腦子裡根本沒有譜。</p> <p>直到從 W3 開始，幾位老師教了不同的方法，雖然最初還是不太懂，但開始每一張、每一步都挑自己覺得「最容易畫出準度」的方式，畫完再看老師怎麼打框，拿來對答案、再修改。褶皺也改成先自己畫，真的不懂才去看老師那一步怎麼處理。</p> <p>到了 W5 的手腳和頭髮，我都是先自己畫到八成甚至十成，才打開老師的畫對照，看有什麼可以改、老師處理思路是如何。</p> <p>雖然我從畫齡上不是新手，但對於老師說的每一樣東西我都是完全沒了解，這就是野路子又從沒認真用腦子思考的後果 XDD</p> <p>助教教我這猿人慢慢學會用樹枝、火堆，學會用火；那麼 K 大在這堂課的知識，就像是塞我吃智慧之果，終於明白如何做「人」。</p> </div>" },
        { h:"自己摸出來的小規則", html:"<div> <p>試過改變趨勢，用跟老師有點不同的方式取框，看哪個比較適合自己。</p> <p>一開始我一定要用長方形去框手腳的位置。W3、W4 的老師說可以直接用曲線，但我怕準度不夠，就保留了一部分舊方法，另外加一條黃色線標出曲線的位置。這樣既能把四肢分開看，也知道這裡的 CSI 曲線細微表達。</p> <p>筆刷也試了兩種：團練給的粗線筆刷很適合色塊起稿（對我來說比較容易看，有點厚塗的感覺）；K 大的草稿筆刷則是線條更好控制。</p> </div>" },
        { h:"最大的感想", html:"<div> <p>以前看真人照片，完全看不出衣服的走向，甚至連四肢怎麼分都不知道。</p> <p>老師們把很多我不知道從哪下手的地方，先拆到最簡單，再一層一層疊上去——有點像從樂高人（方塊人），變成兵人玩偶（真人），再變成 BJD（風格化）；K 大則像是模型師，弄個鐵線（趨勢），教大家用黏土女媧造不同體型、曲線的人。</p> <p>現在型是準了很多，但我還是不懂人體。最近一張代餐就翻車了：不懂人體卻硬畫肌肉，不懂衣服走勢，把原圖的衣服走向改掉了。不過我覺得速寫練出來的準度，是可以跟透視互推的。接下來還是要好好學透視與結構。</p> <p>以前我一年可能只畫幾次圖，而且只畫頭，因為總覺得自己畫得太爛，每次畫都很頹廢。這次雖然反而知道了更多自己的不足，但現在有方向了，也終於有力量踏出第一步。</p> <p class=\"essay-end\">從 0 到 1，已經非常開心了！</p> </div>" }
      ]
    }
  },
  {
    id:'krenz-perspective', gallery:'class', status:'open',
    title:'透視繪畫', en:'Perspective Drawing',
    teacher:'Krenz', period:'2026.08 –',
    dir:'../art-journal/courses/krenz-perspective/homework/',
    intro:'作業整理中，佈置完成後開展。',
    legacy:'../art-journal/perspective.html',
    sections:[]
  },
  {
    id:'figure-2026-10', gallery:'class', status:'open',
    title:'人體課', en:'Figure Drawing',
    teacher:'（授課者待補）', period:'2026.10 –',
    dir:'works/figure-2026-10/',
    intro:'上課中。每堂課的作業與筆記會陸續掛上牆。',
    sections:[]
  }
];
