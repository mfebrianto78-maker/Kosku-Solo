// =====================================================
// KosKu Solo — Desain ulang sisi pemilik (Putaran 2)
// Dimuat lewat: <script src="desain-pemilik.js"></script>
// Isi: Dashboard Pemilik, Booking Masuk (dengan filter status),
//      dan tampilan kartu Kelola Kamar.
// Harus dimuat SETELAH dashboard-pemilik.js dan kelola-kamar.js.
// =====================================================

(function () {
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const css = `
    /* ================= DASHBOARD PEMILIK ================= */
    #screen-owner .owner-header { border-radius: 0 0 28px 28px; padding-bottom: 42px; }
    #screen-owner .owner-greet { margin-bottom: 18px; }
    #screen-owner .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
    #screen-owner .stat-card { padding: 12px 4px; border-radius: 14px; }
    #screen-owner .stat-val { font-size: 22px; margin-bottom: 2px; }
    #screen-owner .stat-label { font-size: 10px; line-height: 1.25; }
    #screen-owner .kk-income { margin-top: -26px !important; position: relative; z-index: 2; }
    #screen-owner .kk-income > div { border-radius: 20px !important; padding: 18px !important; box-shadow: 0 10px 24px rgba(255,122,0,0.35); }
    #screen-owner .kk-income #ownerPendapatan { font-size: 26px !important; }
    #kkTodo { padding: 4px 16px 0; }
    .kk-h { display: flex; justify-content: space-between; align-items: center; margin: 6px 0 10px; font-size: 17px; font-weight: 800; color: var(--text); }
    #kkTodo #ownerRecentBooking { padding-bottom: 0 !important; }
    #kkTodo #ownerRecentBooking > div[style*="rgba(255,255,255,0.15)"] {
      background: var(--bg-2) !important; color: var(--text-3) !important;
    }
    .kk-due {
      display: flex; align-items: center; gap: 12px; background: var(--orange-light);
      border: 1.5px solid var(--orange); border-radius: 18px; padding: 13px 14px; margin-bottom: 12px;
    }
    .kk-due-ic { width: 42px; height: 42px; border-radius: 13px; background: var(--orange); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .kk-due-tx { flex: 1; min-width: 0; }
    .kk-due-tx b { display: block; font-size: 13.5px; color: var(--text); font-weight: 800; }
    .kk-due-tx span { font-size: 12px; color: var(--text-2); }
    .kk-due button { background: var(--orange); color: #fff; border: none; border-radius: 12px; padding: 10px 16px; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; flex-shrink: 0; }
    #screen-owner .owner-menu-grid { gap: 12px; padding: 4px 16px 16px; }
    #screen-owner .owner-menu-card { display: flex; align-items: center; gap: 12px; text-align: left; padding: 14px; border-radius: 18px; }
    #screen-owner .owner-menu-icon { margin: 0 !important; width: 46px !important; height: 46px !important; flex-shrink: 0; border-radius: 14px !important; }
    #screen-owner .kk-mtxt { min-width: 0; }
    #screen-owner .owner-menu-label { font-size: 13.5px; }
    #screen-owner .owner-menu-badge { font-size: 11.5px; margin-top: 2px; }

    /* ================= BOOKING MASUK ================= */
    #screen-booking-masuk .top-bar { padding-bottom: 8px !important; }
    .bm-sum { font-size: 12.5px; color: var(--text-3); margin: 0 4px 12px; }
    .bm-chips { display: flex; gap: 8px; overflow-x: auto; padding: 2px 0 12px; }
    .bm-chips::-webkit-scrollbar { display: none; }
    .bm-chip {
      flex-shrink: 0; padding: 8px 14px; border-radius: 50px; font-size: 12.5px; font-weight: 700;
      border: 1.5px solid var(--border); background: var(--card); color: var(--text-2); cursor: pointer;
    }
    .bm-chip b { margin-left: 4px; font-weight: 800; opacity: .8; }
    .bm-chip.on { background: var(--orange); border-color: var(--orange); color: #fff; box-shadow: 0 4px 12px rgba(255,122,0,0.3); }
    .bm-card { background: var(--card); border-radius: 20px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 14px rgba(20,20,40,0.07); }
    .bm-top { display: flex; align-items: center; gap: 12px; }
    .bm-av {
      width: 48px; height: 48px; border-radius: 16px; flex-shrink: 0; overflow: hidden; cursor: pointer;
      background: linear-gradient(135deg,#E0E7FF,#C7D2FE); color: #4338CA; font-size: 18px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .bm-av img { width: 100%; height: 100%; object-fit: cover; }
    .bm-who { flex: 1; min-width: 0; cursor: pointer; }
    .bm-name { font-size: 15px; font-weight: 800; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bm-sub { font-size: 11.5px; color: var(--text-3); margin-top: 2px; line-height: 1.35; }
    .bm-st { font-size: 11px; font-weight: 800; padding: 5px 11px; border-radius: 50px; flex-shrink: 0; }
    .bm-trust { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; margin-top: 4px; }
    .bm-info { display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 8px; margin: 14px 0; }
    .bm-cell { background: var(--bg-2); border-radius: 12px; padding: 9px 10px; min-width: 0; }
    .bm-cell p { font-size: 10.5px; color: var(--text-3); margin: 0 0 3px; font-weight: 600; }
    .bm-cell span { font-size: 12.5px; font-weight: 800; color: var(--text); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bm-cell.pr span { color: var(--orange); }
    .bm-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .bm-actions button { padding: 11px 14px; border: none; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
    .bm-actions .main { flex: 1; color: #fff; }
    .bm-actions .ic { flex: 0 0 44px; padding: 11px 0; background: var(--bg-2); color: var(--text-2); }
    .bm-actions .wa { background: #DCFCE7; color: #15803D; }
    .bm-empty { text-align: center; padding: 56px 24px; color: var(--text-3); }
    .bm-empty .ic { width: 88px; height: 88px; border-radius: 50%; background: var(--orange-light); color: var(--orange); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .bm-empty h3 { font-size: 16px; font-weight: 800; color: var(--text); margin: 0 0 6px; }
    .bm-empty p { font-size: 13px; line-height: 1.6; margin: 0; }

    /* ================= KELOLA KAMAR ================= */
    #screen-kelola-kamar .kk-card { border-radius: 18px; padding: 14px 14px 14px 16px; box-shadow: 0 2px 12px rgba(20,20,40,0.07); }
    #screen-kelola-kamar .kk-card.is-terisi { border-left: 4px solid var(--orange); }
    #screen-kelola-kamar .kk-card.is-kosong { border-left: 4px solid #16A34A; }
    #kkStats > div { border-radius: 16px !important; box-shadow: 0 2px 10px rgba(20,20,40,0.06) !important; }
  `;

  function injectStyle() {
    if (document.getElementById('koskuDesainPemilik')) return;
    const s = document.createElement('style');
    s.id = 'koskuDesainPemilik';
    s.textContent = css;
    document.head.appendChild(s);
  }

  const SV = (d, w) => `<svg width="${w || 20}" height="${w || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const P = {
    bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10.3 20a1.9 1.9 0 0 0 3.4 0"/>',
    list: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 10h6M9 14h6"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20l1.2-5.3A8.4 8.4 0 1 1 21 11.5z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    warn: '<path d="M12 3 2 20h20z"/><path d="M12 10v5M12 18h.01"/>',
    wa: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z"/>'
  };

  // =====================================================
  // DASHBOARD PEMILIK
  // =====================================================
  function susunDashboard() {
    const screen = document.getElementById('screen-owner');
    if (!screen) return;

    // Bungkus label + badge tiap kartu menu supaya sejajar dengan ikon
    screen.querySelectorAll('.owner-menu-card').forEach(card => {
      if (card.querySelector('.kk-mtxt')) return;
      const label = card.querySelector('.owner-menu-label');
      const badge = card.querySelector('.owner-menu-badge');
      if (!label) return;
      const wrap = document.createElement('div');
      wrap.className = 'kk-mtxt';
      card.appendChild(wrap);
      wrap.appendChild(label);
      if (badge) wrap.appendChild(badge);
    });

    if (screen.dataset.kkTata) return;
    const recent = document.getElementById('ownerRecentBooking');
    const income = document.getElementById('ownerPendapatan');
    const incomeWrap = income && income.parentElement && income.parentElement.parentElement && income.parentElement.parentElement.parentElement;
    if (!recent || !incomeWrap || !screen.querySelector('.owner-header')) return;
    screen.dataset.kkTata = '1';

    incomeWrap.classList.add('kk-income');
    const todo = document.createElement('div');
    todo.id = 'kkTodo';
    todo.innerHTML = '<div class="kk-h"><span>Perlu Tindakan</span></div><div id="kkDueAlert"></div>';
    todo.appendChild(recent);
    incomeWrap.insertAdjacentElement('afterend', todo);
  }

  function hariIni() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async function updateDueAlert() {
    const el = document.getElementById('kkDueAlert');
    if (!el) return;
    const kosIds = (typeof myKosData !== 'undefined' ? myKosData : []).map(k => k.id);
    if (!kosIds.length) { el.innerHTML = ''; return; }
    try {
      const d = new Date(Date.now() + 7 * 86400000);
      const batas = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const { data, error } = await sbClient.from('catatan_sewa')
        .select('id, tanggal_tagihan')
        .in('kos_id', kosIds).in('status', ['aktif', 'menunggak'])
        .not('tanggal_tagihan', 'is', null).lte('tanggal_tagihan', batas);
      if (error) throw error;
      const n = (data || []).length;
      if (!n) { el.innerHTML = ''; return; }
      const telat = data.filter(x => x.tanggal_tagihan < hariIni()).length;
      el.innerHTML = `
        <div class="kk-due">
          <div class="kk-due-ic">${SV(P.bell, 22)}</div>
          <div class="kk-due-tx"><b>${n} penghuni jatuh tempo</b><span>${telat ? telat + ' sudah terlambat · ' : ''}dalam 7 hari ke depan</span></div>
          <button onclick="showKelolaKamar()">Lihat</button>
        </div>`;
    } catch (e) { el.innerHTML = ''; }
  }

  const asliLoadMyKos = window.loadMyKos;
  if (typeof asliLoadMyKos === 'function') {
    window.loadMyKos = async function () {
      const r = await asliLoadMyKos.apply(this, arguments);
      try { susunDashboard(); updateDueAlert(); } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // =====================================================
  // BOOKING MASUK
  // =====================================================
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const fmtTgl = s => {
    if (!s) return '-';
    const t = new Date(String(s).length <= 10 ? s + 'T00:00:00' : s);
    return isNaN(t) ? esc(s) : `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
  };
  const STATUS = {
    menunggu: { label: 'Menunggu', bg: '#FEF9C3', color: '#A16207' },
    diterima: { label: 'Diterima', bg: '#DCFCE7', color: '#15803D' },
    aktif: { label: 'Aktif', bg: '#DBEAFE', color: '#1D4ED8' },
    selesai: { label: 'Selesai', bg: '#F1F5F9', color: '#475569' }
  };
  const FILTERS = [['semua', 'Semua'], ['menunggu', 'Menunggu'], ['diterima', 'Diterima'], ['aktif', 'Aktif'], ['selesai', 'Selesai']];

  let bmData = [], bmProfile = {}, bmFilter = 'semua';

  const waNomor = hp => {
    let n = String(hp || '').replace(/\D/g, '');
    if (!n) return '';
    if (n.startsWith('0')) n = '62' + n.slice(1);
    else if (n.startsWith('8')) n = '62' + n;
    return n;
  };

  function waktuLalu(iso) {
    const h = Math.round((Date.now() - new Date(iso)) / 3600000);
    return h < 1 ? 'Baru saja' : h < 24 ? `${h} jam lalu` : `${Math.round(h / 24)} hari lalu`;
  }

  function bmKosong(c, judul, teks) {
    c.innerHTML = `<div class="bm-empty"><div class="ic">${SV(P.list, 38)}</div><h3>${judul}</h3><p>${teks}</p></div>`;
  }

  function bmRender() {
    const c = document.getElementById('bookingMasukList');
    if (!c) return;
    const hitung = f => f === 'semua' ? bmData.length : bmData.filter(b => b.status === f).length;
    const chips = FILTERS.map(([k, l]) =>
      `<div class="bm-chip${bmFilter === k ? ' on' : ''}" onclick="kkBmFilter('${k}')">${l}<b>${hitung(k)}</b></div>`).join('');

    const daftar = bmData.filter(b => bmFilter === 'semua' || b.status === bmFilter);
    const menunggu = hitung('menunggu');

    const kartu = daftar.map(b => {
      const pr = bmProfile[b.penyewa_id] || {};
      const nama = pr.nama_lengkap || b.nama_pemesan || 'Penyewa';
      const st = STATUS[b.status] || { label: b.status, bg: '#F1F5F9', color: '#475569' };
      const ok = pr.booking_ok_count || 0, bad = pr.booking_bermasalah_count || 0;
      let trust = '';
      if (bad >= 2 && bad >= ok) trust = `<div class="bm-trust" style="color:#DC2626">${SV(P.warn, 13)}Riwayat kurang baik</div>`;
      else if (ok > 0) trust = `<div class="bm-trust" style="color:#16A34A">${SV(P.shield, 13)}Riwayat baik</div>`;
      const avatar = pr.foto_url ? `<img src="${esc(pr.foto_url)}" alt="">` : esc(nama.trim().charAt(0).toUpperCase());
      const wa = waNomor(b.no_hp);
      const idq = esc(b.id), pid = esc(b.penyewa_id), kid = esc(b.kos_id);

      return `
        <div class="bm-card">
          <div class="bm-top">
            <div class="bm-av" onclick="showPencariProfile('${pid}')">${avatar}</div>
            <div class="bm-who" onclick="showPencariProfile('${pid}')">
              <div class="bm-name">${esc(nama)}</div>
              <div class="bm-sub">${esc(b.kos ? b.kos.nama_kos : '-')} · Kamar ${esc(b.kamar ? b.kamar.nomor_kamar : '-')} · ${waktuLalu(b.created_at)}</div>
              ${trust}
            </div>
            <span class="bm-st" style="background:${st.bg};color:${st.color}">${st.label}</span>
          </div>
          <div class="bm-info">
            <div class="bm-cell"><p>Mulai</p><span>${fmtTgl(b.tanggal_masuk)}</span></div>
            <div class="bm-cell"><p>Durasi</p><span>${esc(b.durasi_bulan)} bulan</span></div>
            <div class="bm-cell pr"><p>Total</p><span>${formatRupiah(b.total_bayar)}</span></div>
          </div>
          <div class="bm-actions">
            ${b.status === 'menunggu' ? `
              <button class="main" style="background:#16A34A" onclick="updateStatusBooking('${idq}','diterima')">${SV(P.check, 16)}Terima</button>
              <button class="main" style="background:#EF4444" onclick="updateStatusBooking('${idq}','ditolak')">${SV(P.x, 16)}Tolak</button>` : ''}
            ${b.status === 'aktif' ? `
              <button class="main" style="background:#16A34A" onclick="selesaikanBooking('${idq}')">${SV(P.check, 16)}Tandai Selesai</button>` : ''}
            ${['diterima', 'aktif', 'selesai'].includes(b.status) ? `
              <button class="main" style="background:#334155" onclick="showBuatKwitansi('${idq}')">${SV(P.receipt, 16)}Buat Kwitansi</button>` : ''}
            ${wa ? `<button class="ic wa" aria-label="WhatsApp" onclick="window.open('https://wa.me/${wa}','_blank')">${SV(P.wa, 20)}</button>` : ''}
            <button class="ic" aria-label="Chat" onclick="openChatForPartner('${kid}','${pid}')">${SV(P.chat, 20)}</button>
          </div>
        </div>`;
    }).join('');

    c.innerHTML =
      `<div class="bm-sum">${menunggu ? `<b style="color:var(--orange)">${menunggu} booking menunggu keputusan</b>` : 'Tidak ada booking yang menunggu keputusan'}</div>` +
      `<div class="bm-chips">${chips}</div>` +
      (kartu || `<div class="bm-empty" style="padding:36px 20px"><h3>Tidak ada booking</h3><p>Tidak ada booking dengan status ini.</p></div>`);
  }

  window.kkBmFilter = function (f) { bmFilter = f; bmRender(); };

  window.loadBookingMasuk = async function () {
    if (typeof currentUser === 'undefined' || !currentUser) return;
    const c = document.getElementById('bookingMasukList');
    if (!c) return;
    if (!bmData.length) {
      c.innerHTML = Array.from({ length: 3 }, () =>
        '<div class="kk-skel" style="border-radius:20px;padding:16px"><b style="margin:0 0 12px;width:60%"></b><b style="margin:0 0 12px;width:90%"></b><b style="margin:0;width:75%;height:34px"></b></div>').join('');
    }
    try {
      if (!myKosData || !myKosData.length) await loadMyKos();
      if (!myKosData || !myKosData.length) { bmKosong(c, 'Belum ada kos', 'Tambahkan kos dulu lewat menu Kelola Kos.'); return; }
      const kosIds = myKosData.map(k => k.id);

      const { data, error } = await sbClient.from('booking')
        .select('*, kamar(nomor_kamar), kos(nama_kos)')
        .in('kos_id', kosIds)
        .in('status', ['menunggu', 'diterima', 'aktif', 'selesai'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      let bookings = data || [];

      // Booking diterima yang lewat 24 jam otomatis kedaluwarsa (aturan lama dipertahankan)
      const now = new Date();
      const kedaluwarsa = bookings
        .filter(b => b.status === 'diterima' && b.diterima_at && (now - new Date(b.diterima_at)) > 24 * 3600000)
        .map(b => b.id);
      if (kedaluwarsa.length) {
        await sbClient.from('booking').update({ status: 'kedaluwarsa' }).in('id', kedaluwarsa);
        bookings = bookings.filter(b => !kedaluwarsa.includes(b.id));
      }

      if (!bookings.length) {
        bmData = [];
        bmKosong(c, 'Belum ada booking', 'Booking dari penyewa akan muncul di sini.');
        return;
      }

      const ids = [...new Set(bookings.map(b => b.penyewa_id).filter(Boolean))];
      bmProfile = {};
      if (ids.length) {
        const { data: ps } = await sbClient.from('profiles')
          .select('id, nama_lengkap, foto_url, booking_ok_count, booking_bermasalah_count').in('id', ids);
        (ps || []).forEach(p => { bmProfile[p.id] = p; });
      }

      // Yang menunggu keputusan ditaruh paling atas
      bmData = bookings.slice().sort((a, b) => (b.status === 'menunggu') - (a.status === 'menunggu'));
      bmRender();
    } catch (err) {
      console.error('Gagal memuat booking masuk:', err);
      c.innerHTML = '<div style="text-align:center;padding:30px;color:var(--red);font-size:13px">Gagal memuat data booking</div>';
    }
  };

  // ---------- Mulai ----------
  function init() {
    injectStyle();
    susunDashboard();
    try { if (typeof currentUser !== 'undefined' && currentUser && myKosData && myKosData.length) updateDueAlert(); } catch (e) { /* abaikan */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
