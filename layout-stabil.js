// =====================================================
// KosKu Solo — Navigasi bawah tidak ikut bergerak saat halaman di-scroll
// Dimuat lewat: <script src="layout-stabil.js"></script>
//
// Penyebab sebelumnya:
//  - Menu bawah memakai "sticky" di dalam area yang di-scroll, sehingga di HP
//    terlihat bergetar naik turun saat scroll.
//  - Dokumen browser sendiri masih bisa ikut tergeser/memantul.
// Perbaikan:
//  - Menu bawah dikunci (fixed) di dasar layar.
//  - Dokumen dikunci setinggi layar; hanya isi halaman yang bisa di-scroll.
//  - Scroll tidak "menembus" ke lapisan di bawahnya (tidak ada pantulan).
// =====================================================

(function () {
  const css = `
    html, body { height: 100%; overflow: hidden; overscroll-behavior: none; }
    body { min-height: 0; height: 100vh; height: 100dvh; }
    #app { min-height: 0; height: 100vh; height: 100dvh; }
    .screen { overscroll-behavior: contain; }

    /* Menu bawah: kartu melayang berbingkai di dasar layar */
    .bottom-nav {
      position: fixed !important; left: 0; right: 0;
      bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      margin: 0 auto; z-index: 100;
      width: calc(100% - 28px); max-width: 402px;
      padding: 6px; gap: 2px;
      background: var(--card, #fff) !important;
      border: 1px solid var(--border, #EEE) !important;
      border-radius: 24px;
      box-shadow: 0 10px 30px rgba(20,20,40,0.16), 0 2px 6px rgba(20,20,40,0.06);
    }
    .bottom-nav .nav-item {
      padding: 7px 0 6px; gap: 3px; border-radius: 18px;
      transition: background .2s;
    }
    .bottom-nav .nav-item.active { background: var(--orange-light, #FFF0E0); }
    .bottom-nav .nav-item.active .nav-label { font-weight: 800; }
    html.kosku-dark .bottom-nav .nav-item.active { background: rgba(255,122,0,0.16); }
    html.kosku-dark .bottom-nav { box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    /* Sisakan ruang agar isi halaman tidak tertutup menu */
    .screen:has(> .bottom-nav) { padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px)); }
  `;
  if (document.getElementById('koskuLayoutStabil')) return;
  const s = document.createElement('style');
  s.id = 'koskuLayoutStabil';
  s.textContent = css;
  document.head.appendChild(s);
})();
