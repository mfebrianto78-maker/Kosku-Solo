// =====================================================
// KosKu Solo — Bagikan Kos + Kartu Promosi
// Dimuat lewat: <script src="bagikan-kos.js"></script>  (setelah navigasi-kembali.js)
//
// Isi:
//  - Tombol Bagikan di Detail Kos (semua pengguna) dan di Kelola Kos (pemilik)
//  - Kartu Promosi berupa gambar: Feed (4:5) atau Story (9:16), 3 tema warna
//  - Teks promosi siap kirim (bisa diedit), tombol: Bagikan, Simpan gambar,
//    WhatsApp, Salin tautan
//  - Tautan bagikan membuka langsung Detail Kos di aplikasi (?kos=ID)
// Tidak perlu SQL.
// =====================================================

(function () {
  'use strict';
  if (window.__kkBagikanReady) return;
  window.__kkBagikanReady = true;

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const WARNA_JENIS = { Putri: '#EC4899', Putra: '#3B82F6', Campur: '#8B5CF6', Eksklusif: '#D97706' };
  const TEMA = {
    oranye: { nama: 'Oranye', bg: ['#FF9A1F', '#FF6A00'], teks: '#FFFFFF', redup: 'rgba(255,255,255,.88)', chip: 'rgba(255,255,255,.24)', chipTeks: '#FFFFFF', harga: '#FFFFFF', hargaTeks: '#FF6A00', garis: 'rgba(255,255,255,.35)', link: '#FFFFFF', logoBg: '#FFFFFF', logoIkon: '#FF6A00', bingkai: '#FFFFFF' },
    putih: { nama: 'Putih', bg: ['#FFFFFF', '#FFF4E6'], teks: '#1A1A2E', redup: '#6B7280', chip: '#FFF0E0', chipTeks: '#C2410C', harga: '#FF7A00', hargaTeks: '#FFFFFF', garis: '#F1E3D0', link: '#FF7A00', logoBg: '#FF7A00', logoIkon: '#FFFFFF', bingkai: '#FFFFFF' },
    gelap: { nama: 'Gelap', bg: ['#14141F', '#25253D'], teks: '#FFFFFF', redup: 'rgba(255,255,255,.7)', chip: 'rgba(255,255,255,.12)', chipTeks: '#FFFFFF', harga: '#FF7A00', hargaTeks: '#FFFFFF', garis: 'rgba(255,255,255,.18)', link: '#FF9A3D', logoBg: '#FF7A00', logoIkon: '#FFFFFF', bingkai: '#2F2F4A' }
  };
  const FORMAT = { feed: { w: 1080, h: 1350, nama: 'Feed 4:5' }, story: { w: 1080, h: 1920, nama: 'Story 9:16' } };

  let kosAktif = null;
  let format = 'feed';
  let tema = 'oranye';
  let teksPromo = '';
  let sedangGambar = 0;

  // ---------- Util ----------
  function rupiah(n) { try { return formatRupiah(n); } catch (e) { return 'Rp ' + Number(n || 0).toLocaleString('id-ID'); } }
  function tautanKos(id) {
    let basis = location.origin + location.pathname;
    return basis + '?kos=' + encodeURIComponent(id);
  }
  function terverifikasi(kos) {
    if (kos.lokasi_terverifikasi) return 'Lokasi Terverifikasi';
    try { if (isKosVerified(kos)) return 'Kos Terverifikasi'; } catch (e) { /* abaikan */ }
    return '';
  }
  function bangunTeks(kos) {
    const fas = (kos.fasilitas || []).slice(0, 4).join(' • ');
    const baris = [
      '🏠 ' + kos.nama_kos + ' (' + (kos.jenis_kos || 'Kos') + ')',
      '💰 ' + rupiah(kos.harga_per_bulan) + '/bulan',
      '📍 ' + (kos.alamat || ''),
    ];
    if (fas) baris.push('✨ ' + fas);
    const v = terverifikasi(kos);
    if (v) baris.push('✅ ' + v);
    baris.push('', 'Lihat detail & booking langsung di KosKu Solo:', tautanKos(kos.id));
    return baris.join('\n');
  }

  // ---------- Gambar kartu (canvas) ----------
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function bungkus(ctx, teks, maxW, maxBaris) {
    const kata = String(teks || '').split(/\s+/).filter(Boolean);
    let baris = [], cur = '';
    kata.forEach(k => {
      const t = cur ? cur + ' ' + k : k;
      if (ctx.measureText(t).width <= maxW) cur = t; else { if (cur) baris.push(cur); cur = k; }
    });
    if (cur) baris.push(cur);
    if (baris.length > maxBaris) {
      baris = baris.slice(0, maxBaris);
      let l = baris[maxBaris - 1];
      while (ctx.measureText(l + '…').width > maxW && l.length > 1) l = l.slice(0, -1);
      baris[maxBaris - 1] = l + '…';
    }
    return baris.length ? baris : [''];
  }
  function ikon(ctx, d, x, y, ukuran, warna, lebarGaris) {
    ctx.save();
    ctx.translate(x, y);
    const s = ukuran / 24;
    ctx.scale(s, s);
    ctx.strokeStyle = warna; ctx.lineWidth = lebarGaris || 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(new Path2D(d));
    ctx.restore();
  }
  const D_PIN = 'M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z M12 7.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z';
  const D_CEK = 'M5 12.5l4.5 4.5L19 7.5';
  const D_RUMAH = 'M3 11l9-8 9 8 M5 9.5V21h14V9.5 M10 21v-6h4v6';

  function muatFoto(url) {
    return new Promise(res => {
      if (!url) return res(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = url;
      setTimeout(() => res(null), 9000);
    });
  }

  async function gambarKartu(kos, fmt, namaTema) {
    const F = FORMAT[fmt], T = TEMA[namaTema];
    const W = F.w, H = F.h;
    try { await document.fonts.load('800 40px "Plus Jakarta Sans"'); await document.fonts.load('600 30px "Plus Jakarta Sans"'); } catch (e) { /* abaikan */ }
    const foto = await muatFoto(kos.foto_urls && kos.foto_urls[0]);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    const FONT = '"Plus Jakarta Sans", "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textBaseline = 'top';

    // Latar
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, T.bg[0]); g.addColorStop(1, T.bg[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (namaTema === 'oranye') {   // lingkaran dekoratif
      ctx.fillStyle = 'rgba(255,255,255,.10)';
      ctx.beginPath(); ctx.arc(W - 60, 120, 260, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(60, H - 220, 200, 0, Math.PI * 2); ctx.fill();
    }

    const M = 60;
    const atas = fmt === 'story' ? 150 : 56;

    // Logo
    ctx.fillStyle = T.logoBg;
    ctx.beginPath(); ctx.arc(M + 36, atas + 36, 36, 0, Math.PI * 2); ctx.fill();
    ikon(ctx, D_RUMAH, M + 14, atas + 14, 44, T.logoIkon, 2.2);
    ctx.fillStyle = T.teks; ctx.font = `800 46px ${FONT}`;
    ctx.fillText('KosKu Solo', M + 90, atas + 12);
    ctx.fillStyle = T.redup; ctx.font = `600 26px ${FONT}`;
    ctx.textAlign = 'right'; ctx.fillText('Cari kos di Soloraya', W - M, atas + 24); ctx.textAlign = 'left';

    // Foto
    const fy = atas + 104;
    const fh = fmt === 'story' ? 1010 : 620;
    const fw = W - M * 2;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 12;
    ctx.fillStyle = T.bingkai; rr(ctx, M - 8, fy - 8, fw + 16, fh + 16, 52); ctx.fill();
    ctx.restore();
    ctx.save();
    rr(ctx, M, fy, fw, fh, 44); ctx.clip();
    if (foto) {
      const r = Math.max(fw / foto.width, fh / foto.height);
      const dw = foto.width * r, dh = foto.height * r;
      ctx.drawImage(foto, M + (fw - dw) / 2, fy + (fh - dh) / 2, dw, dh);
    } else {
      const gp = ctx.createLinearGradient(M, fy, M + fw, fy + fh);
      gp.addColorStop(0, '#FFE0C0'); gp.addColorStop(1, '#FFB347');
      ctx.fillStyle = gp; ctx.fillRect(M, fy, fw, fh);
      ikon(ctx, D_RUMAH, M + fw / 2 - 110, fy + fh / 2 - 110, 220, 'rgba(255,255,255,.9)', 1.6);
    }
    const gb = ctx.createLinearGradient(0, fy + fh - 260, 0, fy + fh);
    gb.addColorStop(0, 'rgba(0,0,0,0)'); gb.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = gb; ctx.fillRect(M, fy + fh - 260, fw, 260);
    ctx.restore();

    // Label jenis (kiri atas foto)
    const jenis = kos.jenis_kos || 'Kos';
    ctx.font = `800 36px ${FONT}`;
    const jw = ctx.measureText(jenis).width + 56;
    ctx.fillStyle = WARNA_JENIS[jenis] || '#FF7A00';
    rr(ctx, M + 28, fy + 28, jw, 68, 34); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(jenis, M + 56, fy + 44);

    // Label terverifikasi (kanan atas foto)
    const v = terverifikasi(kos);
    if (v) {
      ctx.font = `800 30px ${FONT}`;
      const vw = ctx.measureText(v).width + 100;
      const vx = M + fw - 28 - vw;
      ctx.fillStyle = '#16A34A'; rr(ctx, vx, fy + 28, vw, 68, 34); ctx.fill();
      ikon(ctx, D_CEK, vx + 24, fy + 42, 40, '#fff', 3);
      ctx.fillStyle = '#fff'; ctx.fillText(v, vx + 72, fy + 47);
    }

    // Harga (kiri bawah foto)
    const hargaTeks = rupiah(kos.harga_per_bulan).replace(/\s/g, ' ');
    ctx.font = `800 58px ${FONT}`;
    const hw = ctx.measureText(hargaTeks).width;
    ctx.font = `600 30px ${FONT}`;
    const bw = ctx.measureText('/bulan').width;
    const pw = hw + bw + 80, ph = 104;
    const px = M + 28, py = fy + fh - 28 - ph;
    ctx.fillStyle = T.harga; rr(ctx, px, py, pw, ph, 30); ctx.fill();
    ctx.fillStyle = T.hargaTeks; ctx.font = `800 58px ${FONT}`; ctx.fillText(hargaTeks, px + 30, py + 20);
    ctx.font = `600 30px ${FONT}`; ctx.fillText('/bulan', px + 30 + hw + 10, py + 52);

    // Nama
    let y = fy + fh + 44;
    ctx.fillStyle = T.teks; ctx.font = `800 66px ${FONT}`;
    const namaBaris = bungkus(ctx, kos.nama_kos, W - M * 2, 2);
    namaBaris.forEach(b => { ctx.fillText(b, M, y); y += 78; });
    y += 4;

    // Alamat
    ctx.font = `600 34px ${FONT}`; ctx.fillStyle = T.redup;
    const alamatBaris = bungkus(ctx, kos.alamat, W - M * 2 - 52, fmt === 'story' ? 3 : 2);
    ikon(ctx, D_PIN, M - 2, y + 2, 40, T.link === '#FFFFFF' ? '#FFFFFF' : '#FF7A00', 2.2);
    alamatBaris.forEach(b => { ctx.fillText(b, M + 52, y); y += 46; });
    y += 20;

    // Fasilitas
    const fas = (kos.fasilitas || []).slice(0, 6);
    ctx.font = `700 32px ${FONT}`;
    let cx = M;
    const tinggiChip = 62;
    let ditampilkan = 0;
    for (const f of fas) {
      const w = ctx.measureText(f).width + 48;
      if (cx + w > W - M) break;
      ctx.fillStyle = T.chip; rr(ctx, cx, y, w, tinggiChip, 31); ctx.fill();
      ctx.fillStyle = T.chipTeks; ctx.fillText(f, cx + 24, y + 14);
      cx += w + 14; ditampilkan++;
    }
    const sisa = (kos.fasilitas || []).length - ditampilkan;
    if (sisa > 0 && cx + 90 < W - M) {
      const t = '+' + sisa;
      const w = ctx.measureText(t).width + 48;
      ctx.fillStyle = T.chip; rr(ctx, cx, y, w, tinggiChip, 31); ctx.fill();
      ctx.fillStyle = T.chipTeks; ctx.fillText(t, cx + 24, y + 14);
    }

    // Kaki: tautan
    const fyBawah = H - 168;
    ctx.fillStyle = T.garis; ctx.fillRect(M, fyBawah, W - M * 2, 3);
    ctx.fillStyle = T.redup; ctx.font = `600 30px ${FONT}`;
    ctx.fillText('Lihat detail & booking di aplikasi', M, fyBawah + 28);
    ctx.fillStyle = T.link; ctx.font = `800 40px ${FONT}`;
    const dom = location.host || 'kosku-solo-app.vercel.app';
    ctx.fillText(dom, M, fyBawah + 72);
    // tombol bulat panah
    ctx.fillStyle = namaTema === 'oranye' ? '#FFFFFF' : '#FF7A00';
    ctx.beginPath(); ctx.arc(W - M - 48, fyBawah + 78, 48, 0, Math.PI * 2); ctx.fill();
    ikon(ctx, 'M5 12h14 M13 6l6 6-6 6', W - M - 48 - 22, fyBawah + 78 - 22, 44, namaTema === 'oranye' ? '#FF6A00' : '#FFFFFF', 2.8);

    return cv;
  }

  // ---------- Tampilan lembar bagikan ----------
  function pasangCss() {
    if (document.getElementById('kkbCss')) return;
    const s = document.createElement('style');
    s.id = 'kkbCss';
    s.textContent = `
      #kkbModal { position: fixed; inset: 0; z-index: 3000; background: rgba(0,0,0,.55); display: flex; align-items: flex-end; justify-content: center; }
      #kkbModal .kkb-sheet { width: 100%; max-width: 430px; max-height: 94vh; overflow-y: auto; background: var(--card, #fff); color: var(--text, #222);
        border-radius: 26px 26px 0 0; padding: 14px 18px calc(20px + env(safe-area-inset-bottom, 0px)); }
      .kkb-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .kkb-head b { font: 800 18px 'Plus Jakarta Sans', sans-serif; }
      .kkb-x { width: 34px; height: 34px; border-radius: 50%; background: var(--bg-2, #F1F2F4); display: flex; align-items: center; justify-content: center; cursor: pointer; border: 0; font-size: 16px; color: var(--text, #222); }
      .kkb-prev { background: var(--bg-2, #F1F2F4); border-radius: 18px; padding: 12px; display: flex; justify-content: center; align-items: center; min-height: 200px; }
      .kkb-prev canvas { max-width: 100%; max-height: 360px; width: auto; height: auto; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,.2); }
      .kkb-prev .kkb-load { font: 600 13px 'Plus Jakarta Sans', sans-serif; color: var(--text-3, #888); }
      .kkb-row { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; align-items: center; }
      .kkb-lab { font: 700 12px 'Plus Jakarta Sans', sans-serif; color: var(--text-3, #888); margin-top: 14px; }
      .kkb-chip { padding: 8px 14px; border-radius: 18px; border: 1.5px solid var(--border, #E5E7EB); background: var(--card, #fff); color: var(--text, #222);
        font: 700 12.5px 'Plus Jakarta Sans', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 7px; }
      .kkb-chip.on { background: var(--orange, #FF7A00); border-color: var(--orange, #FF7A00); color: #fff; }
      .kkb-chip i { width: 14px; height: 14px; border-radius: 50%; display: block; border: 1px solid rgba(0,0,0,.15); }
      .kkb-ta { width: 100%; min-height: 150px; margin-top: 8px; padding: 12px; border: 1.5px solid var(--border, #E5E7EB); border-radius: 14px;
        font: 500 13px/1.5 'Plus Jakarta Sans', sans-serif; background: var(--card, #fff); color: var(--text, #222); resize: vertical; outline: 0; }
      .kkb-main { width: 100%; margin-top: 14px; padding: 15px; border: 0; border-radius: 16px; background: var(--orange, #FF7A00); color: #fff;
        font: 800 15px 'Plus Jakarta Sans', sans-serif; cursor: pointer; box-shadow: 0 8px 20px rgba(255,122,0,.35); display: flex; align-items: center; justify-content: center; gap: 8px; }
      .kkb-main:disabled { opacity: .6; }
      .kkb-sec { display: flex; gap: 8px; margin-top: 10px; }
      .kkb-sec button { flex: 1; padding: 12px 6px; border: 0; border-radius: 14px; background: var(--bg-2, #F1F2F4); color: var(--text, #222);
        font: 700 12.5px 'Plus Jakarta Sans', sans-serif; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; }
      .kkb-sec button svg { width: 20px; height: 20px; }
      .kkb-sec button.wa { background: #DCFCE7; color: #15803D; }
      .kkb-note { margin-top: 10px; font: 600 12px 'Plus Jakarta Sans', sans-serif; color: #B45309; background: #FEF3C7; border-radius: 12px; padding: 9px 12px; }
      .kkb-toast { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(40px + env(safe-area-inset-bottom, 0px)); z-index: 3100;
        background: rgba(30,30,40,.92); color: #fff; font: 600 13px 'Plus Jakarta Sans', sans-serif; padding: 11px 18px; border-radius: 20px; max-width: 86%; text-align: center; }
      /* Tombol di Detail Kos & Kelola Kos */
      #screen-detail .kk-dshare { position: absolute !important; top: 52px; right: 66px; z-index: 10; width: 42px; height: 42px; border-radius: 14px;
        background: rgba(255,255,255,.92); backdrop-filter: blur(6px); box-shadow: 0 4px 14px rgba(0,0,0,.2); display: flex; align-items: center; justify-content: center;
        cursor: pointer; color: #1A1A2E; }
      #screen-detail .kk-dshare svg { width: 20px; height: 20px; }
      .kk-btn-share { background: #FFF0E0 !important; color: #C2410C !important; }
    `;
    document.head.appendChild(s);
  }

  const SVG_BAGI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>';
  const SVG_UNDUH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16"/></svg>';
  const SVG_WA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.5L3 21z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-.8.7a3.5 3.5 0 0 1-1.9-1.9l.7-.8-1-2L9 9.5z"/></svg>';
  const SVG_SALIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>';

  function toast(t) {
    const lama = document.querySelector('.kkb-toast'); if (lama) lama.remove();
    const el = document.createElement('div');
    el.className = 'kkb-toast'; el.textContent = t;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  async function perbaruiGambar() {
    const wadah = document.getElementById('kkbPrev'); if (!wadah || !kosAktif) return;
    const id = ++sedangGambar;
    wadah.innerHTML = '<div class="kkb-load">Membuat kartu…</div>';
    try {
      const cv = await gambarKartu(kosAktif, format, tema);
      if (id !== sedangGambar) return;
      wadah.innerHTML = '';
      wadah.appendChild(cv);
    } catch (e) {
      console.error('Gagal membuat kartu:', e);
      if (id === sedangGambar) wadah.innerHTML = '<div class="kkb-load">Kartu belum bisa dibuat. Coba lagi.</div>';
    }
  }

  function canvasKeBlob() {
    return new Promise(res => {
      const cv = document.querySelector('#kkbPrev canvas');
      if (!cv) return res(null);
      try { cv.toBlob(b => res(b), 'image/jpeg', 0.92); } catch (e) { res(null); }
    });
  }
  const namaFile = () => 'kosku-' + String(kosAktif.nama_kos || 'kos').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '.jpg';

  async function salinTeks(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) { /* lanjut */ }
    try {
      const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (e) { return false; }
  }

  async function aksiBagikan() {
    if (!kosAktif) return;
    teksPromo = document.getElementById('kkbTeks').value;
    const btn = document.getElementById('kkbBagikan');
    btn.disabled = true;
    try {
      const blob = await canvasKeBlob();
      if (blob && typeof File === 'function' && navigator.canShare && navigator.share) {
        const file = new File([blob], namaFile(), { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], text: teksPromo, title: kosAktif.nama_kos });
          } catch (e) { if (e && e.name !== 'AbortError') toast('Gagal membuka menu bagikan.'); }
          btn.disabled = false; return;
        }
      }
      // Perangkat tidak mendukung bagikan gambar: simpan gambar + salin teks
      if (blob) unduh(blob);
      const ok = await salinTeks(teksPromo);
      toast(ok ? 'Gambar disimpan & teks disalin. Tempelkan di aplikasi tujuan.' : 'Gambar disimpan.');
    } finally { btn.disabled = false; }
  }

  function unduh(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = namaFile();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function tutup() { const m = document.getElementById('kkbModal'); if (m) m.remove(); sedangGambar++; }

  function bukaBagikan(kos) {
    if (!kos) return;
    pasangCss();
    tutup();
    kosAktif = kos;
    teksPromo = bangunTeks(kos);
    const nonaktif = kos.status && kos.status !== 'aktif';
    const m = document.createElement('div');
    m.id = 'kkbModal';
    m.setAttribute('style', 'position:fixed;inset:0;z-index:3000');
    m.innerHTML = `<div class="kkb-sheet">
      <div class="kkb-head"><b>Bagikan Kos</b><button class="kkb-x" id="kkbTutup" aria-label="Tutup">✕</button></div>
      <div class="kkb-prev" id="kkbPrev"><div class="kkb-load">Membuat kartu…</div></div>
      ${nonaktif ? '<div class="kkb-note">Kos ini sedang nonaktif. Tautannya tidak akan menampilkan kos sampai kamu mengaktifkannya lagi.</div>' : ''}
      <div class="kkb-lab">Ukuran</div>
      <div class="kkb-row" id="kkbFormat" style="margin-top:6px">
        ${Object.keys(FORMAT).map(k => `<button class="kkb-chip${k === format ? ' on' : ''}" data-f="${k}">${esc(FORMAT[k].nama)}</button>`).join('')}
      </div>
      <div class="kkb-lab">Warna</div>
      <div class="kkb-row" id="kkbTema" style="margin-top:6px">
        ${Object.keys(TEMA).map(k => `<button class="kkb-chip${k === tema ? ' on' : ''}" data-t="${k}"><i style="background:${TEMA[k].bg[1]}"></i>${esc(TEMA[k].nama)}</button>`).join('')}
      </div>
      <div class="kkb-lab">Teks promosi (boleh diedit)</div>
      <textarea class="kkb-ta" id="kkbTeks"></textarea>
      <button class="kkb-main" id="kkbBagikan">${SVG_BAGI.replace('<svg', '<svg width="20" height="20"')}Bagikan gambar &amp; teks</button>
      <div class="kkb-sec">
        <button id="kkbUnduh">${SVG_UNDUH}Simpan gambar</button>
        <button id="kkbWa" class="wa">${SVG_WA}WhatsApp</button>
        <button id="kkbSalin">${SVG_SALIN}Salin teks</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    document.getElementById('kkbTeks').value = teksPromo;

    m.addEventListener('click', e => { if (e.target === m) tutup(); });
    m.querySelector('#kkbTutup').addEventListener('click', tutup);
    m.querySelector('#kkbFormat').addEventListener('click', e => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      format = b.dataset.f;
      m.querySelectorAll('#kkbFormat .kkb-chip').forEach(c => c.classList.toggle('on', c === b));
      perbaruiGambar();
    });
    m.querySelector('#kkbTema').addEventListener('click', e => {
      const b = e.target.closest('[data-t]'); if (!b) return;
      tema = b.dataset.t;
      m.querySelectorAll('#kkbTema .kkb-chip').forEach(c => c.classList.toggle('on', c === b));
      perbaruiGambar();
    });
    m.querySelector('#kkbBagikan').addEventListener('click', aksiBagikan);
    m.querySelector('#kkbUnduh').addEventListener('click', async () => {
      const blob = await canvasKeBlob();
      if (blob) { unduh(blob); toast('Gambar disimpan.'); } else toast('Gambar belum siap.');
    });
    m.querySelector('#kkbWa').addEventListener('click', () => {
      const t = document.getElementById('kkbTeks').value;
      window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank');
    });
    m.querySelector('#kkbSalin').addEventListener('click', async () => {
      const ok = await salinTeks(document.getElementById('kkbTeks').value);
      toast(ok ? 'Teks disalin.' : 'Gagal menyalin teks.');
    });
    perbaruiGambar();
  }
  window.bukaBagikan = bukaBagikan;
  window.kkBagikanId = function (id) {
    let kos = null;
    try { kos = (myKosData || []).find(k => k.id === id); } catch (e) { /* abaikan */ }
    if (!kos) { try { kos = (allKosData || []).find(k => k.id === id); } catch (e) { /* abaikan */ } }
    bukaBagikan(kos);
  };

  // ---------- Tombol di Detail Kos ----------
  const asliRender = window.renderDetailScreen;
  if (typeof asliRender === 'function') {
    window.renderDetailScreen = function (kos) {
      const r = asliRender.apply(this, arguments);
      try {
        pasangCss();
        const photos = document.querySelector('#screen-detail .detail-photos');
        if (photos) {
          photos.querySelectorAll('.kk-dshare').forEach(e => e.remove());
          const b = document.createElement('div');
          b.className = 'kk-dshare';
          b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'Bagikan kos');
          b.innerHTML = SVG_BAGI;
          b.addEventListener('click', ev => { ev.stopPropagation(); bukaBagikan(kos); });
          photos.appendChild(b);
        }
      } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // ---------- Tombol di Kelola Kos (pemilik) ----------
  const asliDaftar = window.renderKelolaKosList;
  if (typeof asliDaftar === 'function') {
    window.renderKelolaKosList = function () {
      const r = asliDaftar.apply(this, arguments);
      try {
        pasangCss();
        document.querySelectorAll('#kelolaKosList .kk-card').forEach(card => {
          const aksi = card.querySelector('.kk-actions');
          const edit = card.querySelector('.kk-btn-edit');
          if (!aksi || !edit || aksi.querySelector('.kk-btn-share')) return;
          const m = (edit.getAttribute('onclick') || '').match(/showTambahKos\('([^']+)'\)/);
          if (!m) return;
          const b = document.createElement('button');
          b.className = 'kk-btn kk-btn-share';
          b.textContent = '📤 Bagikan';
          b.addEventListener('click', () => window.kkBagikanId(m[1]));
          aksi.insertBefore(b, aksi.firstChild);
        });
      } catch (e) { /* abaikan */ }
      return r;
    };
  }

  // ---------- Buka tautan bagikan (?kos=ID) ----------
  async function bukaDariTautan() {
    let id = null;
    try { id = new URLSearchParams(location.search).get('kos'); } catch (e) { /* abaikan */ }
    if (!id) return;
    const bersihkan = () => { try { history.replaceState(history.state, '', location.pathname); } catch (e) { /* abaikan */ } };
    const layar = () => { const a = document.querySelector('.screen.active'); return a ? a.id.replace(/^screen-/, '') : ''; };
    try {
      // Tunggu data kos termuat
      let kos = null;
      for (let i = 0; i < 80 && !kos; i++) {
        try { kos = (allKosData || []).find(k => k.id === id); } catch (e) { /* belum siap */ }
        if (!kos) await new Promise(r => setTimeout(r, 150));
      }
      if (!kos) { bersihkan(); toast('Kos ini sudah tidak tersedia.'); return; }

      const { data } = await sbClient.auth.getSession();
      const awal = ['splash', 'onboarding', 'login', 'register', 'role'];
      if (data && data.session) {
        for (let i = 0; i < 40; i++) {
          let siap = false;
          try { siap = !!currentUserProfile; } catch (e) { /* abaikan */ }
          if (siap) break;
          await new Promise(r => setTimeout(r, 150));
        }
        if (awal.includes(layar())) {
          let prof = null; try { prof = currentUserProfile; } catch (e) { /* abaikan */ }
          if (prof && prof.role === 'pemilik' && typeof window.showOwner === 'function') window.showOwner();
          else if (typeof window.showDashboard === 'function') window.showDashboard();
        }
      } else if (typeof window.showLogin === 'function' && awal.includes(layar())) {
        window.showLogin();
      }
      window.openDetail(id);
    } catch (e) {
      console.warn('Tautan kos tidak bisa dibuka:', e && e.message);
    }
    bersihkan();
  }

  function mulai() { pasangCss(); bukaDariTautan(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();
})();
