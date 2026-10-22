// =====================================================
// KosKu Solo — Urutkan hasil pencarian
// Dimuat lewat: <script src="urutkan-hasil.js"></script>
// Menambah pilihan urutan di halaman Cari Kos:
// Terbaru, Termurah, Termahal, Rating tertinggi, Terpopuler.
// =====================================================

(function () {
  const KEY = 'kosku_urutan_cari';
  const OPTIONS = [
    ['terbaru', 'Terbaru'],
    ['termurah', 'Harga termurah'],
    ['termahal', 'Harga termahal'],
    ['rating', 'Rating tertinggi'],
    ['populer', 'Paling sering disewa']
  ];

  let urutan = 'terbaru';
  try { const s = localStorage.getItem(KEY); if (s && OPTIONS.some(o => o[0] === s)) urutan = s; } catch (e) { /* abaikan */ }

  const num = v => Number(v) || 0;
  const tgl = k => { const t = Date.parse(k.created_at); return isNaN(t) ? 0 : t; };

  function sortData(list) {
    const a = list.slice();
    switch (urutan) {
      case 'termurah': return a.sort((x, y) => num(x.harga_per_bulan) - num(y.harga_per_bulan));
      case 'termahal': return a.sort((x, y) => num(y.harga_per_bulan) - num(x.harga_per_bulan));
      case 'rating':   return a.sort((x, y) => num(y.rating) - num(x.rating) || num(y.jumlah_review) - num(x.jumlah_review));
      case 'populer':  return a.sort((x, y) => num(y.jumlah_booking) - num(x.jumlah_booking));
      default:         return a.sort((x, y) => tgl(y) - tgl(x));
    }
  }

  // Bungkus fungsi render bawaan: urutkan data dulu, lalu render seperti biasa
  const asli = window.renderFilteredKos;
  if (typeof asli !== 'function') { console.warn('urutkan-hasil: renderFilteredKos tidak ditemukan'); return; }

  window.renderFilteredKos = function () {
    let cadangan = null, bisa = false;
    try { cadangan = allKosData; allKosData = sortData(cadangan); bisa = true; } catch (e) { /* data tidak bisa diurutkan */ }
    try { return asli.apply(this, arguments); }
    finally { if (bisa) { try { allKosData = cadangan; } catch (e) { /* abaikan */ } } }
  };

  function buatBar() {
    if (document.getElementById('koskuSortBar')) return;
    const count = document.getElementById('resultsCount');
    if (!count || !count.parentNode) return;

    const bar = document.createElement('div');
    bar.id = 'koskuSortBar';
    bar.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px';
    bar.innerHTML =
      '<span style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--text-2);white-space:nowrap">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16"/><path d="m3 16 4 4 4-4"/><path d="M17 20V4"/><path d="m13 8 4-4 4 4"/></svg>Urutkan</span>' +
      '<select id="koskuSortSelect" style="flex:1;padding:10px 12px;border:1.5px solid var(--border);border-radius:12px;background:var(--card);color:var(--text);font-size:13.5px;font-weight:600;font-family:inherit;outline:none">' +
      OPTIONS.map(o => '<option value="' + o[0] + '"' + (o[0] === urutan ? ' selected' : '') + '>' + o[1] + '</option>').join('') +
      '</select>';
    count.parentNode.insertBefore(bar, count);

    document.getElementById('koskuSortSelect').addEventListener('change', function () {
      urutan = this.value;
      try { localStorage.setItem(KEY, urutan); } catch (e) { /* abaikan */ }
      window.renderFilteredKos();
    });
  }

  // Jika pengguna sudah pernah memilih urutan, terapkan begitu daftar kos selesai dimuat
  function init() {
    buatBar();
    // Pastikan bar tetap ada jika halaman dibangun ulang
    const app = document.getElementById('app');
    if (app) new MutationObserver(buatBar).observe(app, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
