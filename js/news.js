/* ============================================
   news.js - お知らせ・イベント管理

   新しいお知らせを追加するには：
   newsData 配列の先頭に追加するだけ！

   プロパティ：
   - id       : ユニークなID
   - date     : 日付テキスト
   - category : カテゴリー名
   - color    : 'gold' | 'green' | 'blue' | 'red'
   - title    : タイトル
   - summary  : 一覧に出る短い説明
   - flyer    : チラシ画像パス（省略可）
   - detail   : 詳細ポップアップのHTML（省略可）
   - upcoming : true にすると「次のイベント」枠に表示
   ============================================ */

const newsData = [
  {
    id: 1,
    date: '2025年3月8日（土）13:00〜16:00',
    category: 'イベント',
    color: 'gold',
    title: 'わたげミーティング 立ち上げ宣誓研修会',
    summary: '「私たちの居場所ってどこですか？」高知県立大学 永国寺キャンパスにて開催。参加費無料。',
    flyer: 'images/flyer-event1.jpg',
    upcoming: true,
    detail: `
      <div class="modal-flyer"><img src="images/flyer-event1.jpg" alt="チラシ"></div>
      <h2>わたげミーティング 立ち上げ宣誓研修会</h2>
      <p class="modal-date">📅 2025年3月8日（土）13:00〜16:00（12:30受付開始）</p>
      <p class="modal-place">📍 高知県立大学 永国寺キャンパス 教育研究棟 A101</p>
      <h3>テーマ</h3>
      <p>「私たちの居場所ってどこですか？」</p>
      <h3>プログラム</h3>
      <p><strong>第1部</strong></p>
      <ul>
        <li>13:00〜 開会・わたげミーティング立ち上げ宣誓</li>
        <li>13:15〜 基調講演「ヤングケアラーが横のつながりを作るということ」</li>
        <li>ケア経験談・ふうせんの会の取り組みについて</li>
      </ul>
      <p><strong>第2部</strong></p>
      <ul>
        <li>15:05〜 パネルディスカッション</li>
        <li>15:25〜 グループワーク「地域で暮らす私たちにできることってなんだろう？」</li>
      </ul>
      <p class="modal-note">※第1部・第2部どちらか参加のみも可能です</p>
      <h3>参加費</h3><p>無料 （当日参加OKです！）</p>
      <h3>主催・後援</h3>
      <p>主催：高知県立大学 森下幸子研究室／わたげミーティング<br>
      後援：（一社）高知県社会福祉士会、高知県精神保健福祉士協会、高知県医療ソーシャルワーカー協会、一般社団法人りぐらっぷ高知</p>
      <p class="modal-note">会場に駐車場はありません。公共交通機関をご利用ください。</p>
    `
  },
  {
    id: 2,
    date: '今後開催予定',
    category: 'つどい',
    color: 'green',
    title: '定期ミーティング（つどい・交流会）開始予定',
    summary: 'ヤングケアラー・元ヤングケアラーが集まれる定期的なつどいを準備中です。',
    detail: `
      <h2>定期ミーティング（つどい・交流会）開始予定</h2>
      <p>ヤングケアラー・元ヤングケアラーが気軽に集まれる定期的なつどいの場を準備しています。</p>
      <p>日程・場所などの詳細は決まり次第、このページおよびSNSにてお知らせします。</p>
      <p>Instagram：<a href="https://www.instagram.com/watage.meeting.kochi_" target="_blank">@watage.meeting.kochi_</a></p>
    `
  },
  {
    id: 3,
    date: '随時更新中',
    category: 'SNS',
    color: 'blue',
    title: 'Instagram・X（Twitter）で最新情報を発信中',
    summary: 'SNSで活動の最新情報をお届けしています。フォローしてお待ちください。',
    detail: `
      <h2>SNSで最新情報を発信中</h2>
      <p>📸 Instagram：<a href="https://www.instagram.com/watage.meeting.kochi_" target="_blank">@watage.meeting.kochi_</a></p>
      <p>🐦 X（Twitter）：<a href="https://twitter.com/watage_m_kochi" target="_blank">@watage_m_kochi</a></p>
      <p>DMでのご相談もお気軽にどうぞ。</p>
    `
  }
  /* ↓ 新しいお知らせはここに追加
  ,{
    id: 4,
    date: '2025年○月○日',
    category: 'お知らせ',
    color: 'green',
    title: 'タイトル',
    summary: '短い説明',
    detail: `<h2>タイトル</h2><p>詳細内容</p>`
  }
  */
];

const SHOW_COUNT = 3;

function renderNews() {
  renderUpcoming();
  renderList();
}

/* 次のイベントバナー */
function renderUpcoming() {
  const upcoming = newsData.find(n => n.upcoming);
  const wrap = document.getElementById('upcomingEvent');
  if (!upcoming || !wrap) return;

  wrap.innerHTML = `
    <div class="upcoming-inner">
      ${upcoming.flyer ? `
        <div class="upcoming-flyer" onclick="openModal(${upcoming.id})" style="cursor:pointer">
          <img src="${upcoming.flyer}" alt="チラシ">
          <span class="upcoming-flyer-btn">チラシを見る ↗</span>
        </div>` : ''}
      <div class="upcoming-body">
        <span class="upcoming-eyebrow">📌 次のイベント</span>
        <h3 class="upcoming-title">${upcoming.title}</h3>
        <p class="upcoming-date">🗓 ${upcoming.date}</p>
        <p class="upcoming-summary">${upcoming.summary}</p>
        <button class="upcoming-btn" onclick="openModal(${upcoming.id})">詳細・チラシを見る →</button>
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
    <div class="nlist-item nlist-item--${item.color}" onclick="openModal(${item.id})">
      <span class="nlist-badge nlist-badge--${item.color}">${item.category}</span>
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

/* モーダル */
function openModal(id) {
  const item = newsData.find(n => n.id === id);
  if (!item) return;
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');
  content.innerHTML = item.detail || `<h2>${item.title}</h2><p>${item.summary}</p>`;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

renderNews();
