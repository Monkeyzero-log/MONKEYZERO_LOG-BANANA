/* ================================================================
   思考錄 · 季刊版的排版程式
   書目一樣讀 posts.js（跟書櫃版共用），文章內文直接讀 pieces/ 裡的原文章頁，
   所以上架新文章時兩個版本會同時更新，不用另外做。
   改刊號、售價：改下面的 ISSUE。
   ================================================================ */
var ISSUE = { name:'創刊號', season:'2026 秋', price:'一根香蕉' };

(function () {
  var page = document.body.dataset.page;
  var $ = function (s) { return document.querySelector(s); };
  var CN = ['〇','一','二','三','四','五','六','七','八','九','十'];
  function cn(n) { return n <= 10 ? CN[n] : (n < 20 ? '十' + CN[n % 10] : CN[Math.floor(n / 10)] + '十' + (n % 10 ? CN[n % 10] : '')); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }
  function shelfOf(id) { return SHELVES.filter(function (s) { return s.id === id; })[0] || { id:id, name:id, desc:'' }; }
  function published(p) { return p.words > 0; }
  function minutes(p) { return Math.max(1, Math.round(p.words / 400)); }   /* 中文約每分鐘 400 字 */
  function date(p) { return p.date.replace(/-/g, '.'); }
  function series(p) { return p.series ? p.series + '・其' + cn(p.no) : ''; }
  function byline(p) {
    return '<span>文／<b>猩其一</b></span><span>' + date(p) + '</span>' +
      (p.words ? '<span>' + p.words.toLocaleString('en-US') + ' 字</span><span>約 ' + minutes(p) + ' 分鐘讀完</span>' : '');
  }
  function link(p) { return 'read.html?id=' + encodeURIComponent(p.id); }
  var newest = POSTS.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });

  /* ================= 季刊首頁 ================= */
  function home() {
    var pub = newest.filter(published);
    var total = 0; pub.forEach(function (p) { total += p.words; });
    $('#issue-line').innerHTML =
      '<span>' + esc(ISSUE.season) + '・' + esc(ISSUE.name) + '</span>' +
      '<span>本期收錄 ' + pub.length + ' 篇・共 ' + total.toLocaleString('en-US') + ' 字・另有 ' + (POSTS.length - pub.length) + ' 篇審閱中</span>' +
      '<span>定價　' + esc(ISSUE.price) + '</span>';

    /* 封面故事：最新一篇已刊出的文章 */
    var c = pub[0];
    if (c) {
      $('#cover-story').innerHTML =
        '<span class="bignum" aria-hidden="true">01</span>' +
        '<p class="kicker">封面故事・' + esc(shelfOf(c.shelf).name) + (c.series ? '・' + esc(series(c)) : '') + '</p>' +
        '<h2><a href="' + link(c) + '">' + esc(c.title) + '</a></h2>' +
        '<p class="deck">' + esc(c.summary) + '</p>' +
        '<p class="byline">' + byline(c) + '</p>' +
        '<a class="read-btn" href="' + link(c) + '">閱讀全文 →</a>';
    }
    $('#highlights').innerHTML = '<h3>本期要目</h3><ol>' + pub.slice(1, 5).map(function (p) {
      return '<li><span><a href="' + link(p) + '">' + esc(p.title) + '</a><p>' + esc(shelfOf(p.shelf).name) + '・' + date(p) + '・約 ' + minutes(p) + ' 分鐘</p></span></li>';
    }).join('') + (pub.length < 2 ? '<li><span><a>下期待續</a><p>主編正在闔目構思中。</p></span></li>' : '') + '</ol>';

    /* 目錄：依欄目（書架）分組，頁碼依序編 */
    var pg = 3;
    $('#columns').innerHTML = SHELVES.map(function (s) {
      var list = POSTS.filter(function (p) { return p.shelf === s.id; }).sort(function (a, b) {
        return (a.series && b.series) ? a.no - b.no : (a.date < b.date ? -1 : 1);
      });
      if (!list.length) return '';
      var n = list.filter(published).length;
      return '<section class="column" data-col="' + esc(s.id) + '">' +
        '<div class="column-name"><h3>' + esc(s.name) + '</h3><p>' + esc(s.desc) + '</p><span class="count">' + n + ' / ' + list.length + ' 篇已刊出</span></div>' +
        '<div class="entries">' + list.map(function (p) {
          var page = 'p.' + (pg < 10 ? '0' : '') + pg; pg += published(p) ? Math.max(2, Math.ceil(p.words / 1500)) : 1;
          var ok = published(p);
          return '<article class="entry' + (ok ? '' : ' pending') + '" data-tags="' + esc(p.tags.join('|')) + '">' +
            '<span class="pg">' + page + '</span>' +
            '<div>' + (p.series ? '<p class="series">' + esc(series(p)) + '</p>' : '') +
              '<h4>' + (ok ? '<a class="t" href="' + link(p) + '">' + esc(p.title) + '</a>' : esc(p.title)) + '</h4>' +
              (ok ? '<p class="sum">' + esc(p.summary) + '</p><p class="tags">' + p.tags.map(function (t) { return '#' + esc(t); }).join('　') + '</p>'
                  : '<span class="pending-tag">稿件審閱中</span>') +
            '</div>' +
            '<p class="side">' + (ok ? date(p) + '<br>約 ' + minutes(p) + ' 分鐘' : '') + '</p>' +
          '</article>';
        }).join('') + '</div></section>';
    }).join('');

    /* 標籤篩選 */
    var tally = {};
    POSTS.filter(published).forEach(function (p) { p.tags.forEach(function (t) { tally[t] = (tally[t] || 0) + 1; }); });
    var tags = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; });
    $('#filters').innerHTML = '<button type="button" aria-pressed="true" data-tag="">全部</button>' +
      tags.map(function (t) { return '<button type="button" aria-pressed="false" data-tag="' + esc(t) + '">#' + esc(t) + '</button>'; }).join('');
    function apply(tag) {
      document.querySelectorAll('#filters button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tag === tag ? 'true' : 'false'); });
      document.querySelectorAll('.column').forEach(function (col) {
        var shown = 0;
        col.querySelectorAll('.entry').forEach(function (e) {
          var ok = !tag || e.dataset.tags.split('|').indexOf(tag) > -1;
          e.hidden = !ok; if (ok) shown++;
        });
        col.hidden = shown === 0;
      });
    }
    $('#filters').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (b) apply(b.dataset.tag);
    });
    var want = new URLSearchParams(location.search).get('tag');
    if (want && tally[want]) { apply(want); $('#contents').scrollIntoView(); }
  }

  /* ================= 閱讀頁 ================= */
  function reader() {
    var id = new URLSearchParams(location.search).get('id');
    var p = POSTS.filter(function (x) { return x.id === id; })[0];
    if (!p) { $('#rhead').innerHTML = '<p class="load-fail">找不到這篇文章。<a href="magazine.html">回到目錄</a></p>'; return; }
    var s = shelfOf(p.shelf);
    document.title = p.title + ' — 思考錄季刊';
    $('#classic').href = 'pieces/' + encodeURIComponent(p.id) + '.html';
    $('#rhead').innerHTML =
      '<p class="kicker">' + esc(s.name) + (p.series ? '・' + esc(series(p)) : '') + '</p>' +
      '<h1>' + esc(p.title) + '</h1>' +
      (published(p) ? '<p class="deck">' + esc(p.summary) + '</p>' : '') +
      '<p class="byline">' + byline(p) + '</p>' +
      '<p class="tags">' + p.tags.map(function (t) { return '<a href="magazine.html?tag=' + encodeURIComponent(t) + '">#' + esc(t) + '</a>'; }).join('') + '</p>';

    /* 上下篇：同系列依編號，否則同欄目依日期；只連已刊出的 */
    var pool = POSTS.filter(function (x) { return published(x) && (p.series ? x.series === p.series : x.shelf === p.shelf); })
      .sort(function (a, b) { return p.series ? a.no - b.no : (a.date < b.date ? -1 : 1); });
    var i = pool.indexOf(p), prev = pool[i - 1], next = pool[i + 1];
    $('#rnext').innerHTML =
      (prev ? '<a href="' + link(prev) + '"><span class="dir">← 上一篇</span><h4>' + esc(prev.title) + '</h4></a>' : '<a href="magazine.html#contents"><span class="dir">← 回到目錄</span><h4>本期所有文章</h4></a>') +
      (next ? '<a class="next" href="' + link(next) + '"><span class="dir">下一篇 →</span><h4>' + esc(next.title) + '</h4></a>' : '<a class="next" href="magazine.html"><span class="dir">回到封面 →</span><h4>思考錄・' + esc(ISSUE.name) + '</h4></a>');

    var body = $('#rbody');
    if (!published(p)) {
      body.innerHTML = '<p class="loading">本篇稿件審閱中，主編正在闔目構思。</p>';
      return;
    }
    fetch('pieces/' + encodeURIComponent(p.id) + '.html').then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var src = doc.querySelector('.essay-body');
      if (!src) throw new Error('no body');
      /* 原文章頁裡的圖片路徑以 pieces/ 為準，這裡補上前綴 */
      src.querySelectorAll('[src^="img/"],[href^="img/"]').forEach(function (el) {
        ['src', 'href'].forEach(function (a) { var v = el.getAttribute(a); if (v && v.indexOf('img/') === 0) el.setAttribute(a, 'pieces/' + v); });
      });
      body.innerHTML = src.innerHTML + '<p class="fin">全文完<span class="seal" aria-hidden="true">猩<br>壹</span></p>';
      /* 首字放大：給第一個夠長的段落（太短的一句話放大會很怪） */
      var first = [].filter.call(body.querySelectorAll('p'), function (el) { return el.textContent.trim().length >= 25; })[0];
      if (first) first.classList.add('dropcap');
      var toc = doc.querySelector('.work-toc > ol');
      if (toc) {
        $('#rtoc').innerHTML = '<h2>CONTENTS</h2>' + toc.outerHTML;
        $('#rtoc-m').innerHTML = '<summary>本文目次</summary>' + toc.outerHTML;
        $('#rtoc-m').hidden = false;
        spy();
      } else {
        $('#rtoc').hidden = true;
      }
    }).catch(function () {
      body.innerHTML = '<p class="load-fail">內文讀取失敗（直接打開電腦裡的檔案時會這樣，放上網站就正常）。<br>' +
        '<a href="pieces/' + encodeURIComponent(p.id) + '.html">改看書櫃版的這篇文章 →</a></p>';
    });

    /* 閱讀進度條 */
    var bar = $('#progress');
    function onScroll() {
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%';
    }
    addEventListener('scroll', onScroll, { passive:true }); onScroll();
  }

  /* 側邊目次：讀到哪一節就亮哪一節 */
  function spy() {
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    document.querySelectorAll('#rtoc a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || !links[en.target.id]) return;
        document.querySelectorAll('#rtoc a.on').forEach(function (a) { a.classList.remove('on'); });
        links[en.target.id].classList.add('on');
        var box = $('#rtoc'), a = links[en.target.id];
        if (a.offsetTop < box.scrollTop || a.offsetTop > box.scrollTop + box.clientHeight - 40) box.scrollTop = a.offsetTop - 60;
      });
    }, { rootMargin:'0px 0px -70% 0px' });
    document.querySelectorAll('#rbody h3[id], #rbody h4[id]').forEach(function (h) { io.observe(h); });
  }

  if (page === 'home') home();
  if (page === 'read') reader();
})();
