// =====================================================
// KosKu Solo — Hemat storage: foto otomatis dikecilkan sebelum diupload
// Dimuat lewat: <script src="batas-upload.js"></script>
//
// Cara kerja:
//  - Foto dari kamera HP (3–6 MB) dikecilkan jadi ±150–300 KB
//    (sisi terpanjang dibatasi, dikompres JPEG) sebelum masuk Supabase.
//  - Berlaku untuk foto kos, foto profil, foto identitas penghuni,
//    dan banner promo admin.
//  - Foto yang ukurannya lebih dari 25 MB ditolak dengan pesan jelas.
// =====================================================

(function () {
  const MAKS_ASLI = 25 * 1024 * 1024;

  const PRESET = {
    kos:       { maks: 1280, kualitas: 0.78 },
    avatar:    { maks: 480,  kualitas: 0.82 },
    identitas: { maks: 1000, kualitas: 0.72 },
    banner:    { maks: 1280, kualitas: 0.80 }
  };

  function presetUntuk(bucket, path) {
    if (bucket === 'avatars') return PRESET.avatar;
    if (/^identitas\//.test(path || '')) return PRESET.identitas;
    if (/^banners\//.test(path || '')) return PRESET.banner;
    return PRESET.kos;
  }

  function layakDikecilkan(file) {
    if (!(file instanceof Blob)) return false;
    const t = (file.type || '').toLowerCase();
    if (t === 'image/gif' || t === 'image/svg+xml') return false;
    if (t.startsWith('image/')) return true;
    // Beberapa HP tidak mengisi tipe file; cek dari nama
    return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || '');
  }

  async function kecilkan(file, p) {
    if (file.size > MAKS_ASLI) {
      throw new Error('Ukuran foto terlalu besar (maks. 25 MB). Pilih foto lain.');
    }
    let bmp;
    try {
      bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (e1) {
      try { bmp = await createImageBitmap(file); } catch (e2) { return file; } // format tak terbaca → biarkan apa adanya
    }
    const skala = Math.min(1, p.maks / Math.max(bmp.width, bmp.height));
    // Sudah kecil dan sudah JPEG → tidak perlu diproses lagi
    if (skala === 1 && /jpe?g/i.test(file.type) && file.size < 350 * 1024) {
      if (bmp.close) bmp.close();
      return file;
    }
    const w = Math.max(1, Math.round(bmp.width * skala));
    const h = Math.max(1, Math.round(bmp.height * skala));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';            // latar putih untuk PNG transparan
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    if (bmp.close) bmp.close();
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', p.kualitas));
    canvas.width = canvas.height = 0;
    if (!blob || blob.size >= file.size) return file; // hasil tidak lebih kecil → pakai aslinya
    const nama = (file.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], nama, { type: 'image/jpeg', lastModified: Date.now() });
  }
  window.koskuKecilkanFoto = kecilkan;

  // ---------- 1. Semua upload ke Supabase Storage dikecilkan otomatis ----------
  function pasangStorage() {
    try {
      const st = sbClient.storage;
      const asliFrom = st.from.bind(st);
      st.from = function (bucket) {
        const b = asliFrom(bucket);
        const asliUpload = b.upload.bind(b);
        b.upload = async function (path, file, opts) {
          let f = file, o = opts;
          if (layakDikecilkan(file)) {
            try {
              f = await kecilkan(file, presetUntuk(bucket, path));
              if (f !== file) o = Object.assign({}, opts || {}, { contentType: 'image/jpeg' });
            } catch (err) {
              return { data: null, error: { message: err.message } };
            }
          }
          return asliUpload(path, f, o);
        };
        return b;
      };
    } catch (e) { console.warn('batas-upload: gagal memasang pengecil foto', e); }
  }

  // ---------- 2. Kecilkan juga saat foto dipilih (preview lebih cepat & hemat memori) ----------
  async function gantiFileInput(input, preset) {
    const files = Array.from(input.files || []);
    if (!files.length) return;
    const hasil = [];
    for (const f of files) {
      if (!layakDikecilkan(f)) { hasil.push(f); continue; }
      try { hasil.push(await kecilkan(f, preset)); }
      catch (err) { alert(err.message); }
    }
    try {
      const dt = new DataTransfer();
      hasil.forEach(f => dt.items.add(f));
      input.files = dt.files;
    } catch (e) { /* browser lama: biarkan, pengecil saat upload tetap jalan */ }
  }

  function bungkus(nama, preset, sesudah) {
    const asli = window[nama];
    if (typeof asli !== 'function') return;
    window[nama] = async function (input) {
      await gantiFileInput(input, preset);
      const r = asli.call(this, input);
      if (sesudah) { try { sesudah(); } catch (e) { /* abaikan */ } }
      return r;
    };
  }

  function infoUkuran() {
    let total = 0, n = 0;
    try { selectedFotoFiles.forEach(f => { total += f.size; n++; }); } catch (e) { return; }
    const el = document.getElementById('tkFotoText');
    if (el && n) el.textContent = `${n} foto dipilih (maks. 5) · total ${Math.round(total / 1024)} KB`;
  }

  bungkus('handleFotoSelected', PRESET.kos, infoUkuran);
  bungkus('handleAvatarChange', PRESET.avatar);

  pasangStorage();
})();
