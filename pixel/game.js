/* ================================================================
   像素作者頁 · 互動與彩蛋
   改台詞：改下面的 SCRIPTS。w 是誰在說話（m 猴、g 猩、s 系統），
   f 可以指定那句話的表情圖（例如猩猩睡著的 gorilla_sleep）。
   ================================================================ */
var SCRIPTS = {
  m: [
    { w:'m', t:'嗨!! 我是猴零士，畫圖的!!' },
    { w:'m', t:'已從「泥巴樹枝派」進化，學會敲打數位板畫圖了！嗚嘎！' },
    { w:'g', t:'（推眼鏡）「嗚嘎」為擬聲詞，刪。' },
    { w:'m', t:'……比起畫師，更像是興趣使然的畫圖猴。給香蕉就畫。' },
    { w:'m', t:'最近剛打完「KK速寫團練第2期」，從 0 到 1，超開心!!' },
    { w:'g', t:'驚嘆號限用一個。' },
    { w:'m', t:'!!!!!!!!' },
    { w:'s', t:'猴零士的關卡在下面 WORLD 1。戳他本人會掉香蕉。' }
  ],
  g: [
    { w:'g', f:'gorilla_sleep', t:'……（闔目構思中）' },
    { w:'m', t:'喂，醒醒，輪到你了。' },
    { w:'g', t:'咳。本猩未入睡，只是在闔目構思。' },
    { w:'g', t:'猩其一，大概、可能、或許是文字創作者。' },
    { w:'g', t:'乃左邊那隻猴子扔掉畫筆、拿起鍵盤後，所披上的正經猩猩皮。' },
    { w:'m', t:'皮底下是我啦!!' },
    { w:'g', t:'每當意圖正正經經地寫搞笑文，惟每每下筆，總不自覺趨於嚴肅。屢經檢討，迄未改善。' },
    { w:'g', t:'又，部分限制級之作，皆為隔壁那隻色猴腦中所構思，與本猩猩無關。' },
    { w:'m', t:'騙人!! 明明寫得很開心' },
    { w:'g', f:'gorilla_sleep', t:'……（假裝沒聽到，繼續闔目構思）' },
    { w:'s', t:'猩其一的關卡在下面 WORLD 2。他大概在睡覺，請小聲。' }
  ]
};
var NAMES = { m:'猴零士', g:'猩其一', s:'SYSTEM' };
var FACES = { m:'monkey_awake', g:'gorilla_awake', s:'banana' };
var MONKEY_SAYS = ['嗚嘎！', '香蕉給你!!', '再戳要收錢喔', '（假裝在畫圖）', '今天也是星期一嗎'];

var ACHIEVEMENTS = [
  { id:'start',  name:'按下 START',      desc:'遊戲開始了。雖然沒有遊戲。',   hint:'標題畫面上有個按鈕' },
  { id:'wake',   name:'叫醒猩猩',        desc:'本猩未入睡。',                 hint:'有一隻在打瞌睡' },
  { id:'banana', name:'香蕉收藏家',      desc:'收集 10 根香蕉。',             hint:'戳戳看那隻猴子' },
  { id:'intro',  name:'認識一下',        desc:'聽完任一隻的自我介紹。',       hint:'選一隻靈長類' },
  { id:'secret', name:'上上下下左右左右', desc:'發動秘技：香蕉雨。',          hint:'VS 好像可以一直按' },
  { id:'monday', name:'GAME OVER',       desc:'holy shit, it\'s monday.',   hint:'一路捲到最底' }
];

/* ---------------- 小工具 ---------------- */
var $ = function (s) { return document.querySelector(s); };
var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function draw(canvas, name) {
  var rows = SPRITES[name]; if (!rows) return;
  canvas.width = rows[0].length; canvas.height = rows.length;
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  rows.forEach(function (r, y) {
    for (var x = 0; x < r.length; x++) {
      var c = r[x];
      if (c !== '.' && PALETTE[c]) { ctx.fillStyle = PALETTE[c]; ctx.fillRect(x, y, 1, 1); }
    }
  });
  canvas.dataset.sprite = name;
}
function spriteCanvas(name, cls) {
  var c = document.createElement('canvas'); draw(c, name);
  if (cls) c.className = cls;
  c.setAttribute('aria-hidden', 'true');
  return c;
}

