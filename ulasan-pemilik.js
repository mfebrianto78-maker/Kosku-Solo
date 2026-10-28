// =====================================================
// KosKu Solo — Halaman "Ulasan" untuk Pemilik
// Dimuat lewat: <script src="ulasan-pemilik.js"></script>  (setelah statistik-kos.js)
// Kartu "Review" di Dashboard Pemilik sebelumnya salah mengarah ke Kelola Kos.
// Sekarang membuka daftar ulasan dari semua kos milik pemilik.
// =====================================================
(function () {
  'use strict';
  if (window.__kkUlasanReady) return;
  window.__kkUlasanReady = true;

  const css = document.createElement('style');
  css.textContent = `
  #screen-ulasan{background:var(--bg)}
  .kku-head{background:linear-gradient(135deg,#FF7A00,#FF9A3D);color:#fff;padding:52px 20px 22px;border-radius:0 0 26px 26px}
  .kku-top{display:flex;align-items:center;gap:12px}
  .kku-back{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer}
  .kku-head h2{font-size:19px;font-weight:800;margin:0}
  .kku-body{flex:1;overflow-y:auto;padding:14px 16px 110px}
  .kku-sum{display:flex;gap:16px;align-items:center;background:var(--card);border-radius:16px;padding:16px;box-shadow:0 2px 10px rgba(0,0,0,.05);margin-bottom:12px}
  .kku-avg{text-align:center;flex:none}
  .kku-avg b{display:block;font-size:34px;font-weight:800;color:var(--text);line-height:1}
  .kku-avg .st{color:var(--orange);font-size:13px;letter-spacing:1px;margin:4px 0 2px}
  .kku-avg span{font-size:11px;color:var(--text-3)}
  .kku-dist{flex:1;display:flex;flex-direction:column;gap:4px}
  .kku-dr{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text-3)}
  .kku-dr .tr{flex:1;height:7px;border-radius:5px;background:var(--border);overflow:hidden}
  .kku-dr .fl{display:block;height:100%;background:var(--orange);border-radius:5px}
  .kku-dr .n{width:18px;text-align:right}
  .kku-chips{display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none}
  .kku-chips::-webkit-scrollbar{display:none}
  .kku-chip{flex:none;padding:8px 14px;border-radius:20px;background:var(--card);border:1.5px solid var(--border);font-size:12.5px;font-weight:700;color:var(--text-2);cursor:pointer;white-space:nowrap}
  .kku-chip.on{background:var(--orange);border-color:var(--orange);color:#fff}
  .kku-item{background:var(--card);border-radius:16px;padding:14px;box-shadow:0 2px 10px rgba(0,0,0,.05);margin-bottom:10px;display:flex;gap:10px}
  .kku-av{width:38px;height:38px;border-radius:50%;overflow:hidden;flex:none;background:var(--orange-light);display:flex;align-items:center;justify-content:center;font-size:17px}
  .kku-av img{width:100%;height:100%;object-fit:cover}
  .kku-main{flex:1;min-width:0}
  .kku-nm{font-size:13.5px;font-weight:700;color:var(--text)}
  .kku-kos{font-size:11.5px;color:var(--orange);font-weight:700;margin-top:1px}
  .kku-stars{color:var(--orange);font-size:13px;letter-spacing:1px;margin-top:4px}
  .kku-kom{font-size:13px;color:var(--text-2);line-height:1.5;margin-top:4px;word-break:break-word}
  .kku-tgl{font-size:11px;color:var(--text-3);margin-top:5px}
  .kku-info{text-align:center;color:var(--text-3);font-size:13px;line-height:1.6;padding:40px 10px}
  .kku-info b{display:block;color:var(--text);font-size:15px;margin-bottom:6px}
  `;
  document.head.appendChild(css);

  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let semua = [];     // semua ulasan
  let filter = 'all'; // id kos atau 'all'

  function bangunLayar() {
    if (document.getElementById('screen-ulasan')) return;
    const induk = document.getElementById('screen-owner') ? document.getElementById('screen-owner').parentNode : document.body;
    const s = document.createElement('div');
    s.id = 'screen-ulasan';
    s.className = 'screen';
    s.innerHTML = `
      <div class="kku-head"><div class="kku-top"><div class="kku-back" id="kkuBack">←</div><h2>⭐ Ulasan Kos Anda</h2></div></div>
      <div class="kku-body" id="kkuIsi"></div>`;
    induk.appendChild(s);
    s.querySelector('#kkuBack').addEventListener('click', () => { if (typeof window.showOwner === 'function') window.showOwner(); });
    s.querySelector('#kkuIsi').addEventListener('click', e => {
      const c = e.target.closest('.kku-chip'); if (!c) return;
      filter = c.dataset.k;
      gambar();
    });
  }

  function namaKos(id) {
    const k = (typeof myKosData !== 'undefined' ? myKosData : []).find(x => x.id === id);
    return (k && k.nama_kos) || 'Kos';
  }

  function gambar() {
    const isi = document.getElementById('kkuIsi'); if (!isi) return;
    const kosList = typeof myKosData !== 'undefined' ? (myKosData || []) : [];
    if (!kosList.length) { isi.innerHTML = '<div class="kku-info"><b>Belum ada kos</b>Tambahkan kos dulu.</div>'; return; }

    const daftar = filter === 'all' ? semua : semua.filter(r => r.kos_id === filter);
    const n = daftar.length;
    const avg = n ? daftar.reduce((a, r) => a + (Number(r.rating) || 0), 0) / n : 0;
    const dist = [5, 4, 3, 2, 1].map(b => ({ b, c: daftar.filter(r => Math.round(r.rating) === b).length }));

    const chips = kosList.length > 1
      ? `<div class="kku-chips"><div class="kku-chip ${filter === 'all' ? 'on' : ''}" data-k="all">Semua kos</div>${kosList.map(k => `<div class="kku-chip ${filter === k.id ? 'on' : ''}" data-k="${esc(k.id)}">${esc(k.nama_kos)}</div>`).join('')}</div>`
      : '';

    const ringkas = n ? `
      <div class="kku-sum">
        <div class="kku-avg"><b>${avg.toFixed(1).replace('.', ',')}</b><div class="st">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5 - Math.round(avg))}</div><span>${n} ulasan</span></div>
        <div class="kku-dist">${dist.map(d => `<div class="kku-dr"><span>${d.b}★</span><span class="tr"><span class="fl" style="width:${Math.round((d.c / n) * 100)}%"></span></span><span class="n">${d.c}</span></div>`).join('')}</div>
      </div>` : '';

    const item = r => {
      const foto = r.profil && r.profil.foto_url;
      const rt = Math.max(0, Math.min(5, Math.round(r.rating) || 0));
      const tgl = new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      return `<div class="kku-item">
        <div class="kku-av">${foto ? `<img src="${esc(foto)}" alt="">` : '🧑'}</div>
        <div class="kku-main">
          <div class="kku-nm">${esc((r.profil && r.profil.nama_lengkap) || 'Pengguna')}</div>
          <div class="kku-kos">${esc(namaKos(r.kos_id))}</div>
          <div class="kku-stars">${'★'.repeat(rt)}${'☆'.repeat(5 - rt)}</div>
          ${r.komentar ? `<div class="kku-kom">${esc(r.komentar)}</div>` : ''}
          <div class="kku-tgl">${tgl}</div>
        </div></div>`;
    };

    isi.innerHTML = chips + ringkas + (n ? daftar.map(item).join('')
      : '<div class="kku-info"><b>Belum ada ulasan</b>Ulasan dari penyewa akan muncul di sini setelah mereka selesai menyewa.</div>');
  }

  async function muat() {
    const isi = document.getElementById('kkuIsi');
    isi.innerHTML = '<div class="kku-info">Memuat ulasan…</div>';
    try {
      const ids = (typeof myKosData !== 'undefined' ? (myKosData || []) : []).map(k => k.id);
      if (!ids.length) { semua = []; gambar(); return; }
      const { data, error } = await sbClient.from('reviews').select('*').in('kos_id', ids).order('created_at', { ascending: false });
      if (error) throw error;
      semua = data || [];
      const uids = [...new Set(semua.map(r => r.user_id).filter(Boolean))];
      if (uids.length) {
        const { data: pr } = await sbClient.from('profiles').select('id, nama_lengkap, foto_url').in('id', uids);
        const peta = {}; (pr || []).forEach(p => { peta[p.id] = p; });
        semua.forEach(r => { r.profil = peta[r.user_id]; });
      }
      gambar();
    } catch (err) {
      console.error('Gagal memuat ulasan:', err);
      isi.innerHTML = '<div class="kku-info"><b>Gagal memuat</b>Periksa koneksi internet, lalu coba lagi.</div>';
    }
  }

  window.showUlasanPemilik = function () {
    bangunLayar();
    filter = 'all';
    window.show('ulasan', 'owner');
    muat();
  };

  // Sambungkan kartu "Review" (menggantikan tautan lama ke Kelola Kos)
  function pasang() {
    const kartu = Array.from(document.querySelectorAll('#screen-owner .owner-menu-card'))
      .find(c => /Review/.test(c.textContent));
    if (!kartu) return;
    kartu.style.cursor = 'pointer';
    kartu.onclick = function () { window.showUlasanPemilik(); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pasang); else pasang();
})();
