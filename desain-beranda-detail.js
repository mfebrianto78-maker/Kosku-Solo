// =====================================================
// KosKu Solo — Desain ulang Beranda & Detail Kos (Putaran 1, bagian B)
// Dimuat lewat: <script src="desain-beranda-detail.js"></script>
// Harus dimuat SETELAH desain-pencari.js (memakai kartu kos barunya).
// =====================================================

(function () {
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const css = `
    /* ================= BERANDA ================= */
    #screen-dashboard > div:first-child { border-radius: 0 0 28px 28px; padding-bottom: 24px !important; }
    #screen-dashboard .kk-sec { background: transparent !important; border: none !important; margin: 0 !important; padding: 18px 18px 4px !important; }
    #screen-dashboard .kk-sec-title { font-size: 16px !important; font-weight: 800 !important; color: var(--text) !important; letter-spacing: 0 !important; margin-bottom: 12px !important; text-transform: none; }
    #screen-dashboard .kk-chips { background: transparent !important; margin: 0 !important; padding: 14px 18px 4px !important; }
    #screen-dashboard .category-scroll { margin-bottom: 0; padding-bottom: 4px; }
    #screen-dashboard .cat-chip { padding: 9px 16px; font-size: 12.5px; background: var(--card); }
    #screen-dashboard .cat-chip.active { box-shadow: 0 4px 12px rgba(255,122,0,0.35); }
    #screen-dashboard .banner-carousel { box-shadow: 0 6px 18px rgba(20,20,40,0.12); }

    /* Rekomendasi: geser ke samping */
    #dashboardKosGrid {
      flex-direction: row !important; overflow-x: auto; gap: 14px; scroll-snap-type: x proximity; scroll-padding-left: 18px; touch-action: pan-x pan-y; overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch; padding-bottom: 12px !important;
    }
    #dashboardKosGrid::-webkit-scrollbar { display: none; }
    #dashboardKosGrid .kk-card2 { flex: 0 0 80%; scroll-snap-align: start; margin-bottom: 0; }
    #dashboardKosGrid .kk-card2 .kk-photo { height: 150px; }
    #dashboardKosGrid > div:not(.kk-card2):not(.kk-skel) { flex: 0 0 100%; }
    #dashboardKosGrid .kk-skel { flex: 0 0 80%; margin-bottom: 0; }

    /* ================= DETAIL KOS ================= */
    #screen-detail .detail-header { border-radius: 0 0 28px 28px; overflow: hidden; }
    #screen-detail .detail-photos { height: 300px; border-radius: 0; }
    #screen-detail .detail-back {
      background: rgba(255,255,255,0.92); backdrop-filter: blur(6px); border-radius: 14px;
      width: 42px; height: 42px; box-shadow: 0 4px 14px rgba(0,0,0,0.2); color: #1A1A2E;
    }
    #screen-detail .photo-count { background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
    #screen-detail .kk-dfav { position: absolute !important; top: 52px; right: 16px; z-index: 10; width: 42px; height: 42px; border-radius: 14px; font-size: 18px; }
    #screen-detail .kk-dots {
      position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 10;
      display: flex; gap: 6px;
    }
    #screen-detail .kk-dots i { width: 7px; height: 7px; border-radius: 4px; background: rgba(255,255,255,0.55); transition: all .25s; }
    #screen-detail .kk-dots i.on { width: 20px; background: #fff; }
    #screen-detail .detail-body { padding: 20px 20px 4px; }
    #screen-detail .detail-name { font-size: 23px; line-height: 1.25; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    #screen-detail .detail-meta { justify-content: space-between; margin: 4px 0 16px; }
    #screen-detail .detail-price { font-size: 26px; }
    #screen-detail .detail-rating { background: var(--bg-2); padding: 8px 12px; border-radius: 12px; }
    #screen-detail .detail-owner { background: var(--bg-2); border-radius: 18px; padding: 14px 16px; }
    #screen-detail .owner-avatar { border-radius: 16px; font-size: 20px; font-weight: 800; }
    #screen-detail .section-divider { height: 1px; background: var(--border); margin: 8px 20px 20px; }
    #screen-detail .detail-section-title { font-size: 17px; margin-bottom: 14px; }
    .kk-fgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
    .kk-fitem {
      display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 14px;
      background: var(--bg-2); color: var(--text); font-size: 13px; font-weight: 600; min-width: 0;
    }
    .kk-fitem svg { flex-shrink: 0; color: var(--orange); }
    .kk-fitem span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .kk-desc { font-size: 14px; color: var(--text-2); line-height: 1.8; }
    .kk-desc.clamp { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
    .kk-more { color: var(--orange); font-weight: 700; font-size: 13.5px; margin: 6px 0 16px; cursor: pointer; display: inline-block; }
    #screen-detail .rule-item { background: var(--bg-2); padding: 11px 14px; border-radius: 12px; }

    #screen-detail .detail-actions { padding: 12px 16px 22px; gap: 12px; align-items: center; box-shadow: 0 -6px 20px rgba(20,20,40,0.07); border-top: none; }
    #screen-detail .kk-chatbtn { flex: 0 0 52px !important; width: 52px; height: 52px; padding: 0 !important; border-radius: 16px; }
    #screen-detail .kk-bar-price { display: flex; flex-direction: column; line-height: 1.15; flex-shrink: 0; }
    #screen-detail .kk-bar-price small { font-size: 11px; color: var(--text-3); font-weight: 500; }
    #screen-detail .kk-bar-price b { font-size: 16px; font-weight: 800; color: var(--text); }
    #screen-detail .detail-actions .btn-booking { flex: 1 !important; height: 52px; padding: 0 12px; border-radius: 16px; box-shadow: 0 6px 16px rgba(255,122,0,0.35); }
  `;

  function injectStyle() {
    if (document.getElementById('koskuDesainBeranda')) return;
    const s = document.createElement('style');
    s.id = 'koskuDesainBeranda';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- Ikon fasilitas ----------
  const IC = {
    wifi: '<path d="M2 9a14 14 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.2" r=".9" fill="currentColor"/>',
    ac: '<path d="M12 2v20"/><path d="M4.5 6.5l15 11"/><path d="M19.5 6.5l-15 11"/>',
    km: '<path d="M4 13h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M7 13V6a3 3 0 0 1 5.5-1.7"/>',
    laundry: '<rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="12" cy="13" r="4"/><path d="M8 6.5h.01M11 6.5h.01"/>',
    parkir: '<path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16"/><rect x="3" y="16" width="18" height="4" rx="1.5"/><path d="M7 20v1.5M17 20v1.5"/>',
    dapur: '<path d="M6 3v7a2 2 0 0 0 2 2v9"/><path d="M10 3v7"/><path d="M17 3c-2 2-3 4.5-3 7h3v11"/>',
    cctv: '<path d="M3 9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m16 11 5-3v8l-5-3"/>',
    kasur: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 14h18"/><path d="M3 18v2M21 18v2"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'
  };
  function icon(name) {
    const n = String(name).toLowerCase();
    let k = 'ok';
    if (/wifi|wi-fi|internet/.test(n)) k = 'wifi';
    else if (/\bac\b|pendingin|kipas/.test(n)) k = 'ac';
    else if (/km|mandi|kamar mandi|toilet/.test(n)) k = 'km';
    else if (/laundry|cuci/.test(n)) k = 'laundry';
    else if (/parkir/.test(n)) k = 'parkir';
    else if (/dapur|masak/.test(n)) k = 'dapur';
    else if (/cctv|kamera|keamanan/.test(n)) k = 'cctv';
    else if (/kasur|bed|tempat tidur/.test(n)) k = 'kasur';
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
  }

  // =====================================================
  // BERANDA
  // =====================================================
  function sapaan() {
    const h = new Date().getHours();
    return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
  }

  function percantikBeranda() {
    const nama = document.getElementById('dashGreetName');
    if (nama && nama.previousElementSibling) nama.previousElementSibling.textContent = sapaan();

    const shortcutWrap = document.getElementById('dashShortcutWrap');
    if (shortcutWrap && shortcutWrap.parentElement) {
      const sec = shortcutWrap.parentElement;
      sec.classList.add('kk-sec');
      const t = sec.firstElementChild;
      if (t && t !== shortcutWrap) { t.classList.add('kk-sec-title'); t.textContent = 'Lokasi Populer'; }
    }
    const chips = document.querySelector('#screen-dashboard .category-scroll');
    if (chips && chips.parentElement) chips.parentElement.classList.add('kk-chips');
  }

  function skeletonH(n) {
    return Array.from({ length: n }, () => '<div class="kk-skel"><i style="height:150px"></i><b></b><b></b><b></b></div>').join('');
  }

  // Kartu Beranda memakai kartu foto besar yang sama dengan halaman Cari
  if (typeof window.renderKosListCard === 'function') {
    window.renderKosCard = function (kos) { return window.renderKosListCard(kos); };
  }

  function segarkanRekomendasi() {
    const grid = document.getElementById('dashboardKosGrid');
    if (!grid) return;
    try {
      if (allKosData && allKosData.length && grid.querySelector('.kos-card')) {
        grid.innerHTML = allKosData.slice(0, 4).map(renderKosCard).join('');
      } else if (/Memuat/i.test(grid.textContent) && !(allKosData && allKosData.length)) {
        grid.innerHTML = skeletonH(2);
      }
    } catch (e) { /* abaikan */ }
  }

  const asliDash = window.showDashboard;
  if (typeof asliDash === 'function') {
    window.showDashboard = function () {
      const r = asliDash.apply(this, arguments);
      try { percantikBeranda(); } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // =====================================================
  // DETAIL KOS
  // =====================================================
  let fotoNow = 0;

  function goFoto(n) {
    const imgs = document.querySelectorAll('#detailPhotoSlider img[data-idx]');
    if (!imgs.length) return;
    fotoNow = (n + imgs.length) % imgs.length;
    imgs.forEach((im, i) => { im.style.opacity = i === fotoNow ? '1' : '0'; });
    try { detailPhotoIndex = fotoNow; } catch (e) { /* abaikan */ }
    const c = document.getElementById('detailPhotoCount');
    if (c) c.textContent = fotoNow + 1;
    document.querySelectorAll('#screen-detail .kk-dots i').forEach((d, i) => d.classList.toggle('on', i === fotoNow));
  }
  window.nextDetailPhoto = function () { goFoto(fotoNow + 1); };

  function percantikFoto(kos) {
    fotoNow = 0;
    try { detailPhotoIndex = 0; } catch (e) { /* abaikan */ }
    const photos = document.querySelector('#screen-detail .detail-photos');
    if (!photos) return;
    photos.querySelectorAll('.kk-dfav, .kk-dots').forEach(e => e.remove());

    // Tombol favorit
    const fav = document.createElement('div');
    fav.className = 'fav-btn kk-dfav';
    let on = false;
    try { on = favoritKosIds.has(kos.id); } catch (e) { /* abaikan */ }
    fav.textContent = on ? '❤️' : '🤍';
    fav.addEventListener('click', ev => {
      ev.stopPropagation();
      try { toggleFavorite(kos.id, ev, fav); } catch (e) { /* abaikan */ }
    });
    photos.appendChild(fav);

    // Titik penanda + geser foto
    const n = (kos.foto_urls || []).length;
    if (n > 1) {
      const dots = document.createElement('div');
      dots.className = 'kk-dots';
      dots.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('');
      photos.appendChild(dots);

      let x0 = null;
      photos.ontouchstart = e => { x0 = e.touches[0].clientX; };
      photos.ontouchend = e => {
        if (x0 == null) return;
        const dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 40) goFoto(fotoNow + (dx < 0 ? 1 : -1));
      };
    } else {
      photos.ontouchstart = null; photos.ontouchend = null;
    }
  }

  const TAG = { Putri: ['#FCE7F3', '#BE185D'], Putra: ['#DBEAFE', '#1D4ED8'], Campur: ['#EDE9FE', '#6D28D9'], Eksklusif: ['#FEF3C7', '#B45309'] };

  function percantikInfo(kos) {
    // Rating
    const rv = document.querySelector('#screen-detail .rating-val');
    const rc = document.querySelector('#screen-detail .rating-count');
    if (rv && rc) {
      const r = Number(kos.rating) || 0;
      rv.textContent = r ? r.toFixed(1) : 'Baru';
      rc.textContent = r ? `(${kos.jumlah_review || 0} ulasan)` : '';
    }

    // Label jenis + kamar kosong (sebelumnya teks tetap, sekarang dari data asli)
    const body = document.querySelector('#screen-detail .detail-body');
    const row = body && body.querySelector('div[style*="gap:8px"][style*="margin-bottom:16px"]');
    if (row) {
      const c = TAG[kos.jenis_kos] || ['#FFF0E0', '#FF7A00'];
      row.innerHTML =
        `<div class="fasil-tag" id="kkKamarTag" style="background:var(--bg-2);color:var(--text-3)">Memeriksa kamar...</div>` +
        `<div class="fasil-tag" style="background:${c[0]};color:${c[1]}">${esc(kos.jenis_kos)}</div>`;
      (async () => {
        try {
          const { count, error } = await sbClient.from('kamar')
            .select('id', { count: 'exact', head: true })
            .eq('kos_id', kos.id).eq('status', 'kosong');
          if (error) throw error;
          if (!selectedKos || selectedKos.id !== kos.id) return;
          const tag = document.getElementById('kkKamarTag');
          if (!tag) return;
          if (count > 0) { tag.style.background = '#DCFCE7'; tag.style.color = '#15803D'; tag.textContent = `${count} kamar kosong`; }
          else { tag.style.background = '#FEE2E2'; tag.style.color = '#B91C1C'; tag.textContent = 'Kamar penuh'; }
        } catch (e) {
          const tag = document.getElementById('kkKamarTag');
          if (tag) tag.remove();
        }
      })();
    }

    // Avatar pemilik: inisial bila belum ada foto
    const av = document.getElementById('detailOwnerAvatar');
    if (av && !kos.owner_foto) {
      av.textContent = (kos.owner_nama || 'P').trim().charAt(0).toUpperCase();
      av.style.background = 'var(--orange)';
    }
  }

  function percantikFasilitas(kos) {
    const grid = document.querySelector('#screen-detail .fasil-grid');
    if (!grid) return;
    const list = kos.fasilitas || [];
    grid.className = 'kk-fgrid';
    grid.innerHTML = list.length
      ? list.map(f => `<div class="kk-fitem">${icon(f)}<span>${esc(f)}</span></div>`).join('')
      : '<div style="font-size:13px;color:var(--text-3)">Pemilik belum mengisi fasilitas.</div>';
  }

  function percantikDeskripsi(kos) {
    const el = document.getElementById('kkDescWrap') ||
      document.querySelector('#screen-detail .detail-body div[style*="line-height:1.8"]');
    if (!el) return;
    el.id = 'kkDescWrap';
    const teks = kos.deskripsi || 'Belum ada deskripsi.';
    const panjang = teks.length > 170;
    el.removeAttribute('style');
    el.innerHTML = `<div class="kk-desc${panjang ? ' clamp' : ''}" id="kkDesc">${esc(teks)}</div>` +
      (panjang ? '<span class="kk-more" id="kkMore">Selengkapnya</span>' : '<div style="height:12px"></div>');
    const more = document.getElementById('kkMore');
    if (more) more.onclick = () => {
      const d = document.getElementById('kkDesc');
      const buka = d.classList.toggle('clamp');
      more.textContent = buka ? 'Selengkapnya' : 'Lebih sedikit';
    };
  }

  function percantikBar(kos) {
    const bar = document.querySelector('#screen-detail .detail-actions');
    if (!bar) return;
    let harga = kos.harga_per_bulan;
    try { harga = formatRupiah(kos.harga_per_bulan); } catch (e) { /* abaikan */ }
    bar.innerHTML =
      '<button class="btn-chat kk-chatbtn" onclick="showChat()" aria-label="Chat pemilik">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.2-5.3A8.4 8.4 0 1 1 21 11.5z"/></svg></button>' +
      `<div class="kk-bar-price"><small>Mulai dari</small><b>${harga}</b><small>per bulan</small></div>` +
      '<button class="btn-booking" onclick="showBookingConfirmModal()">Booking Sekarang</button>';
  }

  const asliDetail = window.renderDetailScreen;
  if (typeof asliDetail === 'function') {
    window.renderDetailScreen = function (kos) {
      const r = asliDetail.apply(this, arguments);
      try {
        percantikFoto(kos);
        percantikInfo(kos);
        percantikFasilitas(kos);
        percantikDeskripsi(kos);
        percantikBar(kos);
      } catch (e) { console.warn('desain-detail:', e); }
      return r;
    };
  }

  // ---------- Mulai ----------
  function init() {
    injectStyle();
    percantikBeranda();
    segarkanRekomendasi();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