/* ---------------- 存檔（只存在這台瀏覽器） ---------------- */
var state = { bananas:0, ach:[] };
try { var saved = JSON.parse(localStorage.getItem('mzgo-pixel') || 'null'); if (saved) state = saved; } catch (e) {}
function save() { try { localStorage.setItem('mzgo-pixel', JSON.stringify(state)); } catch (e) {} }

/* ---------------- HUD ---------------- */
function pad(n) { return (n < 10 ? '0' : '') + n; }
function renderHud() {
  $('#banana-count').textContent = pad(state.bananas);
  $('#ach-count').textContent = state.ach.length + '/' + ACHIEVEMENTS.length;
}
function popText(text, x, y) {
  var p = document.createElement('span');
  p.className = 'pop'; p.textContent = text;
  p.style.left = x + 'px'; p.style.top = y + 'px';
  document.body.appendChild(p);
  setTimeout(function () { p.remove(); }, 900);
}
function addBananas(n, x, y) {
  state.bananas = Math.max(0, state.bananas + n);
  save(); renderHud();
  if (x != null) popText((n > 0 ? '+' : '') + n, x, y);
  if (state.bananas >= 10) unlock('banana');
}

/* ---------------- 成就 ---------------- */
var toastQueue = [], toasting = false;
function unlock(id) {
  if (state.ach.indexOf(id) > -1) return;
  state.ach.push(id); save(); renderHud();
  var a = ACHIEVEMENTS.filter(function (x) { return x.id === id; })[0];
  toastQueue.push('★ ' + a.name); nextToast();
}
function nextToast() {
  if (toasting || !toastQueue.length) return;
  toasting = true;
  $('#toast-text').textContent = toastQueue.shift();
  $('#toast').classList.add('show');
  setTimeout(function () {
    $('#toast').classList.remove('show');
    setTimeout(function () { toasting = false; nextToast(); }, 350);
  }, 2600);
}
function openAchievements() {
  $('#ach-list').innerHTML = ACHIEVEMENTS.map(function (a) {
    var got = state.ach.indexOf(a.id) > -1;
    return '<li class="' + (got ? '' : 'lock') + '"><b>' + (got ? '★ ' + a.name : '？？？') + '</b><span>' + (got ? a.desc : '提示：' + a.hint) + '</span></li>';
  }).join('');
  var d = $('#ach-dialog');
  if (d.showModal) d.showModal(); else d.setAttribute('open', '');
}

/* ---------------- 標題畫面的兩隻 ---------------- */
var monkey = $('#t-monkey'), gorilla = $('#t-gorilla');
function bubble(el, text, ms) {
  el.textContent = text; el.hidden = false;
  clearTimeout(el._t); el._t = setTimeout(function () { el.hidden = true; }, ms || 1600);
}
/* 猴子偶爾眨眼 */
(function blinkLoop() {
  setTimeout(function () {
    if (monkey.dataset.sprite === 'monkey_awake') {
      draw(monkey, 'monkey_sleep');
      setTimeout(function () { draw(monkey, 'monkey_awake'); }, 160);
    }
    blinkLoop();
  }, 2500 + Math.random() * 3000);
})();
/* 戳猴子：跳一下、掉一根香蕉飛進計分列 */
function flyBanana(fromEl) {
  var r = fromEl.getBoundingClientRect(), t = $('.hud-item canvas').getBoundingClientRect();
  var x0 = r.left + r.width * 0.75, y0 = r.top + r.height * 0.2;
  if (reduced) { addBananas(1, x0, y0); return; }
  var b = spriteCanvas('banana', 'fly'); b.style.left = '0'; b.style.top = '0';
  document.body.appendChild(b);
  var anim = b.animate([
    { transform:'translate(' + x0 + 'px,' + y0 + 'px) rotate(0deg)' },
    { transform:'translate(' + (x0 + t.left) / 2 + 'px,' + (Math.min(y0, t.top) - 120) + 'px) rotate(200deg)' },
    { transform:'translate(' + t.left + 'px,' + t.top + 'px) rotate(360deg) scale(.6)' }
  ], { duration:750, easing:'ease-in' });
  anim.onfinish = function () { b.remove(); addBananas(1, t.left, t.top + 20); };
}
$('#t-monkey-btn').addEventListener('click', function () {
  var btn = this;
  btn.classList.remove('jump'); void btn.offsetWidth; btn.classList.add('jump');
  bubble($('#m-bubble'), MONKEY_SAYS[Math.floor(Math.random() * MONKEY_SAYS.length)]);
  flyBanana(btn);
});
/* 戳猩猩：醒來、清喉嚨、否認在睡覺，然後又睡著 */
var gorillaTimer;
$('#t-gorilla-btn').addEventListener('click', function () {
  clearTimeout(gorillaTimer);
  draw(gorilla, 'gorilla_awake'); $('#zzz').hidden = true;
  bubble($('#g-bubble'), '咳⋯⋯', 900);
  setTimeout(function () { bubble($('#g-bubble'), '本猩未入睡，只是在闔目構思。', 2600); }, 950);
  unlock('wake');
  gorillaTimer = setTimeout(function () { draw(gorilla, 'gorilla_sleep'); $('#zzz').hidden = false; }, 3800);
});
$('#press-start').addEventListener('click', function () {
  unlock('start');
  $('#select').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
});

