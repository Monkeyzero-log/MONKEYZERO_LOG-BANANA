/* ================================================================
   思考錄 · 書架與文章頁的自動排版
   讀 posts.js 的清單：首頁排書架、搜尋、標籤篩選；
   文章頁自動補資訊框與上下篇。平常不用改這個檔。
   ================================================================ */
(function () {
  var CN = ['〇','一','二','三','四','五','六','七','八','九','十'];
  function cnNum(n) {
    if (n <= 10) return CN[n];
    if (n < 20) return '十' + CN[n % 10];
    return CN[Math.floor(n / 10)] + '十' + (n % 10 ? CN[n % 10] : '');
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }
  function fmtDate(d) { return d.replace(/-/g, '.'); }
  function fmtWords(w) { return w ? '計 ' + w.toLocaleString('en-US') + ' 字' : ''; }
  function seriesLabel(p) { return p.series ? p.series + ' · 其' + cnNum(p.no) : ''; }
  function shelfOf(id) {
    for (var i = 0; i < SHELVES.length; i++) if (SHELVES[i].id === id) return SHELVES[i];
    return { id:id, name:id, desc:'' };
  }
  var byDate = POSTS.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });

  /* ---------------- 首頁：書架 ---------------- */
  var lib = document.getElementById('library');
  if (lib) {
    var state = { q:'', tags:[] };
    var search = document.getElementById('lib-search');
    var chipBox = document.getElementById('lib-tags');
    var empty = document.getElementById('lib-empty');
    var count = document.getElementById('lib-count');

    /* 標籤按出現次數排 */
    var tally = {};
    POSTS.forEach(function (p) { p.tags.forEach(function (t) { tally[t] = (tally[t] || 0) + 1; }); });
    Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a] || (a < b ? -1 : 1); })
      .forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.dataset.tag = t;
        b.innerHTML = '#' + esc(t) + ' <span>' + tally[t] + '</span>';
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { toggleTag(t); });
        chipBox.appendChild(b);
      });

    /* 書脊的顏色與高度由 id 決定（每次重整都一樣）；厚度看字數 */
    var COLORS = ['#7A1F24','#23395B','#2F4A36','#8A5A1F','#4A2B4F','#5A3A2A','#1F4A4A'];
    function hash(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
    function spine(p) {
      var h = hash(p.id);
      var w = p.words ? Math.max(34, Math.min(66, 30 + Math.round(p.words / 250))) : 40;
      var style = '--c:' + COLORS[h % COLORS.length] + ';--h:' + (190 + h % 44) + 'px;--w:' + w + 'px';
      return '<button type="button" class="spine" data-id="' + esc(p.id) + '" style="' + style + '" aria-pressed="false" title="' + esc(p.title) + '">' +
        '<span class="spine-title">' + esc(p.title) + '</span>' +
        '<span class="spine-no">' + (p.series ? cnNum(p.no) : '◆') + '</span>' +
      '</button>';
    }
    /* 架上擺設：香蕉書擋、小盆栽、一疊稿紙，輪流出現 */
    var PROPS = [
      '<svg viewBox="0 0 46 60" aria-hidden="true"><path d="M8 58 L8 26 L20 26 L20 58 Z" fill="#6B4A2E"/><path d="M14 30 C 4 18, 10 4, 30 2 C 26 8, 22 16, 24 30 Z" fill="#E3C04A"/><path d="M30 2 l3 -1 l-1 3 z" fill="#5A4A20"/><path d="M14 30 C 10 22, 14 10, 28 4" stroke="#B8962E" stroke-width="1.2" fill="none"/></svg>',
      '<svg viewBox="0 0 46 60" aria-hidden="true"><path d="M12 40 h22 l-3 18 h-16 z" fill="#8A5A3A"/><rect x="10" y="37" width="26" height="5" rx="1" fill="#A06B45"/><path d="M23 37 C 22 26, 14 22, 8 20 C 16 18, 22 24, 23 30 C 24 20, 30 12, 38 12 C 32 18, 26 26, 24 37 Z" fill="#4E7A4A"/></svg>',
      '<svg viewBox="0 0 46 60" aria-hidden="true"><rect x="4" y="50" width="38" height="8" fill="#D8CFBC"/><rect x="6" y="44" width="36" height="6" fill="#C8BEA8" transform="rotate(-3 24 47)"/><rect x="5" y="38" width="35" height="6" fill="#E3DAC6" transform="rotate(2 22 41)"/></svg>'
    ];

    lib.innerHTML = SHELVES.map(function (s, si) {
      var books = byDate.filter(function (p) { return p.shelf === s.id; });
      if (!books.length) return '';
      return '<section class="shelf" id="shelf-' + esc(s.id) + '">' +
        '<div class="case"><div class="bay">' +
          '<div class="spines">' + books.map(spine).join('') + '<span class="prop">' + PROPS[si % PROPS.length] + '</span></div>' +
          '<article class="card" aria-live="polite"></article>' +
        '</div>' +
        '<div class="board"><span class="plate">' + esc(s.name) + '<span class="n"></span></span></div></div>' +
        '<p class="shelf-desc">' + esc(s.desc) + '</p>' +
      '</section>';
    }).join('');

    function postById(id) { return POSTS.filter(function (x) { return x.id === id; })[0]; }
    function showCard(sh, id) {
      var p = postById(id), card = sh.querySelector('.card');
      sh.querySelectorAll('.spine').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'); });
      card.innerHTML =
        '<p class="card-series">' + esc(seriesLabel(p) || shelfOf(p.shelf).name) + '</p>' +
        '<h3 class="card-title">' + esc(p.title) + '</h3>' +
        '<p class="card-summary">' + esc(p.summary) + '</p>' +
        '<div class="card-foot"><div>' +
          '<p class="card-tags">' + p.tags.map(function (t) { return '#' + esc(t); }).join('　') + '</p>' +
          '<p class="card-meta">' + fmtDate(p.date) + (p.words ? ' · ' + fmtWords(p.words) : '') + '</p>' +
        '</div><a class="card-open" href="pieces/' + esc(p.id) + '.html">翻開 →</a></div>';
      card.classList.remove('flip'); void card.offsetWidth; card.classList.add('flip');
      sh.dataset.active = id;
    }
    lib.addEventListener('click', function (e) {
      var b = e.target.closest('.spine'); if (b) showCard(b.closest('.shelf'), b.dataset.id);
    });
    lib.addEventListener('mouseover', function (e) {
      var b = e.target.closest('.spine');
      if (b && matchMedia('(hover:hover)').matches && b.closest('.shelf').dataset.active !== b.dataset.id) showCard(b.closest('.shelf'), b.dataset.id);
    });

    function matches(p) {
      if (state.tags.length && !state.tags.every(function (t) { return p.tags.indexOf(t) > -1; })) return false;
      if (!state.q) return true;
      var hay = (p.title + ' ' + p.summary + ' ' + p.tags.join(' ') + ' ' + p.series + ' ' + shelfOf(p.shelf).name).toLowerCase();
      return state.q.split(/\s+/).every(function (w) { return hay.indexOf(w) > -1; });
    }
    function render() {
      var total = 0;
      lib.querySelectorAll('.shelf').forEach(function (sh) {
        var n = 0;
        var first = null;
        sh.querySelectorAll('.spine').forEach(function (b) {
          var ok = matches(postById(b.dataset.id)); b.hidden = !ok;
          if (ok) { n++; if (!first) first = b.dataset.id; }
        });
        sh.hidden = n === 0;
        sh.querySelector('.plate .n').textContent = '· ' + n + ' 冊';
        var act = sh.dataset.active && sh.querySelector('.spine[data-id="' + sh.dataset.active + '"]');
        if (first && (!act || act.hidden)) showCard(sh, first);
        total += n;
      });
      empty.hidden = total > 0;
      count.textContent = (state.q || state.tags.length) ? '找到 ' + total + ' 冊' : '全館 ' + total + ' 冊';
      chipBox.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-pressed', state.tags.indexOf(c.dataset.tag) > -1 ? 'true' : 'false');
      });
    }
    function toggleTag(t) {
      var i = state.tags.indexOf(t);
      if (i > -1) state.tags.splice(i, 1); else state.tags.push(t);
      render();
    }
    search.addEventListener('input', function () { state.q = search.value.trim().toLowerCase(); render(); });
    document.getElementById('lib-reset').addEventListener('click', function () {
      state.q = ''; state.tags = []; search.value = ''; render();
    });
    render();
  }

  /* ---------------- 文章頁：資訊框與上下篇 ---------------- */
  var id = document.body.getAttribute('data-id');
  var post = id && POSTS.filter(function (p) { return p.id === id; })[0];
  if (post) {
    var shelf = shelfOf(post.shelf);
    document.title = (post.series ? post.series + ' ' + cnNum(post.no) + '：' : '') + post.title + ' — 思考錄';
    var set = function (sel, html) { var el = document.querySelector(sel); if (el) el.innerHTML = html; };
    set('.work-series', esc(seriesLabel(post) || shelf.name));
    set('.work-title', esc(post.title));
    var rows = [
      ['書架', '<a href="../index.html#shelf-' + esc(shelf.id) + '">' + esc(shelf.name) + '</a>'],
      ['標籤', post.tags.map(function (t) { return '<a class="tag" href="../index.html?tag=' + encodeURIComponent(t) + '">#' + esc(t) + '</a>'; }).join(' ')]
    ];
    if (post.series) rows.push(['系列', esc(post.series) + ' 第 ' + post.no + ' 篇']);
    rows.push(['發表', fmtDate(post.date)]);
    if (post.words) rows.push(['字數', post.words.toLocaleString('en-US')]);
    set('.work-meta', rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''));

    /* 上下篇：有系列就在系列內跳，沒有就在同一層書架內跳 */
    var pool = POSTS.filter(function (p) { return post.series ? p.series === post.series : p.shelf === post.shelf; })
      .sort(function (a, b) { return post.series ? a.no - b.no : (a.date < b.date ? -1 : 1); });
    var i = pool.indexOf(post), prev = pool[i - 1], next = pool[i + 1];
    var link = function (p, dir) {
      if (!p) return '<span></span>';
      var label = p.series ? '其' + cnNum(p.no) + '　' + p.title : p.title;
      return '<a href="' + esc(p.id) + '.html">' + (dir < 0 ? '← ' : '') + esc(label) + (dir > 0 ? ' →' : '') + '</a>';
    };
    set('.work-pager', link(prev, -1) + '<a href="../index.html">書架</a>' + link(next, 1));
  }
})();

/* 首頁：從文章頁點標籤過來時自動套用（?tag=…） */
(function () {
  var m = location.search.match(/[?&]tag=([^&]+)/);
  if (!m || !document.getElementById('library')) return;
  var t = decodeURIComponent(m[1]);
  var c = document.querySelector('.chip[data-tag="' + t.replace(/"/g, '') + '"]');
  if (c) { c.click(); document.getElementById('finder').scrollIntoView(); }
})();
