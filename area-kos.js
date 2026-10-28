// =====================================================
// KosKu Solo — Area / Lokasi Dekat Kos
// Dimuat lewat: <script src="area-kos.js"></script>  (paling akhir)
// Butuh: area-kos.sql sudah dijalankan di Supabase.
//
// - Formulir Tambah/Edit Kos: pemilik memilih kampus, mal, stasiun, wilayah
//   terdekat. Ada saran otomatis dari titik peta. Wajib minimal 1 untuk kos baru.
// - Pencarian (kartu UNS/UMS/Kartosuro, dll.) memakai pilihan ini, sehingga
//   hasilnya lebih lengkap daripada mencari kata di alamat.
// =====================================================
(function () {
  'use strict';
  if (window.__kkAreaReady) return;
  window.__kkAreaReady = true;

  const WILAYAH = ['Pasar Kliwon', 'Jebres', 'Serengan', 'Laweyan', 'Banjarsari', 'Kartosuro', 'Palur', 'Colomadu', 'Solobaru'];
  // Nama lain yang dianggap sama saat mencocokkan pencarian
  const ALIAS = {
    'uin surakarta': ['uin rms', 'uin raden mas said', 'uin'],
    'unisri': ['unisri'],
    'kartosuro': ['kartasura'],
    'solobaru': ['solo baru']
  };
  const IKON = { Kampus: '🎓', Mal: '🛍️', Pasar: '🧺', Transportasi: '🚉', 'Rumah Sakit': '🏥', Bisnis: '🏢', Wisata: '🏛️', Wilayah: '📍' };
  const URUT_KATEGORI = ['Kampus', 'Mal', 'Transportasi', 'Pasar', 'Rumah Sakit', 'Bisnis', 'Wisata', 'Wilayah'];

  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = t => String(t || '').trim().toLowerCase();

  // ---------- Pencocokan untuk pencarian ----------
  function cocok(kos, kata) {
    const tags = (kos && kos.area_dekat) || [];
    if (!tags.length) return false;
    const q = norm(kata);
    const cocokSemua = [q].concat(ALIAS[q] || []);
    return tags.some(t => cocokSemua.includes(norm(t)));
  }

  function kolomAda() {
    let ada = null;
    try {
      const gabung = [].concat(typeof allKosData !== 'undefined' ? allKosData || [] : [], typeof myKosData !== 'undefined' ? myKosData || [] : []);
      if (gabung.length) ada = gabung.some(k => 'area_dekat' in k);
    } catch (e) { /* abaikan */ }
    return ada !== false; // tidak tahu → anggap ada
  }

  // ---------- Data tempat ----------
  let tempat = [];
  let dimuat = 0;
  async function muatTempat() {
    if (tempat.length && Date.now() - dimuat < 10 * 60 * 1000) return tempat;
    try {
      const { data, error } = await sbClient.from('tempat_favorit')
        .select('nama_singkat, nama, kategori, latitude, longitude').eq('aktif', true).order('urutan');
      if (error) throw error;
      tempat = (data || []).map(t => Object.assign({}, t, { latitude: Number(t.latitude), longitude: Number(t.longitude) }));
      dimuat = Date.now();
    } catch (e) { console.warn('Tempat favorit tidak bisa dimuat untuk area kos:', e && e.message); }
    return tempat;
  }

  function jarakM(a, b, c, d) {
    const R = 6371000, r = x => x * Math.PI / 180;
    const dLa = r(c - a), dLo = r(d - b);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const fmtJarak = m => m < 1000 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(1).replace('.', ',') + ' km';

  // ---------- Pilihan saat ini ----------
  let pilih = new Set();

  function nilai() {
    if (!kolomAda()) return undefined;
    return Array.from(pilih);
  }

  // ---------- Gaya ----------
  const css = document.createElement('style');
  css.textContent = `
  #kkaCard .kka-hint{font-size:12px;color:var(--text-3);line-height:1.5;margin-bottom:12px}
  #kkaCard .kka-sub{font-size:12px;font-weight:800;color:var(--text-2);margin:14px 0 8px;display:flex;align-items:center;justify-content:flex-start;gap:6px}
  #kkaCard .kka-sub button{margin-left:auto;border:0;background:var(--orange-light);color:var(--orange);font-weight:700;font-size:11.5px;padding:5px 10px;border-radius:12px;cursor:pointer}
  #kkaCard .kka-grid{display:flex;flex-wrap:wrap;gap:7px}
  .kka-chip{display:inline-flex;align-items:center;gap:5px;padding:8px 12px;border-radius:20px;background:var(--card);border:1.5px solid var(--border);font-size:12.5px;font-weight:600;color:var(--text-2);cursor:pointer;user-select:none}
  .kka-chip small{font-size:10.5px;color:var(--text-3);font-weight:600}
  .kka-chip.on{background:var(--orange);border-color:var(--orange);color:#fff}
  .kka-chip.on small{color:rgba(255,255,255,.85)}
  #kkaCard .kka-count{font-size:12px;font-weight:700;margin-top:12px;color:var(--text-3)}
  #kkaCard .kka-count.ok{color:var(--green)}
  #kkaCard.kka-salah{outline:2px solid var(--red);outline-offset:2px}
  #kkaCard .kka-saran{background:var(--orange-light);border-radius:14px;padding:12px;margin-bottom:4px}
  #kkaCard .kka-saran .kka-sub{margin-top:0}
  `;
  document.head.appendChild(css);

  // ---------- Kartu di formulir ----------
  function pasangKartu() {
    if (document.getElementById('kkaCard')) return true;
    const err = document.getElementById('tkError');
    if (!err) return false;
    const k = document.createElement('div');
    k.className = 'form-card';
    k.id = 'kkaCard';
    k.innerHTML = `
      <h3>🎓 Dekat Mana Kos Anda?</h3>
      <div class="kka-hint">Pilih kampus, mal, stasiun, atau wilayah terdekat. Pencari kos akan menemukan kos Anda lewat pilihan ini. <b>Pilih minimal 1.</b></div>
      <div id="kkaSaran"></div>
      <div id="kkaDaftar"></div>
      <div class="kka-count" id="kkaCount"></div>`;
    err.parentNode.insertBefore(k, err);
    k.addEventListener('click', e => {
      const c = e.target.closest('.kka-chip'); if (c) { ganti(c.dataset.t); return; }
      const b = e.target.closest('#kkaSemuaSaran');
      if (b) { (b.dataset.t || '').split('|').filter(Boolean).forEach(t => pilih.add(t)); gambar(); }
    });
    const alamat = document.getElementById('tkAlamat');
    if (alamat) {
      let tm = null;
      alamat.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(gambar, 400); });
    }
    return true;
  }

  function ganti(t) {
    if (pilih.has(t)) pilih.delete(t); else pilih.add(t);
    const kartu = document.getElementById('kkaCard'); if (kartu) kartu.classList.remove('kka-salah');
    gambar();
  }

  function chip(t, label, kecil) {
    return `<div class="kka-chip ${pilih.has(t) ? 'on' : ''}" data-t="${esc(t)}">${label}${kecil ? ` <small>${esc(kecil)}</small>` : ''}</div>`;
  }

  function titikSekarang() {
    const inp = document.getElementById('tkKoordinat');
    const p = inp && inp.value ? inp.value.split(',').map(x => parseFloat(x.trim())) : [];
    if (p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])) return { lat: p[0], lng: p[1] };
    return null;
  }

  function gambar() {
    if (!pasangKartu()) return;
    const saran = document.getElementById('kkaSaran');
    const daftar = document.getElementById('kkaDaftar');
    const hitung = document.getElementById('kkaCount');

    // --- Saran otomatis ---
    const t = titikSekarang();
    const alamat = norm((document.getElementById('tkAlamat') || {}).value);
    const dekat = t ? tempat
      .map(x => ({ x, d: jarakM(t.lat, t.lng, x.latitude, x.longitude) }))
      .filter(o => o.d <= 3000).sort((a, b) => a.d - b.d).slice(0, 6) : [];
    const wilSaran = WILAYAH.filter(w => alamat && (alamat.includes(norm(w)) || (w === 'Kartosuro' && alamat.includes('kartasura'))));
    if (dekat.length || wilSaran.length) {
      const tags = dekat.map(o => o.x.nama_singkat).concat(wilSaran);
      saran.innerHTML = `<div class="kka-saran"><div class="kka-sub">✨ Disarankan untuk lokasi Anda <button id="kkaSemuaSaran" data-t="${esc(tags.join('|'))}">Pilih semua</button></div>
        <div class="kka-grid">${dekat.map(o => chip(o.x.nama_singkat, (IKON[o.x.kategori] || '📍') + ' ' + esc(o.x.nama_singkat), fmtJarak(o.d))).join('')}${wilSaran.map(w => chip(w, '📍 ' + esc(w))).join('')}</div></div>`;
    } else {
      saran.innerHTML = t ? '' : '<div class="kka-hint" style="background:var(--orange-light);padding:10px 12px;border-radius:12px">💡 Tandai lokasi kos di peta di atas, nanti saya sarankan tempat terdekat secara otomatis.</div>';
    }

    // --- Daftar lengkap per kategori ---
    const grup = {};
    tempat.forEach(x => { (grup[x.kategori] = grup[x.kategori] || []).push(x); });
    let html = '';
    URUT_KATEGORI.forEach(kat => {
      const isi = kat === 'Wilayah' ? WILAYAH.map(w => ({ nama_singkat: w })) : (grup[kat] || []);
      if (!isi.length) return;
      html += `<div class="kka-sub">${IKON[kat] || '📍'} ${esc(kat)}</div><div class="kka-grid">${isi.map(x => chip(x.nama_singkat, esc(x.nama_singkat))).join('')}</div>`;
    });
    // Pilihan lama yang tempatnya sudah dihapus admin tetap bisa dilihat & dilepas
    const dikenal = new Set(tempat.map(x => x.nama_singkat).concat(WILAYAH));
    const sisa = Array.from(pilih).filter(x => !dikenal.has(x));
    if (sisa.length) html += `<div class="kka-sub">Lainnya</div><div class="kka-grid">${sisa.map(x => chip(x, esc(x))).join('')}</div>`;
    daftar.innerHTML = html;

    hitung.textContent = pilih.size ? `✓ ${pilih.size} lokasi dipilih` : 'Belum ada yang dipilih';
    hitung.classList.toggle('ok', pilih.size > 0);
  }

  // ---------- Sambung ke alur tambah / edit kos ----------
  const asliTampil = window.showTambahKos;
  if (typeof asliTampil === 'function') {
    window.showTambahKos = function (kosId) {
      const r = asliTampil.apply(this, arguments);
      pilih = new Set();
      const kt = document.getElementById('kkaCard'); if (kt) kt.classList.remove('kka-salah');
      if (kosId) {
        try {
          const k = (myKosData || []).find(x => x.id === kosId);
          ((k && k.area_dekat) || []).forEach(t => pilih.add(t));
        } catch (e) { /* abaikan */ }
      }
      gambar();
      muatTempat().then(gambar);
      return r;
    };
  }

  ['setMapLocation', 'resetMapLocation'].forEach(nama => {
    const asli = window[nama];
    if (typeof asli !== 'function') return;
    window[nama] = function () {
      const r = asli.apply(this, arguments);
      try { gambar(); } catch (e) { /* abaikan */ }
      return r;
    };
  });

  // Kos baru wajib memilih minimal satu lokasi dekat
  const asliSimpan = window.handleTambahKos;
  if (typeof asliSimpan === 'function') {
    window.handleTambahKos = function () {
      let baru = false;
      try { baru = !editingKosId; } catch (e) { /* abaikan */ }
      if (baru && kolomAda() && pilih.size === 0) {
        const kartu = document.getElementById('kkaCard');
        if (kartu) { kartu.classList.add('kka-salah'); kartu.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        if (typeof showAuthError === 'function') showAuthError('tkError', 'Pilih minimal 1 lokasi dekat kos (kampus, tempat, atau wilayah).');
        return;
      }
      return asliSimpan.apply(this, arguments);
    };
  }

  window.KKArea = { cocok, nilai, pilihan: () => Array.from(pilih) };
})();
