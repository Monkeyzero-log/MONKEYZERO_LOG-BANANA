/* ================================================================
   純記錄 · 共用程式
   這一版不另外存資料，直接讀原版的兩份清單：
     繪畫 ← ../drawing-log/data.js（GALLERIES、EXHIBITS）
     思考 ← ../mind-journal/posts.js（SHELVES、POSTS）
   所以在原版新增作品或文章，這裡會自動跟著出現，不用改這個資料夾。
   每一頁的 <body data-page="…"> 決定要跑下面哪一段。
   ================================================================ */
(function () {
  'use strict';

  function $(s, el) { return (el || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function param(k) { return new URLSearchParams(location.search).get(k); }
  function dot(d) { return d ? String(d).replace(/-/g, '.') : ''; }
  function num(n) { return Number(n).toLocaleString('en-US'); }
  function sum(arr, fn) { return arr.reduce(function (n, x) { return n + fn(x); }, 0); }

  /* ---------- 繪畫 ---------- */
  var DL = '../drawing-log/';
  var STATUS = { open:'進行中', closed:'已完成', soon:'準備中' };
  function thumb(f) { return DL + 'thumbs/' + f.replace(/\.(png|jpe?g)$/i, '.jpg'); }
  function full(ex, f) { return DL + ex.dir + f; }
  function countPieces(ex) { return sum(ex.sections || [], function (s) { return s.pieces.length; }); }
  function galleryOf(id) { return GALLERIES.filter(function (g) { return g.id === id; })[0]; }
  function teacherOf(ex) { return ex.teacher && !/待補/.test(ex.teacher) ? ex.teacher : ''; }
  function period(ex) { return (ex.period || '').replace(/\s*[–-]\s*$/, ' 起'); }
  /* 時間軸用的日期：已完成取結束日，進行中取開始日 */
  function exDate(ex) {
    var p = (ex.period || '').split(/\s*[–-]\s*/);
    return (ex.status === 'closed' && p[1] ? p[1] : p[0]) || '';
  }

  /* ---------- 思考 ---------- */
  function published(p) { return p.words > 0; }
  function shelfOf(id) { return SHELVES.filter(function (s) { return s.id === id; })[0] || { name:'' }; }
  function minutes(p) { return Math.max(1, Math.round(p.words / 400)); }
  function newestFirst(a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }

  var pages = {};

  /* ================= 總覽 ================= */
  pages.home = function () {
    var posts = POSTS.filter(published), drafts = POSTS.length - posts.length;
    var withWork = EXHIBITS.filter(function (e) { return countPieces(e) > 0; });
    var nPieces = sum(EXHIBITS, countPieces);

    $('[data-stat="drawing"]').textContent = nPieces ? num(nPieces) + ' 張 · ' + EXHIBITS.length + ' 個系列' : '尚無記錄';
    $('[data-stat="essays"]').textContent = posts.length
      ? posts.length + ' 篇 · ' + num(sum(posts, function (p) { return p.words; })) + ' 字' + (drafts ? '（另 ' + drafts + ' 篇整理中）' : '')
      : '尚無記錄';

    var items = posts.map(function (p) {
      return { date:p.date.replace(/-/g, '.'), kind:'思考', title:p.title, href:'essay.html?id=' + encodeURIComponent(p.id), meta:num(p.words) + ' 字' };
    }).concat(withWork.map(function (e) {
      return { date:exDate(e), kind:'繪畫', title:e.title, href:'drawing-set.html?id=' + encodeURIComponent(e.id),
               meta:countPieces(e) + ' 張' + (e.status === 'closed' ? ' · 完成' : '') };
    })).sort(newestFirst);

    $('#recent').innerHTML = items.length ? items.map(function (it) {
      return '<li class="row"><span class="row-date">' + esc(it.date) + '</span>' +
        '<a class="row-title" href="' + it.href + '"><span class="row-kind">' + it.kind + '</span>' + esc(it.title) + '</a>' +
        '<span class="row-meta">' + esc(it.meta) + '</span></li>';
    }).join('') : '<li class="empty">尚無記錄</li>';
  };

  /* ================= 繪畫：總表 ================= */
  /* 原版的展廳說明是美術館口吻，這一版換成平鋪直敘的說法；新增展廳時沒寫在這裡就沿用原版說明 */
  var GALLERY_DESC = {
    class:'課程的作業與課後心得，每門課一個系列。',
    daily:'速寫、臨摹與每日練習，依日期排列。',
    study:'自訂題目的研究，例如特定畫師的用色、手的畫法。',
    works:'完成度較高的作品。'
  };
  pages.drawing = function () {
    $('#galleries').innerHTML = GALLERIES.map(function (g) {
      var list = EXHIBITS.filter(function (e) { return e.gallery === g.id; });
      return '<section class="block" id="' + g.id + '">' +
        '<h2 class="block-title">' + esc(g.name) + '<span class="count">' + list.length + '</span></h2>' +
        '<p class="block-desc">' + esc(GALLERY_DESC[g.id] || g.desc) + '</p>' +
        (list.length ? '<ul class="sets">' + list.map(setRow).join('') + '</ul>' : '<p class="empty">尚無記錄</p>') +
        '</section>';
    }).join('');
  };
  function setRow(e) {
    var n = countPieces(e), t = teacherOf(e);
    return '<li><a class="set" href="drawing-set.html?id=' + encodeURIComponent(e.id) + '">' +
      (e.cover ? '<img class="set-cover" src="' + esc(thumb(e.cover)) + '" alt="" loading="lazy">'
               : '<span class="set-cover set-cover--none">—</span>') +
      '<div><h3>' + esc(e.title) + '<span class="badge">' + (STATUS[e.status] || '') + '</span></h3>' +
      '<p class="set-meta">' + [t, period(e)].filter(Boolean).map(esc).join(' · ') + '</p>' +
      '<p class="set-meta">' + (n ? n + ' 張' : '尚無作品') + (e.essay ? ' · 附心得' : '') + '</p></div></a></li>';
  }

  /* ================= 繪畫：單一系列 ================= */
  pages['drawing-set'] = function () {
    var ex = EXHIBITS.filter(function (e) { return e.id === param('id'); })[0];
    var main = $('#set');
    if (!ex) { main.innerHTML = '<p class="loading">找不到這個系列。<a href="drawing.html">回到繪畫 →</a></p>'; return; }
    var g = galleryOf(ex.gallery) || { name:'' }, n = countPieces(ex), t = teacherOf(ex);
    document.title = ex.title + ' · 純記錄';
    $('#crumb-gallery').textContent = g.name;
    $('#crumb-gallery').href = 'drawing.html#' + ex.gallery;

    var facts = [['分類', g.name], ['授課', t], ['期間', period(ex)], ['狀態', STATUS[ex.status]], ['張數', n ? n + ' 張' : '']]
      .filter(function (f) { return f[1]; });
    var items = [], html = '<header class="page-head"><h1>' + esc(ex.title) + '</h1>' +
      (ex.en ? '<p class="lead">' + esc(ex.en) + '</p>' : '') +
      '<dl class="facts">' + facts.map(function (f) { return '<dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd>'; }).join('') + '</dl>' +
      '</header>';

    if (!n) {
      html += '<p class="empty" style="margin-top:32px">尚無作品</p>';
    } else {
      if (ex.intro) html += '<p class="intro">' + esc(ex.intro) + '</p>';
      ex.sections.forEach(function (s) {
        html += '<section class="block"><h2 class="block-title">' + esc(s.title) + '<span class="count">' + s.pieces.length + '</span></h2>' +
          (s.note ? '<p class="block-desc">' + esc(s.note) + '</p>' : '') +
          '<div class="grid' + (s.layout === 'pair' ? ' grid--pair' : '') + '">' +
          s.pieces.map(function (p) {
            var i = items.length, cap = [p.title, dot(p.date), p.medium].filter(Boolean).join(' · ');
            items.push({ thumb:thumb(p.f), src:full(ex, p.f), alt:p.title, cap:cap + (p.note ? '　' + p.note : '') });
            return '<button class="tile" type="button" data-i="' + i + '" aria-label="放大：' + esc(p.title) + '">' +
              '<img src="' + esc(thumb(p.f)) + '" alt="' + esc(p.title) + '" loading="lazy">' +
              '<span class="tile-cap"><b>' + esc(p.title) + '</b>' + (p.date ? '<br>' + esc(dot(p.date)) : '') + '</span></button>';
          }).join('') + '</div></section>';
      });
    }

    if (ex.essay) {
      var es = ex.essay;
      html += '<section class="essay-block"><p class="count">課後心得</p><h2>' + esc(es.title) + '</h2><div class="prose">' +
        (es.lead ? '<p>' + es.lead + '</p>' : '') +
        es.parts.map(function (pt) { return '<h4>' + esc(pt.h) + '</h4>' + pt.html; }).join('') +
        '</div></section>';
    }
    main.innerHTML = html;
    $('#compare').innerHTML = '對照原版：<a href="../drawing-log/exhibit.html?id=' + encodeURIComponent(ex.id) + '">作畫紀錄</a>' +
      (ex.legacy ? '・<a href="' + esc(ex.legacy) + '">習作輯</a>' : '');   /* legacy 路徑相對於 drawing-log/，和這裡同一層，可以直接用 */
    if (items.length) lightbox(items);
  };

  function lightbox(items) {
    var dlg = $('#lb'), img = $('.lb-stage img', dlg), cap = $('.lb-cap', dlg), orig = $('.lb-orig', dlg), i = 0;
    function show(n) {
      i = (n + items.length) % items.length;
      var it = items[i];
      img.src = it.thumb; img.alt = it.alt;
      var hi = new Image();
      hi.onload = function () { if (items[i] === it) img.src = it.src; };
      hi.src = it.src;
      cap.innerHTML = esc(it.cap) + '　<span style="white-space:nowrap">' + (i + 1) + ' / ' + items.length + '</span>';
      orig.href = it.src;
    }
    document.addEventListener('click', function (e) {
      var t = e.target.closest('.tile');
      if (t) { show(+t.getAttribute('data-i')); dlg.showModal(); }
    });
    $('.lb-prev', dlg).onclick = function () { show(i - 1); };
    $('.lb-next', dlg).onclick = function () { show(i + 1); };
    $('.lb-close', dlg).onclick = function () { dlg.close(); };
    $('.lb-stage', dlg).addEventListener('click', function (e) { if (e.target === this) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  /* ================= 思考：篇目 ================= */
  pages.essays = function () {
    var posts = POSTS.filter(published).sort(newestFirst);
    var drafts = POSTS.filter(function (p) { return !published(p); });
    var current = param('shelf') || 'all';

    function render() {
      var list = current === 'all' ? posts : posts.filter(function (p) { return p.shelf === current; });
      $('#list').innerHTML = list.length ? list.map(function (p) {
        return '<li class="row"><span class="row-date">' + dot(p.date) + '</span>' +
          '<a class="row-title" href="essay.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.title) + '</a>' +
          '<span class="row-meta">' + num(p.words) + ' 字</span>' +
          '<p class="row-sub">' + esc(shelfOf(p.shelf).name) + (p.summary ? '　' + esc(p.summary) : '') + '</p></li>';
      }).join('') : '<li class="empty">此分類尚無文章</li>';
      [].forEach.call(document.querySelectorAll('.filter button'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-shelf') === current));
      });
    }

    $('#filter').innerHTML = [{ id:'all', name:'全部' }].concat(SHELVES).map(function (s) {
      var n = s.id === 'all' ? posts.length : posts.filter(function (p) { return p.shelf === s.id; }).length;
      return '<button type="button" data-shelf="' + s.id + '">' + esc(s.name) + ' ' + n + '</button>';
    }).join('');
    $('#filter').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      current = b.getAttribute('data-shelf');
      history.replaceState(null, '', current === 'all' ? location.pathname : '?shelf=' + current);
      render();
    });
    render();

    $('#drafts').innerHTML = drafts.length ? '<h2 class="block-title">整理中<span class="count">' + drafts.length + '</span></h2>' +
      '<p class="block-desc">已有題目、尚未上架的文章。</p><ol class="rows" style="margin-top:14px">' +
      drafts.map(function (p) {
        return '<li class="row row--muted"><span class="row-date">' + esc(shelfOf(p.shelf).name) + '</span>' +
          '<span class="row-title">' + esc(p.title) + '</span><span class="row-meta">未上架</span></li>';
      }).join('') + '</ol>' : '';
  };

  /* ================= 思考：單篇 ================= */
  pages.essay = function () {
    var id = param('id');
    var p = POSTS.filter(function (x) { return x.id === id; })[0];
    var head = $('#head'), body = $('#body');
    if (!p) { head.innerHTML = '<h1>找不到這篇文章</h1><p class="lead"><a href="essays.html">回到篇目 →</a></p>'; return; }

    var sh = shelfOf(p.shelf);
    document.title = p.title + ' · 純記錄';
    $('#crumb-shelf').textContent = sh.name;
    $('#crumb-shelf').href = 'essays.html?shelf=' + p.shelf;
    head.innerHTML = '<h1>' + esc(p.title) + '</h1>' +
      '<p class="essay-meta"><span>' + dot(p.date) + '</span>' +
      (published(p) ? '<span>' + num(p.words) + ' 字</span><span>約 ' + minutes(p) + ' 分鐘</span>' : '') + '</p>' +
      (p.tags && p.tags.length ? '<p class="tags">標籤：' + p.tags.map(esc).join('、') + '</p>' : '');
    $('#compare').innerHTML = '對照原版：<a href="../mind-journal/pieces/' + encodeURIComponent(p.id) + '.html">思考錄・書櫃版</a>' +
      '・<a href="../mind-journal/read.html?id=' + encodeURIComponent(p.id) + '">思考錄・季刊版</a>';

    var list = POSTS.filter(published).sort(newestFirst), k = list.indexOf(p);
    var newer = k > 0 ? list[k - 1] : null, older = k >= 0 ? list[k + 1] : null;
    $('#pager').innerHTML =
      (older ? '<a href="essay.html?id=' + encodeURIComponent(older.id) + '"><small>← 較早</small><b>' + esc(older.title) + '</b></a>' : '') +
      (newer ? '<a class="next" href="essay.html?id=' + encodeURIComponent(newer.id) + '"><small>較新 →</small><b>' + esc(newer.title) + '</b></a>' : '');

    if (!published(p)) { body.innerHTML = '<p class="empty">本篇整理中，尚未上架。</p>'; return; }

    var base = '../mind-journal/pieces/';
    fetch(base + encodeURIComponent(p.id) + '.html').then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var src = doc.querySelector('.essay-body');
      if (!src) throw new Error('no body');
      [].forEach.call(src.querySelectorAll('.essay-sign'), function (el) { el.remove(); });
      [].forEach.call(src.querySelectorAll('[src^="img/"],[href^="img/"]'), function (el) {
        ['src', 'href'].forEach(function (a) {
          var v = el.getAttribute(a);
          if (v && v.indexOf('img/') === 0) el.setAttribute(a, base + v);
        });
      });
      body.innerHTML = src.innerHTML;
      var toc = doc.querySelector('.work-toc > ol');
      if (toc) {
        var d = $('#toc');
        d.innerHTML = '<summary>目次</summary>' + toc.outerHTML;
        d.hidden = false;
      }
      if (location.hash) { var t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView(); }
    }).catch(function () {
      body.innerHTML = '<p class="empty">內文讀取失敗（直接打開電腦裡的檔案時會這樣，放上網站就正常）。' +
        '<a href="' + base + encodeURIComponent(p.id) + '.html">改看原版 →</a></p>';
    });
  };

  var run = pages[document.body.getAttribute('data-page')];
  if (run) run();
})();
