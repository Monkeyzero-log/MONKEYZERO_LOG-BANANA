/* ================================================================
   作畫紀錄 · 把 data.js 的館藏排成大廳、展廳、展覽三種頁面
   平常不用改這個檔；要加展覽或作品請改 data.js。
   ================================================================ */
(function () {
  var page = document.body.dataset.page;
  var params = new URLSearchParams(location.search);
  var $ = function (s) { return document.querySelector(s); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }
  function gallery(id) { return GALLERIES.filter(function (g) { return g.id === id; })[0]; }
  function exhibitsIn(gid) { return EXHIBITS.filter(function (e) { return e.gallery === gid; }); }
  function pieces(ex) {
    var out = [];
    (ex.sections || []).forEach(function (s) { s.pieces.forEach(function (p) { out.push(p); }); });
    return out;
  }
  function thumb(f) { return 'thumbs/' + f.replace(/\.(png|jpe?g)$/i, '.jpg'); }
  function statusLabel(ex) {
    var isClass = ex.gallery === 'class';
    if (ex.status === 'closed') return isClass ? '已完課・常設展' : '常設展';
    if (ex.status === 'soon') return '即將開展';
    return isClass ? '上課中・展出中' : '持續更新中';
  }
  var ORDER = { open:0, soon:1, closed:2 };

  /* 展覽海報卡 */
  function poster(ex, showRoom) {
    var g = gallery(ex.gallery), n = pieces(ex).length;
    var pic = ex.cover
      ? '<span class="pic"><img src="' + esc(thumb(ex.cover)) + '" alt="' + esc(ex.title) + '的展覽封面" loading="lazy"></span>'
      : '<span class="pic empty">作品佈置中<br>（這面牆還空著）</span>';
    return '<a class="poster" data-room="' + esc(ex.gallery) + '" href="exhibit.html?id=' + encodeURIComponent(ex.id) + '">' + pic +
      '<div class="meta">' +
        (showRoom ? '<span class="room">第 ' + g.no + ' 展廳・' + esc(g.name) + '</span>' : '') +
        '<h3>' + esc(ex.title) + '</h3><span class="en">' + esc(ex.en || '') + '</span>' +
        '<p class="line">' + (ex.teacher ? '授課 ' + esc(ex.teacher) + '　' : '') + esc(ex.period || '') + (n ? '　' + n + ' 件' : '') + '</p>' +
        '<span class="pill ' + esc(ex.status) + '">' + statusLabel(ex) + '</span>' +
      '</div></a>';
  }

  /* ---------------- 大廳 ---------------- */
  function lobby() {
    var COLORS = { class:['#8C2F25','#F6E7E3'], daily:['#2F5D50','#E3EFEA'], study:['#2F4B7C','#E4E9F3'], works:['#9A7B2F','#F4EEDC'] };
    var BOX = { class:[20,20], daily:[310,20], study:[20,250], works:[310,250] };
    var rooms = GALLERIES.map(function (g) {
      var b = BOX[g.id], exs = exhibitsIn(g.id), n = 0;
      exs.forEach(function (e) { n += pieces(e).length; });
      return '<a class="room" href="gallery.html?g=' + g.id + '" style="--room-c:' + COLORS[g.id][0] + ';--room-tint:' + COLORS[g.id][1] + '" aria-label="第 ' + g.no + ' 展廳：' + esc(g.name) + '">' +
        '<rect x="' + b[0] + '" y="' + b[1] + '" width="270" height="130"/>' +
        '<text class="num" x="' + (b[0] + 20) + '" y="' + (b[1] + 46) + '">' + g.no + '</text>' +
        '<text class="nm" x="' + (b[0] + 20) + '" y="' + (b[1] + 80) + '">' + esc(g.name) + '</text>' +
        '<text class="ct" x="' + (b[0] + 20) + '" y="' + (b[1] + 106) + '">' + exs.length + ' 檔展覽・' + n + ' 件作品</text></a>';
    }).join('');
    $('#plan').innerHTML =
      '<g class="lobby"><rect x="20" y="150" width="560" height="100"/>' +
      '<text x="300" y="196" text-anchor="middle">大　廳　LOBBY</text></g>' + rooms +
      '<line class="door" x1="135" y1="150" x2="175" y2="150"/><line class="door" x1="425" y1="150" x2="465" y2="150"/>' +
      '<line class="door" x1="135" y1="250" x2="175" y2="250"/><line class="door" x1="425" y1="250" x2="465" y2="250"/>' +
      '<line class="door" x1="20" y1="182" x2="20" y2="218"/>' +
      '<circle class="here" cx="300" cy="222" r="6"/><text x="312" y="226" font-size="12" fill="#C8432B" font-family="sans-serif">你在這裡</text>' +
      '<text x="4" y="196" font-size="11" fill="#77736B" font-family="sans-serif">入</text><text x="4" y="210" font-size="11" fill="#77736B" font-family="sans-serif">口</text>';

    $('#directory').innerHTML = GALLERIES.map(function (g) {
      var exs = exhibitsIn(g.id), n = 0;
      exs.forEach(function (e) { n += pieces(e).length; });
      return '<a class="dir-item" data-room="' + g.id + '" href="gallery.html?g=' + g.id + '">' +
        '<span class="num">' + g.no + '</span>' +
        '<div><h3>' + esc(g.name) + '</h3><p>' + esc(g.desc) + '</p></div>' +
        '<span class="go">' + (exs.length ? exs.length + ' 檔展覽 →' : '佈置中 →') + '</span></a>';
    }).join('');

    /* 有作品的排前面，再依展出狀態 */
    var now = EXHIBITS.slice().sort(function (a, b) {
      return (pieces(b).length > 0) - (pieces(a).length > 0) || ORDER[a.status] - ORDER[b.status];
    });
    $('#now').innerHTML = now.map(function (e) { return poster(e, true); }).join('');
  }

  /* ---------------- 展廳 ---------------- */
  function room() {
    var g = gallery(params.get('g')) || GALLERIES[0];
    document.body.dataset.room = g.id;
    document.title = '第 ' + g.no + ' 展廳・' + g.name + ' — 作畫紀錄';
    $('#crumb-room').textContent = '第 ' + g.no + ' 展廳・' + g.name;
    $('#room-head').innerHTML =
      '<span class="big" aria-hidden="true">' + g.no + '</span>' +
      '<div><p class="lbl en">GALLERY ' + g.no + ' · ' + esc(g.en) + '</p><h1>' + esc(g.name) + '</h1></div>' +
      '<p>' + esc(g.desc) + '</p>';
    var exs = exhibitsIn(g.id).sort(function (a, b) { return ORDER[a.status] - ORDER[b.status]; });
    $('#room-body').innerHTML = exs.length
      ? '<div class="posters">' + exs.map(function (e) { return poster(e, false); }).join('') + '</div>'
      : '<div class="empty-room"><div class="ghost">（此處預留給猴零士的下一張圖）</div>本展廳佈置中。<br>第一檔展覽開幕前，請先逛逛其他展廳。</div>';
  }

  /* ---------------- 展覽 ---------------- */
  function exhibit() {
    var ex = EXHIBITS.filter(function (e) { return e.id === params.get('id'); })[0];
    if (!ex) {
      $('#ex').innerHTML = '<div class="empty-room"><div class="ghost">找不到這檔展覽</div><a href="./">← 回到大廳</a></div>';
      return;
    }
    var g = gallery(ex.gallery), all = pieces(ex);
    document.body.dataset.room = g.id;
    document.title = ex.title + ' — 作畫紀錄';
    $('#crumb-room').textContent = '第 ' + g.no + ' 展廳・' + g.name;
    $('#crumb-room').href = 'gallery.html?g=' + g.id;
    $('#crumb-ex').textContent = ex.title;

    var facts = [['展廳', '第 ' + g.no + ' 展廳・' + g.name]];
    if (ex.teacher) facts.push(['授課', ex.teacher]);
    if (ex.period) facts.push(['期間', ex.period]);
    facts.push(['展品', all.length ? all.length + ' 件' : '佈置中']);
    facts.push(['狀態', statusLabel(ex)]);
    var html =
      '<header class="ex-head"><div><p class="room">第 ' + g.no + ' 展廳・' + esc(g.name) + '</p>' +
        '<h1>' + esc(ex.title) + '</h1><p class="en">' + esc(ex.en || '') + '</p></div>' +
        '<div><p class="wall-text">' + esc(ex.intro || '') + '</p>' +
        '<dl class="facts">' + facts.map(function (f) { return '<dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '</dd>'; }).join('') + '</dl>' +
        (ex.legacy ? '<p class="legacy">舊館版本：<a href="' + esc(ex.legacy) + '">習作輯</a></p>' : '') +
      '</div></header>';

    if (!all.length) {
      html += '<div class="empty-room"><div class="ghost">作品佈置中</div>這面牆還空著，畫好就掛上來。</div>';
    }
    var idx = 0;
    (ex.sections || []).forEach(function (s) {
      if (!s.pieces.length) return;
      html += '<section class="wall"><div class="wall-head"><h2>' + esc(s.title) + '</h2><span class="count">' + s.pieces.length + ' WORKS</span>' +
        (s.note ? '<p>' + esc(s.note) + '</p>' : '') + '</div><div class="hang' + (s.layout === 'pair' ? ' pair' : '') + '">';
      s.pieces.forEach(function (p) {
        var src = s.layout === 'pair' ? ex.dir + p.f : thumb(p.f);
        html += '<figure class="art"><button class="frame" type="button" data-i="' + (idx++) + '" aria-label="看大圖：' + esc(p.title) + '">' +
          '<img src="' + esc(src) + '" alt="' + esc(p.title) + '" loading="lazy"></button>' +
          '<figcaption class="label"><b>' + esc(p.title) + '</b><span>猴零士' + (p.date ? '，' + esc(p.date) : '') + '</span>' +
          (p.medium ? '<span>' + esc(p.medium) + '</span>' : '') + (p.note ? '<em>' + esc(p.note) + '</em>' : '') + '</figcaption></figure>';
      });
      html += '</div></section>';
    });

    if (ex.essay) {
      html += '<section class="essay"><p class="en">ARTIST STATEMENT</p><h2>創作者自述・' + esc(ex.essay.title) + '</h2>' +
        (ex.essay.lead ? '<p class="lead">' + ex.essay.lead + '</p>' : '') +
        '<div class="essay-cols">' + ex.essay.parts.map(function (p) {
          return '<div class="essay-part"><h3>' + esc(p.h) + '</h3>' + p.html + '</div>';
        }).join('') + '</div></section>';
    }
    $('#ex').innerHTML = html;
    lightbox(ex, all);
  }

  /* ---------------- 看大圖 ---------------- */
  function lightbox(ex, all) {
    var box = $('#lightbox'), img = $('#lb-img'), cap = $('#lb-cap'), count = $('#lb-count'), cur = 0, last = null;
    function show(i) {
      cur = (i + all.length) % all.length;
      var p = all[cur];
      img.src = ex.dir + p.f; img.alt = p.title;
      cap.innerHTML = '<b>' + esc(p.title) + '</b><span>猴零士' + (p.date ? '，' + esc(p.date) : '') + (p.medium ? '・' + esc(p.medium) : '') + '</span>' +
        (p.note ? '<br>' + esc(p.note) : '');
      count.textContent = (cur + 1) + ' / ' + all.length;
    }
    function open(i) { last = document.activeElement; show(i); box.classList.add('open'); document.body.style.overflow = 'hidden'; $('#lb-close').focus(); }
    function close() { box.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); }
    document.addEventListener('click', function (e) {
      var f = e.target.closest('.frame'); if (f) open(+f.dataset.i);
    });
    $('#lb-prev').addEventListener('click', function () { show(cur - 1); });
    $('#lb-next').addEventListener('click', function () { show(cur + 1); });
    $('#lb-close').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  if (page === 'lobby') lobby();
  if (page === 'gallery') room();
  if (page === 'exhibit') exhibit();
})();
