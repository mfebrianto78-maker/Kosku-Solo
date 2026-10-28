// =====================================================
// KosKu Solo — Statistik Kos untuk Pemilik
// Dimuat lewat: <script src="statistik-kos.js"></script>  (setelah bagikan-kos.js)
// Butuh: statistik-kos.sql sudah dijalankan di Supabase.
//
// 1. Mencatat: kos dilihat, dibagikan, dibuka dari peta (tanpa data pribadi).
// 2. Menu "Statistik" di Dashboard Pemilik: ringkasan, grafik harian,
//    peringkat kos, dan corong Dilihat → Favorit → Booking.
// =====================================================
(function () {
  'use strict';
  if (window.__kkStatReady) return;
  window.__kkStatReady = true;

  // ---------- Kode perangkat anonim (untuk mencegah hitungan berulang) ----------
  function sesi() {
    try {
      let s = localStorage.getItem('kk_sesi');
      if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('kk_sesi', s); }
      return s;
    } catch (e) { return ''; }
  }

  function catat(kosId, jenis) {
    try {
      if (!kosId || typeof sbClient === 'undefined') return;
      Promise.resolve(sbClient.rpc('kk_catat', { p_kos: kosId, p_jenis: jenis, p_sesi: sesi() })).catch(() => {});
    } catch (e) { /* pencatatan tidak boleh mengganggu aplikasi */ }
  }
  window.KKStat = { catat };

  // ---------- Pencatatan: dilihat & dari peta ----------
  const asliOpen = window.openDetail;
  if (typeof asliOpen === 'function') {
    window.openDetail = function (id) {
      const r = asliOpen.apply(this, arguments);
      catat(id, 'lihat');
      if (window.__kkDariPeta) catat(id, 'peta');
      return r;
    };
  }

  // ---------- Pencatatan: dibagikan (tombol di lembar Bagikan) ----------
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('#kkbBagikan, #kkbUnduh, #kkbWa, #kkbSalin');
    if (!b) return;
    try { if (selectedKos && selectedKos.id) catat(selectedKos.id, 'bagikan'); } catch (err) { /* abaikan */ }
  }, true);

  // ---------- Tampilan ----------
  const css = document.createElement('style');
  css.textContent = `
  #screen-statistik{background:var(--bg)}
  .kks-head{background:linear-gradient(135deg,#FF7A00,#FF9A3D);color:#fff;padding:52px 20px 22px;border-radius:0 0 26px 26px}
  .kks-head .kks-top{display:flex;align-items:center;gap:12px}
  .kks-back{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer}
  .kks-head h2{font-size:19px;font-weight:800;margin:0}
  .kks-head p{font-size:12px;opacity:.92;margin:10px 0 0;line-height:1.5}
  .kks-body{flex:1;overflow-y:auto;padding:14px 16px 110px}
  .kks-chips{display:flex;gap:8px;margin-bottom:14px}
  .kks-chip{flex:1;text-align:center;padding:9px 0;border-radius:12px;background:var(--card);border:1.5px solid var(--border);font-size:13px;font-weight:700;color:var(--text-2);cursor:pointer}
  .kks-chip.on{background:var(--orange);border-color:var(--orange);color:#fff}
  .kks-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
  .kks-tile{background:var(--card);border-radius:16px;padding:14px;box-shadow:0 2px 10px rgba(0,0,0,.05)}
  .kks-tile .ic{font-size:20px}
  .kks-tile .n{font-size:26px;font-weight:800;color:var(--text);margin-top:4px;line-height:1.1}
  .kks-tile .l{font-size:12px;color:var(--text-3);margin-top:2px}
  .kks-tile .d{font-size:11px;font-weight:700;margin-top:6px}
  .kks-up{color:var(--green)} .kks-down{color:var(--red)} .kks-flat{color:var(--text-3)}
  .kks-card{background:var(--card);border-radius:16px;padding:16px;box-shadow:0 2px 10px rgba(0,0,0,.05);margin-bottom:14px}
  .kks-card h3{font-size:14px;font-weight:800;color:var(--text);margin:0 0 12px}
  .kks-chart{display:flex;align-items:flex-end;gap:2px;height:110px}
  .kks-bar{flex:1;background:var(--orange);border-radius:3px 3px 0 0;min-height:2px;opacity:.9}
  .kks-bar.nol{background:var(--border);opacity:1}
  .kks-axis{display:flex;justify-content:space-between;font-size:10px;color:var(--text-3);margin-top:6px}
  .kks-kos{padding:12px 0;border-top:1px solid var(--border)}
  .kks-kos:first-of-type{border-top:0;padding-top:0}
  .kks-kos .nm{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:14px;font-weight:700;color:var(--text)}
  .kks-kos .nm span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .kks-rank{flex:none;width:22px;height:22px;border-radius:50%;background:var(--orange-light);color:var(--orange);font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;margin-right:8px}
  .kks-stats{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0;font-size:12px;color:var(--text-2)}
  .kks-fun{display:flex;flex-direction:column;gap:5px}
  .kks-fr{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--text-3)}
  .kks-fr .lb{width:58px;flex:none}
  .kks-fr .tr{flex:1;height:8px;border-radius:6px;background:var(--border);overflow:hidden}
  .kks-fr .fl{height:100%;border-radius:6px;background:var(--orange)}
  .kks-fr .vl{width:30px;text-align:right;font-weight:700;color:var(--text-2)}
  .kks-tip{display:flex;gap:10px;font-size:13px;color:var(--text-2);line-height:1.5;padding:10px 0;border-top:1px solid var(--border)}
  .kks-tip:first-of-type{border-top:0;padding-top:0}
  .kks-info{text-align:center;color:var(--text-3);font-size:13px;line-height:1.6;padding:30px 10px}
  .kks-info b{display:block;color:var(--text);font-size:15px;margin-bottom:6px}
  .kks-menu-ok .owner-menu-badge{color:var(--orange)}
  `;
  document.head.appendChild(css);

  function bangunLayar() {
    if (document.getElementById('screen-statistik')) return;
    const app = document.getElementById('screen-owner') ? document.getElementById('screen-owner').parentNode : document.body;
    const s = document.createElement('div');
    s.id = 'screen-statistik';
    s.className = 'screen';
    s.innerHTML = `
      <div class="kks-head">
        <div class="kks-top"><div class="kks-back" id="kksBack">←</div><h2>📈 Statistik Kos</h2></div>
        <p>Lihat seberapa banyak kos Anda dilihat, difavoritkan, dan dibooking.</p>
      </div>
      <div class="kks-body">
        <div class="kks-chips" id="kksChips">
          <div class="kks-chip" data-h="7">7 hari</div>
          <div class="kks-chip on" data-h="30">30 hari</div>
          <div class="kks-chip" data-h="90">90 hari</div>
        </div>
        <div id="kksIsi"></div>
      </div>`;
    app.appendChild(s);
    s.querySelector('#kksBack').addEventListener('click', () => { if (typeof window.showOwner === 'function') window.showOwner(); });
    s.querySelector('#kksChips').addEventListener('click', e => {
      const c = e.target.closest('.kks-chip'); if (!c) return;
      s.querySelectorAll('.kks-chip').forEach(x => x.classList.toggle('on', x === c));
      muat(parseInt(c.dataset.h, 10));
    });
  }

  const fmt = n => Number(n || 0).toLocaleString('id-ID');
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function delta(skrg, lalu) {
    if (!lalu && !skrg) return '<div class="d kks-flat">–</div>';
    if (!lalu) return '<div class="d kks-up">▲ baru</div>';
    const p = Math.round(((skrg - lalu) / lalu) * 100);
    if (p === 0) return '<div class="d kks-flat">sama seperti sebelumnya</div>';
    return p > 0 ? `<div class="d kks-up">▲ ${p}% dari periode lalu</div>` : `<div class="d kks-down">▼ ${Math.abs(p)}% dari periode lalu</div>`;
  }

  function tglPendek(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  function tips(kos, tot) {
    const t = [];
    if (!tot.lihat) {
      t.push(['👀', 'Belum ada yang melihat kos Anda pada periode ini. Pastikan foto jelas dan coba bagikan kos ke WhatsApp.']);
      return t;
    }
    kos.forEach(k => {
      if (k.lihat >= 5 && !k.favorit) t.push(['❤️', `<b>${esc(k.nama)}</b> sering dilihat tapi belum ada yang memfavoritkan. Coba perbarui foto atau turunkan harga sedikit.`]);
      if (k.lihat >= 10 && !k.booking) t.push(['📅', `<b>${esc(k.nama)}</b> dilihat ${fmt(k.lihat)}x tapi belum ada booking. Pastikan jumlah kamar tersedia dan deskripsi lengkap.`]);
    });
    if (tot.bagikan === 0) t.push(['📤', 'Belum ada yang membagikan kos Anda. Bagikan sendiri lewat tombol Bagikan di Kelola Kos.']);
    if (tot.peta > 0 && tot.peta >= tot.lihat * 0.4) t.push(['🗺️', 'Banyak pencari menemukan kos Anda lewat Peta. Verifikasi lokasi akan menambah kepercayaan mereka.']);
    return t.slice(0, 4);
  }

  function gambar(d, h) {
    const k = d.kos || [];
    const tot = k.reduce((a, x) => ({
      lihat: a.lihat + x.lihat, lalu: a.lalu + x.lihat_lalu, bagikan: a.bagikan + x.bagikan,
      peta: a.peta + x.peta, favorit: a.favorit + x.favorit, booking: a.booking + x.booking
    }), { lihat: 0, lalu: 0, bagikan: 0, peta: 0, favorit: 0, booking: 0 });

    if (!k.length) return '<div class="kks-info"><b>Belum ada kos</b>Tambahkan kos dulu, lalu statistiknya muncul di sini.</div>';

    const hr = d.harian || [];
    const maks = Math.max(1, ...hr.map(x => x.lihat));
    const bars = hr.map(x => `<div class="kks-bar ${x.lihat ? '' : 'nol'}" style="height:${Math.max(2, Math.round((x.lihat / maks) * 100))}%" title="${tglPendek(x.tgl)}: ${x.lihat}"></div>`).join('');

    const tile = (ic, n, l, extra) => `<div class="kks-tile"><div class="ic">${ic}</div><div class="n">${fmt(n)}</div><div class="l">${l}</div>${extra || ''}</div>`;

    const daftar = k.map((x, i) => {
      const m = Math.max(1, x.lihat);
      const baris = (lb, v, base) => `<div class="kks-fr"><span class="lb">${lb}</span><span class="tr"><span class="fl" style="display:block;width:${Math.min(100, Math.round((v / base) * 100))}%"></span></span><span class="vl">${fmt(v)}</span></div>`;
      const konv = x.lihat ? Math.round((x.booking / x.lihat) * 100) : 0;
      return `<div class="kks-kos">
        <div class="nm"><span><span class="kks-rank">${i + 1}</span>${esc(x.nama)}</span></div>
        <div class="kks-stats"><span>🗺️ ${fmt(x.peta)} dari peta</span><span>📤 ${fmt(x.bagikan)} dibagikan</span>${x.lihat ? `<span>🎯 ${konv}% jadi booking</span>` : ''}</div>
        <div class="kks-fun">${baris('Dilihat', x.lihat, m)}${baris('Favorit', x.favorit, Math.max(m, x.favorit))}${baris('Booking', x.booking, Math.max(m, x.booking))}${baris('Diterima', x.diterima, Math.max(m, x.booking, x.diterima))}</div>
      </div>`;
    }).join('');

    const tp = tips(k, tot);
    return `
      <div class="kks-tiles">
        ${tile('👀', tot.lihat, 'Kos dilihat', delta(tot.lihat, tot.lalu))}
        ${tile('❤️', tot.favorit, 'Difavoritkan (total)', '<div class="d kks-flat">sejak awal</div>')}
        ${tile('📤', tot.bagikan, 'Dibagikan', '<div class="d kks-flat">' + h + ' hari terakhir</div>')}
        ${tile('📅', tot.booking, 'Booking masuk', '<div class="d kks-flat">' + h + ' hari terakhir</div>')}
      </div>
      <div class="kks-card">
        <h3>Kos dilihat per hari</h3>
        <div class="kks-chart">${bars}</div>
        <div class="kks-axis"><span>${hr.length ? tglPendek(hr[0].tgl) : ''}</span><span>${hr.length ? tglPendek(hr[hr.length - 1].tgl) : ''}</span></div>
      </div>
      <div class="kks-card"><h3>Peringkat kos Anda</h3>${daftar}</div>
      ${tp.length ? `<div class="kks-card"><h3>💡 Saran</h3>${tp.map(x => `<div class="kks-tip"><span>${x[0]}</span><span>${x[1]}</span></div>`).join('')}</div>` : ''}
      <div class="kks-info" style="padding-top:4px">Pemilik yang membuka kosnya sendiri tidak dihitung.<br>Satu perangkat dihitung sekali per 30 menit.</div>`;
  }

  async function muat(h) {
    const isi = document.getElementById('kksIsi');
    if (!isi) return;
    isi.innerHTML = '<div class="kks-info">Memuat statistik…</div>';
    try {
      const { data, error } = await sbClient.rpc('kk_statistik', { p_hari: h });
      if (error) throw error;
      isi.innerHTML = gambar(data || {}, h);
    } catch (err) {
      console.error('Statistik gagal:', err);
      const belum = /kk_statistik|function|schema cache/i.test((err && err.message) || '');
      isi.innerHTML = belum
        ? '<div class="kks-info"><b>Statistik belum aktif</b>Jalankan file <i>statistik-kos.sql</i> di Supabase SQL Editor, lalu buka halaman ini lagi.</div>'
        : '<div class="kks-info"><b>Gagal memuat</b>Periksa koneksi internet, lalu coba lagi.</div>';
    }
  }

  window.showStatistik = function () {
    bangunLayar();
    window.show('statistik', 'owner');
    document.querySelectorAll('#kksChips .kks-chip').forEach(c => c.classList.toggle('on', c.dataset.h === '30'));
    muat(30);
  };

  // ---------- Kartu menu di Dashboard Pemilik ----------
  function pasangMenu() {
    const grid = document.querySelector('#screen-owner .owner-menu-grid');
    if (!grid || grid.querySelector('#kksMenu')) return;
    const kartu = document.createElement('div');
    kartu.className = 'owner-menu-card';
    kartu.id = 'kksMenu';
    kartu.innerHTML = '<div class="owner-menu-icon">📈</div><div class="owner-menu-label">Statistik Kos</div><div class="owner-menu-badge" style="color:var(--orange)">Lihat grafik</div>';
    kartu.addEventListener('click', () => window.showStatistik());
    // Taruh setelah kartu Keuangan bila ada
    const keu = Array.from(grid.children).find(c => /Keuangan/.test(c.textContent));
    if (keu && keu.nextSibling) grid.insertBefore(kartu, keu.nextSibling); else grid.appendChild(kartu);
  }

  function mulai() { pasangMenu(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
})();
