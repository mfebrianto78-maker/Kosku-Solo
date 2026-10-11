// =====================================================
// KosKu Solo — Fitur Kelola Kamar (untuk pemilik kos)
// Dimuat lewat: <script src="kelola-kamar.js"></script>
// (letakkan di bawah baris lupa-password.js, di atas </body>)
// =====================================================

(function () {
  let kkSelectedKosId = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---------- Buat halaman Kelola Kamar ----------
  function buildScreen() {
    if (document.getElementById('screen-kelola-kamar')) return;
    const screen = document.createElement('div');
    screen.id = 'screen-kelola-kamar';
    screen.className = 'screen';
    screen.style.background = 'var(--bg)';
    screen.innerHTML = `
      <div class="tambah-header">
        <span style="font-size:20px;cursor:pointer" onclick="showOwner()">←</span>
        <h2 style="font-size:18px;font-weight:800">🛏️ Kelola Kamar</h2>
      </div>
      <div style="padding:14px 16px 0">
        <label style="font-size:12px;font-weight:700;color:var(--text-3)">PILIH KOS</label>
        <select id="kkKosSelect" class="select-input" style="margin-top:6px;background:white"></select>
        <div id="kkStats" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px"></div>
      </div>
      <div style="flex:1;overflow-y:auto;padding:14px 16px 20px" id="kkList"></div>
      <div style="padding:0 16px 30px">
        <button class="btn-primary" id="kkAddBtn">➕ Tambah Kamar</button>
      </div>`;
    document.getElementById('app').appendChild(screen);

    document.getElementById('kkKosSelect').onchange = function () {
      kkSelectedKosId = this.value;
      renderList();
    };
    document.getElementById('kkAddBtn').onclick = function () { openKamarForm(null); };
  }

  function currentKos() {
    return (myKosData || []).find(k => k.id === kkSelectedKosId) || null;
  }

  function sortedKamar(kos) {
    return [...((kos && kos.kamar) || [])].sort((a, b) =>
      String(a.nomor_kamar).localeCompare(String(b.nomor_kamar), 'id', { numeric: true })
    );
  }

  // ---------- Buka halaman ----------
  async function showKelolaKamar() {
    buildScreen();
    show('kelola-kamar', 'owner');

    if (!myKosData || !myKosData.length) {
      document.getElementById('kkList').innerHTML =
        '<div style="text-align:center;padding:40px 0;color:var(--text-3);font-size:13px">Memuat data...</div>';
      await loadMyKos();
    }

    const select = document.getElementById('kkKosSelect');
    if (!myKosData.length) {
      select.innerHTML = '<option>Belum ada kos</option>';
      document.getElementById('kkStats').innerHTML = '';
      document.getElementById('kkList').innerHTML =
        '<div style="text-align:center;padding:40px 20px;color:var(--text-3);font-size:13px">Tambahkan kos dulu lewat menu Kelola Kos.</div>';
      document.getElementById('kkAddBtn').style.display = 'none';
      return;
    }

    document.getElementById('kkAddBtn').style.display = '';
    if (!kkSelectedKosId || !myKosData.some(k => k.id === kkSelectedKosId)) {
      kkSelectedKosId = myKosData[0].id;
    }
    select.innerHTML = myKosData
      .map(k => `<option value="${k.id}" ${k.id === kkSelectedKosId ? 'selected' : ''}>${esc(k.nama_kos)}</option>`)
      .join('');
    renderList();
  }

  // ---------- Tampilkan daftar kamar ----------
  function renderList() {
    const kos = currentKos();
    const list = document.getElementById('kkList');
    const stats = document.getElementById('kkStats');
    const kamar = sortedKamar(kos);

    const total = kamar.length;
    const terisi = kamar.filter(k => k.status === 'terisi').length;
    const kosong = total - terisi;
    const statBox = (val, label, color) =>
      `<div style="background:white;border-radius:12px;padding:10px;text-align:center;box-shadow:var(--shadow)">
         <div style="font-size:18px;font-weight:800;color:${color}">${val}</div>
         <div style="font-size:11px;color:var(--text-3)">${label}</div>
       </div>`;
    stats.innerHTML =
      statBox(total, 'Total', 'var(--text)') +
      statBox(kosong, 'Kosong', '#16A34A') +
      statBox(terisi, 'Terisi', 'var(--orange)');

    if (!total) {
      list.innerHTML =
        '<div style="text-align:center;padding:40px 20px;color:var(--text-3);font-size:13px">Belum ada kamar di kos ini. Tekan "Tambah Kamar".</div>';
      return;
    }

    list.innerHTML = kamar.map(k => {
      const isTerisi = k.status === 'terisi';
      return `
        <div class="kk-card">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:48px;height:48px;border-radius:12px;background:${isTerisi ? 'var(--orange-light)' : '#DCFCE7'};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🛏️</div>
            <div style="flex:1;min-width:0">
              <div class="kk-name">Kamar ${esc(k.nomor_kamar)}</div>
              <div class="kk-meta">${formatRupiah(k.harga || 0)}/bln</div>
            </div>
            <div class="kk-status-toggle ${isTerisi ? 'kk-status-nonaktif' : 'kk-status-aktif'}"
                 style="${isTerisi ? 'background:var(--orange-light);color:var(--orange)' : ''}"
                 onclick="kkToggleStatus('${k.id}','${k.status}')">
              ${isTerisi ? '● Terisi' : '○ Kosong'}
            </div>
          </div>
          <div class="kk-actions" style="margin-top:12px">
            <button class="kk-btn kk-btn-edit" onclick="kkOpenForm('${k.id}')">✏️ Edit</button>
            <button class="kk-btn kk-btn-delete" onclick="kkDelete('${k.id}')">🗑️ Hapus</button>
          </div>
        </div>`;
    }).join('') +
      '<div style="text-align:center;font-size:11.5px;color:var(--text-3);margin-top:4px">Ketuk label Kosong/Terisi untuk mengubah status</div>';
  }

  async function refresh() {
    await loadMyKos();
    renderList();
    if (typeof loadKosData === 'function') loadKosData();
  }

  // ---------- Ubah status kosong/terisi ----------
  async function toggleStatus(kamarId, current) {
    const next = current === 'terisi' ? 'kosong' : 'terisi';
    try {
      const { error } = await sbClient.from('kamar').update({ status: next }).eq('id', kamarId);
      if (error) throw error;
      await refresh();
    } catch (err) {
      alert('Gagal mengubah status kamar: ' + (err.message || ''));
    }
  }

  // ---------- Form tambah / edit ----------
  function openKamarForm(kamarId) {
    const kos = currentKos();
    if (!kos) return;
    const existing = kamarId ? (kos.kamar || []).find(k => k.id === kamarId) : null;

    let defaultNomor = '';
    if (!existing) {
      const nums = (kos.kamar || []).map(k => parseInt(k.nomor_kamar, 10)).filter(n => !isNaN(n));
      defaultNomor = nums.length ? String(Math.max(...nums) + 1) : '101';
    }

    const inputStyle =
      'width:100%;padding:13px 14px;border:1.5px solid var(--border);border-radius:12px;font-size:15px;font-family:inherit;background:var(--bg);box-sizing:border-box;margin:6px 0 14px';

    const modal = document.createElement('div');
    modal.id = 'kkFormModal';
    modal.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999;display:flex;align-items:flex-end;justify-content:center';
    modal.innerHTML = `
      <div style="background:white;border-radius:20px 20px 0 0;padding:22px 20px 26px;width:100%;max-width:430px">
        <div style="font-size:16px;font-weight:800;margin-bottom:4px">${existing ? '✏️ Edit Kamar' : '➕ Tambah Kamar'}</div>
        <div style="font-size:12.5px;color:var(--text-3);margin-bottom:16px">${esc(kos.nama_kos)}</div>

        <label style="font-size:12.5px;font-weight:700;color:var(--text-2)">Nomor / Nama Kamar</label>
        <input id="kkNomor" type="text" placeholder="Contoh: 101 atau A1" value="${esc(existing ? existing.nomor_kamar : defaultNomor)}" style="${inputStyle}">

        <label style="font-size:12.5px;font-weight:700;color:var(--text-2)">Harga per Bulan (Rp)</label>
        <input id="kkHarga" type="number" placeholder="500000" value="${existing ? existing.harga : (kos.harga_per_bulan || '')}" style="${inputStyle}">

        <label style="font-size:12.5px;font-weight:700;color:var(--text-2)">Status</label>
        <select id="kkStatus" style="${inputStyle}">
          <option value="kosong" ${!existing || existing.status !== 'terisi' ? 'selected' : ''}>Kosong</option>
          <option value="terisi" ${existing && existing.status === 'terisi' ? 'selected' : ''}>Terisi</option>
        </select>

        <div id="kkFormErr" style="color:var(--red);font-size:13px;margin:-4px 0 12px;display:none"></div>

        <div style="display:flex;gap:10px">
          <button id="kkCancelBtn" style="flex:1;padding:13px;background:var(--bg);border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer">Batal</button>
          <button id="kkSaveBtn" style="flex:1;padding:13px;background:var(--orange);color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer">Simpan</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById('kkCancelBtn').onclick = () => modal.remove();
    document.getElementById('kkSaveBtn').onclick = () => saveKamar(existing, kos, modal);
  }

  async function saveKamar(existing, kos, modal) {
    const nomor = document.getElementById('kkNomor').value.trim();
    const harga = parseFloat(document.getElementById('kkHarga').value);
    const status = document.getElementById('kkStatus').value;
    const errEl = document.getElementById('kkFormErr');
    const showErr = (m) => { errEl.textContent = m; errEl.style.display = 'block'; };
    errEl.style.display = 'none';

    if (!nomor) return showErr('Nomor kamar wajib diisi.');
    if (!harga || harga <= 0) return showErr('Harga harus diisi dengan benar.');

    const duplicate = (kos.kamar || []).some(k =>
      String(k.nomor_kamar).toLowerCase() === nomor.toLowerCase() && (!existing || k.id !== existing.id)
    );
    if (duplicate) return showErr('Nomor kamar ini sudah ada di kos ini.');

    const btn = document.getElementById('kkSaveBtn');
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;

    try {
      if (existing) {
        const { error } = await sbClient.from('kamar')
          .update({ nomor_kamar: nomor, harga: harga, status: status })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await sbClient.from('kamar').insert({
          kos_id: kos.id,
          nomor_kamar: nomor,
          harga: harga,
          status: status,
          fasilitas: kos.fasilitas || []
        });
        if (error) throw error;
      }
      modal.remove();
      await refresh();
    } catch (err) {
      showErr('Gagal menyimpan: ' + (err.message || ''));
      btn.textContent = 'Simpan';
      btn.disabled = false;
    }
  }

  // ---------- Hapus kamar ----------
  async function deleteKamar(kamarId) {
    const kos = currentKos();
    const kamar = kos && (kos.kamar || []).find(k => k.id === kamarId);
    if (!kamar) return;

    try {
      const { data: aktif, error: bErr } = await sbClient
        .from('booking')
        .select('id')
        .eq('kamar_id', kamarId)
        .in('status', ['menunggu', 'diterima', 'aktif'])
        .limit(1);
      if (bErr) throw bErr;
      if (aktif && aktif.length) {
        alert(`Kamar ${kamar.nomor_kamar} masih punya booking yang berjalan. Selesaikan atau tolak booking itu dulu sebelum menghapus kamar.`);
        return;
      }
    } catch (err) {
      console.error('Gagal cek booking kamar:', err);
    }

    if (!confirm(`Hapus Kamar ${kamar.nomor_kamar}? Tindakan ini tidak bisa dibatalkan.`)) return;

    try {
      const { error } = await sbClient.from('kamar').delete().eq('id', kamarId);
      if (error) throw error;
      await refresh();
    } catch (err) {
      let msg = err.message || '';
      if (/foreign key|violates/i.test(msg)) {
        msg = 'Kamar ini masih tercatat di riwayat booking, jadi tidak bisa dihapus. Sebagai gantinya, tandai saja sebagai Terisi.';
      }
      alert('Gagal menghapus kamar. ' + msg);
    }
  }

  // ---------- Daftarkan fungsi ke global ----------
  window.showKelolaKamar = showKelolaKamar;
  window.kkToggleStatus = toggleStatus;
  window.kkOpenForm = openKamarForm;
  window.kkDelete = deleteKamar;

  // Sambungkan kartu "Kelola Kamar" di dashboard pemilik
  document.querySelectorAll('#screen-owner .owner-menu-card').forEach(card => {
    if (card.textContent.includes('Kelola Kamar')) {
      card.style.cursor = 'pointer';
      card.onclick = showKelolaKamar;
    }
  });
})();
