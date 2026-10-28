// =====================================================
// KosKu Solo — Tab Admin "Foto": bersihkan foto yang tidak terpakai
// Dimuat lewat: <script src="bersih-foto.js"></script> (setelah promosi-pemilik.js)
// Memerlukan bersih-foto.sql sudah dijalankan.
// =====================================================
(function () {
  'use strict';
  if (window.__kkBersihFoto) return;
  window.__kkBersihFoto = true;

  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const IKON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  const CEK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  let daftar = [];      // {bucket, nama, ukuran, dibuat}
  let dipilih = new Set();
  let status = 'muat';  // muat | siap | gagal | belumSql
  let sibuk = false;

  const css = document.createElement('style');
  css.textContent = `
  .kkb-box{background:var(--card);border-radius:16px;padding:16px;box-shadow:0 1px 6px rgba(0,0,0,.06);margin-bottom:12px}
  .kkb-box h4{margin:0 0 4px;font-size:15px;font-weight:800;color:var(--text)}
  .kkb-box p{margin:0;font-size:12.5px;color:var(--text-3);line-height:1.55}
  .kkb-sum{display:flex;gap:10px;margin:12px 0 4px}
  .kkb-sum div{flex:1;background:var(--bg);border-radius:12px;padding:10px 12px}
  .kkb-sum b{display:block;font-size:19px;font-weight:800;color:var(--text)}
  .kkb-sum span{font-size:11px;color:var(--text-3)}
  .kkb-bar{display:flex;gap:8px;margin-top:12px}
  .kkb-bar button{flex:1;padding:12px;border:0;border-radius:12px;font:800 13px 'Plus Jakarta Sans',sans-serif;cursor:pointer;background:var(--bg);color:var(--text)}
  .kkb-bar button.merah{background:#EF4444;color:#fff}
  .kkb-bar button:disabled{opacity:.5}
  .kkb-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:4px}
  .kkb-it{position:relative;aspect-ratio:1;border-radius:12px;overflow:hidden;background:var(--bg);cursor:pointer;border:3px solid transparent}
  .kkb-it img{width:100%;height:100%;object-fit:cover;display:block}
  .kkb-it.on{border-color:#EF4444}
  .kkb-it .tk{position:absolute;right:5px;top:5px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.35);border:2px solid #fff;display:flex;align-items:center;justify-content:center}
  .kkb-it.on .tk{background:#EF4444}
  .kkb-it .uk{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,.7));color:#fff;font-size:10.5px;font-weight:700;padding:14px 6px 4px}
  .kkb-info{text-align:center;color:var(--text-3);font-size:13px;line-height:1.6;padding:30px 10px}
  .kkb-info b{display:block;color:var(--text);font-size:15px;margin-bottom:6px}
  .kkb-info.ok b{color:var(--green,#16A34A)}
  `;
  document.head.appendChild(css);

  function fmt(b) {
    b = Number(b) || 0;
    if (b >= 1048576) return (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
    if (b >= 1024) return Math.round(b / 1024) + ' KB';
    return b + ' B';
  }
  const kunci = f => f.bucket + '|' + f.nama;
  const urlFoto = f => { try { return sbClient.storage.from(f.bucket).getPublicUrl(f.nama).data.publicUrl; } catch (e) { return ''; } };

  async function muat() {
    status = 'muat'; gambar();
    try {
      const { data, error } = await sbClient.rpc('kk_foto_tak_terpakai');
      if (error) {
        status = /function|schema cache|does not exist/i.test(error.message || '') ? 'belumSql' : 'gagal';
        daftar = []; dipilih = new Set(); gambar(); return;
      }
      daftar = data || [];
      dipilih = new Set(daftar.map(kunci));
      status = 'siap';
    } catch (e) { status = 'gagal'; }
    gambar();
  }

  function gambar() {
    const el = document.getElementById('adminContent'); if (!el) return;
    if (status === 'muat') { el.innerHTML = '<div class="kkb-info">Memeriksa foto yang tidak terpakai…<br>Ini bisa beberapa detik.</div>'; return; }
    if (status === 'belumSql') { el.innerHTML = '<div class="kkb-info"><b>Fitur belum aktif</b>Jalankan file <code>bersih-foto.sql</code> di Supabase SQL Editor dulu.</div>'; return; }
    if (status === 'gagal') { el.innerHTML = '<div class="kkb-info"><b>Gagal memeriksa</b>Periksa koneksi lalu coba lagi.</div><div class="kkb-bar"><button id="kkbUlang">Coba lagi</button></div>'; el.querySelector('#kkbUlang').onclick = muat; return; }

    const total = daftar.reduce((a, f) => a + (Number(f.ukuran) || 0), 0);
    const pilihan = daftar.filter(f => dipilih.has(kunci(f)));
    const totalPilih = pilihan.reduce((a, f) => a + (Number(f.ukuran) || 0), 0);

    const kepala = `
      <div class="kkb-box">
        <h4>Foto tidak terpakai</h4>
        <p>Foto lama yang sudah tidak dipakai oleh kos, profil, banner, maupun data lain (misalnya setelah foto diganti atau kos dihapus). Foto yang diunggah kurang dari 1 hari tidak pernah masuk daftar.</p>
        <div class="kkb-sum"><div><b>${daftar.length}</b><span>file</span></div><div><b>${fmt(total)}</b><span>bisa dihemat</span></div></div>
      </div>`;

    if (!daftar.length) {
      el.innerHTML = kepala + '<div class="kkb-info ok"><b>Semua bersih</b>Tidak ada foto yang tidak terpakai.</div><div class="kkb-bar"><button id="kkbUlang">Periksa ulang</button></div>';
      el.querySelector('#kkbUlang').onclick = muat; return;
    }

    el.innerHTML = kepala + `
      <div class="kkb-box">
        <div style="font-size:12.5px;color:var(--text-3);margin-bottom:8px">Ketuk foto untuk memilih / membatalkan. Foto bertanda merah akan dihapus permanen.</div>
        <div class="kkb-grid">${daftar.map(f => `
          <div class="kkb-it ${dipilih.has(kunci(f)) ? 'on' : ''}" data-k="${esc(kunci(f))}">
            <img src="${esc(urlFoto(f))}" loading="lazy" alt="" onerror="this.style.display='none'">
            <div class="tk">${dipilih.has(kunci(f)) ? CEK : ''}</div>
            <div class="uk">${fmt(f.ukuran)}</div>
          </div>`).join('')}</div>
        <div class="kkb-bar">
          <button id="kkbSemua">${pilihan.length === daftar.length ? 'Batal semua' : 'Pilih semua'}</button>
          <button id="kkbHapus" class="merah" ${pilihan.length && !sibuk ? '' : 'disabled'}>${sibuk ? 'Menghapus…' : `Hapus ${pilihan.length} (${fmt(totalPilih)})`}</button>
        </div>
      </div>`;

    el.querySelector('.kkb-grid').onclick = e => {
      const it = e.target.closest('.kkb-it'); if (!it) return;
      const k = it.dataset.k;
      if (dipilih.has(k)) dipilih.delete(k); else dipilih.add(k);
      gambar();
    };
    el.querySelector('#kkbSemua').onclick = () => {
      dipilih = pilihan.length === daftar.length ? new Set() : new Set(daftar.map(kunci));
      gambar();
    };
    el.querySelector('#kkbHapus').onclick = hapus;
  }

  async function hapus() {
    if (sibuk) return;
    const pilihan = daftar.filter(f => dipilih.has(kunci(f)));
    if (!pilihan.length) return;
    const total = pilihan.reduce((a, f) => a + (Number(f.ukuran) || 0), 0);
    if (!confirm(`Hapus permanen ${pilihan.length} foto (${fmt(total)})?\n\nFoto yang dihapus tidak bisa dikembalikan.`)) return;
    sibuk = true; gambar();
    let terhapus = 0, gagal = 0;
    try {
      const perBucket = {};
      pilihan.forEach(f => { (perBucket[f.bucket] = perBucket[f.bucket] || []).push(f.nama); });
      for (const b of Object.keys(perBucket)) {
        const nama = perBucket[b];
        for (let i = 0; i < nama.length; i += 50) {
          const bagian = nama.slice(i, i + 50);
          const { data, error } = await sbClient.storage.from(b).remove(bagian);
          const n = error ? 0 : (data || []).length;   // hanya yang benar-benar terhapus
          terhapus += n; gagal += bagian.length - n;
        }
      }
    } catch (e) { gagal = pilihan.length - terhapus; }
    sibuk = false;
    await muat();
    const el = document.getElementById('adminContent');
    if (el) {
      const pesan = gagal
        ? `${terhapus} foto terhapus, ${gagal} gagal. Pastikan bersih-foto.sql sudah dijalankan sampai selesai.`
        : `${terhapus} foto berhasil dihapus.`;
      el.insertAdjacentHTML('afterbegin', `<div class="kkb-box" style="border-left:4px solid ${gagal ? '#EF4444' : '#16A34A'}"><p style="color:var(--text);font-weight:700">${esc(pesan)}</p></div>`);
    }
  }

  // ---- Tab di Panel Admin ----
  function pasangTab() {
    const contoh = document.getElementById('tab-users');
    if (!contoh || document.getElementById('tab-foto')) return;
    const t = contoh.cloneNode(true);
    t.id = 'tab-foto';
    t.innerHTML = IKON + 'Foto';
    t.setAttribute('onclick', "switchAdminTab('foto')");
    t.style.borderBottomColor = 'transparent';
    t.style.color = 'var(--text-3)';
    contoh.parentElement.appendChild(t);
  }

  const asli = window.switchAdminTab;
  if (typeof asli === 'function') {
    window.switchAdminTab = function (tab) {
      pasangTab();
      const t = document.getElementById('tab-foto');
      if (tab === 'foto') {
        document.querySelectorAll('.admin-tab').forEach(e => { e.style.borderBottomColor = 'transparent'; e.style.color = 'var(--text-3)'; });
        if (t) { t.style.borderBottomColor = 'var(--orange)'; t.style.color = 'var(--orange)'; }
        return muat();
      }
      if (t) { t.style.borderBottomColor = 'transparent'; t.style.color = 'var(--text-3)'; }
      return asli.apply(this, arguments);
    };
  }
})();
