// =====================================================
// KosKu Solo — Ikon modern & seragam
// Dimuat lewat: <script src="ikon-modern.js"></script>
// Mengganti ikon emoji (👤 ❤️ 📋 🏠 💰 ⭐ 🔔 🌐 🌙 ✏️ 📷)
// dengan ikon garis yang sama gayanya dengan ikon menu bawah.
// =====================================================

(function () {
  const P = {
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    clipboardCheck: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>',
    bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.2-5.3A8.4 8.4 0 1 1 21 11.5z"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
  };

  function svg(name, size, strokeWidth) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${P[name] || ''}</svg>`;
  }

  // Label menu → nama ikon
  const MENU_ICON = {
    'Profil Saya': 'user',
    'Favorit Saya': 'heart',
    'Riwayat Sewa': 'clipboard',
    'Pembayaran': 'card',
    'Pengaturan': 'settings',
    'Notifikasi': 'bell',
    'Bantuan & FAQ': 'help',
    'Keluar': 'logout',
    'Kelola Kos': 'home',
    'Kelola Kamar': 'bed',
    'Booking Masuk': 'clipboardCheck',
    'Laporan Keuangan': 'wallet',
    'Bahasa': 'globe',
    'Mode Gelap': 'moon'
  };

  const OWNER_GRID_ICON = {
    'Kelola Kos': 'home',
    'Kelola Kamar': 'bed',
    'Booking Masuk': 'clipboardCheck',
    'Chat Penyewa': 'chat',
    'Keuangan': 'wallet',
    'Review': 'star'
  };

  function styleBadge(el, danger) {
    el.style.cssText =
      'width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;' +
      (danger
        ? 'background:rgba(239,68,68,0.12);color:var(--red);'
        : 'background:var(--orange-light);color:var(--orange);');
  }

  // ---------- 1. Menu di halaman Akun (pencari & pemilik) ----------
  function modernizeMenu(container) {
    if (!container) return;
    container.querySelectorAll('.menu-item').forEach(item => {
      const labelEl = item.querySelector('.menu-item-label');
      if (!labelEl) return;
      const name = MENU_ICON[labelEl.textContent.trim()];
      if (!name) return;
      const badge = item.querySelector('.menu-item-icon-badge, .menu-item-icon');
      if (!badge) return;
      badge.className = 'menu-item-icon-badge';
      badge.innerHTML = svg(name, 19);
      styleBadge(badge, item.classList.contains('danger'));
    });
  }

  const originalRenderProfilMenu = window.renderProfilMenu;
  if (typeof originalRenderProfilMenu === 'function') {
    window.renderProfilMenu = function () {
      originalRenderProfilMenu.apply(this, arguments);
      modernizeMenu(document.getElementById('profilMenu'));
    };
  }

  // ---------- 2. Menu di halaman Pengaturan ----------
  modernizeMenu(document.getElementById('screen-pengaturan'));

  // ---------- 3. Kartu menu di dashboard pemilik ----------
  document.querySelectorAll('#screen-owner .owner-menu-card').forEach(card => {
    const labelEl = card.querySelector('.owner-menu-label');
    const iconEl = card.querySelector('.owner-menu-icon');
    if (!labelEl || !iconEl) return;
    const name = OWNER_GRID_ICON[labelEl.textContent.trim()];
    if (!name) return;
    iconEl.innerHTML = svg(name, 26);
    iconEl.style.cssText =
      'width:54px;height:54px;border-radius:16px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;background:var(--orange-light);color:var(--orange);font-size:0';
  });

  // ---------- 4. Lonceng notifikasi di dashboard pemilik ----------
  const ownerBell = document.querySelector('#screen-owner .dash-icon-btn');
  if (ownerBell) {
    Array.from(ownerBell.childNodes).forEach(n => {
      if (n.nodeType === 3 && n.textContent.includes('🔔')) n.remove();
    });
    if (!ownerBell.querySelector('svg')) {
      const wrap = document.createElement('span');
      wrap.style.cssText = 'color:white;display:flex';
      wrap.innerHTML = svg('bell', 19);
      ownerBell.insertBefore(wrap, ownerBell.firstChild);
    }
  }

  // ---------- 5. Tombol kamera & Edit Profil di header Akun ----------
  const camBtn = document.querySelector('#screen-profil [onclick*="avatarInput"]');
  if (camBtn) {
    camBtn.innerHTML = svg('camera', 13, 2.2);
    camBtn.style.color = 'white';
  }
  const editBtn = document.querySelector('#screen-profil .profil-edit-btn');
  if (editBtn) {
    editBtn.innerHTML = svg('pencil', 14, 2.2) + '<span>Edit Profil</span>';
  }

  // =====================================================
  // 6. Pisahkan halaman: Profil Saya, Edit Profil, Pengaturan
  //    (sebelumnya ketiganya membuka halaman yang sama)
  // =====================================================
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const pengScreen = document.getElementById('screen-pengaturan');
  const pengCards = pengScreen ? pengScreen.querySelectorAll('.form-card') : [];
  const editCard = pengCards[0] || null;      // Edit Profil
  const passCard = pengCards[1] || null;      // Ganti Password
  const toggleMenu = pengScreen ? pengScreen.querySelector('.profil-menu') : null; // Notifikasi/Bahasa/Mode Gelap
  const pengTitle = pengScreen ? pengScreen.querySelector('.top-bar h2') : null;

  // Judul kartu & tombol tanpa emoji
  function setCardTitle(card, icon, text) {
    const h3 = card && card.querySelector('h3');
    if (!h3) return;
    h3.style.cssText = 'display:flex;align-items:center;gap:10px';
    h3.innerHTML =
      `<span style="width:32px;height:32px;border-radius:10px;background:var(--orange-light);color:var(--orange);display:flex;align-items:center;justify-content:center">${svg(icon, 17)}</span>${text}`;
  }
  setCardTitle(editCard, 'user', 'Edit Profil');
  setCardTitle(passCard, 'lock', 'Ganti Password');

  const profilBtn = document.getElementById('settingProfilBtn');
  const passBtn = document.getElementById('settingPasswordBtn');
  if (profilBtn) profilBtn.textContent = 'Simpan Perubahan';
  if (passBtn) passBtn.textContent = 'Ganti Password';

  // Setelah simpan, aplikasi lama memasang emoji lagi — rapikan kembali
  const origUpdateProfil = window.handleUpdateProfil;
  if (typeof origUpdateProfil === 'function') {
    window.handleUpdateProfil = async function () {
      await origUpdateProfil.apply(this, arguments);
      if (profilBtn) profilBtn.textContent = 'Simpan Perubahan';
    };
  }
  const origUpdatePass = window.handleUpdatePassword;
  if (typeof origUpdatePass === 'function') {
    window.handleUpdatePassword = async function () {
      await origUpdatePass.apply(this, arguments);
      if (passBtn) passBtn.textContent = 'Ganti Password';
    };
  }

  const origShowPengaturan = window.showPengaturan;

  function setPengMode(mode) {
    const isEdit = mode === 'edit';
    if (pengTitle) pengTitle.textContent = isEdit ? 'Edit Profil' : 'Pengaturan';
    if (editCard) editCard.style.display = isEdit ? '' : 'none';
    if (passCard) passCard.style.display = isEdit ? 'none' : '';
    if (toggleMenu) toggleMenu.style.display = isEdit ? 'none' : '';
    const scroller = pengScreen && pengScreen.querySelector('div[style*="overflow-y:auto"]');
    if (scroller) scroller.scrollTop = 0;
  }

  function showEditProfil() {
    if (typeof origShowPengaturan === 'function') origShowPengaturan();
    setPengMode('edit');
  }
  function showPengaturanSaja() {
    if (typeof origShowPengaturan === 'function') origShowPengaturan();
    setPengMode('settings');
  }

  // Halaman baru: Profil Saya (tampilan data, bukan form)
  function buildProfilSaya() {
    if (document.getElementById('screen-profil-saya')) return;
    const s = document.createElement('div');
    s.id = 'screen-profil-saya';
    s.className = 'screen';
    s.style.background = 'var(--bg)';
    s.innerHTML = `
      <div class="top-bar" style="padding:52px 20px 14px;display:flex;align-items:center;gap:12px">
        <span style="font-size:20px;cursor:pointer" onclick="showProfil()">←</span>
        <h2 style="font-size:18px;font-weight:800">Profil Saya</h2>
      </div>
      <div style="flex:1;overflow-y:auto;padding:16px" id="profilSayaBody"></div>`;
    document.getElementById('app').appendChild(s);
  }

  function showProfilSaya() {
    buildProfilSaya();
    const p = currentUserProfile || {};
    const isPemilik = p.role === 'pemilik';
    const email = currentUser && currentUser.email && !currentUser.email.endsWith('@koskusolo.app') ? currentUser.email : '';
    const joined = currentUser && currentUser.created_at
      ? new Date(currentUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-';

    const row = (icon, label, value) => `
      <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid var(--border)">
        <div style="width:36px;height:36px;border-radius:11px;background:var(--orange-light);color:var(--orange);display:flex;align-items:center;justify-content:center;flex-shrink:0">${svg(icon, 17)}</div>
        <div style="min-width:0">
          <div style="font-size:11.5px;color:var(--text-3)">${label}</div>
          <div style="font-size:14.5px;font-weight:600;color:var(--text);word-break:break-word">${value || '-'}</div>
        </div>
      </div>`;

    const avatar = p.foto_url
      ? `<img src="${esc(p.foto_url)}" style="width:100%;height:100%;object-fit:cover">`
      : `<span style="color:var(--orange)">${svg('user', 40, 1.8)}</span>`;

    document.getElementById('profilSayaBody').innerHTML = `
      <div style="text-align:center;padding:10px 0 20px">
        <div style="width:96px;height:96px;border-radius:28px;overflow:hidden;margin:0 auto 12px;background:var(--orange-light);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow)">${avatar}</div>
        <div style="font-size:19px;font-weight:800;color:var(--text)">${esc(p.nama_lengkap || 'Pengguna')}</div>
        <div style="display:inline-block;margin-top:6px;font-size:12px;font-weight:700;padding:4px 12px;border-radius:50px;background:var(--orange-light);color:var(--orange)">${isPemilik ? 'Pemilik Kos' : 'Pencari Kos'}</div>
      </div>
      <div class="profil-menu" style="margin-bottom:16px">
        ${row('user', 'Nama Lengkap', esc(p.nama_lengkap))}
        ${row('mail', 'Email', esc(email))}
        ${row('phone', 'Nomor HP', esc(p.no_hp))}
        ${row('shield', 'Peran Akun', isPemilik ? 'Pemilik Kos' : 'Pencari Kos')}
        ${row('calendar', 'Bergabung Sejak', joined)}
      </div>
      <button class="btn-primary" id="profilSayaEditBtn" style="display:flex;align-items:center;justify-content:center;gap:8px">${svg('pencil', 16, 2.2)}Edit Profil</button>`;
    document.getElementById('profilSayaEditBtn').onclick = showEditProfil;
    show('profil-saya', 'profil');
  }

  window.showEditProfil = showEditProfil;
  window.showPengaturanSaja = showPengaturanSaja;
  window.showProfilSaya = showProfilSaya;

  // Sambungkan ulang tombol-tombolnya
  function rewireProfilButtons() {
    const menu = document.getElementById('profilMenu');
    if (menu) {
      menu.querySelectorAll('.menu-item').forEach(item => {
        const label = (item.querySelector('.menu-item-label') || {}).textContent;
        if (!label) return;
        const l = label.trim();
        if (l === 'Profil Saya') { item.removeAttribute('onclick'); item.onclick = showProfilSaya; }
        if (l === 'Pengaturan') { item.removeAttribute('onclick'); item.onclick = showPengaturanSaja; }
      });
    }
    const eb = document.querySelector('#screen-profil .profil-edit-btn');
    if (eb) { eb.removeAttribute('onclick'); eb.onclick = showEditProfil; }
  }

  // Ikon email & HP di header Akun
  function modernizeProfilHeader() {
    const el = document.getElementById('profilEmail');
    if (!el) return;
    const iconSpan = name =>
      `<span style="display:inline-flex;opacity:0.9;flex-shrink:0">${svg(name, 14, 2.2)}</span>`;
    el.innerHTML = el.innerHTML.replace('✉️', iconSpan('mail')).replace('📞', iconSpan('phone'));
  }

  const origRenderProfilHeader = window.renderProfilHeader;
  if (typeof origRenderProfilHeader === 'function') {
    window.renderProfilHeader = function () {
      origRenderProfilHeader.apply(this, arguments);
      modernizeProfilHeader();
    };
  }

  // renderProfilMenu sudah dibungkus di atas; tambahkan penyambungan ulang
  const wrappedRenderProfilMenu = window.renderProfilMenu;
  window.renderProfilMenu = function () {
    wrappedRenderProfilMenu.apply(this, arguments);
    rewireProfilButtons();
  };

  // Kalau halaman Akun sudah terbuka saat file ini dimuat
  modernizeMenu(document.getElementById('profilMenu'));
  rewireProfilButtons();
  modernizeProfilHeader();
})();


// =====================================================
// BAGIAN 2 — Ganti emoji tombol/judul di SEMUA halaman
// (pencari, pemilik, admin, termasuk jendela pop-up)
// Emoji yang diketik pengguna di chat & ulasan tidak diubah.
// =====================================================
(function () {
  const I = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>',
    bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.2-5.3A8.4 8.4 0 1 1 21 11.5z"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    trendDown: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    sliders: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>',
    map: '<path d="M14.1 6.3 9.9 4.2a2 2 0 0 0-1.8 0L3.6 6.5A1 1 0 0 0 3 7.4v12.2a1 1 0 0 0 1.4.9l4-2a2 2 0 0 1 1.8 0l4.2 2.1a2 2 0 0 0 1.8 0l4.4-2.2a1 1 0 0 0 .6-.9V5.3a1 1 0 0 0-1.4-.9l-4 2a2 2 0 0 1-1.8 0z"/><path d="M15 6.8v15M9 3.2v15"/>',
    smartphone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    grad: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    paperclip: '<path d="m21.4 11-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',
    bank: '<path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M16 13H8M16 17H8"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    wifi: '<path d="M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01"/>',
    snow: '<path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7z"/>',
    archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
    bike: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h2l3 11.5M5.5 17.5 9 10h6l-3.5 7.5"/>',
    utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'
  };

  // Warna khusus untuk ikon tertentu (selain itu mengikuti warna teks)
  const SPECIAL = {
    starFill: { icon: 'star', fill: '#FBBF24', stroke: '#FBBF24' },
    heartFill: { icon: 'heart', fill: '#EF4444', stroke: '#EF4444' },
    checkCircle: { icon: 'checkCircle', stroke: '#16A34A' },
    xCircle: { icon: 'xCircle', stroke: '#EF4444' },
    alert: { icon: 'alert', stroke: '#F59E0B' },
    pin: { icon: 'pin', stroke: 'var(--orange)' }
  };

  const EMOJI = {
    '🏠': 'home', '🏡': 'home', '🛏': 'bed', '🪑': 'bed', '🛋': 'home',
    '📋': 'clipboard', '👤': 'user', '👩': 'user', '🧑': 'user', '👥': 'users',
    '❤': 'heartFill', '🤍': 'heart', '💬': 'chat', '💰': 'wallet', '💸': 'trendDown',
    '⭐': 'starFill', '🔔': 'bell', '⚙': 'settings', '❓': 'help', '🌐': 'globe', '🌏': 'globe',
    '🌙': 'moon', '✏': 'pencil', '🗑': 'trash', '➕': 'plus', '🧾': 'receipt', '📒': 'book',
    '📚': 'book', '📍': 'pin', '✨': 'check', '✅': 'checkCircle', '❌': 'xCircle', '⚠': 'alert',
    '🔍': 'search', '🔧': 'sliders', '🗺': 'map', '🏘': 'map', '📱': 'smartphone', '🎓': 'grad',
    '📞': 'phone', '📎': 'paperclip', '🛡': 'shield', '🖼': 'image', '📊': 'chart',
    '📅': 'calendar', '🗓': 'calendar', '💳': 'card', '🏦': 'bank', '🔢': 'hash', '💵': 'cash',
    '📝': 'fileText', '📄': 'fileText', '🎉': 'sparkles', '🔑': 'key', '🔒': 'lock', '💾': 'save',
    '📷': 'camera', '📸': 'camera', '⏳': 'clock', '📡': 'wifi', '📶': 'wifi', '❄': 'snow',
    '🚿': 'droplet', '🗄': 'archive', '🍳': 'utensils', '🏍': 'bike', '📧': 'mail', '✉': 'mail',
    '🚪': 'logout', '⬇': 'download'
  };

  const keys = Object.keys(EMOJI).sort((a, b) => b.length - a.length)
    .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const RE = new RegExp('(' + keys.join('|') + ')\\uFE0F?', 'gu');
  const TEST = new RegExp('(' + keys.join('|') + ')', 'u');

  // Bagian yang TIDAK diubah: isi chat, ulasan, input, pilihan dropdown
  const SKIP = '.bubble, .chat-messages, #reviewListArea, textarea, input, select, option, script, style, svg, .kosku-noicon, .kosku-ic';

  function iconSpan(name) {
    const sp = SPECIAL[name];
    const key = sp ? sp.icon : name;
    const fill = sp && sp.fill ? sp.fill : 'none';
    const stroke = sp && sp.stroke ? sp.stroke : 'currentColor';
    const span = document.createElement('span');
    span.className = 'kosku-ic';
    span.innerHTML = `<svg viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[key] || ''}</svg>`;
    return span;
  }

  function processTextNode(node) {
    const text = node.nodeValue;
    if (!text || !TEST.test(text)) return;
    const parent = node.parentElement;
    if (!parent || parent.closest(SKIP)) return;

    const frag = document.createDocumentFragment();
    let last = 0;
    text.replace(RE, (match, base, offset) => {
      if (offset > last) frag.appendChild(document.createTextNode(text.slice(last, offset)));
      frag.appendChild(iconSpan(EMOJI[base]));
      last = offset + match.length;
      return match;
    });
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    parent.replaceChild(frag, node);
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === 3) { processTextNode(root); return; }
    if (root.nodeType !== 1 || root.closest && root.closest(SKIP)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(processTextNode);
  }

  // Gaya ikon
  const style = document.createElement('style');
  style.textContent = `
    .kosku-ic { display:inline-flex; width:1.05em; height:1.05em; vertical-align:-0.16em; flex-shrink:0; }
    .kosku-ic svg { width:100%; height:100%; display:block; }
    .onboard-img .kosku-ic, .success-icon .kosku-ic, .notif-icon .kosku-ic, .owner-menu-icon .kosku-ic { color:var(--orange); }
    .kos-card-img > .kosku-ic, .kos-list-img > .kosku-ic, .kk-img > .kosku-ic, .riwayat-img > .kosku-ic,
    .booking-kos-img > .kosku-ic, .detail-photos > .kosku-ic { color:rgba(255,255,255,0.95); }
    .owner-avatar .kosku-ic, .chat-avatar .kosku-ic, #screen-admin-login .kosku-ic { color:white; }
  `;
  document.head.appendChild(style);

  // Pindai sekarang + setiap ada bagian baru yang muncul
  scan(document.body);
  let queue = [];
  let scheduled = false;
  new MutationObserver(muts => {
    muts.forEach(m => {
      if (m.type === 'characterData') queue.push(m.target);
      m.addedNodes.forEach(n => queue.push(n));
    });
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        const q = queue; queue = []; scheduled = false;
        q.forEach(n => { if (n.isConnected) scan(n); });
      });
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
