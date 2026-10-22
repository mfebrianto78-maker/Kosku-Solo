// =====================================================
// KosKu Solo — Lokasi wajib untuk kos baru + lencana "Lokasi Terverifikasi"
// Dimuat lewat: <script src="verifikasi-lokasi.js"></script>
// Butuh: verifikasi-lokasi.sql sudah dijalankan di Supabase.
//
// Aturan (sama dengan yang di database):
//  - Kos BARU wajib punya titik di peta, dan titiknya harus di Soloraya.
//  - Kos lama tidak dikenai kewajiban (tetap tayang).
//  - Lencana didapat bila posisi GPS pemilik saat verifikasi berjarak
//    <= 250 m dari titik di peta, dengan akurasi GPS <= 100 m.
// =====================================================

(function () {
  const MAX_JARAK = 250;     // meter
  const MAX_AKURASI = 100;   // meter
  const BOX = { latMin: -8.30, latMax: -7.10, lngMin: 110.30, lngMax: 111.40 };

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const PIN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><path d="m9.5 9.5 2 2 3.5-3.5"/></svg>';

  const css = `
    .kk-lokv { display:inline-flex; align-items:center; gap:4px; background:#E0F2FE; color:#0369A1; font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:7px; white-space:nowrap; }
    .kkv-box { margin-top:12px; background:var(--bg-2); border-radius:14px; padding:14px; }
    .kkv-t { font-size:13.5px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:7px; }
    .kkv-t svg { color:#0369A1; }
    .kkv-d { font-size:12px; color:var(--text-3); line-height:1.55; margin:6px 0 10px; }
    .kkv-box button { width:100%; padding:12px; border:none; border-radius:12px; background:#0369A1; color:#fff; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; }
    .kkv-box button:disabled { opacity:.6; }
    .kkv-s { font-size:12.5px; line-height:1.5; margin-top:10px; padding:10px 12px; border-radius:10px; display:none; font-weight:600; }
    .kkv-s.ok { display:block; background:#DCFCE7; color:#15803D; }
    .kkv-s.warn { display:block; background:#FEF3C7; color:#92400E; }
    .kkv-s.info { display:block; background:#E0F2FE; color:#075985; }
    .kkv-hint { font-size:11.5px; color:var(--text-3); margin-top:5px; line-height:1.45; }
  `;
  function injectStyle() {
    if (document.getElementById('koskuVerifLokasi')) return;
    const s = document.createElement('style');
    s.id = 'koskuVerifLokasi';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---------- Hitung ----------
  function jarakM(lat1, lng1, lat2, lng2) {
    const R = 6371000, rad = x => x * Math.PI / 180;
    const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  }
  const diSoloraya = t => t.lat >= BOX.latMin && t.lat <= BOX.latMax && t.lng >= BOX.lngMin && t.lng <= BOX.lngMax;

  function titik() {
    try {
      if (selectedLat != null && selectedLng != null) return { lat: Number(selectedLat), lng: Number(selectedLng) };
    } catch (e) { /* abaikan */ }
    const el = document.getElementById('tkKoordinat');
    const p = el && el.value ? el.value.split(',').map(x => parseFloat(x.trim())) : [];
    return p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]) ? { lat: p[0], lng: p[1] } : null;
  }

  // Hasil verifikasi yang menunggu disimpan bersama formulir
  let pending = null;

  function setStatus(jenis, teks) {
    const el = document.getElementById('kkvStatus');
    if (!el) return;
    el.className = 'kkv-s' + (jenis ? ' ' + jenis : '');
    el.textContent = teks || '';
  }

  const pesanGps = err => err && err.code === 1
    ? 'Izin lokasi ditolak. Aktifkan izin lokasi untuk browser ini di pengaturan HP, lalu coba lagi.'
    : err && err.code === 3
      ? 'Waktu habis saat mencari sinyal GPS. Pindah ke area terbuka lalu coba lagi.'
      : 'Lokasi HP tidak tersedia saat ini. Pastikan GPS menyala.';

  // ---------- Kotak verifikasi di formulir ----------
  function pasangKotak() {
    const peta = document.getElementById('tkMapContainer');
    const kartu = peta && peta.closest('.form-card');
    if (!kartu || document.getElementById('kkVerifBox')) return;

    const bantu = peta.previousElementSibling;
    if (bantu) bantu.textContent = 'Tap pada peta untuk menandai lokasi kos Anda. Wajib diisi untuk kos baru.';

    const box = document.createElement('div');
    box.id = 'kkVerifBox';
    box.className = 'kkv-box';
    box.innerHTML = `
      <div class="kkv-t">${PIN} Verifikasi lokasi (lencana)</div>
      <div class="kkv-d">Berdiri di kos Anda, lalu tekan tombol di bawah. Jika posisi HP Anda dekat dengan titik di peta, kos mendapat lencana <b>Lokasi Terverifikasi</b> dan lebih dipercaya pencari. Kos tetap tayang walau belum diverifikasi.</div>
      <button type="button" id="kkvBtn">Verifikasi lokasi saya sekarang</button>
      <div class="kkv-s" id="kkvStatus"></div>`;
    kartu.appendChild(box);
    document.getElementById('kkvBtn').addEventListener('click', verifikasi);
  }

  function verifikasi() {
    const btn = document.getElementById('kkvBtn');
    const t = titik();
    if (!t) { setStatus('warn', 'Tandai titik kos di peta dulu (tap peta, atau tekan "Gunakan Lokasi Saya Sekarang"), lalu verifikasi.'); return; }
    if (!navigator.geolocation) { setStatus('warn', 'Browser ini tidak mendukung GPS.'); return; }
    btn.disabled = true; btn.textContent = 'Mencari sinyal GPS...';
    setStatus('info', 'Mengambil posisi Anda. Tunggu beberapa detik...');
    navigator.geolocation.getCurrentPosition(pos => {
      btn.disabled = false; btn.textContent = 'Verifikasi lokasi saya sekarang';
      const acc = pos.coords.accuracy;
      if (acc > MAX_AKURASI) {
        pending = null;
        setStatus('warn', `Sinyal GPS kurang akurat (±${Math.round(acc)} m). Pindah ke area terbuka lalu coba lagi.`);
        return;
      }
      const d = jarakM(t.lat, t.lng, pos.coords.latitude, pos.coords.longitude);
      if (d <= MAX_JARAK) {
        pending = { lat: pos.coords.latitude, lng: pos.coords.longitude, akurasi: acc };
        setStatus('ok', `Lokasi terverifikasi. Selisih titik peta dan posisi Anda sekitar ${Math.round(d)} m. Lencana didapat setelah kos disimpan.`);
      } else {
        pending = null;
        setStatus('warn', `Anda berjarak sekitar ${Math.round(d)} m dari titik di peta. Geser titik ke posisi kos, atau verifikasi saat Anda berada di kos. Kos tetap bisa disimpan tanpa lencana.`);
      }
    }, err => {
      btn.disabled = false; btn.textContent = 'Verifikasi lokasi saya sekarang';
      pending = null;
      setStatus('warn', pesanGps(err));
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }

  // ---------- Tombol "Gunakan Lokasi Saya Sekarang": sekaligus verifikasi ----------
  window.getMyLocation = function () {
    const btn = window.event && window.event.target && window.event.target.tagName === 'BUTTON' ? window.event.target : null;
    if (!navigator.geolocation) { alert('Browser tidak mendukung GPS'); return; }
    const teksAwal = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Mendapatkan lokasi...'; btn.disabled = true; }
    const pulih = () => { if (btn) { btn.textContent = teksAwal; btn.disabled = false; } };

    navigator.geolocation.getCurrentPosition(pos => {
      pulih();
      const { latitude, longitude, accuracy } = pos.coords;
      setMapLocation(latitude, longitude);          // (juga mereset verifikasi lama bila perlu)
      if (accuracy <= MAX_AKURASI) {
        pending = { lat: latitude, lng: longitude, akurasi: accuracy };
        setStatus('ok', `Titik diisi dari GPS dan lokasi terverifikasi (±${Math.round(accuracy)} m). Lencana didapat setelah kos disimpan.`);
      } else {
        pending = null;
        setStatus('info', `Titik diisi dari GPS, tetapi akurasi ±${Math.round(accuracy)} m belum cukup untuk verifikasi. Coba lagi di area terbuka.`);
      }
    }, err => {
      pulih();
      alert('Gagal mendapatkan lokasi: ' + (err && err.message ? err.message : ''));
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  // Titik digeser jauh dari posisi verifikasi → verifikasi gugur
  const asliSet = window.setMapLocation;
  if (typeof asliSet === 'function') {
    window.setMapLocation = function (lat, lng) {
      const r = asliSet.apply(this, arguments);
      if (pending && jarakM(lat, lng, pending.lat, pending.lng) > MAX_JARAK) {
        pending = null;
        setStatus('warn', 'Titik digeser jauh dari posisi verifikasi. Verifikasi ulang agar kos tetap mendapat lencana.');
      }
      return r;
    };
  }
  const asliReset = window.resetMapLocation;
  if (typeof asliReset === 'function') {
    window.resetMapLocation = function () {
      pending = null; setStatus('', '');
      return asliReset.apply(this, arguments);
    };
  }

  // ---------- Buka formulir tambah / edit ----------
  const asliTampil = window.showTambahKos;
  if (typeof asliTampil === 'function') {
    window.showTambahKos = function (kosId) {
      pending = null;
      const r = asliTampil.apply(this, arguments);
      try {
        pasangKotak();
        const kos = kosId && (myKosData || []).find(k => k.id === kosId);
        if (kos && kos.lokasi_terverifikasi) setStatus('ok', 'Lokasi kos ini sudah terverifikasi.');
        else if (kos) setStatus('info', 'Lokasi belum terverifikasi. Verifikasi saat Anda berada di kos untuk mendapat lencana.');
        else setStatus('info', 'Kos baru wajib menandai titik lokasi di peta.');
      } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // ---------- Simpan: cek wajib lokasi untuk kos baru ----------
  const asliSimpan = window.handleTambahKos;
  if (typeof asliSimpan === 'function') {
    window.handleTambahKos = function () {
      let baru = false;
      try { baru = !editingKosId; } catch (e) { /* abaikan */ }
      if (baru) {
        const t = titik();
        if (!t) {
          showAuthError('tkError', 'Titik lokasi wajib ditandai di peta. Tap pada peta, atau tekan "Gunakan Lokasi Saya Sekarang".');
          const m = document.getElementById('tkMapContainer');
          if (m && m.scrollIntoView) m.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (!diSoloraya(t)) {
          showAuthError('tkError', 'Lokasi kos harus berada di wilayah Soloraya. Geser titik di peta ke lokasi kos Anda.');
          return;
        }
      }
      return asliSimpan.apply(this, arguments);
    };
  }

  // ---------- Sisipkan data verifikasi ke simpanan kos ----------
  function sisipkan(nilai) {
    if (!pending || !nilai || Array.isArray(nilai) || typeof nilai !== 'object') return nilai;
    return Object.assign({}, nilai, { verif_lat: pending.lat, verif_lng: pending.lng, verif_akurasi: pending.akurasi });
  }
  function pasangSimpan() {
    try {
      const asliFrom = sbClient.from.bind(sbClient);
      sbClient.from = function (tabel) {
        const q = asliFrom(tabel);
        if (tabel !== 'kos') return q;
        const asliInsert = q.insert.bind(q), asliUpdate = q.update.bind(q);
        q.insert = (v, o) => asliInsert(v && v.owner_id && v.nama_kos ? sisipkan(v) : v, o);
        // update hanya disisipi pada simpan formulir kos (bukan update foto / status)
        q.update = (v, o) => {
          const dariFormulir = v && v.nama_kos !== undefined && v.harga_per_bulan !== undefined
            && typeof currentScreen !== 'undefined' && currentScreen === 'tambah-kos';
          return asliUpdate(dariFormulir ? sisipkan(v) : v, o);
        };
        return q;
      };
    } catch (e) { console.warn('verifikasi-lokasi: gagal memasang penyimpan', e); }
  }

  // ---------- Lencana di kartu & detail ----------
  const asliKartu = window.renderKosListCard;
  if (typeof asliKartu === 'function') {
    window.renderKosListCard = function (kos) {
      const html = asliKartu.apply(this, arguments);
      if (!kos || !kos.lokasi_terverifikasi) return html;
      return html.replace(/(<div class="kk-name">[\s\S]*?)(<\/div>)/, `$1<span class="kk-lokv">${PIN}Lokasi terverifikasi</span>$2`);
    };
  }

  const asliDetail = window.renderDetailScreen;
  if (typeof asliDetail === 'function') {
    window.renderDetailScreen = function (kos) {
      const r = asliDetail.apply(this, arguments);
      try {
        const body = document.querySelector('#screen-detail .detail-body');
        const row = body && body.querySelector('div[style*="gap:8px"][style*="margin-bottom:16px"]');
        if (row) {
          row.querySelectorAll('.kk-lokv-tag').forEach(e => e.remove());
          if (kos && kos.lokasi_terverifikasi) {
            row.insertAdjacentHTML('beforeend', `<div class="fasil-tag kk-lokv-tag" style="background:#E0F2FE;color:#0369A1">${PIN}Lokasi terverifikasi</div>`);
          }
        }
      } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // ---------- Daftar Kelola Kos (pemilik): status + ajakan verifikasi ----------
  const asliDaftar = window.renderKelolaKosList;
  if (typeof asliDaftar === 'function') {
    window.renderKelolaKosList = function () {
      const r = asliDaftar.apply(this, arguments);
      try {
        document.querySelectorAll('#kelolaKosList .kk-card').forEach(card => {
          const edit = card.querySelector('.kk-btn-edit');
          const m = edit && (edit.getAttribute('onclick') || '').match(/showTambahKos\('([^']+)'\)/);
          const kos = m && (myKosData || []).find(k => k.id === m[1]);
          const info = card.querySelector('.kk-card-top > div:nth-child(2)');
          if (!kos || !info) return;
          info.insertAdjacentHTML('beforeend', kos.lokasi_terverifikasi
            ? `<div style="margin-top:6px"><span class="kk-lokv">${PIN}Lokasi terverifikasi</span></div>`
            : '<div class="kkv-hint">Lokasi belum terverifikasi. Buka Edit saat Anda di kos untuk mendapat lencana.</div>');
        });
      } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // ---------- Mulai ----------
  function init() { injectStyle(); pasangKotak(); }
  pasangSimpan();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
