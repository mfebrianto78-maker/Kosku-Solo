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

    /* Menu bawah: menempel di dasar layar */
    .bottom-nav {
      position: fixed !important; left: 0; right: 0; bottom: 0; margin: 0 auto;
      width: 100%; max-width: 430px; z-index: 100;
      padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    }
    /* Sisakan ruang agar isi halaman tidak tertutup menu */
    .screen:has(> .bottom-nav) { padding-bottom: calc(82px + env(safe-area-inset-bottom, 0px)); }
  `;
  if (document.getElementById('koskuLayoutStabil')) return;
  const s = document.createElement('style');
  s.id = 'koskuLayoutStabil';
  s.textContent = css;
  document.head.appendChild(s);
})();
