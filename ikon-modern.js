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
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>'
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

  // Kalau halaman Akun sudah terbuka saat file ini dimuat
  modernizeMenu(document.getElementById('profilMenu'));
})();
