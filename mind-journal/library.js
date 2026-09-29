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

    function book(p) {
      return '<a class="book" href="pieces/' + esc(p.id) + '.html" data-id="' + esc(p.id) + '">' +
        '<span class="book-series">' + esc(seriesLabel(p) || shelfOf(p.shelf).name) + '</span>' +
        '<span class="book-title">' + esc(p.title) + '</span>' +
        '<span class="book-summary">' + esc(p.summary) + '</span>' +
        '<span class="book-tags">' + p.tags.map(function (t) { return '#' + esc(t); }).join(' ') + '</span>' +
        '<span class="book-meta">' + fmtDate(p.date) + (p.words ? ' · ' + fmtWords(p.words) : '') + '</span>' +
      '</a>';
    }

    lib.innerHTML = SHELVES.map(function (s) {
      var books = byDate.filter(function (p) { return p.shelf === s.id; });
      if (!books.length) return '';
      return '<section class="shelf" id="shelf-' + esc(s.id) + '">' +
        '<header class="shelf-head"><h3>' + esc(s.name) + '</h3>' +
        '<span class="shelf-count"></span>' +
        '<p class="shelf-desc">' + esc(s.desc) + '</p></header>' +
        '<div class="shelf-row">' + books.map(book).join('') + '</div>' +
        '<div class="shelf-board" aria-hidden="true"></div>' +
      '</section>';
    }).join('');

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
        sh.querySelectorAll('.book').forEach(function (b) {
          var p = POSTS.filter(function (x) { return x.id === b.dataset.id; })[0];
          var ok = matches(p); b.hidden = !ok; if (ok) n++;
        });
        sh.hidden = n === 0;
        sh.querySelector('.shelf-count').textContent = n + ' 冊';
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
