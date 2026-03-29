/* ============================================
   news.js - 管理画面のデータを詳細まで表示する完全版
   ============================================ */

const SHOW_COUNT = 3;
let newsData = [];

async function loadNews() {
  try {
    // キャッシュ対策としてクエリパラメータを付与
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

/* 次のイベントバナー */
function renderUpcoming() {
  const upcoming = newsData.find(n => n.upcoming === true);
  const wrap = document.getElementById('upcomingEvent');
  if (!wrap) return;

  if (!upcoming) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div class="upcoming-inner">
      ${upcoming.flyer ? `
        <div class="upcoming-flyer" onclick="openDetailModal('${upcoming.title}')" style="cursor:pointer">
          <img src="${upcoming.flyer}" alt="チラシ">
          <span class="upcoming-flyer-btn">チラシ・詳細を見る ↗</span>
        </div>` : ''}
      <div class="upcoming-body">
        <span class="upcoming-eyebrow">📌 次のイベント</span>
        <h3 class="upcoming-title">${upcoming.title}</h3>
        <p class="upcoming-date">🗓 ${upcoming.date}</p>
        <p class="upcoming-summary">${upcoming.summary}</p>
        <button class="upcoming-btn" onclick="openDetailModal('${upcoming.title}')">詳細・チラシを見る →</button>
      </div>
    </div>
  `;
}

/* 一覧リスト */
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

/* 詳細モーダル（ここが重要！） */
function openDetailModal(title) {
  const item = newsData.find(n => n.title === title);
  if (!item) return;

  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  
  // Markdownの簡易変換（箇条書きや改行に対応）
  let detailHtml = item.detail || item.summary;
  detailHtml = detailHtml
    .replace(/^### (.*$)/gim, '<h3>$1</h3>') // ### 見出し
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')  // ## 見出し
    .replace(/^\* (.*$)/gim, '<li>$1</li>')  // * 箇条書き
    .replace(/\n/g, '<br>');                 // 改行

  content.innerHTML = `
    ${item.flyer ? `<div class="modal-flyer"><img src="${item.flyer}" alt="チラシ"></div>` : ''}
    <h2 class="section-title" style="font-size:1.4rem; margin-top:10px;">${item.title}</h2>
    <p class="modal-date" style="color:var(--text-light); margin-bottom:20px;">🗓 ${item.date}</p>
    <div class="modal-body-text" style="line-height:2;">
      ${detailHtml.includes('<li>') ? `<ul style="margin-left:20px;">${detailHtml}</ul>` : detailHtml}
    </div>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// 初期化
loadNews();
