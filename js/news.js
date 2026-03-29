/* ============================================
   news.js - 管理画面のデータを詳細まで表示する完全版
   ============================================ */

const SHOW_COUNT = 3;
let newsData = [];

// 1. データの読み込み
async function loadNews() {
  try {
    const response = await fetch(`./news.json?t=${new Date().getTime()}`);
    const data = await response.json();
    newsData = data.news_list || [];
    renderNews();
  } catch (error) {
    console.error("データの読み込みに失敗しました:", error);
  }
}

function renderNews() {
  renderUpcoming();
  renderList();
}

/* 2. 次のイベントバナー（カード全体をクリック可能に） */
function renderUpcoming() {
  const upcoming = newsData.find(n => n.upcoming === true);
  const wrap = document.getElementById('upcomingEvent');
  if (!wrap) return;

  if (!upcoming) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  // カード全体(upcoming-inner)に onclick を追加しました
  wrap.innerHTML = `
    <div class="upcoming-inner" onclick="openDetailModal('${upcoming.title}')" style="cursor:pointer">
      ${upcoming.flyer ? `
        <div class="upcoming-flyer">
          <img src="${upcoming.flyer}" alt="チラシ">
          <span class="upcoming-flyer-btn">チラシ・詳細を見る ↗</span>
        </div>` : ''}
      <div class="upcoming-body">
        <span class="upcoming-eyebrow">📌 次のイベント</span>
        <h3 class="upcoming-title">${upcoming.title}</h3>
        <p class="upcoming-date">🗓 ${upcoming.date}</p>
        <p class="upcoming-summary">${upcoming.summary}</p>
        <button class="upcoming-btn">詳細・チラシを見る →</button>
      </div>
    </div>
  `;
}

/* 3. 一覧リスト（カード全体をクリック可能） */
function renderList(showAll = false) {
  const list = document.getElementById('newsList');
  const moreBtn = document.getElementById('newsMoreBtn');
  if (!list) return;

  const items = showAll ? newsData : newsData.slice(0, SHOW_COUNT);

  list.innerHTML = items.map(item => `
    <div class="nlist-item nlist-item--green" onclick="openDetailModal('${item.title}')">
      <span class="nlist-badge nlist-badge--green">${item.category}</span>
      <time class="nlist-date">${item.date}</time>
      <span class="nlist-title">${item.title}</span>
      <span class="nlist-arrow">→</span>
    </div>
  `).join('');

  if (moreBtn) {
    moreBtn.style.display = (newsData.length <= SHOW_COUNT || showAll) ? 'none' : 'inline-flex';
    moreBtn.onclick = () => renderList(true);
  }
}

/* 4. 詳細モーダルを表示 */
function openDetailModal(title) {
  const item = newsData.find(n => n.title === title);
  if (!item) return;

  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  
  // Markdownの簡易変換
  let detailHtml = item.detail || item.summary;
  detailHtml = detailHtml
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/\n/g, '<br>');

  content.innerHTML = `
    ${item.flyer ? `<div class="modal-flyer"><img src="${item.flyer}" alt="チラシ"></div>` : ''}
    <h2 class="section-title" style="font-size:1.4rem; margin-top:10px;">${item.title}</h2>
    <p class="modal-date" style="color:var(--text-light); margin-bottom:20px;">🗓 ${item.date}</p>
    <div class="modal-body-text" style="line-height:2; color:var(--text-soft);">
      ${detailHtml.includes('<li>') ? `<ul style="margin-left:20px;">${detailHtml}</ul>` : detailHtml}
    </div>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* 5. モーダルを閉じる（ここが復活した修正ポイント！） */
function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
  document.body.style.overflow = '';
}

// 閉じるボタンと背景クリックにイベントを登録
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('modalClose');
  const overlay = document.getElementById('modalOverlay');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }
  // Escキーでも閉じられるように
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});

// 実行
loadNews();
