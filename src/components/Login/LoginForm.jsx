import React, { useState } from 'react';
import { login } from '../../api/login';
import './LoginForm.css';

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState('');
  const token = localStorage.getItem('auth_token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Validasi input
      if (!username || !password) {
        setError('Username dan password wajib diisi');
        return;
      }
      const response = await login(username, password);
      // Cek jika response dari backend tidak sesuai
      if (typeof response !== 'object') {
        setError('Response tidak valid dari server');
        return;
      }
      if (response.success) {
        // Simpan token ke localStorage
        if (response.data && response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        // Simpan nama pengguna ke localStorage untuk ditampilkan sebagai nama kasir
        // Prioritas: response.data.name | response.data.nama | response.data.username | input username
        let displayName = username;
        try {
          displayName = (response.data && (response.data.name || response.data.nama || response.data.username)) || username;
          if (displayName) localStorage.setItem('auth_user_name', displayName);
          // Simpan juga username input sebagai fallback pasti
          localStorage.setItem('auth_username', username);
        } catch (e) {
          // ignore storage errors
        }
        // Cek struktur response dan log semuanya
        console.log('FULL RESPONSE:', response);
        let userRole = null;
        if (response.data && response.data.role) {
          userRole = response.data.role;
        } else if (response.role) {
          userRole = response.role;
        } else if (Array.isArray(response.data) && response.data[0] && response.data[0].role) {
          userRole = response.data[0].role;
        }
        setRole(userRole);
        setSuccess('Login berhasil!');
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          if (userRole && userRole.toLowerCase() === 'kasir') {
            onLoginSuccess('kasir', displayName);
          } else if (userRole && userRole.toLowerCase() === 'admin') {
            onLoginSuccess('admin', displayName);
          } else {
            setError('Role tidak dikenali: ' + userRole);
          }
        }, 1000);
      } else {
        setError(response.message || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan: ' + (err.message || err));
    }
  };

  const closeModal = () => setShowModal(false);


  return (
    <div className="login-container">
      <div className="login-left">
        <h1>CAN<br />BENGKEL</h1>
        <p>
        </p>
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome to <span style={{ color: '#23398a' }}>CAN BENGKEL</span></h2>
          <p>
            Silakan masuk dengan akun Anda untuk melanjutkan.
          </p>
          <div>
            <input
              type="text"
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              className="login-input"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div className="login-forgot">
              <a href="#">Forgot Password?</a>
            </div>
          </div>
          {error && <div className="login-error">{error}</div>}
          {success && !showModal && <div className="login-success">{success}</div>}
          <button type="submit" className="login-button">Login</button>
          
        </form>
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Berhasil login sebagai {role}</h3>
              <p style={{ marginTop: 10, color: 'green', fontWeight: 'bold' }}>
                Login berhasil!
              </p>
              <button onClick={closeModal} className="login-button" style={{marginTop: 20}}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;