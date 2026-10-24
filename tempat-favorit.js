// =====================================================
// KosKu Solo — Tempat Favorit (Tahap 2 Peta)
// Dimuat lewat: <script src="tempat-favorit.js"></script>  (setelah peta-kos.js)
// Butuh tabel Supabase: tempat_favorit  (lihat tempat-favorit.sql)
//
// Isi:
//  - Lencana tempat (kampus, mal, pasar, stasiun, RS, bisnis, wisata) di Peta
//  - Chip kategori untuk menampilkan / menyembunyikan tempat
//  - Ketuk tempat: lingkaran radius + jarak & estimasi waktu ke setiap kos,
//    kos diurutkan dari yang terdekat
//  - Bagian "Dekat dari sini" di halaman Detail Kos
//  - Tab "Tempat" di panel Admin: tambah / edit / nonaktifkan / hapus
// =====================================================

(function () {
  'use strict';
  if (window.__kkTempatReady) return;
  window.__kkTempatReady = true;

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const KATEGORI = ['Kampus', 'Mal', 'Pasar', 'Transportasi', 'Rumah Sakit', 'Bisnis', 'Wisata'];
  const WARNA = {
    Kampus: '#2563EB', Mal: '#DB2777', Pasar: '#EA580C', Transportasi: '#059669',
    'Rumah Sakit': '#DC2626', Bisnis: '#475569', Wisata: '#7C3AED'
  };
  const NAMA_KAT = { Transportasi: 'Stasiun/Terminal', Bisnis: 'Area Bisnis' };
  const namaKat = k => NAMA_KAT[k] || k;
  const SVG = {
    Kampus: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    Mal: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/>',
    Pasar: '<path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
    Transportasi: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14"/><circle cx="9" cy="14" r=".7"/><circle cx="15" cy="14" r=".7"/><path d="M8 21l2-4M16 21l-2-4"/>',
    'Rumah Sakit': '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
    Bisnis: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M3 13h18"/>',
    Wisata: '<path d="M3 21h18M5 21V10l7-6 7 6v11"/><path d="M9 21v-6h6v6"/>'
  };
  const ikon = (kat, ukuran) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"${ukuran ? ` width="${ukuran}" height="${ukuran}"` : ''}>${SVG[kat] || SVG.Wisata}</svg>`;

  // ---------- Util ----------
  function jarakM(a, b, c, d) {
    const R = 6371000, r = Math.PI / 180;
    const x = Math.sin((c - a) * r / 2) ** 2 +
      Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
  }
  function fmtJarak(m) {
    return m < 1000 ? Math.round(m / 10) * 10 + ' m' : (m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',') + ' km';
  }
  function estimasi(m) {
    // Jarak lurus dikali 1,3 sebagai perkiraan jarak lewat jalan
    if (m <= 1500) return '±' + Math.max(1, Math.ceil(m * 1.3 / 80)) + ' mnt jalan kaki';
    return '±' + Math.max(1, Math.ceil(m * 1.3 / 450)) + ' mnt naik motor';
  }
  const adaTitik = k => k && k.latitude != null && k.longitude != null &&
    isFinite(Number(k.latitude)) && isFinite(Number(k.longitude));

  // ---------- Data ----------
  let tempat = [];
  let dimuatPada = 0;
  let sedangMuat = null;

  async function muatTempat(paksa) {
    if (!paksa && tempat.length && Date.now() - dimuatPada < 10 * 60 * 1000) return tempat;
    if (sedangMuat) return sedangMuat;
    sedangMuat = (async () => {
      try {
        const { data, error } = await sbClient.from('tempat_favorit').select('*').eq('aktif', true).order('urutan');
        if (error) throw error;
        tempat = (data || []).filter(adaTitik).map(t => Object.assign({}, t, { latitude: Number(t.latitude), longitude: Number(t.longitude) }));
        dimuatPada = Date.now();
      } catch (e) {
        console.warn('Tempat favorit belum bisa dimuat:', e && e.message);
      }
      sedangMuat = null;
      return tempat;
    })();
    return sedangMuat;
  }

  // ---------- Gaya ----------
  function pasangCss() {
    if (document.getElementById('kktCss')) return;
    const s = document.createElement('style');
    s.id = 'kktCss';
    s.textContent = `
      /* Lencana tempat di peta */
      .kkt-wrap { background: transparent; border: 0; }
      .kkt-badge { position: absolute; left: 0; top: 0; transform: translate(-50%, -50%); display: flex; flex-direction: column;
        align-items: center; gap: 3px; cursor: pointer; }
      .kkt-badge .kkt-ic { width: 44px; height: 44px; border-radius: 50%; background: var(--c); color: #fff; border: 3px solid #fff;
        box-shadow: 0 4px 14px rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; transition: transform .15s; }
      .kkt-badge .kkt-ic svg { width: 23px; height: 23px; }
      .kkt-badge .kkt-lab { font: 800 11.5px 'Plus Jakarta Sans', sans-serif; color: #1f2937; white-space: nowrap;
        -webkit-text-stroke: 3.5px #fff; paint-order: stroke fill; letter-spacing: .1px; }
      .kkt-badge.on .kkt-ic { transform: scale(1.22); box-shadow: 0 0 0 5px rgba(255,122,0,.35), 0 4px 14px rgba(0,0,0,.35); }
      #kkMapCanvas.kkt-z-lo .kkt-lab { display: none; }
      #kkMapCanvas.kkt-z-xlo .kkt-badge { display: none; }

      /* Baris chip kategori tempat */
      .kkt-chips { display: flex; gap: 8px; overflow-x: auto; padding: 2px 14px 6px; margin: 0 -14px; pointer-events: auto; scrollbar-width: none; }
      .kkt-chips::-webkit-scrollbar { display: none; }
      .kkt-chip { flex: none; display: flex; align-items: center; gap: 6px; padding: 5px 12px 5px 6px; border-radius: 20px;
        background: var(--card, #fff); box-shadow: 0 3px 10px rgba(20,20,40,.16); border: 0; cursor: pointer;
        font: 700 12px 'Plus Jakarta Sans', sans-serif; color: var(--text, #222); }
      .kkt-chip i { width: 24px; height: 24px; border-radius: 50%; background: var(--c); color: #fff; display: flex; align-items: center; justify-content: center; }
      .kkt-chip i svg { width: 14px; height: 14px; }
      .kkt-chip.off { opacity: .5; }
      .kkt-chip.off i { background: #9CA3AF; }
      .kkt-info { display: none; align-items: center; gap: 10px; margin-top: 4px; padding: 9px 10px 9px 12px; border-radius: 18px; pointer-events: auto;
        background: var(--card, #fff); box-shadow: 0 6px 18px rgba(20,20,40,.22); border: 2px solid var(--orange, #FF7A00); }
      .kkt-info.show { display: flex; }
      .kkt-info .kkt-ic2 { flex: none; width: 34px; height: 34px; border-radius: 50%; background: var(--c); color: #fff; display: flex; align-items: center; justify-content: center; }
      .kkt-info .kkt-ic2 svg { width: 19px; height: 19px; }
      .kkt-info .kkt-tx { flex: 1; min-width: 0; font: 700 12px 'Plus Jakarta Sans', sans-serif; color: var(--text-2, #555); line-height: 1.3; }
      .kkt-info .kkt-tx b { display: block; font-size: 13.5px; color: var(--text, #222); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .kkt-info .kkt-x { flex: none; width: 30px; height: 30px; border-radius: 50%; background: var(--bg-2, #F1F2F4); color: var(--text-2, #555);
        display: flex; align-items: center; justify-content: center; font-size: 15px; cursor: pointer; border: 0; }
      .kkm-note { top: calc(176px + env(safe-area-inset-top, 0px)) !important; }

      /* Jarak di pin & kartu kos */
      .kkm-pin small { display: block; font: 700 10px 'Plus Jakarta Sans', sans-serif; opacity: .92; line-height: 1.15; margin-top: 1px; text-align: center; }
      .kkt-jr { display: flex; align-items: center; gap: 5px; font: 700 11px 'Plus Jakarta Sans', sans-serif; color: var(--c); }
      .kkt-jr svg { width: 13px; height: 13px; flex: none; }
      .kkt-jr span { color: var(--text-2, #666); font-weight: 600; }

      /* Detail kos: Dekat dari sini */
      #kkDekat .kkd-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border, #EEE); }
      #kkDekat .kkd-row:last-child { border-bottom: 0; }
      #kkDekat .kkd-ic { flex: none; width: 40px; height: 40px; border-radius: 13px; background: var(--c); color: #fff; display: flex; align-items: center; justify-content: center; }
      #kkDekat .kkd-ic svg { width: 21px; height: 21px; }
      #kkDekat .kkd-bd { flex: 1; min-width: 0; }
      #kkDekat .kkd-bd b { display: block; font: 700 13.5px 'Plus Jakarta Sans', sans-serif; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      #kkDekat .kkd-bd span { font: 500 11.5px 'Plus Jakarta Sans', sans-serif; color: var(--text-3); }
      #kkDekat .kkd-jr { flex: none; text-align: right; font: 800 13px 'Plus Jakarta Sans', sans-serif; color: var(--orange); }
      #kkDekat .kkd-jr small { display: block; font: 500 10.5px 'Plus Jakarta Sans', sans-serif; color: var(--text-3); }

      /* Panel Admin */
      .kkta-bar { display: flex; gap: 8px; margin-bottom: 10px; }
      .kkta-bar input { flex: 1; min-width: 0; padding: 10px 12px; border: 1.5px solid #E5E7EB; border-radius: 10px; font: 600 13px 'Plus Jakarta Sans', sans-serif; background: #fff; color: #111; outline: 0; }
      .kkta-chips { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 12px; padding-bottom: 2px; scrollbar-width: none; }
      .kkta-chips::-webkit-scrollbar { display: none; }
      .kkta-chips button { flex: none; padding: 6px 12px; border-radius: 16px; border: 1.5px solid #E5E7EB; background: #fff; color: #555; font: 700 12px 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
      .kkta-chips button.on { background: var(--orange, #FF7A00); border-color: var(--orange, #FF7A00); color: #fff; }
      .kkta-row { background: #fff; border-radius: 14px; padding: 12px; margin-bottom: 10px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
      .kkta-top { display: flex; align-items: center; gap: 12px; }
      .kkta-ic { flex: none; width: 42px; height: 42px; border-radius: 13px; background: var(--c); color: #fff; display: flex; align-items: center; justify-content: center; }
      .kkta-ic svg { width: 22px; height: 22px; }
      .kkta-bd { flex: 1; min-width: 0; }
      .kkta-bd b { display: block; font: 700 13.5px 'Plus Jakarta Sans', sans-serif; color: #111; }
      .kkta-bd span { font: 500 11.5px 'Plus Jakarta Sans', sans-serif; color: #6B7280; }
      .kkta-st { flex: none; font: 700 11px 'Plus Jakarta Sans', sans-serif; padding: 3px 9px; border-radius: 50px; background: #DCFCE7; color: #16A34A; }
      .kkta-st.off { background: #F3F4F6; color: #9CA3AF; }
      .kkta-act { display: flex; gap: 8px; margin-top: 10px; }
      .kkta-act button { flex: 1; padding: 8px; border: 0; border-radius: 8px; background: #F3F4F6; color: #111; font: 700 12px 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
      .kkta-act button.del { background: #FEE2E2; color: #DC2626; }
      .kkta-add { background: var(--orange, #FF7A00); color: #fff; border: 0; border-radius: 10px; padding: 10px 14px; font: 700 12.5px 'Plus Jakarta Sans', sans-serif; cursor: pointer; white-space: nowrap; }

      #kktModal { position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; justify-content: center; }
      #kktModal .kkt-sheet { width: 100%; max-width: 430px; max-height: 94vh; overflow-y: auto; background: #fff; color: #111; border-radius: 24px 24px 0 0; padding: 16px 18px calc(20px + env(safe-area-inset-bottom, 0px)); }
      #kktModal h3 { font: 800 17px 'Plus Jakarta Sans', sans-serif; margin: 2px 0 12px; }
      #kktModal label { display: block; font: 700 12px 'Plus Jakarta Sans', sans-serif; color: #374151; margin: 10px 0 5px; }
      #kktModal input, #kktModal select { width: 100%; padding: 11px 12px; border: 1.5px solid #E5E7EB; border-radius: 10px; font: 600 14px 'Plus Jakarta Sans', sans-serif; background: #fff; color: #111; outline: 0; }
      #kktModal .kkt-row2 { display: flex; gap: 10px; }
      #kktModal .kkt-row2 > div { flex: 1; min-width: 0; }
      #kktPick { height: 230px; border-radius: 14px; overflow: hidden; border: 1.5px solid #E5E7EB; margin-top: 6px; }
      #kktModal .kkt-hint { font: 500 11.5px 'Plus Jakarta Sans', sans-serif; color: #6B7280; margin-top: 5px; line-height: 1.4; }
      #kktModal .kkt-btns { display: flex; gap: 10px; margin-top: 16px; }
      #kktModal .kkt-btns button { flex: 1; padding: 13px; border: 0; border-radius: 12px; font: 800 14px 'Plus Jakarta Sans', sans-serif; cursor: pointer; background: #F3F4F6; color: #111; }
      #kktModal .kkt-btns button.ok { background: var(--orange, #FF7A00); color: #fff; }
      #kktModal .kkt-err { color: #DC2626; font: 600 12px 'Plus Jakarta Sans', sans-serif; margin-top: 10px; display: none; }
      #kktModal .kkt-mini { margin-top: 8px; padding: 8px 12px; border: 1.5px solid var(--orange, #FF7A00); background: #fff; color: var(--orange, #FF7A00); border-radius: 10px; font: 700 12px 'Plus Jakarta Sans', sans-serif; cursor: pointer; }
      #kktModal .kkt-sw { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; font: 700 13px 'Plus Jakarta Sans', sans-serif; }
      #kktModal .kkt-sw input { width: 22px; height: 22px; }
    `;
    document.head.appendChild(s);
  }

  // =====================================================
  // BAGIAN 1 — Peta pencari
  // =====================================================
  let peta = null;
  let lapis = null;
  let lingkaran = [];
  let aktifId = null;
  let katOn = new Set(KATEGORI);

  function aktif() { return aktifId ? tempat.find(t => t.id === aktifId) : null; }

  function bangunBarisChip() {
    const top = document.querySelector('#screen-peta .kkm-top');
    if (!top) return;
    let row = document.getElementById('kktChips');
    if (!row) {
      row = document.createElement('div');
      row.id = 'kktChips'; row.className = 'kkt-chips';
      row.addEventListener('click', e => {
        const b = e.target.closest('.kkt-chip'); if (!b) return;
        const k = b.dataset.k;
        if (katOn.has(k)) katOn.delete(k); else katOn.add(k);
        if (aktif() && !katOn.has(aktif().kategori)) bersihkanPilihan(true);
        b.classList.toggle('off', !katOn.has(k));
        gambarTempat();
      });
      const kosChips = document.getElementById('kkmChips');
      if (kosChips && kosChips.nextSibling) top.insertBefore(row, kosChips.nextSibling); else top.appendChild(row);
      const info = document.createElement('div');
      info.id = 'kktInfo'; info.className = 'kkt-info';
      info.addEventListener('click', e => { if (e.target.closest('.kkt-x')) bersihkanPilihan(false); });
      top.appendChild(info);
    }
    const ada = KATEGORI.filter(k => tempat.some(t => t.kategori === k));
    row.innerHTML = ada.map(k =>
      `<button class="kkt-chip${katOn.has(k) ? '' : ' off'}" data-k="${esc(k)}" style="--c:${WARNA[k]}"><i>${ikon(k)}</i>${esc(namaKat(k))}</button>`).join('');
    row.style.display = ada.length ? 'flex' : 'none';
  }

  function ikonTempat(t) {
    return L.divIcon({
      className: 'kkt-wrap', iconSize: [0, 0], iconAnchor: [0, 0],
      html: `<div class="kkt-badge${t.id === aktifId ? ' on' : ''}" style="--c:${WARNA[t.kategori] || '#475569'}"><div class="kkt-ic">${ikon(t.kategori)}</div><div class="kkt-lab">${esc(t.nama_singkat)}</div></div>`
    });
  }

  function gambarTempat() {
    if (!peta || !window.L) return;
    if (!lapis) lapis = L.layerGroup().addTo(peta);
    lapis.clearLayers();
    tempat.filter(t => katOn.has(t.kategori)).forEach(t => {
      const m = L.marker([t.latitude, t.longitude], { icon: ikonTempat(t), zIndexOffset: 500, keyboard: false, riseOnHover: true });
      m.on('click', () => pilihTempat(t.id));
      lapis.addLayer(m);
    });
  }

  function aturZoomKelas() {
    const c = document.getElementById('kkMapCanvas'); if (!c || !peta) return;
    const z = peta.getZoom();
    c.classList.toggle('kkt-z-lo', z < 13);
    c.classList.toggle('kkt-z-xlo', z < 11);
  }

  function hapusLingkaran() {
    lingkaran.forEach(c => { try { peta.removeLayer(c); } catch (e) { /* abaikan */ } });
    lingkaran = [];
  }

  function perbaruiInfo() {
    const el = document.getElementById('kktInfo'); if (!el) return;
    const t = aktif();
    if (!t) { el.classList.remove('show'); el.innerHTML = ''; return; }
    const dalam = (window.KKPeta ? window.KKPeta.kos() : []).filter(k =>
      adaTitik(k) && jarakM(t.latitude, t.longitude, Number(k.latitude), Number(k.longitude)) <= 2000).length;
    el.innerHTML = `<div class="kkt-ic2" style="--c:${WARNA[t.kategori]}">${ikon(t.kategori)}</div>
      <div class="kkt-tx"><b>${esc(t.nama)}</b>${dalam ? dalam + ' kos dalam 2 km · diurutkan dari terdekat' : 'Belum ada kos dalam 2 km'}</div>
      <button class="kkt-x" aria-label="Tutup">✕</button>`;
    el.classList.add('show');
  }

  function pilihTempat(id) {
    if (aktifId === id) { bersihkanPilihan(false); return; }
    aktifId = id;
    const t = aktif(); if (!t || !peta) return;
    hapusLingkaran();
    lingkaran.push(L.circle([t.latitude, t.longitude], { radius: 1000, color: '#FF7A00', weight: 2, dashArray: '6 6', fillColor: '#FF7A00', fillOpacity: 0.09, interactive: false }).addTo(peta));
    lingkaran.push(L.circle([t.latitude, t.longitude], { radius: 2000, color: '#FF7A00', weight: 1.5, opacity: 0.5, dashArray: '3 8', fillColor: '#FF7A00', fillOpacity: 0.04, interactive: false }).addTo(peta));
    gambarTempat();
    if (window.KKPeta) window.KKPeta.segarkan();
    perbaruiInfo();
    // Arahkan peta: tempat + 3 kos terdekat
    const terdekat = (window.KKPeta ? window.KKPeta.kos() : []).filter(adaTitik)
      .map(k => ({ k, d: jarakM(t.latitude, t.longitude, Number(k.latitude), Number(k.longitude)) }))
      .sort((a, b) => a.d - b.d).slice(0, 3);
    const gerak = () => {
      if (terdekat.length) {
        const pts = [[t.latitude, t.longitude]].concat(terdekat.map(x => [Number(x.k.latitude), Number(x.k.longitude)]));
        peta.fitBounds(L.latLngBounds(pts), { paddingTopLeft: [50, 230], paddingBottomRight: [50, 210], maxZoom: 16 });
      } else peta.setView([t.latitude, t.longitude], 15);
    };
    if (window.KKPeta && window.KKPeta.gerak) window.KKPeta.gerak(gerak); else gerak();
    const box = document.getElementById('kkmCards'); if (box) box.scrollLeft = 0;
  }

  function bersihkanPilihan(tanpaSegar) {
    aktifId = null;
    if (peta) hapusLingkaran();
    gambarTempat();
    perbaruiInfo();
    if (!tanpaSegar && window.KKPeta) window.KKPeta.segarkan();
  }

  // Kait ke peta-kos.js
  function pasangKait() {
    window.KKPeta = Object.assign(window.KKPeta || {}, {
      urutan(list) {
        const t = aktif(); if (!t) return null;
        const d = k => adaTitik(k) ? jarakM(t.latitude, t.longitude, Number(k.latitude), Number(k.longitude)) : 1e12;
        return list.slice().sort((a, b) => d(a) - d(b));
      },
      ekstraPin(k) {
        const t = aktif(); if (!t || !adaTitik(k)) return '';
        return '<small>' + fmtJarak(jarakM(t.latitude, t.longitude, Number(k.latitude), Number(k.longitude))) + '</small>';
      },
      ekstraKartu(k) {
        const t = aktif(); if (!t || !adaTitik(k)) return '';
        const d = jarakM(t.latitude, t.longitude, Number(k.latitude), Number(k.longitude));
        return `<div class="kkt-jr" style="--c:${WARNA[t.kategori]}">${ikon(t.kategori)}${fmtJarak(d)} ke ${esc(t.nama_singkat)} <span>· ${estimasi(d)}</span></div>`;
      }
    });
  }

  async function siapPeta(map) {
    peta = map || (window.KKPeta && window.KKPeta.peta());
    if (!peta || !window.L) return;
    pasangCss();
    await muatTempat(false);
    bangunBarisChip();
    gambarTempat();
    aturZoomKelas();
    if (!peta.__kktZoom) { peta.__kktZoom = true; peta.on('zoomend', aturZoomKelas); }
  }

  pasangKait();
  document.addEventListener('kk:peta-siap', e => { siapPeta(e.detail && e.detail.map); });
  // Saat peta dibuka lagi: muat ulang tempat bila data sudah lama
  const asliShow = window.show;
  if (typeof asliShow === 'function') {
    window.show = function (id) {
      const r = asliShow.apply(this, arguments);
      if (id === 'peta' && window.KKPeta && window.KKPeta.peta()) {
        muatTempat(false).then(() => { bangunBarisChip(); gambarTempat(); });
      }
      return r;
    };
  }

  // =====================================================
  // BAGIAN 2 — Detail Kos: "Dekat dari sini"
  // =====================================================
  async function isiDekat(kos) {
    const anchor = document.getElementById('detailLeafletMap');
    const lama = document.getElementById('kkDekat');
    if (lama) lama.remove();
    if (!anchor || !adaTitik(kos)) return;
    const ls = Number(kos.latitude), ln = Number(kos.longitude);
    await muatTempat(false);
    if (!tempat.length || (window.selectedKos && selectedKos.id !== kos.id)) return;
    // Satu tempat terdekat dari setiap kategori, urut dari yang paling dekat
    const terdekatPerKat = [];
    KATEGORI.forEach(kat => {
      const dalam = tempat.filter(t => t.kategori === kat)
        .map(t => ({ t, d: jarakM(ls, ln, t.latitude, t.longitude) })).sort((a, b) => a.d - b.d)[0];
      if (dalam && dalam.d <= 15000) terdekatPerKat.push(dalam);
    });
    terdekatPerKat.sort((a, b) => a.d - b.d);
    const daftar = terdekatPerKat.slice(0, 6);
    if (!daftar.length) return;
    const blok = anchor.closest('.detail-body');
    if (!blok) return;
    pasangCss();
    const wrap = document.createElement('div');
    wrap.id = 'kkDekat';
    wrap.innerHTML = `<div class="section-divider"></div>
      <div class="detail-body" style="padding-top:0">
        <div class="detail-section-title">Dekat dari sini</div>
        ${daftar.map(({ t, d }) => `
          <div class="kkd-row" style="--c:${WARNA[t.kategori]}">
            <div class="kkd-ic">${ikon(t.kategori)}</div>
            <div class="kkd-bd"><b>${esc(t.nama)}</b><span>${esc(namaKat(t.kategori))}</span></div>
            <div class="kkd-jr">${fmtJarak(d)}<small>${estimasi(d)}</small></div>
          </div>`).join('')}
        <div style="font-size:11px;color:var(--text-3);margin-top:8px">Jarak lurus dari kos. Perkiraan waktu bisa berbeda tergantung rute.</div>
      </div>`;
    blok.parentElement.insertBefore(wrap, blok.nextSibling);
  }

  const asliRender = window.renderDetailScreen;
  if (typeof asliRender === 'function') {
    window.renderDetailScreen = function (kos) {
      const r = asliRender.apply(this, arguments);
      try { isiDekat(kos); } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // =====================================================
  // BAGIAN 3 — Panel Admin: tab "Tempat"
  // =====================================================
  let adminData = [];
  let adminKat = 'Semua';
  let adminCari = '';

  function pasangTabAdmin() {
    const contoh = document.getElementById('tab-users');
    if (!contoh || document.getElementById('tab-tempat')) return;
    const t = contoh.cloneNode(true);
    t.id = 'tab-tempat';
    t.textContent = '📍 Tempat';
    t.setAttribute('onclick', "switchAdminTab('tempat')");
    t.style.borderBottomColor = 'transparent';
    t.style.color = 'var(--text-3)';
    contoh.parentElement.appendChild(t);
  }

  const asliSwitch = window.switchAdminTab;
  if (typeof asliSwitch === 'function') {
    window.switchAdminTab = function (tab) {
      pasangTabAdmin();
      const t = document.getElementById('tab-tempat');
      if (tab === 'tempat') {
        ['stats', 'banner', 'kos', 'users'].forEach(x => {
          const e = document.getElementById('tab-' + x);
          if (e) { e.style.borderBottomColor = 'transparent'; e.style.color = 'var(--text-3)'; }
        });
        if (t) { t.style.borderBottomColor = 'var(--orange)'; t.style.color = 'var(--orange)'; }
        return muatPanelAdmin();
      }
      if (t) { t.style.borderBottomColor = 'transparent'; t.style.color = 'var(--text-3)'; }
      return asliSwitch.apply(this, arguments);
    };
  }

  async function muatPanelAdmin() {
    pasangCss();
    const el = document.getElementById('adminContent'); if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--text-3)">Memuat tempat...</div>';
    try {
      const { data, error } = await sbClient.from('tempat_favorit').select('*').order('urutan');
      if (error) throw error;
      adminData = data || [];
      gambarPanelAdmin();
    } catch (err) {
      const belum = /relation|does not exist|schema cache/i.test(err.message || '');
      el.innerHTML = `<div style="text-align:center;padding:40px 16px;color:var(--red,#DC2626);font-size:13px;line-height:1.5">
        ${belum ? 'Tabel tempat_favorit belum dibuat. Jalankan file tempat-favorit.sql di Supabase → SQL Editor.' : 'Gagal memuat: ' + esc(err.message)}</div>`;
    }
  }

  function gambarPanelAdmin() {
    const el = document.getElementById('adminContent'); if (!el) return;
    const cari = adminCari.toLowerCase();
    const list = adminData.filter(t =>
      (adminKat === 'Semua' || t.kategori === adminKat) &&
      (!cari || (t.nama + ' ' + t.nama_singkat).toLowerCase().includes(cari)));
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div><div style="font-size:14px;font-weight:700">Tempat Favorit</div>
          <div style="font-size:11.5px;color:#6B7280">${adminData.length} tempat · ${adminData.filter(t => t.aktif).length} aktif</div></div>
        <button class="kkta-add" onclick="kktBukaForm(null)">+ Tambah</button>
      </div>
      <div class="kkta-bar"><input id="kktaCari" type="search" placeholder="Cari nama tempat" value="${esc(adminCari)}"></div>
      <div class="kkta-chips">
        ${['Semua'].concat(KATEGORI).map(k => `<button class="${adminKat === k ? 'on' : ''}" data-k="${esc(k)}">${esc(k === 'Semua' ? 'Semua' : namaKat(k))}</button>`).join('')}
      </div>
      ${list.length ? list.map(t => `
        <div class="kkta-row" style="--c:${WARNA[t.kategori] || '#475569'}">
          <div class="kkta-top">
            <div class="kkta-ic">${ikon(t.kategori)}</div>
            <div class="kkta-bd"><b>${esc(t.nama)}</b><span>${esc(namaKat(t.kategori))} · label "${esc(t.nama_singkat)}"</span></div>
            <div class="kkta-st ${t.aktif ? '' : 'off'}">${t.aktif ? 'Aktif' : 'Nonaktif'}</div>
          </div>
          <div class="kkta-act">
            <button onclick="kktBukaForm('${esc(t.id)}')">Edit</button>
            <button onclick="kktToggle('${esc(t.id)}')">${t.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
            <button class="del" onclick="kktHapus('${esc(t.id)}')">Hapus</button>
          </div>
        </div>`).join('') : '<div style="text-align:center;padding:30px 0;color:#9CA3AF;font-size:13px">Tidak ada tempat.</div>'}`;
    const inp = document.getElementById('kktaCari');
    if (inp) inp.addEventListener('input', e => {
      adminCari = e.target.value.trim();
      const pos = e.target.selectionStart;
      gambarPanelAdmin();
      const n = document.getElementById('kktaCari'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) { /* abaikan */ } }
    });
    el.querySelector('.kkta-chips').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      adminKat = b.dataset.k; gambarPanelAdmin();
    });
  }

  function toastAdmin(t) {
    try { if (typeof showToast === 'function') { showToast(t); return; } } catch (e) { /* abaikan */ }
    alert(t);
  }

  window.kktToggle = async function (id) {
    const t = adminData.find(x => x.id === id); if (!t) return;
    const { error } = await sbClient.from('tempat_favorit').update({ aktif: !t.aktif }).eq('id', id);
    if (error) { toastAdmin('Gagal: ' + error.message); return; }
    dimuatPada = 0;
    await muatPanelAdmin();
  };

  window.kktHapus = async function (id) {
    const t = adminData.find(x => x.id === id); if (!t) return;
    if (!confirm('Hapus "' + t.nama + '" secara permanen?\nKalau hanya ingin menyembunyikan, pakai Nonaktifkan.')) return;
    const { error } = await sbClient.from('tempat_favorit').delete().eq('id', id);
    if (error) { toastAdmin('Gagal menghapus: ' + error.message); return; }
    dimuatPada = 0;
    await muatPanelAdmin();
  };

  // ----- Formulir tambah / edit -----
  let formMap = null, formMarker = null;

  function setTitik(lat, lng, geser) {
    const la = document.getElementById('kktLat'), ln = document.getElementById('kktLng');
    if (la) la.value = Number(lat).toFixed(6);
    if (ln) ln.value = Number(lng).toFixed(6);
    if (!formMap) return;
    if (!formMarker) {
      formMarker = L.marker([lat, lng], { draggable: true }).addTo(formMap);
      formMarker.on('dragend', () => { const p = formMarker.getLatLng(); setTitik(p.lat, p.lng, false); });
    } else formMarker.setLatLng([lat, lng]);
    if (geser) formMap.setView([lat, lng], Math.max(formMap.getZoom(), 16));
  }

  window.kktBukaForm = function (id) {
    pasangCss();
    const t = id ? adminData.find(x => x.id === id) : null;
    const urutBaru = adminData.reduce((m, x) => Math.max(m, x.urutan || 0), 0) + 1;
    const m = document.createElement('div');
    m.id = 'kktModal';
    m.innerHTML = `<div class="kkt-sheet">
      <h3>${t ? 'Edit Tempat' : 'Tambah Tempat'}</h3>
      <label>Nama lengkap</label>
      <input id="kktNama" maxlength="80" placeholder="mis. Universitas Sebelas Maret (UNS)" value="${esc(t ? t.nama : '')}">
      <div class="kkt-row2">
        <div><label>Label di peta</label><input id="kktSing" maxlength="24" placeholder="mis. UNS" value="${esc(t ? t.nama_singkat : '')}"></div>
        <div><label>Kategori</label><select id="kktKat">${KATEGORI.map(k => `<option value="${esc(k)}"${t && t.kategori === k ? ' selected' : ''}>${esc(namaKat(k))}</option>`).join('')}</select></div>
      </div>
      <label>Alamat / catatan (opsional)</label>
      <input id="kktAlamat" maxlength="140" placeholder="mis. Kentingan, Jebres, Surakarta" value="${esc(t ? t.alamat || '' : '')}">
      <label>Titik lokasi — ketuk peta atau geser pin</label>
      <div id="kktPick"></div>
      <div class="kkt-row2" style="margin-top:8px">
        <div><input id="kktLat" inputmode="decimal" placeholder="Lintang" value="${t ? Number(t.latitude).toFixed(6) : ''}"></div>
        <div><input id="kktLng" inputmode="decimal" placeholder="Bujur" value="${t ? Number(t.longitude).toFixed(6) : ''}"></div>
      </div>
      <input id="kktTempel" style="margin-top:8px" placeholder="Tempel koordinat dari Google Maps, mis. -7.5588, 110.8564">
      <div class="kkt-hint">Di Google Maps, tekan lama titik yang dimaksud lalu salin angka koordinatnya, kemudian tempel di kolom atas.</div>
      <button class="kkt-mini" id="kktGps" type="button">📍 Pakai lokasiku sekarang</button>
      <div class="kkt-row2"><div><label>Urutan tampil</label><input id="kktUrut" type="number" min="0" value="${t ? t.urutan : urutBaru}"></div><div></div></div>
      <label class="kkt-sw"><span>Tampilkan di peta pencari</span><input id="kktAktif" type="checkbox"${!t || t.aktif ? ' checked' : ''}></label>
      <div class="kkt-err" id="kktErr"></div>
      <div class="kkt-btns"><button type="button" id="kktBatal">Batal</button><button type="button" class="ok" id="kktSimpan">Simpan</button></div>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target === m) tutupForm(); });
    m.querySelector('#kktBatal').addEventListener('click', tutupForm);
    m.querySelector('#kktSimpan').addEventListener('click', () => simpanForm(t ? t.id : null));
    m.querySelector('#kktTempel').addEventListener('input', e => {
      const mm = e.target.value.match(/(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)/);
      if (mm) setTitik(parseFloat(mm[1].replace(',', '.')), parseFloat(mm[2].replace(',', '.')), true);
    });
    m.querySelector('#kktGps').addEventListener('click', () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(p => setTitik(p.coords.latitude, p.coords.longitude, true),
        () => toastAdmin('Lokasi tidak ditemukan. Izinkan akses lokasi.'), { enableHighAccuracy: true, timeout: 12000 });
    });
    ['kktLat', 'kktLng'].forEach(i => m.querySelector('#' + i).addEventListener('change', () => {
      const la = parseFloat(m.querySelector('#kktLat').value), ln = parseFloat(m.querySelector('#kktLng').value);
      if (isFinite(la) && isFinite(ln)) setTitik(la, ln, true);
    }));
    // Peta pemilih titik
    setTimeout(() => {
      if (!window.L) { document.getElementById('kktPick').innerHTML = '<div style="padding:20px;font-size:12px;color:#6B7280">Peta belum termuat. Isi koordinat secara manual.</div>'; return; }
      formMarker = null;
      const awal = t ? [Number(t.latitude), Number(t.longitude)] : [-7.5666, 110.8167];
      formMap = L.map('kktPick', { zoomControl: true, attributionControl: false }).setView(awal, t ? 16 : 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(formMap);
      if (t) setTitik(awal[0], awal[1], false);
      formMap.on('click', e => setTitik(e.latlng.lat, e.latlng.lng, false));
      setTimeout(() => formMap.invalidateSize(), 150);
    }, 60);
  };

  function tutupForm() {
    const m = document.getElementById('kktModal'); if (m) m.remove();
    try { if (formMap) formMap.remove(); } catch (e) { /* abaikan */ }
    formMap = null; formMarker = null;
  }

  async function simpanForm(id) {
    const err = document.getElementById('kktErr');
    const tampilErr = t => { err.textContent = t; err.style.display = 'block'; };
    err.style.display = 'none';
    const nama = document.getElementById('kktNama').value.trim();
    const sing = document.getElementById('kktSing').value.trim();
    const kat = document.getElementById('kktKat').value;
    const lat = parseFloat(document.getElementById('kktLat').value.replace(',', '.'));
    const lng = parseFloat(document.getElementById('kktLng').value.replace(',', '.'));
    if (nama.length < 2) return tampilErr('Nama lengkap wajib diisi.');
    if (!sing) return tampilErr('Label di peta wajib diisi.');
    if (!isFinite(lat) || !isFinite(lng)) return tampilErr('Titik lokasi wajib ditandai di peta.');
    if (lat < -8.30 || lat > -7.10 || lng < 110.30 || lng > 111.40) return tampilErr('Titik harus berada di wilayah Soloraya.');
    const payload = {
      nama, nama_singkat: sing, kategori: kat, latitude: lat, longitude: lng,
      alamat: document.getElementById('kktAlamat').value.trim() || null,
      urutan: parseInt(document.getElementById('kktUrut').value, 10) || 0,
      aktif: document.getElementById('kktAktif').checked
    };
    const btn = document.getElementById('kktSimpan');
    btn.disabled = true; btn.textContent = 'Menyimpan…';
    const q = id ? sbClient.from('tempat_favorit').update(payload).eq('id', id) : sbClient.from('tempat_favorit').insert(payload);
    const { error } = await q;
    btn.disabled = false; btn.textContent = 'Simpan';
    if (error) return tampilErr('Gagal menyimpan: ' + error.message);
    tutupForm();
    dimuatPada = 0;
    await muatPanelAdmin();
  }

  // Tab admin: pasang saat halaman admin tersedia
  function mulai() { pasangCss(); pasangTabAdmin(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
