/* ============================================
   news.js - お知らせ・イベント管理（重複回避版）
   ============================================ */

const SHOW_COUNT = 3;
let newsData = [];

async function loadNews() {
  try {
    const response = await fetch(`./news.json?t=${new Date().getTime()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    // 最新順に並び替え
    newsData = (data.news_list || []).reverse(); 
    
    renderNews();
  } catch (error) {
    console.error("データの読み込みに失敗しました:", error);
  }
}

function renderNews() {
  // 1. まず「次のイベント」を特定する
  const upcomingItem = newsData.find(n => n.upcoming === true);
  
  // 2. 「次のイベント」を表示
  renderUpcoming(upcomingItem);
  
  // 3. 「次のイベント」以外をリストに表示
  renderList(upcomingItem);
}

/* 次のイベント（大きなカード） */
function renderUpcoming(item) {
  const wrap = document.getElementById('upcomingEvent');
  if (!wrap) return;

  if (!item) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div class="upcoming-inner" onclick="openDetailModal('${item.title.replace(/'/g, "\\'")}')" style="cursor:pointer;">
      ${item.flyer ? `
        <div class="upcoming-flyer">
          <img src="${item.flyer}" alt="チラシ">
          <span class="upcoming-flyer-btn">詳細・チラシを見る ↗</span>
        </div>` : ''}
      <div class="upcoming-body">
        <span class="upcoming-eyebrow">📌 次のイベント</span>
        <h3 class="upcoming-title">${item.title}</h3>
        <p class="upcoming-date">🗓 ${item.date}</p>
        <p class="upcoming-summary">${item.summary}</p>
        <button class="upcoming-btn">詳細を見る →</button>
      </div>
    </div>
  `;
}

/* お知らせ一覧（小カード：重複を排除 ＆ 開閉トグル付き） */
function renderList(excludeItem, showAll = false) {
  const list = document.getElementById('newsList');
  const moreBtn = document.getElementById('newsMoreBtn');
  if (!list) return;

  // 「次のイベント」に選ばれた項目を除外して新しいリストを作る
  const displayData = excludeItem 
    ? newsData.filter(n => n !== excludeItem) 
    : newsData;

  const items = showAll ? displayData : displayData.slice(0, SHOW_COUNT);

  list.innerHTML = items.map(item => `
    <div class="nlist-item nlist-item--green" onclick="openDetailModal('${item.title.replace(/'/g, "\\'")}')" style="cursor:pointer;">
      <span class="nlist-badge nlist-badge--green">${item.category}</span>
      <time class="nlist-date">${item.date}</time>
      <span class="nlist-title">${item.title}</span>
      <span class="nlist-arrow">→</span>
    </div>
  `).join('');

  if (moreBtn) {
    // データが3件以下ならボタン自体を隠す
    if (displayData.length <= SHOW_COUNT) {
      moreBtn.style.display = 'none';
    } else {
      // データが4件以上ある場合
      moreBtn.style.display = 'inline-flex';
      
      // 開いている時は「閉じる」、閉じている時は「もっと見る」に文字を変更
      moreBtn.innerHTML = showAll ? '閉じる ∧' : '過去のお知らせをもっと見る ∨';
      
      moreBtn.onclick = (e) => {
        e.preventDefault();
        
        // 今の状態の「逆（開く⇔閉じる）」を実行
        renderList(excludeItem, !showAll); 
        
        // 「閉じる」を押した時、リストの一番上にスムーズにスクロールして戻す
        if (showAll) {
          list.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
    }
  }
}
/* --- 以下、モーダル制御と初期化は変更なし --- */
function openDetailModal(title) {
  const item = newsData.find(n => n.title === title);
  if (!item) return;
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  if (!overlay || !content) return;
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
    <div class="modal-body-text" style="line-height:1.8; color:var(--text-soft);">${detailHtml.includes('<li>') ? `<ul style="margin-left:20px;">${detailHtml}</ul>` : detailHtml}</div>
  `;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
window.closeModal = function() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
};
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  const closeBtn = document.getElementById('modalClose');
  const overlay = document.getElementById('modalOverlay');
  if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); window.closeModal(); });
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.closeModal(); });
});
