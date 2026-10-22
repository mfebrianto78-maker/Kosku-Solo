// =====================================================
// KosKu Solo — Desain ulang halaman pencari (Putaran 1, bagian A)
// Dimuat lewat: <script src="desain-pencari.js"></script>
// Isi: Cari Kos (filter bottom sheet, kartu foto besar, kerangka memuat)
//      dan halaman Pesan (daftar percakapan modern).
// =====================================================

(function () {
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const css = `
    /* ---------- Cari Kos: header ---------- */
    #screen-search .search-header { padding-bottom: 12px; }
    #screen-search .search-box {
      box-shadow: none !important; background: var(--bg-2) !important;
      border: none !important; border-radius: 16px; padding: 10px 10px 10px 16px;
    }
    #screen-search .search-box > span:last-child {
      position: relative; width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: var(--orange-light); color: var(--orange);
    }
    #screen-search .search-box > span:last-child svg { stroke: var(--orange); }
    #screen-search .search-box > span:last-child[data-count]:not([data-count="0"])::after {
      content: attr(data-count); position: absolute; top: -5px; right: -5px;
      min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; box-sizing: border-box;
      background: var(--orange); color: #fff; font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center; border: 2px solid var(--card);
    }
    #screen-search .filter-bar { padding-right: 20px; }

    /* ---------- Cari Kos: filter sebagai lembar bawah ---------- */
    #filterPanel:not([style*="none"]) {
      position: fixed; inset: 0; z-index: 300; background: rgba(15,15,25,0.5);
      display: flex !important; align-items: flex-end; animation: kkFade .2s ease-out;
    }
    #filterPanel .filter-panel {
      margin: 0; width: 100%; max-height: 88vh; overflow-y: auto; box-sizing: border-box;
      border-radius: 26px 26px 0 0; padding: 10px 20px 20px;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.25); animation: kkSlide .28s cubic-bezier(.2,.8,.2,1);
    }
    #filterPanel .kk-grab { width: 42px; height: 5px; border-radius: 3px; background: var(--border); margin: 0 auto 14px; }
    #filterPanel .kk-sheet-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    #filterPanel .kk-sheet-head b { font-size: 18px; font-weight: 800; color: var(--text); }
    #filterPanel .kk-x {
      width: 34px; height: 34px; border-radius: 50%; background: var(--bg-2); color: var(--text-2);
      display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px;
    }
    #filterPanel .price-range { gap: 8px; }
    #filterPanel .price-input { min-width: 0; width: 100%; box-sizing: border-box; }
    #filterPanel .kk-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    #filterPanel .filter-actions {
      padding: 10px 0 0; position: sticky; bottom: -20px; background: var(--card);
    }
    #filterPanel .filter-section { margin-bottom: 22px; }

    @keyframes kkFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes kkSlide { from { transform: translateY(60px); opacity: .6; } to { transform: none; opacity: 1; } }

    /* ---------- Cari Kos: kartu foto besar ---------- */
    .kk-card2 {
      background: var(--card); border-radius: 20px; overflow: hidden; margin-bottom: 16px;
      box-shadow: 0 2px 14px rgba(20,20,40,0.08); cursor: pointer; transition: transform .15s;
    }
    .kk-card2:active { transform: scale(0.985); }
    .kk-photo {
      position: relative; height: 180px; overflow: hidden;
      background: linear-gradient(135deg,#FFE0C0,#FFB347);
      display: flex; align-items: center; justify-content: center; font-size: 52px;
    }
    .kk-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .kk-photo::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(to top, rgba(0,0,0,0.38), rgba(0,0,0,0) 48%);
    }
    .kk-tag {
      position: absolute; top: 12px; left: 12px; z-index: 2; color: #fff;
      font-size: 11.5px; font-weight: 800; padding: 5px 12px; border-radius: 20px; letter-spacing: .2px;
    }
    .kk-photo .fav-btn { position: absolute !important; top: 10px; right: 10px; z-index: 2; }
    .kk-rate {
      position: absolute; left: 12px; bottom: 11px; z-index: 2; color: #fff;
      display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700;
    }
    .kk-rate small { font-weight: 500; opacity: .85; font-size: 12px; }
    .kk-body { padding: 14px 16px 16px; }
    .kk-name { font-size: 16.5px; font-weight: 800; color: var(--text); line-height: 1.3; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .kk-addr { display: flex; align-items: flex-start; gap: 5px; margin-top: 6px; font-size: 12.5px; color: var(--text-3); line-height: 1.4; }
    .kk-addr svg { flex-shrink: 0; margin-top: 1px; }
    .kk-fas { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
    .kk-fas span { font-size: 11.5px; font-weight: 600; color: var(--text-2); background: var(--bg-2); padding: 5px 10px; border-radius: 9px; }
    .kk-foot { display: flex; align-items: flex-end; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border); }
    .kk-price { font-size: 19px; font-weight: 800; color: var(--orange); line-height: 1; }
    .kk-price small { font-size: 12px; font-weight: 500; color: var(--text-3); margin-left: 2px; }
    .kk-sewa { font-size: 12px; color: var(--text-3); font-weight: 600; }

    /* ---------- Kerangka memuat ---------- */
    .kk-skel { background: var(--card); border-radius: 20px; overflow: hidden; margin-bottom: 16px; }
    .kk-skel i, .kk-skel b {
      display: block; background: linear-gradient(90deg, var(--bg-2) 25%, var(--border) 50%, var(--bg-2) 75%);
      background-size: 200% 100%; animation: kkShim 1.3s infinite linear;
    }
    .kk-skel i { height: 180px; }
    .kk-skel b { height: 14px; border-radius: 8px; margin: 14px 16px 0; }
    .kk-skel b:last-child { margin-bottom: 18px; width: 40%; }
    @keyframes kkShim { from { background-position: 200% 0; } to { background-position: -200% 0; } }

    /* ---------- Pesan ---------- */
    #screen-chat-list .top-bar { padding-bottom: 8px; }
    .cl-sub { font-size: 12.5px; color: var(--text-3); margin-top: 3px; font-weight: 500; }
    .cl-search {
      margin: 6px 16px 10px; display: flex; align-items: center; gap: 10px;
      background: var(--bg-2); border-radius: 14px; padding: 11px 14px; color: var(--text-3);
    }
    .cl-search input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; font-family: inherit; color: var(--text); }
    .cl-wrap { padding: 2px 16px 24px; }
    .cl-item {
      display: flex; gap: 13px; align-items: center; padding: 13px 14px; margin-bottom: 10px;
      background: var(--card); border-radius: 18px; box-shadow: 0 1px 8px rgba(20,20,40,0.06); cursor: pointer;
    }
    .cl-item:active { transform: scale(0.985); }
    .cl-av {
      width: 54px; height: 54px; border-radius: 17px; flex-shrink: 0; overflow: hidden; color: #fff;
      background: linear-gradient(135deg,#FF8A00,#FFB347); display: flex; align-items: center;
      justify-content: center; font-size: 20px; font-weight: 800;
    }
    .cl-av img { width: 100%; height: 100%; object-fit: cover; }
    .cl-main { flex: 1; min-width: 0; }
    .cl-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .cl-name { font-size: 14.5px; color: var(--text); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cl-time { font-size: 11.5px; color: var(--text-3); flex-shrink: 0; }
    .cl-item.unread .cl-time { color: var(--orange); font-weight: 700; }
    .cl-kos { font-size: 11.5px; color: var(--orange); font-weight: 600; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cl-prev { font-size: 13px; color: var(--text-3); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
    .cl-item.unread .cl-prev { color: var(--text); font-weight: 600; }
    .cl-badge {
      min-width: 20px; height: 20px; padding: 0 6px; box-sizing: border-box; border-radius: 10px; flex-shrink: 0;
      background: var(--orange); color: #fff; font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .cl-empty { text-align: center; padding: 56px 28px; color: var(--text-3); }
    .cl-empty .ic {
      width: 92px; height: 92px; border-radius: 50%; background: var(--orange-light); color: var(--orange);
      display: flex; align-items: center; justify-content: center; margin: 0 auto 18px;
    }
    .cl-empty h3 { font-size: 17px; font-weight: 800; color: var(--text); margin: 0 0 6px; }
    .cl-empty p { font-size: 13px; line-height: 1.6; margin: 0 0 18px; }
    .cl-empty button {
      background: var(--orange); color: #fff; border: none; border-radius: 14px; padding: 12px 26px;
      font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer;
    }
  `;

  function injectStyle() {
    if (document.getElementById('koskuDesainPencari')) return;
    const s = document.createElement('style');
    s.id = 'koskuDesainPencari';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- SVG kecil ----------
  const SVG_PIN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const SVG_STAR = '<svg width="15" height="15" viewBox="0 0 24 24" fill="#FFC531" stroke="#FFC531" stroke-width="1.5" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
  const SVG_SEARCH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const SVG_CHAT = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.2-5.3A8.4 8.4 0 1 1 21 11.5z"/></svg>';
  const SVG_HOME = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>';

  const TAG_COLOR = { Putri: '#EC4899', Putra: '#3B82F6', Campur: '#8B5CF6', Eksklusif: '#D97706' };

  // ---------- Kartu kos baru (halaman Cari) ----------
  window.renderKosListCard = function (kos) {
    const foto = (kos.foto_urls && kos.foto_urls.length) ? kos.foto_urls[0] : null;
    const emoji = kos.jenis_kos === 'Putra' ? '🪑' : kos.jenis_kos === 'Eksklusif' ? '🏠' : '🛏️';
    const fas = (kos.fasilitas || []).slice(0, 3);
    const lebih = (kos.fasilitas || []).length - fas.length;
    let verified = '';
    try { if (isKosVerified(kos)) verified = verifiedBadgeHtml(true); } catch (e) { /* abaikan */ }
    let fav = '🤍';
    try { if (favoritKosIds.has(kos.id)) fav = '❤️'; } catch (e) { /* abaikan */ }
    let harga = kos.harga_per_bulan;
    try { harga = formatRupiah(kos.harga_per_bulan); } catch (e) { /* abaikan */ }
    const rating = Number(kos.rating) || 0;

    return `
      <div class="kk-card2" onclick="openDetail('${esc(kos.id)}')">
        <div class="kk-photo">
          ${foto ? `<img src="${esc(foto)}" loading="lazy" alt="">` : emoji}
          <div class="kk-tag" style="background:${TAG_COLOR[kos.jenis_kos] || '#FF8A00'}">${esc(kos.jenis_kos)}</div>
          <div class="fav-btn" onclick="toggleFavorite('${esc(kos.id)}', event, this)">${fav}</div>
          <div class="kk-rate">${SVG_STAR}${rating ? rating.toFixed(1) : 'Baru'}${rating ? `<small>(${kos.jumlah_review || 0})</small>` : ''}</div>
        </div>
        <div class="kk-body">
          <div class="kk-name">${esc(kos.nama_kos)}${verified}</div>
          <div class="kk-addr">${SVG_PIN}<span>${esc(kos.alamat)}</span></div>
          ${fas.length ? `<div class="kk-fas">${fas.map(f => `<span>${esc(f)}</span>`).join('')}${lebih > 0 ? `<span>+${lebih}</span>` : ''}</div>` : ''}
          <div class="kk-foot">
            <div class="kk-price">${harga}<small>/bulan</small></div>
            ${kos.jumlah_booking ? `<div class="kk-sewa">${kos.jumlah_booking}x disewa</div>` : ''}
          </div>
        </div>
      </div>`;
  };

  // ---------- Kerangka memuat ----------
  function skeleton(n) {
    return Array.from({ length: n }, () => '<div class="kk-skel"><i></i><b></b><b></b><b></b></div>').join('');
  }

  // ---------- Filter: lembar bawah ----------
  function setupFilterSheet() {
    const wrap = document.getElementById('filterPanel');
    if (!wrap || wrap.dataset.kkReady) return;
    const panel = wrap.querySelector('.filter-panel');
    if (!panel) return;
    wrap.dataset.kkReady = '1';

    const head = document.createElement('div');
    head.innerHTML =
      '<div class="kk-grab"></div>' +
      '<div class="kk-sheet-head"><b>Filter</b><div class="kk-x" id="kkSheetClose">✕</div></div>';
    panel.insertBefore(head, panel.firstChild);
    head.querySelector('#kkSheetClose').addEventListener('click', () => toggleFilter());
    wrap.addEventListener('click', e => { if (e.target === wrap) toggleFilter(); });

    // Placeholder harga yang lebih jelas + pilihan cepat
    const min = document.getElementById('filterHargaMin');
    const max = document.getElementById('filterHargaMax');
    if (min) min.placeholder = 'Harga minimum';
    if (max) max.placeholder = 'Harga maksimum';
    const range = panel.querySelector('.price-range');
    if (range && min && max) {
      const quick = document.createElement('div');
      quick.className = 'kk-quick';
      const PILIHAN = [['Di bawah 500rb', 0, 500000], ['500rb – 1jt', 500000, 1000000], ['1jt – 2jt', 1000000, 2000000], ['Di atas 2jt', 2000000, 0]];
      quick.innerHTML = PILIHAN.map((p, i) => `<div class="fasil-chip" data-i="${i}">${p[0]}</div>`).join('');
      range.insertAdjacentElement('afterend', quick);
      quick.addEventListener('click', e => {
        const c = e.target.closest('.fasil-chip');
        if (!c) return;
        const aktif = c.classList.contains('active');
        quick.querySelectorAll('.fasil-chip').forEach(x => x.classList.remove('active'));
        if (aktif) { min.value = ''; max.value = ''; return; }
        const p = PILIHAN[Number(c.dataset.i)];
        c.classList.add('active');
        min.value = p[1] || '';
        max.value = p[2] || '';
      });
    }
  }

  function updateFilterBadge() {
    const icon = document.querySelector('#screen-search .search-box > span:last-child');
    if (!icon) return;
    let n = 0;
    try {
      if (filterHargaMin > 0 || filterHargaMax > 0) n += 1;
      n += (filterFasilitas || []).length;
    } catch (e) { /* abaikan */ }
    icon.setAttribute('data-count', String(n));
  }

  ['applyFilter', 'resetAllFilter'].forEach(nama => {
    const asli = window[nama];
    if (typeof asli !== 'function') return;
    window[nama] = function () {
      const r = asli.apply(this, arguments);
      updateFilterBadge();
      if (nama === 'resetAllFilter') {
        document.querySelectorAll('#filterPanel .kk-quick .fasil-chip').forEach(x => x.classList.remove('active'));
      }
      return r;
    };
  });

  // ---------- Halaman Pesan ----------
  function waktuChat(iso) {
    const t = new Date(iso);
    if (isNaN(t)) return '';
    const now = new Date();
    const hari = d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const selisih = Math.round((hari(now) - hari(t)) / 86400000);
    if (selisih <= 0) return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    if (selisih === 1) return 'Kemarin';
    if (selisih < 7) return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][t.getDay()];
    return `${String(t.getDate()).padStart(2, '0')}/${String(t.getMonth() + 1).padStart(2, '0')}/${String(t.getFullYear()).slice(2)}`;
  }

  function setupChatHeader() {
    const top = document.querySelector('#screen-chat-list .top-bar');
    if (top && !document.getElementById('clSub')) {
      const sub = document.createElement('div');
      sub.id = 'clSub'; sub.className = 'cl-sub'; sub.textContent = 'Percakapan dengan pemilik dan penyewa';
      top.appendChild(sub);
    }
    const cont = document.getElementById('chatListContainer');
    if (cont && !document.getElementById('clSearch')) {
      const box = document.createElement('div');
      box.className = 'cl-search'; box.id = 'clSearchWrap';
      box.innerHTML = SVG_SEARCH + '<input id="clSearch" placeholder="Cari percakapan...">';
      cont.parentNode.insertBefore(box, cont);
      box.querySelector('input').addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();
        document.querySelectorAll('#chatListContainer .cl-item').forEach(el => {
          el.style.display = (!q || (el.dataset.q || '').includes(q)) ? '' : 'none';
        });
      });
    }
  }

  function setSub(text) { const s = document.getElementById('clSub'); if (s) s.textContent = text; }

  function chatKosong(container) {
    const pemilik = typeof currentUserProfile !== 'undefined' && currentUserProfile && currentUserProfile.role === 'pemilik';
    container.innerHTML = `
      <div class="cl-empty">
        <div class="ic">${SVG_CHAT}</div>
        <h3>Belum ada percakapan</h3>
        <p>${pemilik ? 'Pesan dari calon penyewa akan muncul di sini.' : 'Tanya langsung ke pemilik kos soal harga, fasilitas, atau jadwal survei.'}</p>
        ${pemilik ? '' : '<button onclick="showSearch()">Cari Kos</button>'}
      </div>`;
    setSub('Belum ada pesan');
  }

  window.loadChatList = async function () {
    if (typeof currentUser === 'undefined' || !currentUser) return;
    const container = document.getElementById('chatListContainer');
    if (!container) return;
    setupChatHeader();
    if (!container.querySelector('.cl-item')) {
      container.innerHTML = '<div class="cl-wrap">' + Array.from({ length: 4 }, () =>
        '<div class="kk-skel" style="border-radius:18px;padding:16px;display:flex;gap:13px;align-items:center">' +
        '<i style="width:54px;height:54px;border-radius:17px;flex-shrink:0"></i>' +
        '<div style="flex:1"><b style="margin:0 0 10px;width:55%"></b><b style="margin:0;width:85%"></b></div></div>').join('') + '</div>';
    }

    try {
      const { data: messages, error } = await sbClient
        .from('chat_messages').select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!messages || !messages.length) { chatKosong(container); return; }

      const chatMap = {};
      messages.forEach(msg => {
        const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
        const key = `${msg.kos_id}::${partnerId}`;
        if (!chatMap[key]) chatMap[key] = { msg, partnerId, unread: 0 };
        if (!msg.is_read && msg.receiver_id === currentUser.id) chatMap[key].unread += 1;
      });

      const kosIds = [...new Set(Object.values(chatMap).map(c => c.msg.kos_id))].filter(Boolean);
      const kosMap = {};
      if (kosIds.length) {
        const { data: kosList } = await sbClient.from('kos').select('id, nama_kos, foto_urls').in('id', kosIds);
        (kosList || []).forEach(k => { kosMap[k.id] = k; });
      }

      const pemilik = currentUserProfile && currentUserProfile.role === 'pemilik';
      const partnerMap = {};
      if (pemilik) {
        const ids = [...new Set(Object.values(chatMap).map(c => c.partnerId))].filter(Boolean);
        if (ids.length) {
          const { data: ps } = await sbClient.from('profiles').select('id, nama_lengkap, foto_url').in('id', ids);
          (ps || []).forEach(p => { partnerMap[p.id] = p; });
        }
      }

      let totalUnread = 0;
      const html = Object.values(chatMap).map(({ msg, partnerId, unread }) => {
        const kos = kosMap[msg.kos_id] || {};
        const isSelf = msg.sender_id === currentUser.id;
        const partner = partnerMap[partnerId] || {};
        const judul = pemilik ? (partner.nama_lengkap || 'Calon penyewa') : (kos.nama_kos || 'Kos');
        const subJudul = pemilik ? (kos.nama_kos || '') : '';
        const foto = pemilik ? partner.foto_url : (kos.foto_urls && kos.foto_urls[0]);
        const avatar = foto
          ? `<img src="${esc(foto)}" alt="">`
          : (pemilik ? esc((judul || '?').trim().charAt(0).toUpperCase()) : SVG_HOME);
        const preview = (isSelf ? 'Anda: ' : '') + (msg.pesan || '');
        totalUnread += unread;
        return `
          <div class="cl-item${unread ? ' unread' : ''}" data-q="${esc((judul + ' ' + subJudul + ' ' + preview).toLowerCase())}"
               onclick="openChatFromList('${esc(msg.kos_id)}','${esc(partnerId || '')}')">
            <div class="cl-av">${avatar}</div>
            <div class="cl-main">
              <div class="cl-row"><div class="cl-name">${esc(judul)}</div><div class="cl-time">${waktuChat(msg.created_at)}</div></div>
              ${subJudul ? `<div class="cl-kos">${esc(subJudul)}</div>` : ''}
              <div class="cl-row"><div class="cl-prev">${esc(preview)}</div>${unread ? `<div class="cl-badge">${unread > 99 ? '99+' : unread}</div>` : ''}</div>
            </div>
          </div>`;
      }).join('');

      container.innerHTML = `<div class="cl-wrap">${html}</div>`;
      setSub(totalUnread ? `${totalUnread} pesan belum dibaca` : 'Semua pesan sudah dibaca');
      const q = document.getElementById('clSearch');
      if (q && q.value) q.dispatchEvent(new Event('input'));
    } catch (err) {
      console.error('Gagal load chat list:', err);
    }
  };

  // ---------- Mulai ----------
  function init() {
    injectStyle();
    setupFilterSheet();
    setupChatHeader();
    updateFilterBadge();
    const list = document.getElementById('searchResultsList');
    if (list && /Memuat/i.test(list.textContent)) list.innerHTML = skeleton(3);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
