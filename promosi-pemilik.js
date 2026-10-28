// =====================================================
// KosKu Solo — Promosi Kos untuk Pemilik (Tahap 2)
// Dimuat lewat: <script src="promosi-pemilik.js"></script>  (setelah promosi-kos.js)
// Butuh: promosi-pengajuan.sql sudah dijalankan di Supabase.
//
// Menu "Promosi Kos" di Dashboard Pemilik: ajukan promosi "Kos Unggulan",
// pantau status (menunggu / tayang / ditolak), dan lihat hasilnya.
// =====================================================
(function () {
  'use strict';
  if (window.__kkPromoOwnerReady) return;
  window.__kkPromoOwnerReady = true;

  const HARI = 86400000;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tgl = d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmt = n => Number(n || 0).toLocaleString('id-ID');

  function toast(t) {
    try { if (typeof showToast === 'function') { showToast(t); return; } } catch (e) { /* abaikan */ }
    alert(t);
  }

  const css = document.createElement('style');
  css.textContent = `
  #screen-promosi-saya{background:var(--bg)}
  .kkq-head{background:linear-gradient(135deg,#F59E0B,#FF7A00);color:#fff;padding:52px 20px 22px;border-radius:0 0 26px 26px}
  .kkq-top{display:flex;align-items:center;gap:12px}
  .kkq-back{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer}
  .kkq-head h2{font-size:19px;font-weight:800;margin:0}
  .kkq-head p{font-size:12.5px;opacity:.95;margin:10px 0 0;line-height:1.55}
  .kkq-body{flex:1;overflow-y:auto;padding:14px 16px 110px}
  .kkq-card{background:var(--card);border-radius:16px;padding:15px;box-shadow:0 2px 10px rgba(0,0,0,.05);margin-bottom:12px}
  .kkq-nm{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .kkq-nm b{font-size:15px;color:var(--text);line-height:1.3}
  .kkq-st{flex:none;font-size:11px;font-weight:800;padding:3px 10px;border-radius:10px;white-space:nowrap}
  .kkq-st.tayang{background:#FEF3C7;color:#92400E} .kkq-st.tunggu{background:#DBEAFE;color:#1E40AF}
  .kkq-st.biasa{background:var(--border);color:var(--text-3)} .kkq-st.tolak{background:#FEE2E2;color:#991B1B}
  .kkq-info{font-size:12.5px;color:var(--text-2);line-height:1.55;margin-top:8px}
  .kkq-hasil{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
  .kkq-hasil div{background:var(--bg);border-radius:12px;padding:9px 6px;text-align:center}
  .kkq-hasil b{display:block;font-size:18px;font-weight:800;color:var(--text)}
  .kkq-hasil span{font-size:10.5px;color:var(--text-3)}
  .kkq-naik{font-size:12px;font-weight:700;color:var(--green);margin-top:8px}
  .kkq-btn{width:100%;margin-top:12px;padding:12px;border:0;border-radius:12px;font:800 13.5px 'Plus Jakarta Sans',sans-serif;cursor:pointer;background:var(--orange);color:#fff}
  .kkq-btn.alt{background:var(--bg);color:var(--text-2);border:1.5px solid var(--border)}
  .kkq-btn:disabled{opacity:.5}
  .kkq-ket{background:var(--card);border-radius:16px;padding:14px 15px;margin-bottom:12px;font-size:12.5px;color:var(--text-2);line-height:1.6}
  .kkq-ket b{color:var(--text)}
  .kkq-kosong{text-align:center;color:var(--text-3);font-size:13px;padding:40px 10px;line-height:1.6}
  #kkqModal{position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}
  #kkqModal .box{background:var(--card);color:var(--text);width:100%;max-width:430px;max-height:92vh;overflow-y:auto;border-radius:22px 22px 0 0;padding:20px 18px 26px}
  #kkqModal h3{margin:0 0 4px;font-size:17px;font-weight:800}
  #kkqModal .sub{font-size:12.5px;color:var(--text-3);margin-bottom:12px}
  #kkqModal label{display:block;font-size:12px;font-weight:800;color:var(--text-2);margin:14px 0 6px}
  #kkqModal textarea{width:100%;box-sizing:border-box;padding:11px 12px;border:1.5px solid var(--border);border-radius:11px;font:600 14px 'Plus Jakarta Sans',sans-serif;background:var(--card);color:var(--text);min-height:66px;resize:vertical}
  #kkqModal .dur{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
  #kkqModal .dur button{padding:10px 2px;border-radius:12px;border:1.5px solid var(--border);background:var(--card);font:800 13px 'Plus Jakarta Sans',sans-serif;color:var(--text-2);cursor:pointer;line-height:1.3}
  #kkqModal .dur button small{display:block;font-weight:600;font-size:10.5px;opacity:.8}
  #kkqModal .dur button.on{background:var(--orange);border-color:var(--orange);color:#fff}
  #kkqModal .cat{font-size:12px;color:var(--text-2);background:var(--bg);border-radius:10px;padding:10px 12px;margin-top:12px;line-height:1.55}
  #kkqModal .err{color:var(--red);font-size:12.5px;font-weight:700;margin-top:10px;display:none}
  #kkqModal .btns{display:flex;gap:10px;margin-top:16px}
  #kkqModal .btns button{flex:1;padding:13px;border:0;border-radius:12px;font:800 14px 'Plus Jakarta Sans',sans-serif;cursor:pointer;background:var(--bg);color:var(--text)}
  #kkqModal .btns button.ok{background:var(--orange);color:#fff}
  `;
  document.head.appendChild(css);

  const BINTANG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

  // ---------- Layar ----------
  function bangunLayar() {
    if (document.getElementById('screen-promosi-saya')) return;
    const induk = document.getElementById('screen-owner') ? document.getElementById('screen-owner').parentNode : document.body;
    const s = document.createElement('div');
    s.id = 'screen-promosi-saya';
    s.className = 'screen';
    s.innerHTML = `
      <div class="kkq-head">
        <div class="kkq-top"><div class="kkq-back" id="kkqBack">←</div><h2>⭐ Promosi Kos</h2></div>
        <p>Jadikan kos Anda <b>Unggulan</b>: tampil di urutan teratas Beranda dan hasil pencarian dengan label ⭐ Unggulan.</p>
      </div>
      <div class="kkq-body" id="kkqIsi"></div>`;
    induk.appendChild(s);
    s.querySelector('#kkqBack').addEventListener('click', () => { if (typeof window.showOwner === 'function') window.showOwner(); });
    s.querySelector('#kkqIsi').addEventListener('click', e => {
      const a = e.target.closest('[data-aksi]'); if (!a) return;
      if (a.dataset.aksi === 'ajukan') bukaForm(a.dataset.id);
      else if (a.dataset.aksi === 'batal') batalkan(a.dataset.pid);
    });
  }

  let jadwal = [];      // promosi milik pemilik
  let hasil = [];       // hasil promosi
  let pengajuan = [];   // pengajuan milik pemilik

  async function muat() {
    const isi = document.getElementById('kkqIsi');
    isi.innerHTML = '<div class="kkq-kosong">Memuat…</div>';
    try {
      const [a, b, c] = await Promise.all([
        sbClient.rpc('kk_promosi_saya'),
        sbClient.rpc('kk_hasil_promosi'),
        sbClient.from('promosi_pengajuan').select('*').order('created_at', { ascending: false })
      ]);
      if (a.error) throw a.error;
      if (c.error) throw c.error;
      jadwal = a.data || [];
      hasil = (b && !b.error && b.data) || [];
      pengajuan = c.data || [];
      gambar();
    } catch (err) {
      console.error('Promosi pemilik gagal dimuat:', err);
      const belum = /function|relation|does not exist|schema cache|promosi/i.test((err && err.message) || '');
      isi.innerHTML = belum
        ? '<div class="kkq-kosong"><b>Fitur promosi belum aktif</b><br>Jalankan file <i>promosi-pengajuan.sql</i> di Supabase SQL Editor, lalu buka halaman ini lagi.</div>'
        : '<div class="kkq-kosong"><b>Gagal memuat</b><br>Periksa koneksi internet, lalu coba lagi.</div>';
    }
  }

  function gambar() {
    const isi = document.getElementById('kkqIsi'); if (!isi) return;
    const kosList = (typeof myKosData !== 'undefined' ? myKosData : []) || [];
    if (!kosList.length) { isi.innerHTML = '<div class="kkq-kosong"><b>Belum ada kos</b><br>Tambahkan kos dulu, lalu Anda bisa mempromosikannya.</div>'; return; }
    const now = Date.now();

    isi.innerHTML = `
      <div class="kkq-ket"><b>Cara kerjanya</b><br>1. Pilih kos dan lama tayang, lalu ajukan.<br>2. Admin menghubungi Anda untuk biaya &amp; pembayaran.<br>3. Setelah disetujui, kos Anda langsung tayang sebagai Unggulan.</div>` +
      kosList.map(k => {
        const promo = jadwal.filter(p => p.kos_id === k.id);
        const tayang = promo.find(p => Date.parse(p.mulai) <= now && Date.parse(p.selesai) > now);
        const akan = promo.find(p => Date.parse(p.mulai) > now);
        const tunggu = pengajuan.find(p => p.kos_id === k.id && p.status === 'menunggu');
        const tolak = !tunggu && pengajuan.find(p => p.kos_id === k.id);
        const tolakAkhir = tolak && tolak.status === 'ditolak' ? tolak : null;
        const h = hasil.find(x => x.kos_id === k.id);
        const aktif = k.status ? k.status === 'aktif' : true;

        let badge = '<span class="kkq-st biasa">Belum dipromosikan</span>', info = '';
        if (tayang) {
          const sisa = Math.max(0, Math.ceil((Date.parse(tayang.selesai) - now) / HARI));
          badge = '<span class="kkq-st tayang">⭐ Tayang</span>';
          info = `Tayang sampai <b>${tgl(tayang.selesai)}</b> · sisa ${sisa} hari.`;
        } else if (akan) {
          badge = '<span class="kkq-st tunggu">Dijadwalkan</span>';
          info = `Mulai tayang <b>${tgl(akan.mulai)}</b>.`;
        } else if (tunggu) {
          badge = '<span class="kkq-st tunggu">⏳ Menunggu admin</span>';
          info = `Pengajuan ${tunggu.durasi_hari} hari terkirim ${tgl(tunggu.created_at)}. Admin akan menghubungi Anda.`;
        } else if (tolakAkhir) {
          badge = '<span class="kkq-st tolak">Ditolak</span>';
          info = `Pengajuan terakhir ditolak: <b>${esc(tolakAkhir.alasan || 'tidak ada alasan')}</b>.`;
        } else if (h) {
          info = `Promosi terakhir berakhir ${tgl(h.selesai)}.`;
        } else {
          info = 'Belum pernah dipromosikan.';
        }

        let blokHasil = '';
        if (h) {
          const naik = h.lihat_sebelum > 0 ? Math.round(((h.lihat - h.lihat_sebelum) / h.lihat_sebelum) * 100) : null;
          blokHasil = `<div class="kkq-hasil"><div><b>${fmt(h.lihat)}</b><span>dilihat</span></div><div><b>${fmt(h.bagikan)}</b><span>dibagikan</span></div><div><b>${fmt(h.booking)}</b><span>booking</span></div></div>` +
            (naik !== null ? `<div class="kkq-naik" style="${naik < 0 ? 'color:var(--red)' : ''}">${naik >= 0 ? '▲' : '▼'} ${Math.abs(naik)}% dilihat dibanding periode sebelum promosi</div>` : '<div class="kkq-info" style="font-size:11.5px">Selama masa promosi ' + tgl(h.mulai) + ' – ' + tgl(h.selesai) + '.</div>');
        }

        let tombol = '';
        if (!aktif) tombol = '<button class="kkq-btn alt" disabled>Kos nonaktif tidak bisa dipromosikan</button>';
        else if (tunggu) tombol = `<button class="kkq-btn alt" data-aksi="batal" data-pid="${esc(tunggu.id)}">Batalkan pengajuan</button>`;
        else tombol = `<button class="kkq-btn" data-aksi="ajukan" data-id="${esc(k.id)}">${tayang ? 'Ajukan perpanjangan' : '⭐ Ajukan promosi'}</button>`;

        return `<div class="kkq-card"><div class="kkq-nm"><b>${esc(k.nama_kos)}</b>${badge}</div><div class="kkq-info">${info}</div>${blokHasil}${tombol}</div>`;
      }).join('');
  }

  // ---------- Ajukan ----------
  function bukaForm(kosId) {
    if (document.getElementById('kkqModal')) return;
    const kos = (myKosData || []).find(k => k.id === kosId); if (!kos) return;
    const m = document.createElement('div');
    m.id = 'kkqModal';
    m.innerHTML = `<div class="box">
      <h3>⭐ Ajukan Promosi Unggulan</h3>
      <div class="sub">${esc(kos.nama_kos)}</div>
      <label>Lama tayang</label>
      <div class="dur" id="kkqDur">
        <button data-h="7">7<small>hari</small></button><button data-h="14">14<small>hari</small></button><button class="on" data-h="30">30<small>hari</small></button><button data-h="60">60<small>hari</small></button>
      </div>
      <label>Pesan untuk admin (opsional)</label>
      <textarea id="kkqPesan" maxlength="300" placeholder="Contoh: Mohon dihubungi lewat WhatsApp 08xx. Ingin tayang mulai awal bulan."></textarea>
      <div class="cat">💡 Biaya dan pembayaran dikonfirmasi admin setelah pengajuan masuk. Kos baru tayang setelah disetujui.</div>
      <div class="err" id="kkqErr"></div>
      <div class="btns"><button id="kkqBatal">Batal</button><button class="ok" id="kkqKirim">Kirim Pengajuan</button></div>
    </div>`;
    document.body.appendChild(m);
    let hari = 30;
    m.querySelector('#kkqDur').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      hari = parseInt(b.dataset.h, 10);
      m.querySelectorAll('#kkqDur button').forEach(x => x.classList.toggle('on', x === b));
    });
    m.querySelector('#kkqBatal').addEventListener('click', () => m.remove());
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    m.querySelector('#kkqKirim').addEventListener('click', async () => {
      const btn = m.querySelector('#kkqKirim'), err = m.querySelector('#kkqErr');
      err.style.display = 'none'; btn.disabled = true; btn.textContent = 'Mengirim...';
      try {
        const { error } = await sbClient.from('promosi_pengajuan').insert({
          kos_id: kosId, durasi_hari: hari, pesan: m.querySelector('#kkqPesan').value.trim() || null
        });
        if (error) throw error;
        m.remove();
        toast('Pengajuan terkirim. Admin akan menghubungi Anda.');
        muat();
      } catch (e) {
        btn.disabled = false; btn.textContent = 'Kirim Pengajuan';
        const dobel = /duplicate|unique/i.test((e && e.message) || '');
        err.textContent = dobel ? 'Kos ini sudah punya pengajuan yang menunggu.' : 'Gagal mengirim: ' + ((e && e.message) || 'coba lagi');
        err.style.display = 'block';
      }
    });
  }

  async function batalkan(pid) {
    if (!confirm('Batalkan pengajuan promosi ini?')) return;
    try {
      const { data, error } = await sbClient.rpc('kk_batalkan_pengajuan', { p_id: pid });
      if (error) throw error;
      toast(data ? 'Pengajuan dibatalkan.' : 'Pengajuan sudah diproses admin.');
      muat();
    } catch (e) { toast('Gagal: ' + ((e && e.message) || 'coba lagi')); }
  }

  window.showPromosiSaya = function () {
    bangunLayar();
    window.show('promosi-saya', 'owner');
    muat();
  };

  // ---------- Kartu menu di Dashboard Pemilik ----------
  function pasangMenu() {
    const grid = document.querySelector('#screen-owner .owner-menu-grid');
    if (!grid || grid.querySelector('#kkqMenu')) return;
    const k = document.createElement('div');
    k.className = 'owner-menu-card';
    k.id = 'kkqMenu';
    k.innerHTML = `<div class="owner-menu-icon" style="width:54px;height:54px;border-radius:16px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;background:#FEF3C7;color:#D97706;font-size:0">${BINTANG}</div><div class="owner-menu-label">Promosi Kos</div><div class="owner-menu-badge" style="color:#D97706">Tampil teratas</div>`;
    k.addEventListener('click', () => window.showPromosiSaya());
    const stat = grid.querySelector('#kksMenu');
    if (stat && stat.nextSibling) grid.insertBefore(k, stat.nextSibling); else grid.appendChild(k);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasangMenu); else pasangMenu();
})();
