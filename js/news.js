/* ============================================
   news.js - 管理画面(news.json)からデータを読み込む
   ============================================ */

const SHOW_COUNT = 3; // 一覧に最初に表示する件数
let newsData = [];    // ここに管理画面のデータが入ります

async function loadNews() {
  try {
    // 1. 管理画面で作成された news.json を読み込む
    const response = await fetch('./news.json');
    const data = await response.json();
    
    // config.ymlの構造に合わせてデータを取得
    newsData = data.news_list || [];
    
    // 画面に表示
    renderNews();
  } catch (error) {
    console.error("データの読み込みに失敗しました:", error);
    // データがない場合の予備表示
    document.getElementById('newsList').innerHTML = '<p>現在、お知らせはありません。</p>';
  }
}

function renderNews() {
  renderUpcoming();
  renderList();
}

/* 次のイベントバナー（upcomingがtrueのものを表示） */
function renderUpcoming() {
  const upcoming = newsData.find(n => n.upcoming === true);
  const wrap = document.getElementById('upcomingEvent');
  if (!wrap) return;

  if (!upcoming) {
    wrap.style.display = 'none'; // upcomingがなければ隠す
    return;
  }

  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div class="upcoming-inner">
      ${upcoming.flyer ? `
        <div class="upcoming-flyer" style="cursor:default">
          <img src="${upcoming.flyer}" alt="チラシ">
        </div>` : ''}
      <div class="upcoming-body">
        <span class="upcoming-eyebrow">📌 次のイベント</span>
        <h3 class="upcoming-title">${upcoming.title}</h3>
        <p class="upcoming-date">🗓 ${upcoming.date}</p>
        <p class="upcoming-summary">${upcoming.summary}</p>
        <button class="upcoming-btn" onclick="openDetailModal('${upcoming.title}')">詳細を見る →</button>
      </div>
    </div>
  `;
}

/* ニュースリスト */
function renderList(showAll = false) {
  const list    = document.getElementById('newsList');
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
    if (newsData.length <= SHOW_COUNT || showAll) {
      moreBtn.style.display = 'none';
    } else {
      moreBtn.style.display = 'inline-flex';
      moreBtn.onclick = () => renderList(true);
    }
  }
}

/* モーダル表示 */
function openDetailModal(title) {
  const item = newsData.find(n => n.title === title);
  if (!item) return;
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  
  // markdownを簡易的にHTMLに変換（改行を反映）
  const detailHtml = item.detail ? item.detail.replace(/\n/g, '<br>') : item.summary;

  content.innerHTML = `
    <h2>${item.title}</h2>
    <p class="modal-date">📅 ${item.date}</p>
    <div class="modal-text">${detailHtml}</div>
  `;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// 閉じる処理の登録
if (document.getElementById('modalClose')) {
  document.getElementById('modalClose').addEventListener('click', closeModal);
}
const overlay = document.getElementById('modalOverlay');
if (overlay) {
  overlay.addEventListener('click', function (e) { if (e.target === this) closeModal(); });
}

// 実行
loadNews();