/* ---------------- 能力值條 ---------------- */
document.querySelectorAll('.bar').forEach(function (bar) {
  var v = +bar.dataset.v;
  for (var i = 0; i < 10; i++) {
    var seg = document.createElement('i');
    if (i < v) seg.className = 'on';
    bar.appendChild(seg);
  }
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', bar.classList.contains('glitch') ? '不明' : v + ' / 10');
  if (v === 10 && !bar.classList.contains('glitch')) {
    var m = document.createElement('span'); m.className = 'max'; m.textContent = 'MAX';
    bar.appendChild(m);
  }
});

/* ---------------- 對話框 ---------------- */
var dlg = { lines:null, i:0, typing:false, timer:null, done:false };
function setLine(line) {
  var who = $('#d-who');
  who.textContent = NAMES[line.w]; who.className = 'who ' + line.w + (line.w === 's' ? ' sys' : '');
  draw($('#d-face'), line.f || FACES[line.w]);
  var el = $('#d-line'), text = line.t, n = 0;
  clearInterval(dlg.timer); $('#d-next').hidden = true;
  if (reduced) { el.textContent = text; $('#d-next').hidden = false; return; }
  dlg.typing = true; el.textContent = '';
  dlg.timer = setInterval(function () {
    n++; el.textContent = text.slice(0, n);
    if (n >= text.length) { clearInterval(dlg.timer); dlg.typing = false; $('#d-next').hidden = false; }
  }, 38);
}
function finishTyping() {
  clearInterval(dlg.timer); dlg.typing = false;
  $('#d-line').textContent = dlg.lines[dlg.i].t; $('#d-next').hidden = false;
}
function play(who) {
  dlg.lines = SCRIPTS[who]; dlg.i = 0; dlg.done = false;
  setLine(dlg.lines[0]);
}
function advance() {
  if (!dlg.lines) return;
  if (dlg.typing) { finishTyping(); return; }
  if (dlg.i < dlg.lines.length - 1) { dlg.i++; setLine(dlg.lines[dlg.i]); return; }
  if (!dlg.done) {
    dlg.done = true; unlock('intro');
    setLine({ w:'s', t:'（自我介紹完畢。往下捲去選關卡。）' });
  }
}
$('#dialog').addEventListener('click', advance);
$('#dialog').addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
});
$('#d-skip').addEventListener('click', function () {
  if (!dlg.lines) return;
  dlg.i = dlg.lines.length - 1; dlg.typing = false; advance();
});
document.querySelectorAll('[data-pick]').forEach(function (b) {
  b.addEventListener('click', function () {
    var who = b.dataset.pick;
    $('#versus').classList.add('chose');
    document.querySelectorAll('.card-wrap').forEach(function (w) { w.classList.toggle('on', w.dataset.who === who); });
    draw(document.querySelector('.card-wrap[data-who="g"] canvas'), who === 'g' ? 'gorilla_awake' : 'gorilla_sleep');
    play(who);
    $('#dialog').focus({ preventScroll:true });
    $('#dialog').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block:'center' });
  });
});

