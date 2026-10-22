// =====================================================
// KosKu Solo — Desain ulang halaman lainnya (Putaran 3)
// Dimuat lewat: <script src="desain-lainnya.js"></script>
// Isi: Keuangan (grafik asli + tab berfungsi), Kelola Kos, Favorit,
//      Riwayat Sewa, Notifikasi, dan sentuhan untuk Admin.
// Harus dimuat SETELAH desain-pencari.js (memakai kartu kos barunya).
// =====================================================

(function () {
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const SV = (d, w) => `<svg width="${w || 20}" height="${w || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const P = {
    heart: '<path d="M12 21s-6.7-4.35-9.3-8.55C.9 9.6 1.9 6 5 5c1.9-.6 3.9.2 5 1.8C11.1 5.2 13.1 4.4 15 5c3.1 1 4.1 4.6 2.3 7.45C18.7 16.65 12 21 12 21z"/>',
    doc: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 10h6M9 14h6"/>',
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    down: '<path d="M12 4v12M6 11l6 6 6-6"/><path d="M5 21h14"/>'
  };

  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const fmtTgl = s => {
    if (!s) return '-';
    const t = new Date(String(s).length <= 10 ? s + 'T00:00:00' : s);
    return isNaN(t) ? esc(s) : `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
  };
  const rp = n => { try { return formatRupiah(n); } catch (e) { return 'Rp ' + n; } };

  const css = `
    /* ---------- Umum ---------- */
    .top-bar, .tambah-header, .keu-header { box-shadow: 0 1px 0 var(--border); }

    /* ---------- Keuangan ---------- */
    .keu-header { padding-bottom: 14px; }
    #screen-keuangan .income-card { position: relative; overflow: hidden; border-radius: 22px; padding: 22px; box-shadow: 0 10px 24px rgba(255,122,0,0.3); }
    #screen-keuangan .income-card::after { content: ''; position: absolute; right: -34px; top: -34px; width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,0.12); pointer-events: none; }
    #screen-keuangan .income-val { font-size: 34px; letter-spacing: -0.5px; }
    #screen-keuangan .income-tab { padding: 7px 16px; }
    #screen-keuangan .keu-body > div[style*="grid-template-columns"] > div { border-radius: 18px !important; padding: 18px 12px !important; box-shadow: 0 2px 12px rgba(20,20,40,0.06) !important; }
    #screen-keuangan .keu-body > div[style*="background:white"] { border-radius: 20px !important; box-shadow: 0 2px 14px rgba(20,20,40,0.07) !important; }
    #kkChart { border-radius: 20px; padding: 18px 16px 14px; box-shadow: 0 2px 14px rgba(20,20,40,0.07); margin-bottom: 14px; }
    #kkChart .t { font-size: 15px; font-weight: 800; color: var(--text); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    #kkChart .t small { font-size: 11.5px; font-weight: 600; color: var(--text-3); }
    .kk-bars { display: flex; align-items: flex-end; gap: 8px; height: 150px; }
    .kk-bcol { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 5px; height: 100%; }
    .kk-bval { font-size: 9.5px; color: var(--text-3); font-weight: 700; white-space: nowrap; height: 12px; }
    .kk-bbar { width: 100%; max-width: 38px; border-radius: 8px 8px 3px 3px; background: var(--orange-light); transition: height .5s ease; }
    .kk-bcol.now .kk-bbar { background: linear-gradient(180deg,#FF9A3C,#FF7A00); }
    .kk-bcol.now .kk-bval { color: var(--orange); }
    .kk-blab { font-size: 10.5px; color: var(--text-3); font-weight: 600; margin-top: 2px; }
    .kk-trx { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); }
    .kk-trx:last-child { border-bottom: none; }
    .kk-trx-ic { width: 40px; height: 40px; border-radius: 13px; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .kk-trx-tx { flex: 1; min-width: 0; }
    .kk-trx-tx b { display: block; font-size: 13.5px; color: var(--text); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .kk-trx-tx span { font-size: 11.5px; color: var(--text-3); }
    .kk-trx-amt { font-size: 13.5px; font-weight: 800; color: #16A34A; flex-shrink: 0; }

    /* ---------- Kelola Kos ---------- */
    #screen-kelola-kos .kk-card { border-radius: 20px; padding: 14px; box-shadow: 0 2px 14px rgba(20,20,40,0.07); }
    #screen-kelola-kos .kk-img { width: 88px; height: 88px; border-radius: 16px; }
    #screen-kelola-kos .kk-name { font-size: 16px; font-weight: 800; }
    #screen-kelola-kos .kk-btn { padding: 11px; border-radius: 12px; font-size: 12.5px; }

    /* ---------- Favorit ---------- */
    #screen-favorit .favorit-body { padding: 8px 16px 24px; overflow-y: auto; }
    .fv-sub { font-size: 12.5px; color: var(--text-3); margin-top: 3px; font-weight: 500; }
    .kk-empty { text-align: center; padding: 56px 28px; color: var(--text-3); }
    .kk-empty .ic { width: 92px; height: 92px; border-radius: 50%; background: var(--orange-light); color: var(--orange); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
    .kk-empty h3 { font-size: 17px; font-weight: 800; color: var(--text); margin: 0 0 6px; }
    .kk-empty p { font-size: 13px; line-height: 1.6; margin: 0 0 18px; }
    .kk-empty button { background: var(--orange); color: #fff; border: none; border-radius: 14px; padding: 12px 26px; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; }

    /* ---------- Riwayat Sewa ---------- */
    #screen-riwayat .riwayat-list { padding: 14px 16px 24px; }
    #screen-riwayat .tab-item { font-size: 13.5px; font-weight: 700; }
    .rw-card { background: var(--card); border-radius: 20px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 14px rgba(20,20,40,0.07); }
    .rw-top { display: flex; align-items: center; gap: 12px; }
    .rw-img { width: 54px; height: 54px; border-radius: 16px; overflow: hidden; flex-shrink: 0; background: var(--orange-light); color: var(--orange); display: flex; align-items: center; justify-content: center; }
    .rw-img img { width: 100%; height: 100%; object-fit: cover; }
    .rw-who { flex: 1; min-width: 0; }
    .rw-name { font-size: 15px; font-weight: 800; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rw-sub { font-size: 12px; color: var(--text-3); margin-top: 2px; }
    .rw-st { font-size: 11px; font-weight: 800; padding: 5px 11px; border-radius: 50px; flex-shrink: 0; }
    .rw-info { display: grid; grid-template-columns: 1.2fr 1fr 1.3fr; gap: 8px; margin-top: 14px; }
    .rw-cell { background: var(--bg-2); border-radius: 12px; padding: 9px 10px; min-width: 0; }
    .rw-cell p { font-size: 10.5px; color: var(--text-3); margin: 0 0 3px; font-weight: 600; }
    .rw-cell span { font-size: 12.5px; font-weight: 800; color: var(--text); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rw-cell.pr span { color: var(--orange); }
    .rw-note { margin-top: 12px; font-size: 12px; color: #A16207; background: #FEF9C3; border-radius: 10px; padding: 9px 12px; font-weight: 600; }
    .rw-btn { width: 100%; margin-top: 10px; padding: 13px; border: none; border-radius: 13px; font-size: 13.5px; font-weight: 700; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .rw-btn.pri { background: var(--orange); color: #fff; box-shadow: 0 6px 16px rgba(255,122,0,0.3); }
    .rw-btn.sec { background: var(--bg-2); color: var(--text); }

    /* ---------- Notifikasi ---------- */
    .notif-list .notif-item, #screen-notif .notif-item { border-radius: 18px; padding: 14px; box-shadow: 0 2px 12px rgba(20,20,40,0.06); }
    #screen-notif .notif-icon { border-radius: 14px; }

    /* ---------- Admin ---------- */
    #screen-admin-dashboard > div:first-child { border-radius: 0 0 24px 24px; padding-bottom: 22px !important; }
    #screen-admin-dashboard .admin-tab { font-size: 13px; }
    #adminContent > div[style*="grid-template-columns"] > div { border-radius: 18px !important; box-shadow: 0 2px 12px rgba(20,20,40,0.06) !important; }
    #adminContent div[style*="background:white;border-radius:12px"] { border-radius: 16px !important; }
  `;

  function injectStyle() {
    if (document.getElementById('koskuDesainLainnya')) return;
    const s = document.createElement('style');
    s.id = 'koskuDesainLainnya';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // =====================================================
  // KEUANGAN
  // =====================================================
  let kuData = [], kuTab = 'harian';

  const ymd = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  function singkat(n) {
    if (!n) return '';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '').replace('.', ',') + 'jt';
    if (n >= 1e3) return Math.round(n / 1e3) + 'rb';
    return String(n);
  }

  function deret(tab) {
    const now = new Date();
    const out = [];
    if (tab === 'harian') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        out.push({ label: i === 0 ? 'Hari ini' : HARI[d.getDay()], cocok: t => ymd(t) === ymd(d), nilai: 0 });
      }
    } else if (tab === 'bulanan') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        out.push({ label: BULAN[d.getMonth()], cocok: t => t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth(), nilai: 0 });
      }
    } else {
      for (let i = 3; i >= 0; i--) {
        const y = now.getFullYear() - i;
        out.push({ label: String(y), cocok: t => t.getFullYear() === y, nilai: 0 });
      }
    }
    kuData.forEach(b => {
      const t = new Date(b.created_at);
      out.forEach(o => { if (o.cocok(t)) o.nilai += Number(b.total_bayar) || 0; });
    });
    return out;
  }

  function kuRender() {
    const card = document.querySelector('#screen-keuangan .income-card');
    if (!card) return;

    const seri = deret(kuTab);
    const sekarang = seri[seri.length - 1].nilai;
    const now = new Date();
    const judul = { harian: 'Pendapatan Hari Ini', bulanan: 'Total Pendapatan Bulan Ini', tahunan: 'Total Pendapatan Tahun Ini' }[kuTab];
    const periode = kuTab === 'harian'
      ? now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : kuTab === 'bulanan' ? now.toLocaleString('id-ID', { month: 'long', year: 'numeric' }) : String(now.getFullYear());
    const lab = card.querySelector('.income-label'); if (lab) lab.textContent = judul;
    const val = document.getElementById('keuTotalPendapatan'); if (val) val.textContent = rp(sekarang);
    const per = document.getElementById('keuPeriod'); if (per) per.textContent = periode;

    // Grafik batang
    let chart = document.getElementById('kkChart');
    if (!chart) {
      chart = document.createElement('div');
      chart.id = 'kkChart';
      chart.className = 'chart-card';
      card.insertAdjacentElement('afterend', chart);
    }
    const maks = Math.max(1, ...seri.map(o => o.nilai));
    const sub = { harian: '7 hari terakhir', bulanan: '6 bulan terakhir', tahunan: '4 tahun terakhir' }[kuTab];
    chart.innerHTML =
      `<div class="t">Grafik Pendapatan<small>${sub}</small></div>` +
      `<div class="kk-bars">${seri.map((o, i) => `
        <div class="kk-bcol${i === seri.length - 1 ? ' now' : ''}">
          <div class="kk-bval">${singkat(o.nilai)}</div>
          <div class="kk-bbar" style="height:${Math.max(4, Math.round(o.nilai / maks * 96))}px"></div>
          <div class="kk-blab">${o.label}</div>
        </div>`).join('')}</div>`;

    // Transaksi terbaru
    const trx = document.getElementById('keuTransaksi');
    if (trx) {
      if (!kuData.length) {
        trx.innerHTML = '<div style="text-align:center;padding:24px 0;color:var(--text-3);font-size:13px">Belum ada transaksi</div>';
      } else {
        trx.innerHTML = kuData.slice(0, 6).map(b => `
          <div class="kk-trx">
            <div class="kk-trx-ic">${SV(P.down, 19)}</div>
            <div class="kk-trx-tx"><b>${esc(b.nama_pemesan || 'Penyewa')}</b><span>${esc(b.kos ? b.kos.nama_kos : '-')} · Kamar ${esc(b.kamar ? b.kamar.nomor_kamar : '-')} · ${fmtTgl(b.created_at)}</span></div>
            <div class="kk-trx-amt">+${rp(b.total_bayar || 0)}</div>
          </div>`).join('');
      }
    }
  }

  async function kuLoad() {
    kuData = [];
    const ids = (typeof myKosData !== 'undefined' ? myKosData : []).map(k => k.id);
    if (!ids.length) return;
    const { data, error } = await sbClient.from('booking')
      .select('id, created_at, total_bayar, nama_pemesan, status, kamar(nomor_kamar), kos(nama_kos)')
      .in('kos_id', ids).in('status', ['diterima', 'aktif', 'selesai'])
      .order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    kuData = data || [];
  }

  const asliKeu = window.loadKeuangan;
  if (typeof asliKeu === 'function') {
    window.loadKeuangan = async function () {
      const r = await asliKeu.apply(this, arguments);
      try { await kuLoad(); kuRender(); } catch (e) { console.warn('keuangan:', e); }
      return r;
    };
  }
  const asliTab = window.switchIncomeTab;
  if (typeof asliTab === 'function') {
    window.switchIncomeTab = function (el, period) {
      const r = asliTab.apply(this, arguments);
      kuTab = period || 'harian';
      try { kuRender(); } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // =====================================================
  // FAVORIT
  // =====================================================
  if (typeof window.renderKosListCard === 'function') {
    window.renderFavoritCard = function (kos) {
      const html = window.renderKosListCard(kos);
      // Tombol hati di halaman ini menghapus dari favorit lalu menyegarkan daftar
      return html.replace(/toggleFavorite\('([^']*)', event, this\)/, "removeFavorit('$1', event)");
    };
  }

  const asliFav = window.loadFavoritList;
  if (typeof asliFav === 'function') {
    window.loadFavoritList = async function () {
      const r = await asliFav.apply(this, arguments);
      try {
        const body = document.querySelector('#screen-favorit .favorit-body');
        const top = document.querySelector('#screen-favorit .top-bar');
        if (top && !document.getElementById('fvSub')) {
          const sub = document.createElement('div');
          sub.id = 'fvSub'; sub.className = 'fv-sub';
          top.appendChild(sub);
        }
        const sub = document.getElementById('fvSub');
        if (body) {
          const n = body.querySelectorAll('.kk-card2').length;
          if (n) { if (sub) sub.textContent = `${n} kos tersimpan`; }
          else if (/Belum ada kos favorit/i.test(body.textContent)) {
            if (sub) sub.textContent = 'Belum ada yang disimpan';
            body.innerHTML = `
              <div class="kk-empty">
                <div class="ic">${SV(P.heart, 40)}</div>
                <h3>Belum ada kos favorit</h3>
                <p>Ketuk ikon hati pada kos yang kamu suka, dan kos itu akan tersimpan di sini.</p>
                <button onclick="showSearch()">Cari Kos</button>
              </div>`;
          }
        }
      } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // =====================================================
  // RIWAYAT SEWA
  // =====================================================
  const ST = {
    menunggu: ['Menunggu', '#FEF9C3', '#A16207'],
    diterima: ['Diterima', '#DCFCE7', '#15803D'],
    aktif: ['Aktif', '#DBEAFE', '#1D4ED8'],
    selesai: ['Selesai', '#F1F5F9', '#475569'],
    ditolak: ['Ditolak', '#FEE2E2', '#B91C1C'],
    kedaluwarsa: ['Kedaluwarsa', '#FEE2E2', '#B91C1C']
  };

  window.renderRiwayatCard = function (b) {
    const namaKos = (b.kos && b.kos.nama_kos) || 'Kos';
    const kamar = (b.kamar && b.kamar.nomor_kamar) || '-';
    const foto = (b.kos && b.kos.foto_urls && b.kos.foto_urls.length) ? b.kos.foto_urls[0] : null;
    const st = ST[b.status] || [b.status, '#F1F5F9', '#475569'];
    let punyaKwitansi = false;
    try { punyaKwitansi = !!riwayatKwitansiMap[b.id]; } catch (e) { /* abaikan */ }
    const id = esc(b.id);

    return `
      <div class="rw-card">
        <div class="rw-top">
          <div class="rw-img">${foto ? `<img src="${esc(foto)}" alt="">` : SV(P.home, 26)}</div>
          <div class="rw-who"><div class="rw-name">${esc(namaKos)}</div><div class="rw-sub">Kamar ${esc(kamar)}</div></div>
          <span class="rw-st" style="background:${st[1]};color:${st[2]}">${st[0]}</span>
        </div>
        <div class="rw-info">
          <div class="rw-cell"><p>Mulai</p><span>${fmtTgl(b.tanggal_masuk)}</span></div>
          <div class="rw-cell"><p>Durasi</p><span>${esc(b.durasi_bulan || '-')} bulan</span></div>
          <div class="rw-cell pr"><p>Total</p><span>${rp(b.total_bayar || 0)}</span></div>
        </div>
        ${b.status === 'menunggu' ? '<div class="rw-note">Menunggu persetujuan pemilik kos.</div>' : ''}
        ${b.status === 'diterima' ? `<button class="rw-btn pri" onclick="showKonfirmasiPembayaran('${id}')">Konfirmasi &amp; Lanjutkan ${SV(P.arrow, 17)}</button>` : ''}
        ${punyaKwitansi ? `<button class="rw-btn sec" onclick="viewKwitansiById('${id}')">${SV(P.receipt, 17)}Lihat Kwitansi</button>` : ''}
      </div>`;
  };

  const asliRList = window.renderRiwayatList;
  if (typeof asliRList === 'function') {
    window.renderRiwayatList = function (tab) {
      const r = asliRList.apply(this, arguments);
      try {
        const c = document.getElementById('riwayatList');
        if (c && !c.querySelector('.rw-card') && /Belum Ada|Tidak Ada/i.test(c.textContent)) {
          const judul = { aktif: 'Belum ada sewa aktif', selesai: 'Belum ada riwayat selesai', batal: 'Tidak ada booking dibatalkan' }[tab] || 'Belum ada riwayat sewa';
          c.innerHTML = `
            <div class="kk-empty">
              <div class="ic">${SV(P.doc, 40)}</div>
              <h3>${judul}</h3>
              <p>Riwayat booking dan sewa kosmu akan muncul di sini.</p>
              ${tab === 'aktif' ? '<button onclick="showSearch()">Cari Kos</button>' : ''}
            </div>`;
        }
      } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // ---------- Mulai ----------
  function init() { injectStyle(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
