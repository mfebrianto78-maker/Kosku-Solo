// =====================================================
// KosKu Solo — Promosi "Kos Unggulan" (diatur admin)
// Dimuat lewat: <script src="promosi-kos.js"></script>  (paling akhir)
// Butuh: promosi-kos.sql sudah dijalankan di Supabase.
//
// Pencari : kos unggulan tampil paling atas di Rekomendasi (Beranda) dan hasil Cari,
//           dengan label "Unggulan".
// Admin   : tab "Promosi" di Dashboard Admin untuk menambah, memperpanjang,
//           menghentikan, dan menghapus promosi (lengkap dengan catatan pembayaran).
// =====================================================
(function () {
  'use strict';
  if (window.__kkPromoReady) return;
  window.__kkPromoReady = true;

  const MAKS_SLOT = 3; // jumlah kos unggulan yang disarankan tampil bersamaan
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const HARI = 86400000;

  // =====================================================
  // BAGIAN 1 — Tampil ke pencari
  // =====================================================
  let aktifIds = new Set();
  let urutAcak = {};      // urutan acak adil antar kos unggulan (berubah tiap muat data)

  async function ambilPromoAktif() {
    try {
      const { data, error } = await sbClient.rpc('kk_promosi_aktif');
      if (error) throw error;
      const s = new Set();
      (data || []).forEach(p => { if (p.jenis === 'unggulan') s.add(p.kos_id); });
      return s;
    } catch (e) {
      return null; // tabel belum dibuat / gagal: abaikan, aplikasi jalan seperti biasa
    }
  }

  function tandai(ids) {
    aktifIds = ids;
    urutAcak = {};
    Array.from(ids).sort(() => Math.random() - 0.5).forEach((id, i) => { urutAcak[id] = i; });
    try { (allKosData || []).forEach(k => { k.unggulan = ids.has(k.id); }); } catch (e) { /* abaikan */ }
  }

  // Taruh kos unggulan di depan, sisanya mengikuti urutan semula
  function utamakan(list) {
    const depan = list.filter(k => k.unggulan).sort((a, b) => (urutAcak[a.id] || 0) - (urutAcak[b.id] || 0));
    if (!depan.length) return list;
    return depan.concat(list.filter(k => !k.unggulan));
  }

  const asliLoad = window.loadKosData;
  if (typeof asliLoad === 'function') {
    window.loadKosData = async function () {
      const janji = ambilPromoAktif();            // diambil bersamaan dengan data kos
      const r = await asliLoad.apply(this, arguments);
      try {
        const ids = await janji;
        if (ids) {
          tandai(ids);
          if (ids.size && Array.isArray(allKosData)) {
            allKosData = utamakan(allKosData);
            const grid = document.getElementById('dashboardKosGrid');
            if (grid && allKosData.length && typeof renderKosCard === 'function') {
              grid.innerHTML = allKosData.slice(0, 4).map(renderKosCard).join('');
            }
            if (typeof renderFilteredKos === 'function') renderFilteredKos();
          }
        }
      } catch (e) { console.warn('promosi-kos:', e && e.message); }
      return r;
    };
  }

  window.KKPromo = { utamakan, aktif: () => aktifIds };

  const css = document.createElement('style');
  css.textContent = `
  .kkp-lencana{display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#FBBF24,#F59E0B);color:#5B3A00;font-size:10.5px;font-weight:800;padding:2px 8px;border-radius:7px;white-space:nowrap;vertical-align:middle;margin-left:6px}
  .kkp-lencana svg{flex:none}
  .kkp-tag{display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#FEF3C7,#FDE68A);color:#7A4B00;font-weight:800}
  `;
  document.head.appendChild(css);

  const BINTANG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

  const asliKartu = window.renderKosListCard;
  if (typeof asliKartu === 'function') {
    window.renderKosListCard = function (kos) {
      const html = asliKartu.apply(this, arguments);
      if (!kos || !aktifIds.has(kos.id)) return html;
      return html.replace(/(<div class="kk-name">[\s\S]*?)(<\/div>)/, `$1<span class="kkp-lencana">${BINTANG}Unggulan</span>$2`);
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
          row.querySelectorAll('.kkp-tag').forEach(e => e.remove());
          if (kos && aktifIds.has(kos.id)) row.insertAdjacentHTML('afterbegin', `<div class="fasil-tag kkp-tag">${BINTANG}Unggulan</div>`);
        }
      } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // =====================================================
  // BAGIAN 2 — Panel Admin: tab "Promosi"
  // =====================================================
  const TAB_LAIN = ['stats', 'banner', 'kos', 'users', 'tempat'];
  let data = [];
  let saring = 'aktif';

  function toast(t) {
    try { if (typeof showToast === 'function') { showToast(t); return; } } catch (e) { /* abaikan */ }
    alert(t);
  }

  const adminCss = document.createElement('style');
  adminCss.textContent = `
  .kkpa-add{border:0;background:var(--orange);color:#fff;font:800 12.5px 'Plus Jakarta Sans',sans-serif;padding:9px 14px;border-radius:12px;cursor:pointer}
  .kkpa-slot{background:#FFF7E0;border:1.5px solid #FCD34D;border-radius:14px;padding:12px 14px;margin-bottom:12px;font-size:12.5px;color:#7A4B00;line-height:1.5}
  .kkpa-slot b{font-size:14px}
  .kkpa-slot.penuh{background:#FEE2E2;border-color:#FCA5A5;color:#991B1B}
  .kkpa-chips{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;scrollbar-width:none}
  .kkpa-chips::-webkit-scrollbar{display:none}
  .kkpa-chips button{flex:none;padding:6px 12px;border-radius:16px;border:1.5px solid #E5E7EB;background:#fff;color:#555;font:700 12px 'Plus Jakarta Sans',sans-serif;cursor:pointer}
  .kkpa-chips button.on{background:var(--orange);border-color:var(--orange);color:#fff}
  .kkpa-row{background:#fff;border-radius:14px;padding:13px 14px;margin-bottom:10px;box-shadow:0 1px 6px rgba(0,0,0,.06);color:#111}
  .kkpa-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .kkpa-top b{font-size:14px;line-height:1.3}
  .kkpa-top span.st{flex:none;font-size:11px;font-weight:800;padding:3px 9px;border-radius:10px}
  .st.aktif{background:#DCFCE7;color:#166534} .st.jadwal{background:#DBEAFE;color:#1E40AF} .st.selesai{background:#F3F4F6;color:#6B7280}
  .kkpa-meta{font-size:12px;color:#6B7280;margin-top:5px;line-height:1.5}
  .kkpa-cat{font-size:12px;color:#92400E;background:#FEF3C7;border-radius:8px;padding:5px 9px;margin-top:7px}
  .kkpa-act{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
  .kkpa-act button{flex:1;min-width:70px;padding:8px 6px;border:1.5px solid #E5E7EB;border-radius:10px;background:#fff;color:#374151;font:700 11.5px 'Plus Jakarta Sans',sans-serif;cursor:pointer}
  .kkpa-act button.del{color:#DC2626;border-color:#FECACA}
  #kkpModal{position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center}
  #kkpModal .box{background:#fff;color:#111;width:100%;max-width:430px;max-height:92vh;overflow-y:auto;border-radius:22px 22px 0 0;padding:20px 18px 26px}
  #kkpModal h3{margin:0 0 14px;font-size:17px;font-weight:800}
  #kkpModal label{display:block;font-size:12px;font-weight:800;color:#374151;margin:12px 0 6px}
  #kkpModal input,#kkpModal select,#kkpModal textarea{width:100%;box-sizing:border-box;padding:11px 12px;border:1.5px solid #E5E7EB;border-radius:11px;font:600 14px 'Plus Jakarta Sans',sans-serif;background:#fff;color:#111}
  #kkpModal textarea{min-height:64px;resize:vertical}
  #kkpModal .dur{display:flex;gap:7px;flex-wrap:wrap}
  #kkpModal .dur button{flex:1;min-width:52px;padding:9px 4px;border-radius:11px;border:1.5px solid #E5E7EB;background:#fff;font:800 12.5px 'Plus Jakarta Sans',sans-serif;color:#374151;cursor:pointer}
  #kkpModal .dur button.on{background:var(--orange);border-color:var(--orange);color:#fff}
  #kkpModal .ring{font-size:12.5px;color:#374151;background:#F3F4F6;border-radius:10px;padding:9px 11px;margin-top:10px;line-height:1.5}
  #kkpModal .ring.warn{background:#FEF3C7;color:#92400E}
  #kkpModal .err{color:#DC2626;font-size:12.5px;font-weight:700;margin-top:10px;display:none}
  #kkpModal .btns{display:flex;gap:10px;margin-top:16px}
  #kkpModal .btns button{flex:1;padding:13px;border:0;border-radius:12px;font:800 14px 'Plus Jakarta Sans',sans-serif;cursor:pointer;background:#F3F4F6;color:#111}
  #kkpModal .btns button.ok{background:var(--orange);color:#fff}
  `;
  document.head.appendChild(adminCss);

  function pasangTab() {
    const contoh = document.getElementById('tab-users');
    if (!contoh || document.getElementById('tab-promosi')) return;
    const t = contoh.cloneNode(true);
    t.id = 'tab-promosi';
    t.textContent = '⭐ Promosi';
    t.setAttribute('onclick', "switchAdminTab('promosi')");
    t.style.borderBottomColor = 'transparent';
    t.style.color = 'var(--text-3)';
    contoh.parentElement.appendChild(t);
  }

  const asliSwitch = window.switchAdminTab;
  if (typeof asliSwitch === 'function') {
    window.switchAdminTab = function (tab) {
      pasangTab();
      const t = document.getElementById('tab-promosi');
      if (tab === 'promosi') {
        TAB_LAIN.forEach(x => {
          const e = document.getElementById('tab-' + x);
          if (e) { e.style.borderBottomColor = 'transparent'; e.style.color = 'var(--text-3)'; }
        });
        if (t) { t.style.borderBottomColor = 'var(--orange)'; t.style.color = 'var(--orange)'; }
        return muatPanel();
      }
      if (t) { t.style.borderBottomColor = 'transparent'; t.style.color = 'var(--text-3)'; }
      return asliSwitch.apply(this, arguments);
    };
  }

  const tglPendek = d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  function status(p) {
    const n = Date.now(), m = Date.parse(p.mulai), s = Date.parse(p.selesai);
    if (s <= n) return 'selesai';
    if (m > n) return 'jadwal';
    return 'aktif';
  }

  async function muatPanel() {
    const el = document.getElementById('adminContent'); if (!el) return;
    el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--text-3)">Memuat promosi...</div>';
    try {
      const { data: rows, error } = await sbClient.from('promosi_kos')
        .select('*, kos(nama_kos, alamat)').order('selesai', { ascending: false });
      if (error) throw error;
      data = rows || [];
      gambarPanel();
    } catch (err) {
      const belum = /relation|does not exist|schema cache|promosi_kos/i.test((err && err.message) || '');
      el.innerHTML = `<div style="text-align:center;padding:40px 16px;color:#DC2626;font-size:13px;line-height:1.5">
        ${belum ? 'Tabel promosi belum dibuat. Jalankan file promosi-kos.sql di Supabase → SQL Editor.' : 'Gagal memuat: ' + esc(err && err.message)}</div>`;
    }
  }

  function gambarPanel() {
    const el = document.getElementById('adminContent'); if (!el) return;
    const aktif = data.filter(p => status(p) === 'aktif');
    const jml = { aktif: aktif.length, jadwal: data.filter(p => status(p) === 'jadwal').length, selesai: data.filter(p => status(p) === 'selesai').length };
    const penuh = aktif.length >= MAKS_SLOT;
    const daftar = data.filter(p => saring === 'semua' || status(p) === saring);
    const label = { aktif: 'Aktif', jadwal: 'Dijadwalkan', selesai: 'Berakhir', semua: 'Semua' };

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div><div style="font-size:14px;font-weight:700">Promosi Kos Unggulan</div>
          <div style="font-size:11.5px;color:#6B7280">Kos unggulan tampil paling atas di Beranda &amp; Cari</div></div>
        <button class="kkpa-add" onclick="kkpBukaForm()">+ Tambah</button>
      </div>
      <div class="kkpa-slot ${penuh ? 'penuh' : ''}"><b>Slot terisi: ${aktif.length} / ${MAKS_SLOT}</b><br>${penuh ? 'Slot penuh. Menambah lagi membuat tiap kos kurang menonjol.' : 'Masih ada ' + (MAKS_SLOT - aktif.length) + ' slot kosong yang bisa dijual.'}</div>
      <div class="kkpa-chips">${['aktif', 'jadwal', 'selesai', 'semua'].map(k => `<button class="${saring === k ? 'on' : ''}" data-k="${k}">${label[k]}${k !== 'semua' ? ' (' + jml[k] + ')' : ''}</button>`).join('')}</div>
      ${daftar.length ? daftar.map(p => {
        const st = status(p);
        const sisa = Math.max(0, Math.ceil((Date.parse(p.selesai) - Date.now()) / HARI));
        const nama = (p.kos && p.kos.nama_kos) || 'Kos (sudah dihapus)';
        return `<div class="kkpa-row">
          <div class="kkpa-top"><b>${esc(nama)}</b><span class="st ${st}">${st === 'aktif' ? 'Tayang' : st === 'jadwal' ? 'Dijadwalkan' : 'Berakhir'}</span></div>
          <div class="kkpa-meta">${esc((p.kos && p.kos.alamat) || '')}<br>📅 ${tglPendek(p.mulai)} – ${tglPendek(p.selesai)}${st === 'aktif' ? ' · sisa ' + sisa + ' hari' : ''}</div>
          ${p.catatan ? `<div class="kkpa-cat">📝 ${esc(p.catatan)}</div>` : ''}
          <div class="kkpa-act">
            <button onclick="kkpPerpanjang('${esc(p.id)}',7)">+7 hari</button>
            <button onclick="kkpPerpanjang('${esc(p.id)}',30)">+30 hari</button>
            ${st !== 'selesai' ? `<button onclick="kkpHentikan('${esc(p.id)}')">Hentikan</button>` : ''}
            <button class="del" onclick="kkpHapus('${esc(p.id)}')">Hapus</button>
          </div></div>`;
      }).join('') : '<div style="text-align:center;padding:30px 0;color:#9CA3AF;font-size:13px">Belum ada promosi di kategori ini.</div>'}`;
    el.querySelector('.kkpa-chips').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      saring = b.dataset.k; gambarPanel();
    });
  }

  async function ubah(id, nilai, pesan) {
    try {
      const { data: hasil, error } = await sbClient.from('promosi_kos').update(nilai).eq('id', id).select('id');
      if (error) throw error;
      if (!hasil || !hasil.length) { toast('Tidak diizinkan. Pastikan Anda masuk sebagai admin.'); return; }
      toast(pesan);
      await muatPanel();
      refresh();
    } catch (e) { toast('Gagal: ' + (e && e.message)); }
  }

  window.kkpPerpanjang = function (id, hari) {
    const p = data.find(x => x.id === id); if (!p) return;
    const dasar = Math.max(Date.parse(p.selesai), Date.now());
    ubah(id, { selesai: new Date(dasar + hari * HARI).toISOString() }, 'Promosi diperpanjang ' + hari + ' hari.');
  };
  window.kkpHentikan = function (id) {
    if (!confirm('Hentikan promosi ini sekarang? Kos akan langsung kembali ke urutan biasa.')) return;
    const p = data.find(x => x.id === id); if (!p) return;
    const kini = new Date();
    // Bila belum mulai, geser mulainya agar tetap memenuhi aturan selesai > mulai
    const nilai = { selesai: kini.toISOString() };
    if (Date.parse(p.mulai) >= kini.getTime()) nilai.mulai = new Date(kini.getTime() - 1000).toISOString();
    ubah(id, nilai, 'Promosi dihentikan.');
  };
  window.kkpHapus = async function (id) {
    if (!confirm('Hapus catatan promosi ini selamanya?')) return;
    try {
      const { data: hasil, error } = await sbClient.from('promosi_kos').delete().eq('id', id).select('id');
      if (error) throw error;
      if (!hasil || !hasil.length) { toast('Tidak diizinkan.'); return; }
      toast('Promosi dihapus.');
      await muatPanel();
      refresh();
    } catch (e) { toast('Gagal: ' + (e && e.message)); }
  };

  // Muat ulang tanda "Unggulan" setelah admin mengubah promosi
  function refresh() {
    try { if (typeof window.loadKosData === 'function') window.loadKosData(); } catch (e) { /* abaikan */ }
  }

  // ---------- Formulir tambah promosi ----------
  const dua = n => String(n).padStart(2, '0');
  const tglInput = d => d.getFullYear() + '-' + dua(d.getMonth() + 1) + '-' + dua(d.getDate());

  window.kkpBukaForm = function () {
    if (document.getElementById('kkpModal')) return;
    let kosList = [];
    try { kosList = (allKosData || []).slice().sort((a, b) => String(a.nama_kos).localeCompare(String(b.nama_kos))); } catch (e) { /* abaikan */ }
    if (!kosList.length) { toast('Data kos belum dimuat. Buka Beranda dulu, lalu coba lagi.'); return; }

    const m = document.createElement('div');
    m.id = 'kkpModal';
    m.innerHTML = `<div class="box">
      <h3>⭐ Tambah Promosi Kos Unggulan</h3>
      <label>Kos yang dipromosikan</label>
      <select id="kkpKos">
        <option value="">— Pilih kos —</option>
        ${kosList.map(k => `<option value="${esc(k.id)}">${esc(k.nama_kos)}${k.owner_nama ? ' · ' + esc(k.owner_nama) : ''}</option>`).join('')}
      </select>
      <label>Mulai tayang</label>
      <input type="date" id="kkpMulai" value="${tglInput(new Date())}">
      <label>Lama tayang</label>
      <div class="dur" id="kkpDur">
        <button data-h="7">7 hari</button><button data-h="14">14 hari</button><button class="on" data-h="30">30 hari</button><button data-h="60">60 hari</button>
      </div>
      <div class="ring" id="kkpRing"></div>
      <label>Catatan pribadi admin (pembayaran, kontak, dll.)</label>
      <textarea id="kkpCat" maxlength="300" placeholder="Contoh: Lunas transfer BCA 28/10, Rp 150.000"></textarea>
      <div class="err" id="kkpErr"></div>
      <div class="btns"><button id="kkpBatal">Batal</button><button class="ok" id="kkpSimpan">Simpan &amp; Tayangkan</button></div>
    </div>`;
    document.body.appendChild(m);
    let hari = 30;
    const $ = id => m.querySelector('#' + id);

    function hitung() {
      const mulai = new Date($('kkpMulai').value + 'T00:00:00');
      const selesai = new Date(mulai.getTime() + hari * HARI);
      const bentrok = data.filter(p => status(p) !== 'selesai' && Date.parse(p.mulai) < selesai.getTime() && Date.parse(p.selesai) > mulai.getTime()).length;
      const ring = $('kkpRing');
      ring.innerHTML = `Tayang <b>${tglPendek(mulai)}</b> sampai <b>${tglPendek(new Date(selesai.getTime() - 1))}</b>.` +
        (bentrok >= MAKS_SLOT ? `<br>⚠️ Pada periode ini sudah ada ${bentrok} kos unggulan (batas saran ${MAKS_SLOT}).` : `<br>Slot terpakai pada periode ini: ${bentrok} dari ${MAKS_SLOT}.`);
      ring.classList.toggle('warn', bentrok >= MAKS_SLOT);
      return { mulai, selesai };
    }
    $('kkpDur').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      hari = parseInt(b.dataset.h, 10);
      m.querySelectorAll('#kkpDur button').forEach(x => x.classList.toggle('on', x === b));
      hitung();
    });
    $('kkpMulai').addEventListener('change', hitung);
    $('kkpBatal').addEventListener('click', () => m.remove());
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    hitung();

    $('kkpSimpan').addEventListener('click', async () => {
      const err = $('kkpErr'); err.style.display = 'none';
      const kosId = $('kkpKos').value;
      if (!kosId) { err.textContent = 'Pilih kos yang akan dipromosikan.'; err.style.display = 'block'; return; }
      if (!$('kkpMulai').value) { err.textContent = 'Tanggal mulai wajib diisi.'; err.style.display = 'block'; return; }
      const { mulai, selesai } = hitung();
      const dobel = data.find(p => p.kos_id === kosId && status(p) !== 'selesai' && Date.parse(p.mulai) < selesai.getTime() && Date.parse(p.selesai) > mulai.getTime());
      if (dobel) { err.textContent = 'Kos ini sudah punya promosi pada periode tersebut. Gunakan "Perpanjang" pada promosi yang ada.'; err.style.display = 'block'; return; }
      const btn = $('kkpSimpan'); btn.disabled = true; btn.textContent = 'Menyimpan...';
      try {
        const { error } = await sbClient.from('promosi_kos').insert({
          kos_id: kosId, jenis: 'unggulan',
          mulai: mulai.toISOString(), selesai: selesai.toISOString(),
          catatan: $('kkpCat').value.trim() || null
        });
        if (error) throw error;
        m.remove();
        toast('Promosi tersimpan.');
        await muatPanel();
        refresh();
      } catch (e) {
        btn.disabled = false; btn.textContent = 'Simpan & Tayangkan';
        err.textContent = 'Gagal menyimpan: ' + ((e && e.message) || 'periksa izin admin.'); err.style.display = 'block';
      }
    });
  };
})();
