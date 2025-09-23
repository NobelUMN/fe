import React, { useState } from 'react';
import { login } from '../api/login';
import './LoginForm.css';

function LoginForm() {
  const [email, setEmail] = useState('');
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
      const response = await login(email, password);
      if (response.success) {
        setRole(response.data.role); // ambil role dari response backend
        setSuccess('Login berhasil!');
        setShowModal(true);
      } else {
        setError(response.message || 'Login gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>CAN<br />BENGKEL</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non sollicitudin purus, vel dapibus nunc.
        </p>
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome to <span style={{ color: '#23398a' }}>CAN BENGKEL</span></h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non sollicitudin purus, vel dapibus nunc.
          </p>
          <div>
            <input
              type="text"
              className="login-input"
              placeholder="Username / Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
          {success && <div className="login-success">{success}</div>}
          <button type="submit" className="login-button">Login</button>
        </form>
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Berhasil login sebagai {role}</h3>
              <button onClick={closeModal} className="login-button" style={{marginTop: 20}}>Tutup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;

// Tambahkan CSS berikut di LoginForm.css:
// .modal-overlay {
//   position: fixed;
//   top: 0; left: 0; right: 0; bottom: 0;
//   background: rgba(0,0,0,0.3);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 999;
// }
// .modal-content {
//   background: #fff;
//   padding: 32px 24px;
//   border-radius: 12px;
//   box-shadow: 0 2px 16px rgba(0,0,0,0.2);
//   text-align: center;
// }