/* ---------------- 秘技：香蕉雨 ---------------- */
function bananaRain() {
  unlock('secret');
  var main = $('#screen');
  main.classList.remove('shake'); void main.offsetWidth; main.classList.add('shake');
  var count = reduced ? 8 : 26;
  for (var i = 0; i < count; i++) {
    (function (i) {
      setTimeout(function () {
        var b = spriteCanvas('banana', 'rain');
        b.removeAttribute('aria-hidden'); b.setAttribute('role', 'button'); b.setAttribute('aria-label', '香蕉');
        var x = Math.random() * (innerWidth - 40);
        b.style.left = x + 'px'; b.style.top = '-40px';
        document.body.appendChild(b);
        var anim = b.animate([
          { transform:'translateY(0) rotate(0deg)' },
          { transform:'translateY(' + (innerHeight + 80) + 'px) rotate(' + (Math.random() > .5 ? 540 : -540) + 'deg)' }
        ], { duration: reduced ? 6000 : 2600 + Math.random() * 2200, easing:'linear' });
        anim.onfinish = function () { b.remove(); };
        b.addEventListener('pointerdown', function (e) { addBananas(1, e.clientX, e.clientY); b.remove(); });
      }, i * 120);
    })(i);
  }
}
var vsClicks = [];
$('#vs').addEventListener('click', function () {
  var now = Date.now();
  vsClicks = vsClicks.filter(function (t) { return now - t < 3000; }); vsClicks.push(now);
  if (vsClicks.length >= 5) { vsClicks = []; bananaRain(); }
});
var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'], kPos = 0;
addEventListener('keydown', function (e) {
  var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  kPos = (k === KONAMI[kPos]) ? kPos + 1 : (k === KONAMI[0] ? 1 : 0);
  if (kPos === KONAMI.length) { kPos = 0; bananaRain(); }
});

/* ---------------- 偶爾飛過的香蕉（抓到 +3） ---------------- */
function floater() {
  if (document.hidden || reduced) return;
  var b = spriteCanvas('banana', 'floater');
  b.removeAttribute('aria-hidden'); b.setAttribute('role', 'button'); b.setAttribute('aria-label', '飛過去的香蕉');
  var y = 80 + Math.random() * (innerHeight - 200);
  b.style.left = '-50px'; b.style.top = y + 'px';
  document.body.appendChild(b);
  var steps = [];
  for (var i = 0; i <= 8; i++) steps.push({ transform:'translate(' + (innerWidth + 100) * i / 8 + 'px,' + (i % 2 ? -26 : 26) + 'px) rotate(' + i * 45 + 'deg)' });
  var anim = b.animate(steps, { duration:7000, easing:'linear' });
  anim.onfinish = function () { b.remove(); };
  b.addEventListener('pointerdown', function (e) { addBananas(3, e.clientX, e.clientY); b.remove(); });
}
setInterval(floater, 30000);
setTimeout(floater, 9000);

/* ---------------- CONTINUE? 倒數 ---------------- */
var cont = { n:9, timer:null, over:false };
function contShow(over) {
  cont.over = over;
  $('#cont-ask').hidden = over; $('#cont-over').hidden = !over;
  if (over) { clearInterval(cont.timer); cont.timer = null; unlock('monday'); }
}
function contStart() {
  if (cont.timer || cont.over) return;
  cont.n = 9; $('#cont-count').textContent = cont.n;
  cont.timer = setInterval(function () {
    cont.n--; $('#cont-count').textContent = cont.n;
    if (cont.n <= 0) contShow(true);
  }, 1000);
}
function contStop() { clearInterval(cont.timer); cont.timer = null; }
if ('IntersectionObserver' in window) {
  new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { en.isIntersecting ? contStart() : contStop(); });
  }, { threshold:.5 }).observe($('#continue'));
}
$('#cont-no').addEventListener('click', function () { contShow(true); });
$('#cont-yes').addEventListener('click', contStop);
$('#cont-insert').addEventListener('click', function (e) {
  if (state.bananas > 0) addBananas(-1, e.clientX, e.clientY);
  else popText('免費一次', e.clientX, e.clientY);
  contShow(false); contStart();
});

/* ---------------- 開機 ---------------- */
document.querySelectorAll('canvas[data-sprite]').forEach(function (c) { draw(c, c.dataset.sprite); });
document.querySelectorAll('[data-hearts]').forEach(function (h) {
  for (var i = 0; i < 3; i++) h.appendChild(spriteCanvas('heart'));
});
$('#trophy-btn').addEventListener('click', openAchievements);
$('#ach-close').addEventListener('click', function () { var d = $('#ach-dialog'); d.close ? d.close() : d.removeAttribute('open'); });
renderHud();
