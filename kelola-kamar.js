// =====================================================
// KosKu Solo — Kelola Kamar + Data Penghuni (untuk pemilik kos)
// Dimuat lewat: <script src="kelola-kamar.js"></script>
// Data penghuni disimpan di tabel catatan_sewa (sama dengan menu Catatan Sewa).
// Foto KTP sengaja TIDAK diminta: disimpan sendiri oleh pemilik di HP-nya.
// =====================================================

(function () {
  let kkSelectedKosId = null;
  let penghuniByNomor = {}; // nomor kamar (lowercase) -> baris catatan_sewa aktif

  const PEKERJAAN = ['Pelajar', 'Mahasiswa', 'Pekerja/Karyawan', 'Wiraswasta', 'Lainnya'];

  // ---------- Helper ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function addMonth(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m, 1); // bulan berikutnya
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(d, lastDay));
    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  }
  function fmtTgl(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const a = new Date(todayStr() + 'T00:00:00');
    const b = new Date(dateStr + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }
  function tempoBadge(dateStr) {
    const n = daysUntil(dateStr);
    if (n === null) return '<span style="color:var(--text-3)">Jatuh tempo belum diisi</span>';
    if (n < 0) return `<span style="color:var(--red);font-weight:700">⚠️ Terlambat ${-n} hari (${fmtTgl(dateStr)})</span>`;
    if (n === 0) return `<span style="color:var(--red);font-weight:700">🔔 Jatuh tempo hari ini</span>`;
    if (n <= 7) return `<span style="color:var(--orange);font-weight:700">🔔 Jatuh tempo ${n} hari lagi (${fmtTgl(dateStr)})</span>`;
    return `<span style="color:var(--text-2)">Jatuh tempo ${fmtTgl(dateStr)}</span>`;
  }
  // ---------- WhatsApp ----------
  function waNumber(hp) {
    let n = String(hp || '').replace(/[^0-9]/g, '');
    if (!n) return '';
    if (n.startsWith('0')) n = '62' + n.slice(1);
    else if (n.startsWith('8')) n = '62' + n;
    return n;
  }
  function openWA(hp, text) {
    const n = waNumber(hp);
    const url = (n ? `https://wa.me/${n}` : 'https://wa.me/') + '?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }
  function reminderText(p, kamar, kos) {
    const nama = p.nama_penghuni || 'Bapak/Ibu';
    const harga = formatRupiah((kamar && kamar.harga) || 0);
    const tgl = fmtTgl(p.tanggal_tagihan);
    const n = daysUntil(p.tanggal_tagihan);
    let status;
    if (n === null) status = 'sudah memasuki waktu pembayaran';
    else if (n < 0) status = `sudah melewati jatuh tempo sejak ${tgl} (${-n} hari)`;
    else if (n === 0) status = `jatuh tempo *hari ini* (${tgl})`;
    else status = `akan jatuh tempo pada *${tgl}* (${n} hari lagi)`;
    return `Halo ${nama} 👋\n\n` +
      `Ini pengingat dari *${kos.nama_kos}*.\n` +
      `Sewa *Kamar ${kamar.nomor_kamar}* sebesar *${harga}/bulan* ${status}.\n\n` +
      `Mohon melakukan pembayaran tepat waktu. Kalau sudah membayar, abaikan pesan ini.\n\n` +
      `Terima kasih 🙏\n— ${kos.nama_kos} (via KosKu Solo)`;
  }
  function paidText(p, kamar, kos, nextTempo) {
    return `Halo ${p.nama_penghuni || 'Bapak/Ibu'} 👋\n\n` +
      `Pembayaran sewa *Kamar ${kamar.nomor_kamar}* di *${kos.nama_kos}* sudah kami terima. Terima kasih 🙏\n\n` +
      `Jatuh tempo berikutnya: *${fmtTgl(nextTempo)}*.\n\n— ${kos.nama_kos} (via KosKu Solo)`;
  }
  function sendReminder(kamarId) {
    const kos = currentKos();
    const kamar = kos && (kos.kamar || []).find(k => k.id === kamarId);
    const p = kamar && penghuniOf(kamar);
    if (!p) return;
    if (!p.no_hp_penghuni && !confirm('No. HP penghuni belum diisi. Buka WhatsApp dan pilih kontaknya sendiri?')) return;
    openWA(p.no_hp_penghuni, reminderText(p, kamar, kos));
  }

  const inputStyle =
    'width:100%;padding:12px 14px;border:1.5px solid var(--border);border-radius:12px;font-size:14.5px;font-family:inherit;background:var(--bg);box-sizing:border-box;margin:6px 0 12px';
  const labelStyle = 'font-size:12.5px;font-weight:700;color:var(--text-2)';

  function openSheet(id, html) {
    closeSheet(id);
    const modal = document.createElement('div');
    modal.id = id;
    modal.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999;display:flex;align-items:flex-end;justify-content:center';
    modal.innerHTML =
      `<div style="background:white;border-radius:20px 20px 0 0;padding:22px 20px 26px;width:100%;max-width:430px;max-height:90vh;overflow-y:auto">${html}</div>`;
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    return modal;
  }
  function closeSheet(id) {
    const m = document.getElementById(id);
    if (m) m.remove();
  }

  // ---------- Halaman ----------
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

    document.getElementById('kkKosSelect').onchange = async function () {
      kkSelectedKosId = this.value;
      await loadPenghuni();
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
  function penghuniOf(kamar) {
    return penghuniByNomor[String(kamar.nomor_kamar).toLowerCase()] || null;
  }

  async function loadPenghuni() {
    penghuniByNomor = {};
    if (!kkSelectedKosId) return;
    try {
      const { data, error } = await sbClient
        .from('catatan_sewa')
        .select('*')
        .eq('kos_id', kkSelectedKosId)
        .in('status', ['aktif', 'menunggak'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      (data || []).forEach(c => {
        const key = String(c.nomor_kamar || '').toLowerCase();
        if (key && !penghuniByNomor[key]) penghuniByNomor[key] = c;
      });
    } catch (err) {
      console.error('Gagal memuat data penghuni:', err);
    }
  }

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
    await loadPenghuni();
    renderList();
  }

  // ---------- Daftar kamar ----------
  function renderList() {
    const kos = currentKos();
    const list = document.getElementById('kkList');
    const stats = document.getElementById('kkStats');
    const kamar = sortedKamar(kos);

    const total = kamar.length;
    const terisi = kamar.filter(k => k.status === 'terisi').length;
    const statBox = (val, label, color) =>
      `<div style="background:white;border-radius:12px;padding:10px;text-align:center;box-shadow:var(--shadow)">
         <div style="font-size:18px;font-weight:800;color:${color}">${val}</div>
         <div style="font-size:11px;color:var(--text-3)">${label}</div>
       </div>`;
    stats.innerHTML =
      statBox(total, 'Total', 'var(--text)') +
      statBox(total - terisi, 'Kosong', '#16A34A') +
      statBox(terisi, 'Terisi', 'var(--orange)');

    if (!total) {
      list.innerHTML =
        '<div style="text-align:center;padding:40px 20px;color:var(--text-3);font-size:13px">Belum ada kamar di kos ini. Tekan "Tambah Kamar".</div>';
      return;
    }

    // Ringkasan penghuni yang jatuh tempo ≤ 7 hari / terlambat
    const dueList = kamar
      .map(k => ({ k, p: penghuniOf(k) }))
      .filter(x => x.p && daysUntil(x.p.tanggal_tagihan) !== null && daysUntil(x.p.tanggal_tagihan) <= 7)
      .sort((a, b) => daysUntil(a.p.tanggal_tagihan) - daysUntil(b.p.tanggal_tagihan));

    const duePanel = dueList.length ? `
      <div style="background:var(--card, white);border:1.5px solid var(--orange);border-radius:16px;padding:14px;margin-bottom:14px">
        <div style="font-size:14px;font-weight:800;margin-bottom:4px">🔔 Perlu Diingatkan (${dueList.length})</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:10px">Penghuni yang jatuh tempo dalam 7 hari atau sudah terlambat</div>
        ${dueList.map(({ k, p }) => `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--border)">
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Kamar ${esc(k.nomor_kamar)} · ${esc(p.nama_penghuni || '-')}</div>
              <div style="font-size:11.5px;margin-top:2px">${tempoBadge(p.tanggal_tagihan)}</div>
            </div>
            <button onclick="kkSendReminder('${k.id}')" style="flex-shrink:0;padding:8px 12px;background:#25D366;color:white;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer">💬 Ingatkan</button>
          </div>`).join('')}
      </div>` : '';

    list.innerHTML = duePanel + kamar.map(k => {
      const isTerisi = k.status === 'terisi';
      const p = penghuniOf(k);

      let penghuniBlock = '';
      if (p) {
        penghuniBlock = `
          <div onclick="kkShowPenghuni('${k.id}')" style="margin-top:12px;background:var(--bg);border-radius:12px;padding:10px 12px;cursor:pointer">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="display:flex;align-items:center;gap:9px;min-width:0">
                <div style="width:30px;height:30px;border-radius:50%;background:var(--orange);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0">${esc(String(p.nama_penghuni || 'P').trim().charAt(0).toUpperCase())}</div>
                <div style="font-size:13.5px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.nama_penghuni || 'Penghuni')}</div>
              </div>
              <div style="font-size:11.5px;color:var(--orange);font-weight:700">Detail ›</div>
            </div>
            <div style="font-size:12px;color:var(--text-3);margin-top:3px">${esc(p.pekerjaan || '-')} · Tinggal sejak ${fmtTgl(p.tanggal_masuk)}</div>
            <div style="font-size:12px;margin-top:3px">${tempoBadge(p.tanggal_tagihan)}</div>
            ${(() => { const n = daysUntil(p.tanggal_tagihan); return n !== null && n <= 7; })() ? `
            <button onclick="event.stopPropagation();kkSendReminder('${k.id}')" style="margin-top:9px;width:100%;padding:9px;background:#25D366;color:white;border:none;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer">💬 Kirim Pengingat WhatsApp</button>` : ''}
          </div>`;
      } else if (isTerisi) {
        penghuniBlock = `
          <button onclick="kkOpenPenghuniForm('${k.id}', null)" style="margin-top:12px;width:100%;padding:10px;background:var(--orange-light);color:var(--orange);border:1.5px dashed var(--orange);border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer">
            + Isi Data Penghuni
          </button>`;
      }

      return `
        <div class="kk-card ${isTerisi ? 'is-terisi' : 'is-kosong'}">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:48px;height:48px;border-radius:12px;background:${isTerisi ? 'var(--orange-light)' : '#DCFCE7'};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">🛏️</div>
            <div style="flex:1;min-width:0">
              <div class="kk-name">Kamar ${esc(k.nomor_kamar)}</div>
              <div class="kk-meta">${formatRupiah(k.harga || 0)}/bln</div>
            </div>
            <div class="kk-status-toggle ${isTerisi ? 'kk-status-nonaktif' : 'kk-status-aktif'}"
                 style="${isTerisi ? 'background:var(--orange-light);color:var(--orange)' : ''}"
                 onclick="kkToggleStatus('${k.id}')">
              ${isTerisi ? '● Terisi' : '○ Kosong'}
            </div>
          </div>
          ${penghuniBlock}
          <div class="kk-actions" style="margin-top:12px">
            ${!isTerisi ? `<button class="kk-btn" style="background:#DCFCE7;color:#16A34A" onclick="kkOpenPenghuniForm('${k.id}', null)">👤 Isi Penghuni</button>` : ''}
            <button class="kk-btn kk-btn-edit" onclick="kkOpenForm('${k.id}')">✏️ Edit</button>
            <button class="kk-btn kk-btn-delete" onclick="kkDelete('${k.id}')">🗑️ Hapus</button>
          </div>
        </div>`;
    }).join('') +
      '<div style="text-align:center;font-size:11.5px;color:var(--text-3);margin-top:4px">Ketuk label Kosong/Terisi untuk mengubah status</div>';
  }

  async function refresh() {
    await loadMyKos();
    await loadPenghuni();
    renderList();
    if (typeof loadKosData === 'function') loadKosData();
  }

  async function setKamarStatus(kamarId, status) {
    const { error } = await sbClient.from('kamar').update({ status }).eq('id', kamarId);
    if (error) throw error;
  }

  // ---------- Toggle status ----------
  async function toggleStatus(kamarId) {
    const kos = currentKos();
    const kamar = kos && (kos.kamar || []).find(k => k.id === kamarId);
    if (!kamar) return;

    try {
      if (kamar.status === 'terisi') {
        const p = penghuniOf(kamar);
        if (p) {
          if (!confirm(`Kamar ${kamar.nomor_kamar} masih dihuni ${p.nama_penghuni || 'penghuni'}. Tandai penghuni ini sudah keluar dan kamar jadi kosong?`)) return;
          await markKeluar(p, kamar, true);
          return;
        }
        await setKamarStatus(kamarId, 'kosong');
      } else {
        await setKamarStatus(kamarId, 'terisi');
      }
      await refresh();
    } catch (err) {
      alert('Gagal mengubah status kamar: ' + (err.message || ''));
    }
  }

  // ---------- Form tambah / edit kamar ----------
  function openKamarForm(kamarId) {
    const kos = currentKos();
    if (!kos) return;
    const existing = kamarId ? (kos.kamar || []).find(k => k.id === kamarId) : null;

    let defaultNomor = '';
    if (!existing) {
      const nums = (kos.kamar || []).map(k => parseInt(k.nomor_kamar, 10)).filter(n => !isNaN(n));
      defaultNomor = nums.length ? String(Math.max(...nums) + 1) : '101';
    }

    const modal = openSheet('kkFormModal', `
      <div style="font-size:16px;font-weight:800;margin-bottom:4px">${existing ? '✏️ Edit Kamar' : '➕ Tambah Kamar'}</div>
      <div style="font-size:12.5px;color:var(--text-3);margin-bottom:16px">${esc(kos.nama_kos)}</div>

      <label style="${labelStyle}">Nomor / Nama Kamar</label>
      <input id="kkNomor" type="text" placeholder="Contoh: 101 atau A1" value="${esc(existing ? existing.nomor_kamar : defaultNomor)}" style="${inputStyle}">

      <label style="${labelStyle}">Harga per Bulan (Rp)</label>
      <input id="kkHarga" type="number" placeholder="500000" value="${existing ? existing.harga : (kos.harga_per_bulan || '')}" style="${inputStyle}">

      ${existing ? '' : `
      <label style="${labelStyle}">Status</label>
      <select id="kkStatus" style="${inputStyle}">
        <option value="kosong" selected>Kosong</option>
        <option value="terisi">Terisi</option>
      </select>`}

      <div id="kkFormErr" style="color:var(--red);font-size:13px;margin:-2px 0 12px;display:none"></div>
      <div style="display:flex;gap:10px">
        <button id="kkCancelBtn" style="flex:1;padding:13px;background:var(--bg);border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer">Batal</button>
        <button id="kkSaveBtn" style="flex:1;padding:13px;background:var(--orange);color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer">Simpan</button>
      </div>`);

    document.getElementById('kkCancelBtn').onclick = () => modal.remove();
    document.getElementById('kkSaveBtn').onclick = () => saveKamar(existing, kos, modal);
  }

  async function saveKamar(existing, kos, modal) {
    const nomor = document.getElementById('kkNomor').value.trim();
    const harga = parseFloat(document.getElementById('kkHarga').value);
    const statusEl = document.getElementById('kkStatus');
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
          .update({ nomor_kamar: nomor, harga: harga })
          .eq('id', existing.id);
        if (error) throw error;

        // Ikut ganti nomor kamar di data penghuni yang masih aktif
        const p = penghuniOf(existing);
        if (p && String(existing.nomor_kamar) !== nomor) {
          await sbClient.from('catatan_sewa').update({ nomor_kamar: nomor }).eq('id', p.id);
        }
      } else {
        const { error } = await sbClient.from('kamar').insert({
          kos_id: kos.id,
          nomor_kamar: nomor,
          harga: harga,
          status: statusEl ? statusEl.value : 'kosong',
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

    const p = penghuniOf(kamar);
    if (p) {
      alert(`Kamar ${kamar.nomor_kamar} masih dihuni ${p.nama_penghuni || 'penghuni'}. Tandai penghuni keluar dulu sebelum menghapus kamar.`);
      return;
    }

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

  // =====================================================
  // DATA PENGHUNI
  // =====================================================

  function showPenghuni(kamarId) {
    const kos = currentKos();
    const kamar = kos && (kos.kamar || []).find(k => k.id === kamarId);
    const p = kamar && penghuniOf(kamar);
    if (!p) return;

    const row = (label, val) =>
      `<div style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px">
         <span style="color:var(--text-3);flex-shrink:0">${label}</span>
         <span style="font-weight:600;text-align:right;word-break:break-word">${val}</span>
       </div>`;

    const waLink = p.no_hp_penghuni
      ? `https://wa.me/${p.no_hp_penghuni.replace(/[^0-9]/g, '').replace(/^0/, '62')}`
      : null;

    const modal = openSheet('kkPenghuniModal', `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="width:48px;height:48px;border-radius:14px;background:var(--orange-light);display:flex;align-items:center;justify-content:center;font-size:22px">👤</div>
        <div>
          <div style="font-size:16px;font-weight:800">${esc(p.nama_penghuni || 'Penghuni')}</div>
          <div style="font-size:12.5px;color:var(--text-3)">Kamar ${esc(kamar.nomor_kamar)} · ${esc(kos.nama_kos)}</div>
        </div>
      </div>
      <div style="background:var(--bg);border-radius:12px;padding:10px 12px;font-size:12.5px;margin-bottom:12px">${tempoBadge(p.tanggal_tagihan)}</div>
      ${row('Pekerjaan', esc(p.pekerjaan || '-'))}
      ${row('No. HP', p.no_hp_penghuni ? `<a href="${waLink}" target="_blank" style="color:#16A34A;text-decoration:none">${esc(p.no_hp_penghuni)} 💬</a>` : '-')}
      ${row('Alamat (KTP)', esc(p.alamat_ktp || '-'))}
      ${row('Kontak Darurat', esc(p.kontak_darurat || '-'))}
      ${row('Mulai Tinggal', fmtTgl(p.tanggal_masuk))}
      ${row('Jatuh Tempo', fmtTgl(p.tanggal_tagihan))}
      ${p.keterangan ? row('Catatan', esc(p.keterangan)) : ''}

      <button id="kkRemindBtn" style="width:100%;margin-top:16px;padding:13px;background:#25D366;color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer">💬 Kirim Pengingat WhatsApp</button>
      <button id="kkPaidBtn" style="width:100%;margin-top:10px;padding:13px;background:#16A34A;color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer">✅ Sudah Bayar Bulan Ini</button>
      <div style="font-size:11px;color:var(--text-3);text-align:center;margin-top:4px">Jatuh tempo otomatis maju 1 bulan</div>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button id="kkEditPBtn" style="flex:1;padding:12px;background:var(--orange-light);color:var(--orange);border:none;border-radius:12px;font-weight:700;font-size:13.5px;cursor:pointer">✏️ Edit Data</button>
        <button id="kkOutBtn" style="flex:1;padding:12px;background:#FEE2E2;color:var(--red);border:none;border-radius:12px;font-weight:700;font-size:13.5px;cursor:pointer">🚪 Penghuni Keluar</button>
      </div>`);

    document.getElementById('kkRemindBtn').onclick = () => sendReminder(kamarId);
    document.getElementById('kkPaidBtn').onclick = () => markPaid(p, modal, kamar, kos);
    document.getElementById('kkEditPBtn').onclick = () => { modal.remove(); openPenghuniForm(kamarId, p); };
    document.getElementById('kkOutBtn').onclick = async () => {
      if (!confirm(`Tandai ${p.nama_penghuni || 'penghuni'} sudah keluar dari Kamar ${kamar.nomor_kamar}? Kamar akan jadi Kosong.`)) return;
      modal.remove();
      await markKeluar(p, kamar, false);
    };
  }

  async function markPaid(p, modal, kamar, kos) {
    const base = p.tanggal_tagihan || todayStr();
    const next = addMonth(base);
    try {
      const { error } = await sbClient.from('catatan_sewa')
        .update({ tanggal_tagihan: next, status: 'aktif', reminder_sent: false })
        .eq('id', p.id);
      if (error) throw error;
      modal.remove();
      await refresh();
      if (kamar && kos && confirm(`Tercatat lunas. Jatuh tempo berikutnya: ${fmtTgl(next)}.\n\nKirim konfirmasi pembayaran ke WhatsApp penghuni?`)) {
        openWA(p.no_hp_penghuni, paidText(p, kamar, kos, next));
      }
    } catch (err) {
      alert('Gagal menyimpan: ' + (err.message || ''));
    }
  }

  async function markKeluar(p, kamar, silent) {
    try {
      const { error } = await sbClient.from('catatan_sewa')
        .update({ status: 'keluar', tanggal_keluar: todayStr() })
        .eq('id', p.id);
      if (error) throw error;
      await setKamarStatus(kamar.id, 'kosong');
      await refresh();
      if (!silent) alert(`Kamar ${kamar.nomor_kamar} sekarang Kosong. Riwayat penghuni tetap tersimpan di Catatan Sewa.`);
    } catch (err) {
      alert('Gagal memproses: ' + (err.message || ''));
    }
  }

  function openPenghuniForm(kamarId, existing) {
    const kos = currentKos();
    const kamar = kos && (kos.kamar || []).find(k => k.id === kamarId);
    if (!kamar) return;

    const masuk = existing ? (existing.tanggal_masuk || '') : todayStr();
    const tempo = existing ? (existing.tanggal_tagihan || '') : addMonth(todayStr());
    const pek = existing ? existing.pekerjaan : '';

    const modal = openSheet('kkPenghuniForm', `
      <div style="font-size:16px;font-weight:800;margin-bottom:4px">${existing ? '✏️ Edit Data Penghuni' : '👤 Data Penghuni Baru'}</div>
      <div style="font-size:12.5px;color:var(--text-3);margin-bottom:16px">Kamar ${esc(kamar.nomor_kamar)} · ${esc(kos.nama_kos)}</div>

      <label style="${labelStyle}">Nama Lengkap *</label>
      <input id="pfNama" type="text" placeholder="Nama sesuai KTP" value="${esc(existing ? existing.nama_penghuni : '')}" style="${inputStyle}">

      <label style="${labelStyle}">Pekerjaan / Status</label>
      <select id="pfPekerjaan" style="${inputStyle}">
        <option value="">— Pilih —</option>
        ${PEKERJAAN.map(x => `<option ${pek === x ? 'selected' : ''}>${x}</option>`).join('')}
      </select>

      <label style="${labelStyle}">No. HP / WhatsApp</label>
      <input id="pfHp" type="tel" placeholder="08xx-xxxx-xxxx" value="${esc(existing ? existing.no_hp_penghuni : '')}" style="${inputStyle}">

      <label style="${labelStyle}">Alamat Sesuai KTP</label>
      <textarea id="pfAlamat" rows="2" placeholder="Alamat asal penghuni" style="${inputStyle};resize:vertical">${esc(existing ? existing.alamat_ktp : '')}</textarea>

      <label style="${labelStyle}">Kontak Darurat</label>
      <input id="pfDarurat" type="text" placeholder="Contoh: Ibu Sri - 0812xxxx" value="${esc(existing ? existing.kontak_darurat : '')}" style="${inputStyle}">

      <label style="${labelStyle}">Mulai Tinggal *</label>
      <input id="pfMasuk" type="date" value="${masuk}" style="${inputStyle}">

      <label style="${labelStyle}">Jatuh Tempo Bayar Berikutnya *</label>
      <input id="pfTempo" type="date" value="${tempo}" style="${inputStyle}">

      <label style="${labelStyle}">Catatan (opsional)</label>
      <textarea id="pfKet" rows="2" placeholder="Catatan tambahan" style="${inputStyle};resize:vertical">${esc(existing ? existing.keterangan : '')}</textarea>

      <div style="font-size:11.5px;color:var(--text-3);background:var(--bg);border-radius:10px;padding:10px;margin-bottom:14px;line-height:1.5">
        📷 Foto KTP tidak disimpan di aplikasi. Simpan sendiri di galeri HP-mu.
      </div>

      <div id="pfErr" style="color:var(--red);font-size:13px;margin-bottom:12px;display:none"></div>
      <div style="display:flex;gap:10px">
        <button id="pfCancel" style="flex:1;padding:13px;background:var(--bg);border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer">Batal</button>
        <button id="pfSave" style="flex:1;padding:13px;background:var(--orange);color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer">Simpan</button>
      </div>`);

    // Saat tanggal masuk diganti pada data baru, jatuh tempo ikut menyesuaikan
    if (!existing) {
      document.getElementById('pfMasuk').onchange = function () {
        document.getElementById('pfTempo').value = addMonth(this.value);
      };
    }
    document.getElementById('pfCancel').onclick = () => modal.remove();
    document.getElementById('pfSave').onclick = () => savePenghuni(kos, kamar, existing, modal);
  }

  async function savePenghuni(kos, kamar, existing, modal) {
    const val = id => document.getElementById(id).value.trim();
    const nama = val('pfNama');
    const masuk = val('pfMasuk');
    const tempo = val('pfTempo');
    const errEl = document.getElementById('pfErr');
    const showErr = m => { errEl.textContent = m; errEl.style.display = 'block'; };
    errEl.style.display = 'none';

    if (!nama) return showErr('Nama penghuni wajib diisi.');
    if (!masuk) return showErr('Tanggal mulai tinggal wajib diisi.');
    if (!tempo) return showErr('Tanggal jatuh tempo wajib diisi.');

    const payload = {
      nama_penghuni: nama,
      pekerjaan: val('pfPekerjaan') || null,
      no_hp_penghuni: val('pfHp') || null,
      alamat_ktp: val('pfAlamat') || null,
      kontak_darurat: val('pfDarurat') || null,
      tanggal_masuk: masuk,
      tanggal_tagihan: tempo,
      keterangan: val('pfKet') || null
    };

    const btn = document.getElementById('pfSave');
    btn.textContent = 'Menyimpan...';
    btn.disabled = true;

    try {
      if (existing) {
        if (existing.tanggal_tagihan !== tempo) payload.reminder_sent = false;
        const { error } = await sbClient.from('catatan_sewa').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await sbClient.from('catatan_sewa').insert({
          ...payload,
          kos_id: kos.id,
          owner_id: currentUser.id,
          nomor_kamar: kamar.nomor_kamar,
          status: 'aktif',
          tanggal_dicatat: todayStr(),
          reminder_sent: false
        });
        if (error) throw error;
        if (kamar.status !== 'terisi') await setKamarStatus(kamar.id, 'terisi');
      }
      modal.remove();
      await refresh();
    } catch (err) {
      let msg = err.message || '';
      if (/column .* does not exist|schema cache/i.test(msg)) {
        msg = 'Kolom data penghuni belum ada. Jalankan dulu file penghuni-setup.sql di Supabase.';
      }
      showErr('Gagal menyimpan: ' + msg);
      btn.textContent = 'Simpan';
      btn.disabled = false;
    }
  }

  // ---------- Daftarkan ke global ----------
  window.showKelolaKamar = showKelolaKamar;
  window.kkToggleStatus = toggleStatus;
  window.kkOpenForm = openKamarForm;
  window.kkDelete = deleteKamar;
  window.kkShowPenghuni = showPenghuni;
  window.kkSendReminder = sendReminder;

  // =====================================================
  // Kirim KWITANSI ke WhatsApp (menu Booking Masuk → Buat Kwitansi)
  // =====================================================
  function kwitansiText(kw) {
    const tgl = kw.tanggal_bayar
      ? new Date(kw.tanggal_bayar + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-';
    return `🧾 *KWITANSI PEMBAYARAN*\n` +
      `No: ${kw.nomor_kwitansi || '-'}\n\n` +
      `Diterima dari : ${kw.nama_penyewa || '-'}\n` +
      `Kos / Kamar   : ${kw.nama_kos || '-'} / ${kw.nomor_kamar || '-'}\n` +
      `Untuk         : ${kw.untuk_periode || '-'}\n` +
      `Tanggal       : ${tgl}\n` +
      `Metode        : ${kw.metode_bayar || '-'}\n` +
      (kw.catatan ? `Catatan       : ${kw.catatan}\n` : '') +
      `\n*Total Dibayar: ${formatRupiah(kw.jumlah || 0)}*\n\n` +
      `Terima kasih 🙏\nKwitansi digital — ${kw.nama_kos || 'KosKu Solo'} (via KosKu Solo)`;
  }

  const origRenderKwitansi = window.renderKwitansiReceipt;
  if (typeof origRenderKwitansi === 'function') {
    window.renderKwitansiReceipt = function (kw) {
      origRenderKwitansi.apply(this, arguments);

      // Tombol WA hanya untuk pemilik kos
      if (!(currentUserProfile && currentUserProfile.role === 'pemilik')) return;
      const modal = document.getElementById('kwitansiReceiptModal');
      if (!modal) return;
      const closeBtn = modal.querySelector('button');
      if (!closeBtn) return;

      let hp = '';
      try { hp = (typeof _kwitansiBookingCache !== 'undefined' && _kwitansiBookingCache && _kwitansiBookingCache.no_hp) || ''; } catch (e) { /* abaikan */ }

      const btn = document.createElement('button');
      btn.style.cssText = 'width:100%;padding:12px;background:#25D366;border:none;border-radius:10px;color:white;font-weight:700;font-size:13px;margin-top:16px;cursor:pointer';
      btn.textContent = '💬 Kirim Kwitansi ke WhatsApp';
      btn.onclick = function () {
        if (!hp && !confirm('No. HP penyewa tidak ditemukan. Buka WhatsApp dan pilih kontaknya sendiri?')) return;
        openWA(hp, kwitansiText(kw));
      };
      closeBtn.parentNode.insertBefore(btn, closeBtn);
      closeBtn.style.marginTop = '10px';
    };
  }
  window.kkOpenPenghuniForm = function (kamarId, _existing) { openPenghuniForm(kamarId, null); };

  // Sambungkan kartu "Kelola Kamar" di dashboard pemilik
  document.querySelectorAll('#screen-owner .owner-menu-card').forEach(card => {
    if (card.textContent.includes('Kelola Kamar')) {
      card.style.cursor = 'pointer';
      card.onclick = showKelolaKamar;
    }
  });
})();
