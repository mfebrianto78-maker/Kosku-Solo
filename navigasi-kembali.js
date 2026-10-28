// =====================================================
// KosKu Solo — Tombol kembali HP + masuk otomatis
// Dimuat lewat: <script src="navigasi-kembali.js"></script>  (paling akhir)
//
// Masalah sebelumnya:
//  1. Tombol kembali di HP langsung menutup aplikasi (aplikasi tidak punya
//     riwayat halaman), jadi saat dibuka lagi harus login dari awal.
//  2. Setiap aplikasi dibuka ulang, selalu mulai dari layar awal → login,
//     padahal sesi login masih tersimpan.
//
// Perbaikan:
//  - Tombol kembali sekarang MENDAHULUI: tutup jendela yang terbuka
//    (filter, foto besar, dialog), lalu pindah ke halaman sebelumnya.
//  - Di halaman utama (Beranda / Dashboard Pemilik) tekan kembali sekali
//    memunculkan "Tekan sekali lagi untuk keluar"; baru tekan kedua keluar.
//  - Kalau sesi login masih ada, aplikasi langsung membuka Beranda / Dashboard
//    sesuai peran, tanpa layar login.
// =====================================================

(function () {
  'use strict';
  if (window.__kkNavReady) return;
  window.__kkNavReady = true;

  const ROOT = ['dashboard', 'owner', 'login', 'onboarding', 'splash', 'admin-dashboard', 'admin-login'];
  const TAB_PENCARI = ['dashboard', 'search', 'favorit', 'chat-list', 'riwayat', 'profil'];
  const LAYAR_AWAL = ['splash', 'onboarding', 'login', 'register', 'role'];

  const asliShow = window.show;
  if (typeof asliShow !== 'function') return;

  let tumpukan = [];           // riwayat layar di dalam aplikasi
  let sedangKembali = false;   // true saat perpindahan berasal dari tombol kembali
  let menungguKeluar = false;  // true setelah tekan kembali pertama di layar utama
  let timerKeluar = null;

  function layarSaatIni() {
    try { return currentScreen; } catch (e) {
      const a = document.querySelector('.screen.active');
      return a ? a.id.replace(/^screen-/, '') : null;
    }
  }

  // ---------- Catat riwayat layar ----------
  function catat(id) {
    if (sedangKembali) return;
    const i = tumpukan.lastIndexOf(id);
    if (i >= 0) { tumpukan = tumpukan.slice(0, i + 1); return; }
    if (id === 'dashboard' || id === 'owner' || id === 'login' || id === 'admin-dashboard' || id === 'onboarding') {
      tumpukan = [id];
    } else if (TAB_PENCARI.includes(id)) {
      tumpukan = ['dashboard', id];
    } else {
      tumpukan.push(id);
    }
  }

  window.show = function (id) {
    const r = asliShow.apply(this, arguments);
    catat(id);
    menungguKeluar = false;
    return r;
  };

  // ---------- Tutup jendela yang sedang terbuka ----------
  function tutupJendela() {
    // Mode geser pin admin
    const gb = document.getElementById('kktGBatal');
    if (gb) { gb.click(); return true; }
    // Formulir tempat (admin)
    const km = document.getElementById('kktModal');
    if (km) { const b = km.querySelector('#kktBatal'); if (b) b.click(); else km.remove(); return true; }
    // Panel filter
    const fp = document.getElementById('filterPanel');
    if (fp && fp.style.display !== 'none' && getComputedStyle(fp).display !== 'none' && layarSaatIni() === 'search') {
      try { toggleFilter(); } catch (e) { fp.style.display = 'none'; }
      return true;
    }
    // Dialog / foto besar yang dibuat dinamis (menutupi seluruh layar)
    const kids = Array.from(document.body.children).filter(el => {
      const st = el.style;
      return st && st.position === 'fixed' && /inset:\s*0|top:\s*0/.test(el.style.cssText) &&
        parseInt(st.zIndex || '0', 10) >= 900 && !el.matches('script,style,#kkmCatatKeluar');
    });
    if (kids.length) { kids[kids.length - 1].remove(); return true; }
    return false;
  }

  // ---------- Ke halaman sebelumnya ----------
  function kembaliSatuLayar() {
    const sekarang = layarSaatIni();
    if (tumpukan.length > 1) {
      tumpukan.pop();
      const tujuan = tumpukan[tumpukan.length - 1];
      sedangKembali = true;
      try {
        if (sekarang === 'chat' && typeof window.goBackFromChat === 'function') {
          window.goBackFromChat();               // bersihkan koneksi chat dulu
          if (layarSaatIni() !== tujuan) window.show(tujuan);
        } else {
          window.show(tujuan);
        }
        // Muat ulang isi layar yang datanya perlu disegarkan
        if (tujuan === 'dashboard' && typeof window.loadDashBannerCarousel === 'function') { try { window.loadDashBannerCarousel(); } catch (e) { /* abaikan */ } }
        if (tujuan === 'owner' && typeof window.loadMyKos === 'function') { try { window.loadMyKos(); } catch (e) { /* abaikan */ } }
        if (tujuan === 'search' && typeof window.renderFilteredKos === 'function') { try { window.renderFilteredKos(); } catch (e) { /* abaikan */ } }
      } finally { sedangKembali = false; }
      return true;
    }
    return false;
  }

  function toastKeluar() {
    let t = document.getElementById('kkmCatatKeluar');
    if (!t) {
      t = document.createElement('div');
      t.id = 'kkmCatatKeluar';
      t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(110px + env(safe-area-inset-bottom,0px));' +
        'background:rgba(30,30,40,.92);color:#fff;font:600 13px "Plus Jakarta Sans",sans-serif;padding:11px 18px;border-radius:20px;' +
        'z-index:9000;pointer-events:none;transition:opacity .25s;max-width:86%;text-align:center';
      document.body.appendChild(t);
    }
    t.textContent = 'Tekan sekali lagi untuk keluar';
    t.style.opacity = '1';
    clearTimeout(timerKeluar);
    timerKeluar = setTimeout(() => { t.style.opacity = '0'; menungguKeluar = false; }, 2000);
  }

  // ---------- Riwayat browser sebagai pengait tombol kembali ----------
  function pasangPenjaga() { try { history.pushState({ kkJaga: 1 }, '', location.href); } catch (e) { /* abaikan */ } }

  function mulaiRiwayat() {
    try { history.replaceState({ kkDasar: 1 }, '', location.href); } catch (e) { /* abaikan */ }
    pasangPenjaga();
    const cur = layarSaatIni();
    if (cur && !tumpukan.length) tumpukan = [cur];
  }

  window.addEventListener('popstate', () => {
    // Setiap tekan kembali dimakan satu entri; pasang lagi penjaga agar berikutnya tetap tertangkap
    if (tutupJendela()) { pasangPenjaga(); return; }
    if (kembaliSatuLayar()) { pasangPenjaga(); return; }
    // Sudah di layar paling awal
    const cur = layarSaatIni();
    if (menungguKeluar) {
      // Tekan kedua: biarkan sistem keluar dari aplikasi
      menungguKeluar = false;
      try { history.back(); } catch (e) { /* abaikan */ }
      return;
    }
    menungguKeluar = true;
    toastKeluar();
    pasangPenjaga();
    void cur;
  });

  // ---------- Masuk otomatis bila sesi masih ada ----------
  async function masukOtomatis() {
    try {
      const mulaiWaktu = Date.now();
      const { data } = await sbClient.auth.getSession();
      if (!data || !data.session) return;
      // Tunggu profil selesai dimuat oleh checkExistingSession()
      let n = 0;
      while (n < 60) {
        let siap = false;
        try { siap = !!currentUserProfile; } catch (e) { /* abaikan */ }
        if (siap) break;
        await new Promise(r => setTimeout(r, 150));
        n++;
      }
      let prof = null;
      try { prof = currentUserProfile; } catch (e) { /* abaikan */ }
      if (!prof) return;
      // Beri waktu tampil layar pembuka sebentar agar tidak berkedip
      const sisa = 1200 - (Date.now() - mulaiWaktu);
      if (sisa > 0) await new Promise(r => setTimeout(r, sisa));
      if (!LAYAR_AWAL.includes(layarSaatIni())) return;   // pengguna sudah pindah sendiri
      if (prof.role === 'pemilik' && typeof window.showOwner === 'function') window.showOwner();
      else if (typeof window.showDashboard === 'function') window.showDashboard();
    } catch (e) {
      console.warn('Masuk otomatis dilewati:', e && e.message);
    }
  }

  function mulai() { mulaiRiwayat(); masukOtomatis(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
