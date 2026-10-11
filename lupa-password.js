// =====================================================
// KosKu Solo — Fitur Lupa Password
// Dimuat lewat: <script src="lupa-password.js"></script>
// (letakkan di bawah baris admin-patch.js, di atas </body>)
// =====================================================

(function () {
  const APP_URL = location.origin + location.pathname;

  // ---------- Kerangka modal ----------
  function openResetModal(innerHtml) {
    closeResetModal();
    const modal = document.createElement('div');
    modal.id = 'resetPwModal';
    modal.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
    modal.innerHTML =
      '<div style="background:white;border-radius:20px 20px 0 0;padding:24px 20px 28px;width:100%;max-width:430px;font-family:inherit">' +
      innerHtml +
      '</div>';
    document.body.appendChild(modal);
    return modal;
  }

  function closeResetModal() {
    const m = document.getElementById('resetPwModal');
    if (m) m.remove();
  }

  function setMsg(text, ok) {
    const el = document.getElementById('resetPwMsg');
    if (!el) return;
    el.textContent = text;
    el.style.color = ok ? 'var(--green)' : 'var(--red)';
    el.style.display = text ? 'block' : 'none';
  }

  const inputStyle =
    'width:100%;padding:14px 16px;border:1.5px solid var(--border);border-radius:12px;font-size:15px;font-family:inherit;background:var(--bg);box-sizing:border-box;margin:6px 0 14px';
  const btnStyle =
    'width:100%;padding:14px;background:var(--orange);border:none;border-radius:12px;color:white;font-weight:700;font-size:15px;cursor:pointer';
  const cancelStyle =
    'width:100%;padding:12px;background:transparent;border:none;color:var(--text-3);font-weight:600;font-size:14px;cursor:pointer;margin-top:6px';

  // ---------- 1. Minta link reset ----------
  function showLupaPasswordModal() {
    const prefill = (document.getElementById('loginIdentifier') || {}).value || '';
    openResetModal(`
      <div style="text-align:center;font-size:36px;margin-bottom:6px">🔑</div>
      <div style="text-align:center;font-size:17px;font-weight:800;margin-bottom:6px">Lupa Password</div>
      <div style="text-align:center;font-size:13px;color:var(--text-3);line-height:1.5;margin-bottom:16px">
        Masukkan email akunmu. Kami akan mengirim link untuk membuat password baru.
      </div>
      <label style="font-size:13px;font-weight:600;color:var(--text-2)">Email</label>
      <input id="resetPwEmail" type="email" placeholder="email@contoh.com" value="${prefill.includes('@') ? prefill : ''}" style="${inputStyle}">
      <div id="resetPwMsg" style="font-size:13px;margin:-6px 0 12px;display:none;line-height:1.5"></div>
      <button id="resetPwSendBtn" style="${btnStyle}">Kirim Link Reset</button>
      <button id="resetPwCancelBtn" style="${cancelStyle}">Batal</button>
    `);
    document.getElementById('resetPwCancelBtn').onclick = closeResetModal;
    document.getElementById('resetPwSendBtn').onclick = sendResetLink;
  }

  async function sendResetLink() {
    const email = document.getElementById('resetPwEmail').value.trim();
    const btn = document.getElementById('resetPwSendBtn');
    setMsg('');

    if (!email) return setMsg('Email wajib diisi.');
    if (!email.includes('@')) {
      return setMsg('Akun yang didaftarkan dengan No. HP belum bisa reset lewat email. Hubungi admin KosKu Solo lewat menu Bantuan.');
    }

    btn.textContent = 'Mengirim...';
    btn.disabled = true;
    try {
      const { error } = await sbClient.auth.resetPasswordForEmail(email, { redirectTo: APP_URL });
      if (error) throw error;
      setMsg('✅ Jika email terdaftar, link reset sudah dikirim. Cek kotak masuk atau folder Spam, lalu buka link-nya di HP ini.', true);
      btn.textContent = 'Kirim Ulang';
    } catch (err) {
      let msg = err.message || 'Gagal mengirim link.';
      if (/rate limit|too many|seconds/i.test(msg)) msg = 'Terlalu sering mencoba. Tunggu beberapa menit lalu coba lagi.';
      setMsg('❌ ' + msg);
      btn.textContent = 'Kirim Link Reset';
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- 2. Buat password baru (setelah klik link di email) ----------
  function showSetPasswordModal() {
    openResetModal(`
      <div style="text-align:center;font-size:36px;margin-bottom:6px">🔒</div>
      <div style="text-align:center;font-size:17px;font-weight:800;margin-bottom:16px">Buat Password Baru</div>
      <label style="font-size:13px;font-weight:600;color:var(--text-2)">Password Baru</label>
      <input id="newPw1" type="password" placeholder="Min. 6 karakter" style="${inputStyle}">
      <label style="font-size:13px;font-weight:600;color:var(--text-2)">Ulangi Password Baru</label>
      <input id="newPw2" type="password" placeholder="Ketik ulang password" style="${inputStyle}">
      <div id="resetPwMsg" style="font-size:13px;margin:-6px 0 12px;display:none;line-height:1.5"></div>
      <button id="newPwSaveBtn" style="${btnStyle}">Simpan Password</button>
    `);
    document.getElementById('newPwSaveBtn').onclick = saveNewPassword;
  }

  async function saveNewPassword() {
    const p1 = document.getElementById('newPw1').value;
    const p2 = document.getElementById('newPw2').value;
    const btn = document.getElementById('newPwSaveBtn');
    setMsg('');

    if (p1.length < 6) return setMsg('Password minimal 6 karakter.');
    if (p1 !== p2) return setMsg('Kedua password tidak sama.');

    btn.textContent = 'Menyimpan...';
    btn.disabled = true;
    try {
      const { error } = await sbClient.auth.updateUser({ password: p1 });
      if (error) throw error;

      await sbClient.auth.signOut();
      currentUser = null;
      currentUserProfile = null;

      openResetModal(`
        <div style="text-align:center;font-size:40px;margin-bottom:8px">✅</div>
        <div style="text-align:center;font-size:17px;font-weight:800;margin-bottom:6px">Password Berhasil Diganti</div>
        <div style="text-align:center;font-size:13px;color:var(--text-3);margin-bottom:18px">Silakan login dengan password barumu.</div>
        <button id="resetPwDoneBtn" style="${btnStyle}">Ke Halaman Login</button>
      `);
      document.getElementById('resetPwDoneBtn').onclick = function () {
        closeResetModal();
        show('login');
      };
    } catch (err) {
      setMsg('❌ ' + (err.message || 'Gagal menyimpan password.'));
      btn.textContent = 'Simpan Password';
      btn.disabled = false;
    }
  }

  function showLinkErrorModal(text) {
    openResetModal(`
      <div style="text-align:center;font-size:36px;margin-bottom:6px">⚠️</div>
      <div style="text-align:center;font-size:17px;font-weight:800;margin-bottom:6px">Link Tidak Berlaku</div>
      <div style="text-align:center;font-size:13px;color:var(--text-3);line-height:1.5;margin-bottom:18px">${text}</div>
      <button id="resetPwRetryBtn" style="${btnStyle}">Minta Link Baru</button>
      <button id="resetPwCloseBtn" style="${cancelStyle}">Tutup</button>
    `);
    document.getElementById('resetPwRetryBtn').onclick = showLupaPasswordModal;
    document.getElementById('resetPwCloseBtn').onclick = closeResetModal;
  }

  // ---------- 3. Baca link reset dari URL saat aplikasi dibuka ----------
  async function handleRecoveryLink() {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : '';
    if (!hash) return;
    const params = new URLSearchParams(hash);

    const cleanUrl = () => history.replaceState(null, '', APP_URL);

    if (params.get('error') || params.get('error_code')) {
      cleanUrl();
      show('login');
      showLinkErrorModal('Link reset sudah kedaluwarsa atau sudah pernah dipakai. Minta link baru, lalu buka link terbaru di email.');
      return;
    }

    if (params.get('type') !== 'recovery') return;

    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    cleanUrl();
    if (!access_token || !refresh_token) return;

    try {
      const { error } = await sbClient.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      show('login');
      showSetPasswordModal();
    } catch (err) {
      show('login');
      showLinkErrorModal('Link reset tidak bisa diproses: ' + (err.message || err));
    }
  }

  // ---------- Sambungkan ke tombol "Lupa Password?" ----------
  const forgotLink = document.querySelector('.forgot-link a');
  if (forgotLink) {
    forgotLink.addEventListener('click', function (e) {
      e.preventDefault();
      showLupaPasswordModal();
    });
  }

  handleRecoveryLink();
})();
