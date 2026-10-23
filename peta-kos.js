// =====================================================
// KosKu Solo — Peta Kos layar penuh (Tahap 1)
// Dimuat lewat: <script src="peta-kos.js"></script>  (paling akhir)
//
// Isi:
//  - Halaman "Peta" penuh layar (Leaflet + gaya peta CARTO, ikut mode gelap)
//  - Pin berisi harga, berwarna sesuai jenis kos; pin berdekatan digabung
//  - Kartu kos di bawah peta bisa digeser; peta ikut pindah ke kos yang aktif
//  - Ketuk pin = kartu pindah; ketuk kartu = buka Detail Kos
//  - Tombol: Lokasi saya, Daftar, "Tampilkan kos di area ini"
//  - Pintu masuk: Beranda (Lihat Peta), Cari Kos (tombol Peta),
//    dan tombol pin di setiap kartu kos
// =====================================================

(function () {
  'use strict';
  if (window.__kkPetaReady) return;
  window.__kkPetaReady = true;

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const WARNA = { Putri: '#EC4899', Putra: '#3B82F6', Campur: '#8B5CF6', Eksklusif: '#D97706' };
  const PUSAT_SOLO = [-7.5666, 110.8167];
  const TILE_TERANG = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const TILE_GELAP = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const ATRIBUSI = '&copy; OpenStreetMap &copy; CARTO';

  let peta = null;          // instance Leaflet
  let tileLayer = null;
  let lapisPin = null;      // grup pin (cluster atau layerGroup biasa)
  let pinById = {};
  let dataTampil = [];      // kos yang tampil (sudah difilter & punya koordinat)
  let aktifId = null;
  let asalLayar = 'dashboard';
  let jenisAktif = 'Semua';
  let kataKunci = '';
  let batasArea = null;     // L.LatLngBounds saat mode "area ini"
  let posisiSaya = null;    // {lat,lng}
  let penandaSaya = null;
  let scrollProgram = false;
  let scrollTimer = null;
  let clusterSiap = false;

  // ---------- Util ----------
  function adaKoordinat(k) {
    const la = Number(k.latitude), ln = Number(k.longitude);
    return isFinite(la) && isFinite(ln) && k.latitude !== null && k.longitude !== null &&
      la >= -90 && la <= 90 && ln >= -180 && ln <= 180 && !(la === 0 && ln === 0);
  }
  function jarakM(a, b, c, d) {
    const R = 6371000, r = Math.PI / 180;
    const x = Math.sin((c - a) * r / 2) ** 2 +
      Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
  }
  function fmtJarak(m) {
    return m < 1000 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',') + ' km';
  }
  function hargaSingkat(h) {
    h = Number(h) || 0;
    if (h >= 1000000) return (Math.round(h / 100000) / 10).toString().replace('.', ',') + 'jt';
    return Math.round(h / 1000) + 'rb';
  }
  function hargaPenuh(h) {
    try { return formatRupiah(h); } catch (e) { return 'Rp ' + Number(h).toLocaleString('id-ID'); }
  }
  function gelap() { return document.documentElement.classList.contains('kosku-dark'); }
  function semuaKos() { try { return Array.isArray(allKosData) ? allKosData : []; } catch (e) { return []; } }

  // ---------- Gaya ----------
  function pasangCss() {
    if (document.getElementById('kkPetaCss')) return;
    const s = document.createElement('style');
    s.id = 'kkPetaCss';
    s.textContent = `
      #screen-peta { overflow: hidden !important; background: var(--bg); }
      #kkMapCanvas { position: absolute; inset: 0; z-index: 1; background: #E8E8EC; }
      html.kosku-dark #kkMapCanvas { background: #1b1b1f; }
      #screen-peta .leaflet-control-attribution { font-size: 9px; background: rgba(255,255,255,.7); }
      html.kosku-dark #screen-peta .leaflet-control-attribution { background: rgba(0,0,0,.55); color: #aaa; }
      html.kosku-dark #screen-peta .leaflet-control-attribution a { color: #bbb; }
      #screen-peta .leaflet-bottom { margin-bottom: 150px; }

      .kkm-top { position: absolute; z-index: 500; left: 0; right: 0; top: 0;
        padding: calc(14px + env(safe-area-inset-top, 0px)) 14px 0; pointer-events: none; }
      .kkm-bar { display: flex; gap: 10px; align-items: center; pointer-events: auto; }
      .kkm-round { width: 46px; height: 46px; flex: none; border-radius: 50%; background: var(--card, #fff);
        box-shadow: 0 4px 16px rgba(20,20,40,.2); display: flex; align-items: center; justify-content: center;
        color: var(--text, #222); cursor: pointer; border: 0; padding: 0; }
      .kkm-round:active { transform: scale(.94); }
      .kkm-round svg { width: 22px; height: 22px; }
      .kkm-search { flex: 1; min-width: 0; height: 46px; border-radius: 23px; background: var(--card, #fff);
        box-shadow: 0 4px 16px rgba(20,20,40,.2); display: flex; align-items: center; gap: 8px; padding: 0 16px; }
      .kkm-search svg { width: 18px; height: 18px; color: var(--orange, #FF7A00); flex: none; }
      .kkm-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent;
        font: 600 14px 'Plus Jakarta Sans', sans-serif; color: var(--text, #222); }
      .kkm-search input::placeholder { color: var(--text-3, #999); font-weight: 500; }
      .kkm-chips { display: flex; gap: 8px; overflow-x: auto; padding: 12px 0 6px; margin: 0 -14px;
        padding-left: 14px; padding-right: 14px; pointer-events: auto; scrollbar-width: none; }
      .kkm-chips::-webkit-scrollbar { display: none; }
      .kkm-chip { flex: none; padding: 8px 15px; border-radius: 20px; background: var(--card, #fff);
        box-shadow: 0 3px 10px rgba(20,20,40,.16); font: 700 12.5px 'Plus Jakarta Sans', sans-serif;
        color: var(--text, #222); cursor: pointer; border: 0; display: flex; align-items: center; gap: 6px; }
      .kkm-chip i { width: 9px; height: 9px; border-radius: 50%; background: var(--c, #999); display: block; }
      .kkm-chip.on { background: var(--orange, #FF7A00); color: #fff; }
      .kkm-chip.on i { background: #fff; }

      .kkm-note { position: absolute; z-index: 500; left: 50%; transform: translateX(-50%); top: calc(118px + env(safe-area-inset-top, 0px));
        background: rgba(30,30,40,.88); color: #fff; font: 600 12px 'Plus Jakarta Sans', sans-serif;
        padding: 8px 14px; border-radius: 16px; max-width: 86%; text-align: center; pointer-events: none;
        opacity: 0; transition: opacity .25s; }
      .kkm-note.show { opacity: 1; }

      .kkm-fabs { position: absolute; z-index: 500; right: 14px; bottom: 168px; display: flex; flex-direction: column; gap: 10px; }
      .kkm-area { position: absolute; z-index: 500; left: 50%; transform: translateX(-50%); bottom: 172px;
        background: var(--orange, #FF7A00); color: #fff; border: 0; border-radius: 22px; padding: 10px 18px;
        font: 800 12.5px 'Plus Jakarta Sans', sans-serif; box-shadow: 0 6px 18px rgba(255,122,0,.45);
        cursor: pointer; display: none; white-space: nowrap; }
      .kkm-area.show { display: block; }

      .kkm-cards { position: absolute; z-index: 500; left: 0; right: 0; bottom: 0;
        padding: 8px 0 calc(16px + env(safe-area-inset-bottom, 0px));
        display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-left: 14px;
        padding-left: 14px; padding-right: 14px; scrollbar-width: none; touch-action: pan-x; overscroll-behavior-x: contain; }
      .kkm-cards::-webkit-scrollbar { display: none; }
      .kkm-card { flex: 0 0 min(86%, 340px); scroll-snap-align: start; background: var(--card, #fff);
        border-radius: 20px; box-shadow: 0 8px 26px rgba(20,20,40,.22); display: flex; overflow: hidden;
        cursor: pointer; border: 2px solid transparent; transition: border-color .2s; min-height: 112px; }
      .kkm-card.on { border-color: var(--orange, #FF7A00); }
      .kkm-card:active { transform: scale(.985); }
      .kkm-ph { width: 104px; flex: none; background: linear-gradient(135deg,#FFE0C0,#FFB347);
        display: flex; align-items: center; justify-content: center; font-size: 34px; }
      .kkm-ph img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .kkm-bd { flex: 1; min-width: 0; padding: 11px 13px; display: flex; flex-direction: column; gap: 4px; }
      .kkm-tag { align-self: flex-start; font: 800 10.5px 'Plus Jakarta Sans', sans-serif; color: #fff;
        padding: 3px 9px; border-radius: 10px; }
      .kkm-nm { font: 800 14.5px 'Plus Jakarta Sans', sans-serif; color: var(--text, #222);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .kkm-ad { font: 500 11.5px 'Plus Jakarta Sans', sans-serif; color: var(--text-3, #888);
        overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      .kkm-ft { margin-top: auto; display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
      .kkm-pr { white-space: nowrap; font: 800 15px 'Plus Jakarta Sans', sans-serif; color: var(--orange, #FF7A00); }
      .kkm-pr small { font: 500 11px 'Plus Jakarta Sans', sans-serif; color: var(--text-3, #888); }
      .kkm-jr { font: 700 11px 'Plus Jakarta Sans', sans-serif; color: var(--text-2, #666); white-space: nowrap; }
      .kkm-kosong { flex: 1; background: var(--card, #fff); border-radius: 20px; padding: 18px; text-align: center;
        font: 600 13px 'Plus Jakarta Sans', sans-serif; color: var(--text-3, #888); box-shadow: 0 8px 26px rgba(20,20,40,.2); }

      /* Pin harga */
      .kkm-pinwrap { background: transparent; border: 0; }
      .kkm-pin { position: absolute; left: 0; top: 0; transform: translate(-50%, -100%); white-space: nowrap;
        background: var(--c, #FF7A00); color: #fff; font: 800 12px 'Plus Jakarta Sans', sans-serif;
        padding: 6px 10px; border-radius: 14px; border: 2px solid #fff; box-shadow: 0 3px 10px rgba(0,0,0,.3);
        margin-top: -7px; transition: transform .15s; }
      .kkm-pin::after { content: ''; position: absolute; left: 50%; bottom: -8px; width: 10px; height: 10px;
        background: var(--c, #FF7A00); border-right: 2px solid #fff; border-bottom: 2px solid #fff;
        transform: translateX(-50%) rotate(45deg); }
      .kkm-pin.on { transform: translate(-50%, -100%) scale(1.22); background: #fff; color: var(--c, #FF7A00);
        border-color: var(--c, #FF7A00); }
      .kkm-pin.on::after { background: #fff; border-color: var(--c, #FF7A00); }
      .kkm-cl { width: 40px; height: 40px; border-radius: 50%; background: var(--orange, #FF7A00); color: #fff;
        border: 3px solid #fff; box-shadow: 0 3px 12px rgba(0,0,0,.3); display: flex; align-items: center;
        justify-content: center; font: 800 14px 'Plus Jakarta Sans', sans-serif; }
      .kkm-me { width: 18px; height: 18px; border-radius: 50%; background: #2563EB; border: 3px solid #fff;
        box-shadow: 0 0 0 8px rgba(37,99,235,.22); }

      /* Tombol peta di kartu kos & di header */
      .kk-photo .kk-mapbtn { position: absolute; top: 10px; right: 52px; z-index: 2; width: 32px; height: 32px;
        background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,.15); color: #FF7A00; cursor: pointer; }
      .kk-mapbtn svg { width: 17px; height: 17px; }
      .kkm-entry { display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px; border-radius: 18px;
        background: var(--orange-light, #FFF0E0); color: var(--orange, #FF7A00);
        font: 800 12.5px 'Plus Jakarta Sans', sans-serif; cursor: pointer; border: 0; white-space: nowrap; }
      .kkm-entry svg { width: 15px; height: 15px; }
    `;
    document.head.appendChild(s);
  }

  const IKON = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    cari: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    lokasi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="8"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/></svg>',
    daftar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>'
  };

  // ---------- Kerangka halaman ----------
  function bangunLayar() {
    if (document.getElementById('screen-peta')) return;
    pasangCss();
    const app = document.getElementById('app');
    if (!app) return;
    const el = document.createElement('div');
    el.id = 'screen-peta';
    el.className = 'screen';
    el.innerHTML = `
      <div id="kkMapCanvas"></div>
      <div class="kkm-top">
        <div class="kkm-bar">
          <button class="kkm-round" id="kkmBack" aria-label="Kembali">${IKON.back}</button>
          <div class="kkm-search">${IKON.cari}<input id="kkmCari" type="search" placeholder="Cari nama kos atau alamat" autocomplete="off"></div>
        </div>
        <div class="kkm-chips" id="kkmChips">
          ${['Semua', 'Putra', 'Putri', 'Campur', 'Eksklusif'].map(j =>
            `<button class="kkm-chip${j === 'Semua' ? ' on' : ''}" data-j="${j}">${WARNA[j] ? `<i style="--c:${WARNA[j]}"></i>` : ''}${j}</button>`).join('')}
        </div>
      </div>
      <div class="kkm-note" id="kkmNote"></div>
      <div class="kkm-fabs">
        <button class="kkm-round" id="kkmLokasi" aria-label="Lokasi saya">${IKON.lokasi}</button>
        <button class="kkm-round" id="kkmDaftar" aria-label="Lihat daftar">${IKON.daftar}</button>
      </div>
      <button class="kkm-area" id="kkmArea"></button>
      <div class="kkm-cards" id="kkmCards"></div>`;
    app.appendChild(el);

    el.querySelector('#kkmBack').addEventListener('click', () => { window.show(asalLayar || 'dashboard'); });
    el.querySelector('#kkmDaftar').addEventListener('click', () => { if (typeof window.showSearch === 'function') window.showSearch(); });
    el.querySelector('#kkmLokasi').addEventListener('click', cariLokasiSaya);
    el.querySelector('#kkmArea').addEventListener('click', klikArea);
    el.querySelector('#kkmCari').addEventListener('input', e => {
      kataKunci = e.target.value.trim().toLowerCase();
      batasArea = null;
      segarkan(true);
    });
    el.querySelector('#kkmChips').addEventListener('click', e => {
      const b = e.target.closest('.kkm-chip'); if (!b) return;
      jenisAktif = b.dataset.j;
      el.querySelectorAll('.kkm-chip').forEach(c => c.classList.toggle('on', c === b));
      batasArea = null;
      segarkan(true);
    });
    el.querySelector('#kkmCards').addEventListener('scroll', () => {
      if (scrollProgram) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(pilihDariScroll, 140);
    }, { passive: true });
    el.querySelector('#kkmCards').addEventListener('click', e => {
      const c = e.target.closest('.kkm-card'); if (!c) return;
      if (typeof window.openDetail === 'function') window.openDetail(c.dataset.id);
    });
  }

  // ---------- Leaflet ----------
  function muatSkrip(src) {
    return new Promise(res => {
      const s = document.createElement('script');
      s.src = src; s.onload = () => res(true); s.onerror = () => res(false);
      document.head.appendChild(s);
      setTimeout(() => res(false), 7000);
    });
  }
  function muatCss(href) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l);
  }
  async function siapkanCluster() {
    if (clusterSiap || (window.L && L.markerClusterGroup)) { clusterSiap = true; return; }
    muatCss('https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css');
    const ok = await muatSkrip('https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js');
    clusterSiap = ok && !!(window.L && L.markerClusterGroup);
  }

  function pasangTile() {
    if (!peta) return;
    if (tileLayer) peta.removeLayer(tileLayer);
    tileLayer = L.tileLayer(gelap() ? TILE_GELAP : TILE_TERANG, {
      subdomains: 'abcd', maxZoom: 19, attribution: ATRIBUSI
    }).addTo(peta);
  }

  async function mulaiPeta() {
    if (peta) return;
    if (!window.L) { catatan('Peta belum termuat. Periksa koneksi internet.'); return; }
    await siapkanCluster();
    peta = L.map('kkMapCanvas', { zoomControl: false, attributionControl: true, zoomSnap: 0.5 })
      .setView(PUSAT_SOLO, 12);
    if (peta.attributionControl) peta.attributionControl.setPrefix(false);
    pasangTile();
    lapisPin = (clusterSiap && L.markerClusterGroup)
      ? L.markerClusterGroup({
          showCoverageOnHover: false, maxClusterRadius: 44, spiderfyOnMaxZoom: true,
          iconCreateFunction: c => L.divIcon({
            html: `<div class="kkm-cl">${c.getChildCount()}</div>`, className: 'kkm-pinwrap', iconSize: [40, 40]
          })
        })
      : L.layerGroup();
    lapisPin.addTo(peta);
    peta.on('dragend zoomend', () => {
      if (programGerak) return;
      tampilTombolArea(true);
    });
    peta.on('click', () => { /* ketuk peta kosong: tidak melakukan apa-apa */ });
    new MutationObserver(pasangTile).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  let programGerak = false;
  function gerakKe(ll, zoom, animasi) {
    if (!peta) return;
    programGerak = true;
    const z = zoom || Math.max(peta.getZoom(), 15);
    // geser sedikit ke bawah agar pin terlihat di atas kartu
    let tujuan = L.latLng(ll[0], ll[1]);
    try {
      const p = peta.project(tujuan, z).add([0, 70]);
      tujuan = peta.unproject(p, z);
    } catch (e) { /* pakai titik asli */ }
    peta.setView(tujuan, z, { animate: animasi !== false });
    setTimeout(() => { programGerak = false; }, 700);
  }

  // ---------- Data & tampilan ----------
  function hitungTampil() {
    const semua = semuaKos();
    let punya = semua.filter(adaKoordinat);
    const tanpa = semua.length - punya.length;
    punya = punya.filter(k => jenisAktif === 'Semua' || k.jenis_kos === jenisAktif);
    if (kataKunci) {
      punya = punya.filter(k => ((k.nama_kos || '') + ' ' + (k.alamat || '')).toLowerCase().includes(kataKunci));
    }
    return { punya, tanpa };
  }

  function ikonPin(k, on) {
    const c = WARNA[k.jenis_kos] || '#FF7A00';
    const cek = k.lokasi_terverifikasi ? ' ✓' : '';
    return L.divIcon({
      className: 'kkm-pinwrap', iconSize: [0, 0], iconAnchor: [0, 0],
      html: `<div class="kkm-pin${on ? ' on' : ''}" style="--c:${c}">${hargaSingkat(k.harga_per_bulan)}${cek}</div>`
    });
  }

  function gambarPin() {
    if (!peta || !lapisPin) return;
    lapisPin.clearLayers();
    pinById = {};
    dataTampil.forEach(k => {
      const m = L.marker([Number(k.latitude), Number(k.longitude)], {
        icon: ikonPin(k, k.id === aktifId), riseOnHover: true, keyboard: false
      });
      m.on('click', () => pilih(k.id, { dariPin: true }));
      m._kosId = k.id;
      pinById[k.id] = m;
      lapisPin.addLayer(m);
    });
  }

  function urutkan(list) {
    if (!posisiSaya) return list;
    return list.slice().sort((a, b) =>
      jarakM(posisiSaya.lat, posisiSaya.lng, Number(a.latitude), Number(a.longitude)) -
      jarakM(posisiSaya.lat, posisiSaya.lng, Number(b.latitude), Number(b.longitude)));
  }

  function gambarKartu(list) {
    const box = document.getElementById('kkmCards');
    if (!box) return;
    if (!list.length) {
      box.innerHTML = `<div class="kkm-kosong">${semuaKos().length ? 'Tidak ada kos yang cocok di peta.' : 'Memuat data kos…'}</div>`;
      return;
    }
    box.innerHTML = list.map(k => {
      const foto = (k.foto_urls && k.foto_urls.length) ? k.foto_urls[0] : null;
      const emoji = k.jenis_kos === 'Putra' ? '🪑' : k.jenis_kos === 'Eksklusif' ? '🏠' : '🛏️';
      let jr = '';
      if (posisiSaya) jr = fmtJarak(jarakM(posisiSaya.lat, posisiSaya.lng, Number(k.latitude), Number(k.longitude)));
      return `<div class="kkm-card${k.id === aktifId ? ' on' : ''}" data-id="${esc(k.id)}">
        <div class="kkm-ph">${foto ? `<img src="${esc(foto)}" loading="lazy" alt="">` : emoji}</div>
        <div class="kkm-bd">
          <span class="kkm-tag" style="background:${WARNA[k.jenis_kos] || '#FF7A00'}">${esc(k.jenis_kos)}${k.lokasi_terverifikasi ? ' · Lokasi ✓' : ''}</span>
          <div class="kkm-nm">${esc(k.nama_kos)}</div>
          <div class="kkm-ad">${esc(k.alamat)}</div>
          <div class="kkm-ft"><div class="kkm-pr">${hargaPenuh(k.harga_per_bulan)}<small>/bln</small></div>${jr ? `<div class="kkm-jr" title="Jarak lurus dari lokasimu">${jr}</div>` : ''}</div>
        </div></div>`;
    }).join('');
  }

  function segarkan(sesuaikanPeta) {
    if (!document.getElementById('screen-peta')) return;
    const { punya, tanpa } = hitungTampil();
    let list = punya;
    if (batasArea) list = punya.filter(k => batasArea.contains([Number(k.latitude), Number(k.longitude)]));
    dataTampil = punya;
    list = urutkan(list);
    if (!list.some(k => k.id === aktifId)) aktifId = list.length ? list[0].id : null;
    gambarPin();
    gambarKartu(list);
    if (sesuaikanPeta && peta && punya.length && !batasArea) {
      programGerak = true;
      if (punya.length === 1) {
        peta.setView([Number(punya[0].latitude), Number(punya[0].longitude)], 16);
      } else {
        const b = L.latLngBounds(punya.map(k => [Number(k.latitude), Number(k.longitude)]));
        peta.fitBounds(b, { paddingTopLeft: [40, 130], paddingBottomRight: [40, 200], maxZoom: 16 });
      }
      setTimeout(() => { programGerak = false; }, 700);
    }
    tampilTombolArea(false);
    if (tanpa > 0 && !segarkan._sudahCatat) {
      segarkan._sudahCatat = true;
      catatan(tanpa + ' kos belum menandai titik lokasi, jadi belum tampil di peta.');
    }
  }

  // ---------- Interaksi ----------
  function pilih(id, opsi) {
    opsi = opsi || {};
    const lama = aktifId;
    aktifId = id;
    const kosBaru = dataTampil.find(k => k.id === id);
    const kosLama = dataTampil.find(k => k.id === lama);
    if (lama && pinById[lama] && kosLama) pinById[lama].setIcon(ikonPin(kosLama, false));
    if (pinById[id] && kosBaru) {
      pinById[id].setIcon(ikonPin(kosBaru, true));
      try { pinById[id].setZIndexOffset(1000); } catch (e) { /* abaikan */ }
    }
    document.querySelectorAll('#kkmCards .kkm-card').forEach(c => c.classList.toggle('on', c.dataset.id === id));
    if (kosBaru && opsi.gerakPeta !== false) {
      const buka = () => gerakKe([Number(kosBaru.latitude), Number(kosBaru.longitude)], opsi.zoom, true);
      if (lapisPin && lapisPin.zoomToShowLayer && pinById[id] && lapisPin.getVisibleParent &&
          lapisPin.getVisibleParent(pinById[id]) !== pinById[id]) {
        programGerak = true;
        lapisPin.zoomToShowLayer(pinById[id], () => { programGerak = false; buka(); });
      } else buka();
    }
    if (opsi.dariPin) {
      const kartu = document.querySelector(`#kkmCards .kkm-card[data-id="${CSS.escape(id)}"]`);
      const box = document.getElementById('kkmCards');
      if (kartu && box) {
        scrollProgram = true;
        box.scrollTo({ left: Math.max(0, kartu.offsetLeft - 14), behavior: 'smooth' });
        setTimeout(() => { scrollProgram = false; }, 600);
      }
    }
  }

  function pilihDariScroll() {
    const box = document.getElementById('kkmCards'); if (!box) return;
    const kartu = [...box.querySelectorAll('.kkm-card')]; if (!kartu.length) return;
    let terbaik = kartu[0], selisih = Infinity;
    kartu.forEach(c => {
      const d = Math.abs((c.offsetLeft - 14) - box.scrollLeft);
      if (d < selisih) { selisih = d; terbaik = c; }
    });
    if (terbaik.dataset.id !== aktifId) pilih(terbaik.dataset.id, {});
  }

  function tampilTombolArea(tampil) {
    const b = document.getElementById('kkmArea'); if (!b) return;
    if (batasArea) {
      b.textContent = 'Menampilkan kos di area ini · ketuk untuk semua';
      b.classList.add('show');
    } else if (tampil) {
      b.textContent = 'Tampilkan kos di area ini';
      b.classList.add('show');
    } else {
      b.classList.remove('show');
    }
  }
  function klikArea() {
    if (batasArea) { batasArea = null; segarkan(true); return; }
    if (!peta) return;
    batasArea = peta.getBounds();
    segarkan(false);
    const { punya } = hitungTampil();
    const n = punya.filter(k => batasArea.contains([Number(k.latitude), Number(k.longitude)])).length;
    if (!n) catatan('Belum ada kos di area ini. Geser atau perkecil peta.');
  }

  let catatTimer = null;
  function catatan(teks) {
    const n = document.getElementById('kkmNote'); if (!n) return;
    n.textContent = teks; n.classList.add('show');
    clearTimeout(catatTimer);
    catatTimer = setTimeout(() => n.classList.remove('show'), 4200);
  }

  function cariLokasiSaya() {
    if (!navigator.geolocation) { catatan('Perangkat ini tidak mendukung lokasi.'); return; }
    catatan('Mencari lokasimu…');
    navigator.geolocation.getCurrentPosition(pos => {
      posisiSaya = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (peta) {
        if (penandaSaya) peta.removeLayer(penandaSaya);
        penandaSaya = L.marker([posisiSaya.lat, posisiSaya.lng], {
          icon: L.divIcon({ className: 'kkm-pinwrap', iconSize: [0, 0], html: '<div class="kkm-me" style="position:absolute;transform:translate(-50%,-50%)"></div>' }),
          interactive: false, keyboard: false
        }).addTo(peta);
        programGerak = true;
        peta.setView([posisiSaya.lat, posisiSaya.lng], 15);
        setTimeout(() => { programGerak = false; }, 700);
      }
      segarkan(false);
      const box = document.getElementById('kkmCards'); if (box) box.scrollLeft = 0;
      catatan('Kos diurutkan dari yang terdekat denganmu.');
    }, err => {
      catatan(err && err.code === 1 ? 'Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser.' : 'Lokasi tidak ditemukan. Coba lagi.');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  }

  // ---------- Pintu masuk ----------
  async function bukaPeta(fokusId) {
    bangunLayar();
    if (currentScreen !== 'peta') asalLayar = currentScreen || 'dashboard';
    window.show('peta');
    await mulaiPeta();
    if (!semuaKos().length && typeof window.loadKosData === 'function') {
      segarkan(false);
      try { await window.loadKosData(); } catch (e) { /* abaikan */ }
    }
    if (fokusId) { jenisAktif = 'Semua'; kataKunci = ''; batasArea = null; aktifId = fokusId; }
    const inp = document.getElementById('kkmCari'); if (inp && fokusId) inp.value = '';
    document.querySelectorAll('#kkmChips .kkm-chip').forEach(c => c.classList.toggle('on', c.dataset.j === jenisAktif));
    setTimeout(() => {
      if (peta) peta.invalidateSize();
      segarkan(!fokusId);
      if (fokusId) {
        const k = dataTampil.find(x => x.id === fokusId);
        if (k) {
          pilih(fokusId, { dariPin: true, zoom: 16 });
        } else catatan('Kos ini belum menandai titik lokasi.');
      }
    }, 60);
  }
  window.showPeta = function () { return bukaPeta(null); };
  window.bukaPetaKos = function (id) { return bukaPeta(id); };

  // Pastikan peta menyesuaikan ukuran saat layar dibuka kembali (mis. dari Detail)
  const asliShow = window.show;
  if (typeof asliShow === 'function') {
    window.show = function (id) {
      const r = asliShow.apply(this, arguments);
      if (id === 'peta' && peta) setTimeout(() => { try { peta.invalidateSize(); } catch (e) { /* abaikan */ } }, 80);
      return r;
    };
  }

  // Dari Detail Kos: tombol ← kembali ke Peta bila dibuka dari Peta
  const asliOpen = window.openDetail;
  if (typeof asliOpen === 'function') {
    window.openDetail = function () {
      window.__kkDariPeta = (currentScreen === 'peta');
      return asliOpen.apply(this, arguments);
    };
  }
  document.addEventListener('click', e => {
    if (!window.__kkDariPeta || currentScreen !== 'detail') return;
    const b = e.target.closest && e.target.closest('#screen-detail .detail-back');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    window.__kkDariPeta = false;
    window.show('peta');
  }, true);

  // Data kos selesai dimuat → segarkan peta bila sedang dibuka
  const asliLoad = window.loadKosData;
  if (typeof asliLoad === 'function') {
    window.loadKosData = async function () {
      const r = await asliLoad.apply(this, arguments);
      if (currentScreen === 'peta') segarkan(true);
      return r;
    };
  }

  // Tombol pin di kartu kos
  const asliKartu = window.renderKosListCard;
  if (typeof asliKartu === 'function') {
    window.renderKosListCard = function (kos) {
      let html = asliKartu.apply(this, arguments);
      try {
        if (adaKoordinat(kos)) {
          html = html.replace('<div class="fav-btn"',
            `<div class="kk-mapbtn" title="Lihat di peta" onclick="event.stopPropagation();bukaPetaKos('${esc(kos.id)}')">${IKON.pin}</div><div class="fav-btn"`);
        }
      } catch (e) { /* abaikan */ }
      return html;
    };
  }

  // Tombol di Beranda & Cari Kos
  function pasangPintu() {
    pasangCss();
    const lihatSemua = [...document.querySelectorAll('#screen-dashboard div[onclick="showSearch()"]')].find(d => /Lihat Semua/.test(d.textContent));
    const rowTitle = [...document.querySelectorAll('#screen-dashboard div')].find(d => d.textContent.trim() === 'Rekomendasi Kos' && !d.children.length);
    if (rowTitle && rowTitle.parentElement && !document.getElementById('kkmEntryDash')) {
      const b = document.createElement('button');
      b.id = 'kkmEntryDash'; b.className = 'kkm-entry'; b.type = 'button';
      b.innerHTML = IKON.pin + 'Peta';
      b.style.marginLeft = 'auto'; b.style.marginRight = '12px';
      b.addEventListener('click', () => bukaPeta(null));
      const aksi = lihatSemua && lihatSemua.parentElement === rowTitle.parentElement ? lihatSemua : null;
      if (aksi) rowTitle.parentElement.insertBefore(b, aksi); else rowTitle.parentElement.appendChild(b);
    }
    const judul = document.querySelector('#screen-search .search-header h2');
    if (judul && judul.parentElement && !document.getElementById('kkmEntrySearch')) {
      const b = document.createElement('button');
      b.id = 'kkmEntrySearch'; b.className = 'kkm-entry'; b.type = 'button';
      b.innerHTML = IKON.pin + 'Peta';
      b.style.marginLeft = 'auto';
      b.addEventListener('click', () => bukaPeta(null));
      judul.parentElement.appendChild(b);
    }
  }

  function mulai() { pasangPintu(); bangunLayar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
