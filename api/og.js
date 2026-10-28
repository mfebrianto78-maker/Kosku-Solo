// =====================================================
// KosKu Solo — Halaman pratinjau tautan kos (Vercel Serverless Function)
// Letakkan di GitHub: api/og.js  (folder "api" di sebelah index.html)
//
// Fungsi: saat tautan kos dibagikan (WhatsApp, Telegram, Facebook, dll.),
// aplikasi pembaca tautan mengambil halaman ini dan menampilkan kartu
// pratinjau berisi FOTO, NAMA, dan HARGA kos tersebut.
// Orang yang mengetuk tautan langsung diarahkan ke Detail Kos di aplikasi.
// =====================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kyytbtkeivjzfzxgzzdm.supabase.co';
// Kunci publishable (publik, sama dengan yang dipakai di aplikasi)
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_czOkAsxCHGfXYgabjRPoPA_zNkv3OrH';

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const rupiah = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = async function handler(req, res) {
  const q = req.query || {};
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'kosku-solo-app.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const origin = proto + '://' + host;

  // Pemeriksaan ringan: dipakai aplikasi untuk memastikan fungsi ini aktif
  if (q.ping) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).send('{"ok":true}');
  }

  const id = String(q.kos || '').trim();
  let kos = null;
  if (UUID.test(id)) {
    try {
      const url = SUPABASE_URL + '/rest/v1/kos?id=eq.' + id +
        '&select=nama_kos,jenis_kos,harga_per_bulan,alamat,foto_urls,fasilitas,status,lokasi_terverifikasi&limit=1';
      const r = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } });
      if (r.ok) {
        const rows = await r.json();
        if (rows && rows[0] && rows[0].status === 'aktif') kos = rows[0];
      }
    } catch (e) { /* lanjut dengan pratinjau umum */ }
  }

  const tujuan = origin + '/' + (UUID.test(id) ? '?kos=' + id : '');
  let judul = 'KosKu Solo', deskripsi = 'Temukan dan Sewakan Kos dengan Mudah di Solo. Simpel, Cepat, Dapat.';
  let gambar = origin + '/images/banner-kosku-app.png';

  if (kos) {
    judul = kos.nama_kos + (kos.jenis_kos ? ' (' + kos.jenis_kos + ')' : '') + ' • ' + rupiah(kos.harga_per_bulan) + '/bulan';
    const bagian = [];
    if (kos.alamat) bagian.push(String(kos.alamat).slice(0, 90));
    if (Array.isArray(kos.fasilitas) && kos.fasilitas.length) bagian.push(kos.fasilitas.slice(0, 4).join(', '));
    if (kos.lokasi_terverifikasi) bagian.push('Lokasi terverifikasi');
    deskripsi = bagian.join(' · ') || deskripsi;
    if (Array.isArray(kos.foto_urls) && kos.foto_urls[0]) gambar = kos.foto_urls[0];
  }

  const html = `<!doctype html>
<html lang="id"><head>
<meta charset="utf-8">
<title>${esc(judul)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(deskripsi)}">
<meta property="og:site_name" content="KosKu Solo">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(judul)}">
<meta property="og:description" content="${esc(deskripsi)}">
<meta property="og:image" content="${esc(gambar)}">
<meta property="og:url" content="${esc(origin + '/api/og?kos=' + id)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(judul)}">
<meta name="twitter:description" content="${esc(deskripsi)}">
<meta name="twitter:image" content="${esc(gambar)}">
<style>body{font-family:system-ui,sans-serif;background:#FFF4E6;color:#1A1A2E;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center}a{color:#FF7A00;font-weight:700}</style>
</head><body>
<div><p>Membuka KosKu Solo…</p><p><a href="${esc(tujuan)}">Ketuk di sini bila tidak berpindah otomatis</a></p></div>
<script>location.replace(${JSON.stringify(tujuan)});</script>
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(html);
};
    
