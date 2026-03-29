/* ============================================
   news.js - お知らせ・イベント管理（最終安定版）
   ============================================ */

const SHOW_COUNT = 3;
let newsData = [];

/**
 * 1. データの読み込み
 */
async function loadNews() {
  try {
    // キャッシュを回避して最新のjsonを取得
    const response = await fetch(`./news.json?t=${new Date().getTime()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    newsData = data.news_list || [];
    
    renderNews();
  } catch (error) {
    console.error("データの読み込みに失敗しました:", error);
    const list = document.getElementById('newsList');
    if (list) list.innerHTML = '<p>お知らせを読み込めませんでした。</p>';
  }
}

/**
 * 2. 画面へのレンダリング
 */
function renderNews() {
  renderUpcoming();
  renderList();
}

// 次のイベント（大きなカード）
function renderUpcoming() {
  const wrap = document.getElementById('upcomingEvent');
  if (!wrap) return;

  const upcoming = newsData.find(n => n.upcoming === true);
  if (!upcoming) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  // カード全体を確実にクリック可能にするため、onclickを親要素に付与
  wrap.innerHTML = `
    <div class="upcoming-inner" onclick="openDetailModal('${upcoming.title.replace(/'/g, "\\'")}')" style="cursor:pointer;">
      ${upcoming.flyer ? `
        <div class="upcoming-flyer">
          <img src="${upcoming.flyer}" alt="チラシ">
          <span class="upcoming-flyer-btn">詳細・チラシを見る ↗</span>
        </div>` : ''}
      <div class="upcoming-body">
        <span class="upcoming-eyebrow">📌 次のイベント</span>
        <h3 class="upcoming-title">${upcoming.title}</h3>
        <p class="upcoming-date">🗓 ${upcoming.date}</p>
        <p class="upcoming-summary">${upcoming.summary}</p>
        <button class="upcoming-btn">詳細を見る →</button>
      </div>
    </div>
  `;
}

// お知らせ一覧（リスト）
function renderList(showAll = false) {
  const list = document.getElementById('newsList');
  const moreBtn = document.getElementById('newsMoreBtn');
  if (!list) return;

  const items = showAll ? newsData : newsData.slice(0, SHOW_COUNT);

  list.innerHTML = items.map(item => `
    <div class="nlist-item nlist-item--green" onclick="openDetailModal('${item.title.replace(/'/g, "\\'")}')" style="cursor:pointer;">
      <span class="nlist-badge nlist-badge--green">${item.category}</span>
      <time class="nlist-date">${item.date}</time>
      <span class="nlist-title">${item.title}</span>
      <span class="nlist-arrow">→</span>
    </div>
  `).join('');

  if (moreBtn) {
    moreBtn.style.display = (newsData.length <= SHOW_COUNT || showAll) ? 'none' : 'inline-flex';
    moreBtn.onclick = (e) => {
      e.preventDefault();
      renderList(true);
    };
  }
}

/**
 * 3. モーダル（詳細画面）の制御
 */
function openDetailModal(title) {
  const item = newsData.find(n => n.title === title);
  if (!item) return;

  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!overlay || !content) return;
  
  // Markdownの簡易変換（見出し、箇条書き、改行）
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
    <div class="modal-body-text" style="line-height:1.8; color:var(--text-soft);">
      ${detailHtml.includes('<li>') ? `<ul style="margin-left:20px;">${detailHtml}</ul>` : detailHtml}
    </div>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // 背景スクロール禁止
}

// モーダルを閉じる関数（グローバルに公開）
window.closeModal = function() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = ''; // スクロール再開
};

/**
 * 4. 初期化処理
 */
document.addEventListener('DOMContentLoaded', () => {
  // データの読み込み開始
  loadNews();

  // 閉じるボタンと背景クリックのイベント登録
  const closeBtn = document.getElementById('modalClose');
  const overlay = document.getElementById('modalOverlay');

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.closeModal();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) window.closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeModal();
  });
});
