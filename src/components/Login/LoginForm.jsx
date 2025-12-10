import React, { useState, useEffect } from 'react';
import { login } from '../../api/login';
import './LoginForm.css';

function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState('');
  const [isChecking, setIsChecking] = useState(true); // Add loading state

  // Check if already logged in - prevent showing login form if token exists
  useEffect(() => {
    const checkExistingLogin = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      const storedUsername = localStorage.getItem('username');

      if (!token) {
        // Tidak ada token, user belum login
        setIsChecking(false);
        return;
      }

      try {
        // Verify token is still valid via /api/me
        const res = await fetch('https://be-production-6856.up.railway.app/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          // Sudah ada user yang login, redirect ke dashboard
          console.log('User already logged in, redirecting to dashboard');
          // Call onLoginSuccess immediately tanpa delay
          onLoginSuccess(storedRole || 'kasir', storedUsername);
        } else {
          // Token tidak valid, hapus dari localStorage
          console.log('Token invalid, clearing localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('role');
          setIsChecking(false);
        }
      } catch (err) {
        console.error('Error:', err);
        setIsChecking(false);
      }
    };

    checkExistingLogin();
  }, [onLoginSuccess]);

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
      
      // Token, username, role sudah disimpan di localStorage oleh login()
      const userRole = localStorage.getItem('role');
      
      console.log('LOGIN SUCCESSFUL - Token dan role sudah disimpan');
      
      setRole(userRole);
      setSuccess('Login berhasil!');
      setShowModal(true);
      
      setTimeout(() => {
        setShowModal(false);
        if (userRole && userRole.toLowerCase() === 'kasir') {
          onLoginSuccess('kasir', username);
        } else if (userRole && userRole.toLowerCase() === 'admin') {
          onLoginSuccess('admin', username);
        } else {
          setError('Role tidak dikenali: ' + userRole);
        }
      }, 1000);
    } catch (err) {
      setError('Terjadi kesalahan: ' + (err.message || err));
    }
  };

  const closeModal = () => setShowModal(false);

  // Show loading screen while checking existing login
  if (isChecking) {
    return (
      <div className="login-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh', fontSize: '18px', color: '#666' }}>
          <div>Memeriksa sesi...</div>
        </div>
      </div>
    );
  }

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
              <button type="button" style={{ background: 'none', border: 'none', color: '#ff7a00', cursor: 'pointer', textDecoration: 'underline' }}>Forgot Password?</button>
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