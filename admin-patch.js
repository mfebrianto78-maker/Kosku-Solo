// =====================================================
// KosKu Solo — Pengganti fungsi admin di index.html
// Cari tiap fungsi di bawah ini di index.html (nama sama),
// hapus versi lamanya, lalu tempel versi baru ini.
// =====================================================


// ---------- 1. GANTI handleAdminLogin ----------
async function handleAdminLogin() {
  const email = document.getElementById('adminEmail').value.trim();
  const pass = document.getElementById('adminPass').value;
  const errEl = document.getElementById('adminLoginErr');
  errEl.style.display = 'none';
  if (!email || !pass) {
    errEl.textContent = 'Email dan password wajib diisi.';
    errEl.style.display = 'block';
    return;
  }
  try {
    const { data, error } = await sbClient.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    const { data: profile, error: pErr } = await sbClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (pErr || !profile || !profile.is_admin) {
      await sbClient.auth.signOut();
      errEl.textContent = 'Akun ini tidak memiliki akses admin.';
      errEl.style.display = 'block';
      return;
    }

    currentUser = data.user;
    currentUserProfile = profile;
    adminSession = profile;
    document.getElementById('adminPass').value = '';
    show('admin-dashboard');
    switchAdminTab('stats');
  } catch (err) {
    let msg = err.message || 'Gagal login.';
    if (msg.includes('Invalid login credentials')) msg = 'Email atau password salah.';
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
}


// ---------- 2. GANTI handleAdminLogout ----------
async function handleAdminLogout() {
  adminSession = null;
  try { await sbClient.auth.signOut(); } catch (e) { console.error(e); }
  currentUser = null;
  currentUserProfile = null;
  show('login');
}


// ---------- 3. GANTI loadAdminStats ----------
async function loadAdminStats() {
  const el = document.getElementById('adminContent');
  el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--text-3)">Memuat statistik...</div>';
  try {
    const [kosRes, userRes, bookRes, activeBookRes] = await Promise.all([
      sbClient.from('kos').select('id', { count: 'exact', head: true }),
      sbClient.from('profiles').select('id', { count: 'exact', head: true }),
      sbClient.from('booking').select('id', { count: 'exact', head: true }),
      sbClient.from('booking').select('id', { count: 'exact', head: true }).in('status', ['diterima', 'aktif']),
    ]);

    const { data: recentBook } = await sbClient
      .from('booking')
      .select('*, kos(nama_kos)')
      .order('created_at', { ascending: false })
      .limit(5);

    // Nama penyewa diambil terpisah (booking tidak berelasi langsung ke profiles)
    const penyewaIds = [...new Set((recentBook || []).map(b => b.penyewa_id).filter(Boolean))];
    const namaMap = {};
    if (penyewaIds.length) {
      const { data: profs } = await sbClient.from('profiles').select('id, nama_lengkap').in('id', penyewaIds);
      (profs || []).forEach(p => { namaMap[p.id] = p.nama_lengkap; });
    }

    const statusStyle = {
      menunggu: ['#FFF7CD', '#CA8A04'],
      diterima: ['#DCFCE7', '#16A34A'],
      aktif: ['#DBEAFE', '#2563EB'],
      selesai: ['#F1F5F9', '#64748B'],
      ditolak: ['#FEE2E2', '#DC2626'],
      kedaluwarsa: ['#FEE2E2', '#DC2626'],
    };

    el.innerHTML = `
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:12px">Ringkasan Platform</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
        ${adminCard('Total Kos', kosRes.count || 0, '🏠', '#FF7A00')}
        ${adminCard('Total Pengguna', userRes.count || 0, '👥', '#2563EB')}
        ${adminCard('Total Booking', bookRes.count || 0, '📋', '#7C3AED')}
        ${adminCard('Booking Aktif', activeBookRes.count || 0, '✅', '#16A34A')}
      </div>
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:12px">Booking Terbaru</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${(recentBook || []).length ? recentBook.map(b => {
          const [bg, fg] = statusStyle[b.status] || ['#F1F5F9', '#64748B'];
          return `
          <div style="background:white;border-radius:12px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div style="font-size:13.5px;font-weight:700">${(b.kos && b.kos.nama_kos) || '-'}</div>
              <div style="font-size:11px;padding:3px 9px;border-radius:50px;background:${bg};color:${fg};font-weight:700">${b.status}</div>
            </div>
            <div style="font-size:12px;color:var(--text-3);margin-top:4px">Oleh: ${namaMap[b.penyewa_id] || b.nama_pemesan || '-'} · ${new Date(b.created_at).toLocaleDateString('id-ID')}</div>
          </div>`;
        }).join('') : '<div style="text-align:center;padding:20px;color:var(--text-3);font-size:13px">Belum ada booking</div>'}
      </div>`;
  } catch (err) {
    el.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--red)">Gagal memuat: ${err.message}</div>`;
  }
}


// ---------- 4. GANTI loadAdminKos ----------
async function loadAdminKos() {
  const el = document.getElementById('adminContent');
  el.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--text-3)">Memuat data kos...</div>';
  try {
    const { data, error } = await sbClient.from('kos').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    const ownerIds = [...new Set((data || []).map(k => k.owner_id).filter(Boolean))];
    const ownerMap = {};
    if (ownerIds.length) {
      const { data: owners } = await sbClient.from('profiles').select('id, nama_lengkap').in('id', ownerIds);
      (owners || []).forEach(o => { ownerMap[o.id] = o.nama_lengkap; });
    }

    el.innerHTML = `
      <div style="font-size:14px;font-weight:700;margin-bottom:12px">Semua Kos (${(data || []).length})</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${(data || []).map(k => `
          <div style="background:white;border-radius:12px;padding:12px 14px;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${k.nama_kos}</div>
                <div style="font-size:12px;color:var(--text-3);margin-top:2px">👤 ${ownerMap[k.owner_id] || '-'} · 📍 ${k.alamat || '-'}</div>
                <div style="font-size:12px;color:var(--orange);font-weight:600;margin-top:2px">${formatRupiah(k.harga_per_bulan)}/bln · ${k.status}</div>
              </div>
              <div style="margin-left:8px;flex-shrink:0">
                <button onclick="adminDeleteKos('${k.id}','${k.nama_kos.replace(/'/g, "\\'")}')" style="padding:7px 12px;background:#FEE2E2;border:none;border-radius:8px;font-size:12px;font-weight:700;color:var(--red);cursor:pointer">🗑️ Hapus</button>
              </div>
            </div>
          </div>`).join('')}
      </div>`;
  } catch (err) {
    el.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--red)">Gagal: ${err.message}</div>`;
  }
}


// ---------- 5. GANTI adminDeleteKos ----------
async function adminDeleteKos(id, nama) {
  if (!confirm(`Hapus kos "${nama}"? Semua data kamar terkait akan ikut terhapus.`)) return;
  try {
    await sbClient.from('kamar').delete().eq('kos_id', id);
    const { error } = await sbClient.from('kos').delete().eq('id', id);
    if (error) throw error;
    loadAdminKos();
  } catch (err) {
    alert('Gagal menghapus kos: ' + (err.message || ''));
  }
}
