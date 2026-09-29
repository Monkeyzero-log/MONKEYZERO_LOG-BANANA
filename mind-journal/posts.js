/* ================================================================
   思考錄 · 書目清單（全館唯一要手動維護的清單）
   ----------------------------------------------------------------
   新增一篇：
   1. 複製 pieces/_template-piece.html 改名，貼上正文，
      把 <body data-id="…"> 改成下面這篇的 id
   2. 在 POSTS 裡加一段 { … }（照抄上一段改內容）
   書架首頁、搜尋、標籤、文章頁的資訊框與上下篇，全部自動更新。

   欄位：
   id       文章代號，英文加連字號，和檔名一致
   shelf    放在哪一層書架（要和 SHELVES 裡的 id 一樣）
   series   系列名稱，沒有就留空 ''；no 是系列裡第幾篇
   tags     標籤，想掛幾個都可以
   date     發表日期 YYYY-MM-DD
   words    字數（數字），不知道就寫 0
   summary  一兩句摘要，會顯示在書本卡片上
   ================================================================ */

/* 書架：由上到下的順序就是首頁的順序
   doodle 是猴零士寫在書櫃黑板上的吐槽（手寫字），用 \n 換行；不想要就留空 '' */
var SHELVES = [
  { id:'mind',    name:'心智與自我', desc:'大腦、語言、我是誰，以及「看」這件事本身',
    doodle:'猩猩坐在馬桶上\n想出來的 ↙' },
  { id:'human',   name:'人與演化',   desc:'從猩猩到孩子，人怎麼變成人',
    doodle:'猩猩研究猩猩\n＝自己考自己的古' },
  { id:'society', name:'社會與道德', desc:'權力、規則、代價，和我們替自己找的理由',
    doodle:'猩猩為了裝逼\n的自我思考 ↙' },
  { id:'craft',   name:'創作',       desc:'寫作與畫圖的方法論',
    doodle:'創作就是\n先把一坨香蕉泥\n拉出來', pile:true }
];

/* 書目：順序不重要，首頁會自動按日期排 */
var POSTS = [
  {
    id:'thinking-01', shelf:'mind', series:'思考錄', no:1,
    title:'觀察已存在的東西',
    tags:['觀察','認識論'],
    date:'2026-01-01', words:0,
    summary:'（摘要待補）'
  },
  {
    id:'thinking-02', shelf:'human', series:'思考錄', no:2,
    title:'孩子、猩猩的考古報告',
    tags:['演化','人類學','成長'],
    date:'2026-01-02', words:0,
    summary:'（摘要待補）'
  },
  {
    id:'thinking-03', shelf:'mind', series:'思考錄', no:3,
    title:'關於自我、大腦、語言',
    tags:['自我','心智','語言'],
    date:'2026-01-03', words:0,
    summary:'（摘要待補）'
  },
  {
    id:'thinking-04', shelf:'society', series:'思考錄', no:4,
    title:'統治者豪華樂高工…',
    tags:['政治','權力'],
    date:'2026-01-04', words:0,
    summary:'（摘要待補）'
  },
  {
    id:'thinking-05', shelf:'society', series:'思考錄', no:5,
    title:'道德很貴，藉口很…',
    tags:['道德','倫理'],
    date:'2026-01-05', words:0,
    summary:'（摘要待補）'
  },
  {
    id:'thinking-06', shelf:'society', series:'思考錄', no:6,
    title:'保護地球，還是保…',
    tags:['環境','倫理'],
    date:'2026-01-06', words:0,
    summary:'（摘要待補）'
  },
  {
    id:'creative-thinking', shelf:'craft', series:'', no:0,
    title:'拆開黑盒子：我的創作筆記',
    tags:['創作','寫作技法','角色塑造','劇情結構'],
    date:'2026-09-29', words:20822,
    summary:'把「一瞬間就得出答案」的創作直覺拆開來看：砍、補、擴、縮四個動作，劇情的 XYZ 座標，運算順序決定風格——一個畫畫的人拆解自己思路的紀錄。'
  }
];
