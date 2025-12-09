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
      
      // Validasi response object
      if (typeof response !== 'object') {
        setError('Response tidak valid dari server');
        return;
      }
      
      if (response.success && response.data) {
        // Simpan token ke localStorage dari response.data.token
        const tokenValue = response.data.token;
        if (tokenValue) {
          localStorage.setItem('auth_token', tokenValue);
        } else {
          setError('Token tidak ditemukan dalam response');
          return;
        }
        
        // Simpan username ke localStorage
        localStorage.setItem('auth_username', username);
        localStorage.setItem('auth_user_name', response.data.name || response.data.username || username);
        
        // Ekstrak role dari response.data.role
        const userRole = response.data.role;
        
        console.log('LOGIN SUCCESSFUL:', { token: tokenValue, role: userRole, username });
        
        setRole(userRole);
        setSuccess('Login berhasil!');
        setShowModal(true);
        
        setTimeout(() => {
          setShowModal(false);
          if (userRole && userRole.toLowerCase() === 'kasir') {
            onLoginSuccess('kasir', response.data.name || username);
          } else if (userRole && userRole.toLowerCase() === 'admin') {
            onLoginSuccess('admin', response.data.name || username);
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