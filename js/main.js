/* ============================================
   main.js - わたげミーティング JavaScript
   テキスト → index.html / 見た目 → css/style.css / 動き → main.js
   ============================================ */


/* ナビバーのスクロールエフェクト */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', function () {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});


/* ハンバーガーメニュー */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', function () {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    navLinks.classList.remove('open');
  });
});


/* スクロールフェードインアニメーション
   .reveal クラスの要素が画面内に入ったとき .visible を追加する */
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry, index) {
    if (entry.isIntersecting) {
      setTimeout(function () {
        entry.target.classList.add('visible');
      }, index * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(function (el) {
  observer.observe(el);
});


/* 背景のわたげエフェクト
   seedCount を変えると種の数を調整できる */
const seedsBg = document.getElementById('seedsBg');

const seedSVG = [
  '<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
  '  <line x1="20" y1="40" x2="20" y2="15" stroke="#4a9e4e" stroke-width="1"/>',
  '  <line x1="20" y1="15" x2="10" y2="5"  stroke="#4a9e4e" stroke-width="0.8"/>',
  '  <line x1="20" y1="15" x2="30" y2="5"  stroke="#4a9e4e" stroke-width="0.8"/>',
  '  <line x1="20" y1="15" x2="20" y2="2"  stroke="#4a9e4e" stroke-width="0.8"/>',
  '  <line x1="20" y1="15" x2="8"  y2="10" stroke="#4a9e4e" stroke-width="0.5"/>',
  '  <line x1="20" y1="15" x2="32" y2="10" stroke="#4a9e4e" stroke-width="0.5"/>',
  '</svg>'
].join('');

var seedCount = 12;

for (var i = 0; i < seedCount; i++) {
  var seed = document.createElement('div');
  seed.className = 'seed';
  seed.innerHTML = seedSVG;
  seed.style.left              = (Math.random() * 100) + '%';
  seed.style.top               = (Math.random() * 100 + 50) + '%';
  seed.style.width             = (16 + Math.random() * 20) + 'px';
  seed.style.animationDuration = (15 + Math.random() * 20) + 's';
  seed.style.animationDelay    = (Math.random() * 15) + 's';
  seedsBg.appendChild(seed);
}
