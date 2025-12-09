import './App.css';
import LoginForm from './components/Login/LoginForm';
import DashboardAdmin from './components/Admin/DashboardAdmin/DashboardAdmin';
import Dashboard from './components/Kasir/Dashboard/Dashboard';
import Transaksi from './components/Kasir/Transaksi/Transaksi';
import RiwayatTrx from './components/Kasir/RiwayatTrx/Riwayat_Trx';
// LaporanHarian component removed
import { useState, useEffect } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [authUserName, setAuthUserName] = useState(() => {
    try {
      return localStorage.getItem('auth_user_name') || localStorage.getItem('auth_username') || '';
    } catch (e) {
      return '';
    }
  });
  const [activeMenu, setActiveMenu] = useState('transaksi');
  const [produkCache, setProdukCache] = useState(null);
  const [riwayatCache, setRiwayatCache] = useState(null);

  const handleLoginSuccess = (role, username) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setActiveMenu(role === 'admin' ? 'produk' : 'transaksi');
    if (username) setAuthUserName(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setActiveMenu('transaksi');
    localStorage.removeItem('auth_token');
    // hapus nama pengguna yang disimpan
    try {
      localStorage.removeItem('auth_user_name');
      localStorage.removeItem('auth_username');
    } catch (e) { /* ignore */ }
    setAuthUserName('');
  };

  // Otorisasi berdasarkan role
  if (isLoggedIn && userRole === 'kasir') {
    return (
      <>
        {activeMenu === 'transaksi' && (
          <Transaksi
            onLogout={handleLogout}
            setActiveMenu={setActiveMenu}
            activeMenu={activeMenu}
            produkCache={produkCache}
            setProdukCache={setProdukCache}
            authUserName={authUserName}
          />
        )}
        {activeMenu === 'produk' && (
          <Dashboard
            onLogout={handleLogout}
            setActiveMenu={setActiveMenu}
            activeMenu={activeMenu}
            produkCache={produkCache}
            setProdukCache={setProdukCache}
          />
        )}
        {activeMenu === 'riwayat' && (
          <RiwayatTrx
            onLogout={handleLogout}
            setActiveMenu={setActiveMenu}
            activeMenu={activeMenu}
            riwayatCache={riwayatCache}
            setRiwayatCache={setRiwayatCache}
          />
        )}
        {/* laporan menu removed */}
      </>
    );
  }

  if (isLoggedIn && userRole === 'admin') {
    return (
      <DashboardAdmin
        onLogout={handleLogout}
        setActiveMenu={setActiveMenu}
        activeMenu={activeMenu}
      />
    );
  }

  // Jika belum login, tampilkan login
  return (
    <div className="App">
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
