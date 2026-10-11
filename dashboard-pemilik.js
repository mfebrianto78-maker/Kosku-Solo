// =====================================================
// KosKu Solo — Angka asli di Dashboard Pemilik
// Dimuat lewat: <script src="dashboard-pemilik.js"></script>
// Mengganti angka contoh ("3 Baru!", "5 Pesan", "4.8 Rating")
// dengan data sebenarnya dari database.
// =====================================================

(function () {
  function findCard(label) {
    return Array.from(document.querySelectorAll('#screen-owner .owner-menu-card'))
      .find(c => c.textContent.includes(label)) || null;
  }

  function setBadge(label, text, color) {
    const card = findCard(label);
    if (!card) return;
    const b = card.querySelector('.owner-menu-badge');
    if (!b) return;
    b.textContent = text;
    b.style.color = color || 'var(--orange)';
  }

  function setBookingNavDot(hasNew) {
    // Titik oranye di tab "Booking" pada bottom nav dashboard pemilik
    document.querySelectorAll('#screen-owner .bottom-nav .nav-item').forEach(item => {
      if (item.textContent.includes('Booking')) {
        const icon = item.querySelector('.nav-icon');
        if (icon) icon.classList.toggle('has-unread', hasNew);
      }
    });
  }

  async function updateOwnerDashboard() {
    if (!currentUser || !(currentUserProfile && currentUserProfile.role === 'pemilik')) return;
    const kosIds = (myKosData || []).map(k => k.id);

    // ---------- Booking Masuk: jumlah booking menunggu ----------
    try {
      if (!kosIds.length) {
        setBadge('Booking Masuk', 'Belum ada', 'var(--text-3)');
        setBookingNavDot(false);
      } else {
        const { count, error } = await sbClient
          .from('booking')
          .select('id', { count: 'exact', head: true })
          .in('kos_id', kosIds)
          .eq('status', 'menunggu');
        if (error) throw error;
        const n = count || 0;
        if (n > 0) setBadge('Booking Masuk', `${n} Baru!`, 'var(--red)');
        else setBadge('Booking Masuk', 'Tidak ada baru', 'var(--text-3)');
        setBookingNavDot(n > 0);
      }
    } catch (err) {
      console.error('Gagal hitung booking baru:', err);
    }

    // ---------- Chat Penyewa: pesan belum dibaca ----------
    try {
      const { count, error } = await sbClient
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);
      if (error) throw error;
      const n = count || 0;
      if (n > 0) setBadge('Chat Penyewa', `${n} Pesan Baru`, 'var(--red)');
      else setBadge('Chat Penyewa', 'Tidak ada baru', 'var(--text-3)');
    } catch (err) {
      console.error('Gagal hitung pesan baru:', err);
    }

    // ---------- Review: rata-rata rating semua kos ----------
    let totalUlasan = 0, totalBintang = 0;
    (myKosData || []).forEach(k => {
      const j = Number(k.jumlah_review) || 0;
      totalUlasan += j;
      totalBintang += (Number(k.rating) || 0) * j;
    });
    if (totalUlasan > 0) {
      const avg = (totalBintang / totalUlasan).toFixed(1).replace('.', ',');
      setBadge('Review', `⭐ ${avg} · ${totalUlasan} ulasan`);
    } else {
      setBadge('Review', 'Belum ada ulasan', 'var(--text-3)');
    }

    // ---------- Pendapatan bulan ini ----------
    const pendEl = document.getElementById('ownerPendapatan');
    if (pendEl && kosIds.length) {
      try {
        const now = new Date();
        const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data, error } = await sbClient
          .from('booking')
          .select('total_bayar')
          .in('kos_id', kosIds)
          .in('status', ['diterima', 'aktif', 'selesai'])
          .gte('created_at', awalBulan);
        if (error) throw error;
        const total = (data || []).reduce((s, b) => s + (Number(b.total_bayar) || 0), 0);
        pendEl.textContent = formatRupiah(total);
      } catch (err) {
        console.error('Gagal hitung pendapatan:', err);
      }
    }
  }

  // ---------- Jalankan setiap kali data kos pemilik dimuat ulang ----------
  const originalLoadMyKos = window.loadMyKos;
  if (typeof originalLoadMyKos === 'function') {
    window.loadMyKos = async function () {
      await originalLoadMyKos.apply(this, arguments);
      await updateOwnerDashboard();
    };
  }

  // Sambungkan kartu Review supaya bisa dibuka (menuju daftar kos milik pemilik)
  const reviewCard = findCard('Review');
  if (reviewCard && !reviewCard.onclick) {
    reviewCard.style.cursor = 'pointer';
    reviewCard.onclick = function () {
      if (typeof showKelolaKos === 'function') showKelolaKos();
    };
  }

  // Tampilkan "memuat" dulu, bukan angka contoh
  ['Booking Masuk', 'Chat Penyewa', 'Review'].forEach(l => setBadge(l, '…', 'var(--text-3)'));

  window.updateOwnerDashboard = updateOwnerDashboard;

  // Kalau dashboard pemilik sudah terbuka saat file ini dimuat
  if (currentUser && myKosData && myKosData.length) updateOwnerDashboard();
})();
