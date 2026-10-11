// =====================================================
// KosKu Solo — Mode Gelap yang tersimpan
// Dimuat lewat: <script src="mode-gelap.js"></script>
// Pilihan Mode Gelap disimpan di HP, jadi tetap aktif
// walaupun aplikasi ditutup lalu dibuka lagi.
// =====================================================

(function () {
  const STORAGE_KEY = 'kosku_mode_gelap';

  const LIGHT = {
    '--bg': '#F7F8FA', '--bg-2': '#F3F4F6', '--card': '#FFFFFF',
    '--text': '#1A1A2E', '--text-2': '#555770', '--text-3': '#9395A5',
    '--border': '#ECEEF2', '--orange-light': '#FFF0E0'
  };
  const DARK = {
    '--bg': '#121212', '--bg-2': '#1A1A1A', '--card': '#1E1E1E',
    '--text': '#F2F2F2', '--text-2': '#C4C4CC', '--text-3': '#8E8E99',
    '--border': '#2E2E33', '--orange-light': '#3A2410'
  };

  // Banyak bagian aplikasi memakai latar putih langsung,
  // jadi saat mode gelap aktif, latar putih itu ditimpa.
  const css = `
    html.kosku-dark body { background:#000 !important; }
    html.kosku-dark #app { background:var(--bg) !important; color:var(--text); }

    /* Tombol kembali (←) dibuat jelas di semua halaman */
    html.kosku-dark .kosku-back {
      display:inline-flex !important; align-items:center; justify-content:center;
      width:40px !important; height:40px !important; border-radius:12px !important;
      background:#2A2A2F !important; border:1.5px solid #3A3A42 !important;
      color:#FFFFFF !important; font-size:20px !important; font-weight:700;
      flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,0.35) !important;
    }
    html.kosku-dark .kosku-back:active { background:var(--orange) !important; border-color:var(--orange) !important; }

    /* Latar halaman yang ditulis langsung dengan warna terang (mis. Beranda) */
    html.kosku-dark #screen-dashboard,
    html.kosku-dark #screen-admin-dashboard,
    html.kosku-dark [style*="background:#F7F8FA"], html.kosku-dark [style*="background:#f7f8fa"],
    html.kosku-dark [style*="background:#F4F5F7"], html.kosku-dark [style*="background:#f4f5f7"] {
      background: var(--bg) !important;
    }
    /* Label shortcut Lokasi Populer di Beranda */
    html.kosku-dark #dashShortcutWrap [style*="color:#5C3A00"] { color: var(--text-2) !important; }
    html.kosku-dark #dashShortcutWrap [style*="background:#FFF1E0"] {
      background: var(--orange-light) !important; border-color: #5A3A18 !important;
    }

    html.kosku-dark #screen-login, html.kosku-dark #screen-register,
    html.kosku-dark #screen-role, html.kosku-dark #screen-onboarding,
    html.kosku-dark #screen-detail, html.kosku-dark #screen-success,
    html.kosku-dark .top-bar, html.kosku-dark .bottom-nav,
    html.kosku-dark .search-header, html.kosku-dark .dash-header,
    html.kosku-dark .tambah-header, html.kosku-dark .keu-header,
    html.kosku-dark .booking-header, html.kosku-dark .payment-header,
    html.kosku-dark .maps-header, html.kosku-dark .chat-header,
    html.kosku-dark .chat-input-bar, html.kosku-dark .detail-actions,
    html.kosku-dark .tab-bar, html.kosku-dark .chat-list-item,
    html.kosku-dark .kos-card, html.kosku-dark .kos-list-card,
    html.kosku-dark .filter-panel, html.kosku-dark .profil-menu,
    html.kosku-dark .owner-menu-card, html.kosku-dark .booking-req-card,
    html.kosku-dark .kk-card, html.kosku-dark .form-card,
    html.kosku-dark .riwayat-card, html.kosku-dark .notif-item,
    html.kosku-dark .booking-form, html.kosku-dark .summary-card,
    html.kosku-dark .booking-kos-card, html.kosku-dark .payment-detail-card,
    html.kosku-dark .payment-method, html.kosku-dark .map-detail-card,
    html.kosku-dark .chart-card, html.kosku-dark .search-box,
    html.kosku-dark .role-card, html.kosku-dark .btn-google,
    html.kosku-dark .btn-secondary, html.kosku-dark .btn-chat,
    html.kosku-dark .cat-chip:not(.active), html.kosku-dark .filter-chip:not(.active),
    html.kosku-dark .fasil-chip:not(.active), html.kosku-dark .area-chip:not(.active),
    html.kosku-dark .jenis-btn:not(.active), html.kosku-dark .fav-btn,
    html.kosku-dark .detail-back,
    html.kosku-dark [style*="background:white"], html.kosku-dark [style*="background: white"],
    html.kosku-dark [style*="background:#fff"], html.kosku-dark [style*="background:#FFF"] {
      background: var(--card) !important;
    }

    html.kosku-dark .msg-bubble.received .bubble { background: var(--card) !important; color: var(--text) !important; }
    html.kosku-dark input, html.kosku-dark textarea, html.kosku-dark select {
      color: var(--text) !important; background-color: var(--bg) !important; border-color: var(--border) !important;
    }
    html.kosku-dark input::placeholder, html.kosku-dark textarea::placeholder { color: var(--text-3) !important; }
    html.kosku-dark .kos-name, html.kosku-dark .kos-list-name, html.kosku-dark .kk-name,
    html.kosku-dark .detail-name, html.kosku-dark .section-title, html.kosku-dark .menu-item-label,
    html.kosku-dark .owner-menu-label, html.kosku-dark .req-name, html.kosku-dark .chat-name,
    html.kosku-dark h2, html.kosku-dark h3, html.kosku-dark h4 { color: var(--text); }
    html.kosku-dark .menu-item.danger .menu-item-label { color: var(--red); }
  `;

  function injectStyle() {
    if (document.getElementById('koskuDarkStyle')) return;
    const style = document.createElement('style');
    style.id = 'koskuDarkStyle';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function readSaved() {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
  }
  function save(on) {
    try { localStorage.setItem(STORAGE_KEY, on ? '1' : '0'); } catch (e) { /* abaikan */ }
  }

  function updateToggleUI(on) {
    const toggle = document.getElementById('darkModeToggle');
    const knob = document.getElementById('darkModeKnob');
    const label = document.getElementById('darkModeLabel');
    if (toggle) toggle.style.background = on ? 'var(--orange)' : 'var(--border)';
    if (knob) {
      knob.style.left = on ? 'auto' : '2px';
      knob.style.right = on ? '2px' : 'auto';
    }
    if (label) label.textContent = on ? 'Aktif' : 'Nonaktif';
  }

  function applyDarkMode(on) {
    const root = document.documentElement;
    const vars = on ? DARK : LIGHT;
    Object.keys(vars).forEach(k => root.style.setProperty(k, vars[k]));
    root.classList.toggle('kosku-dark', on);
    // Variabel bawaan aplikasi ikut disamakan
    try { darkMode = on; } catch (e) { /* abaikan */ }
    updateToggleUI(on);
  }

  // Ganti fungsi tombol Mode Gelap di Pengaturan
  window.toggleDarkMode = function () {
    const next = !document.documentElement.classList.contains('kosku-dark');
    applyDarkMode(next);
    save(next);
  };

  // ---------- Tandai semua tombol kembali (←) ----------
  // Termasuk halaman yang dibuat belakangan (Kelola Kamar, Detail Kos, dll.)
  function tagBackButtons() {
    document.querySelectorAll('#app span, #app div, .back-btn, .detail-back').forEach(el => {
      if (el.classList.contains('kosku-back')) return;
      if (el.children.length) return;
      const t = (el.textContent || '').trim();
      if (t === '←' && (el.onclick || el.getAttribute('onclick') || el.classList.contains('back-btn') || el.classList.contains('detail-back'))) {
        el.classList.add('kosku-back');
      }
    });
  }

  let tagTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(tagTimer);
    tagTimer = setTimeout(tagBackButtons, 150);
  });
  const appEl = document.getElementById('app');
  if (appEl) observer.observe(appEl, { childList: true, subtree: true });

  injectStyle();
  tagBackButtons();
  applyDarkMode(readSaved());
})();
