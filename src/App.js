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
      return localStorage.getItem('username') || localStorage.getItem('auth_user_name') || localStorage.getItem('auth_username') || '';
    } catch (e) {
      return '';
    }
  });
  const [activeMenu, setActiveMenu] = useState('transaksi');
  const [produkCache, setProdukCache] = useState(null);
  const [riwayatCache, setRiwayatCache] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // Add loading state for auth check

  // ========== CHECK AUTH ON APP LOAD ==========
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      
      if (!token) {
        // Tidak ada token, user belum login
        setIsAuthChecking(false);
        return;
      }

      try {
        const res = await fetch('https://be-production-6856.up.railway.app/api/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Token valid, restore login state
          setIsLoggedIn(true);
          setUserRole(storedRole || 'kasir');
          setAuthUserName(data.username || data.user_name || authUserName);
          setActiveMenu(storedRole === 'admin' ? 'produk' : 'transaksi');
          console.log('Auth check passed, user:', data.username);
        } else {
          // Token invalid, clear localStorage
          console.log('Auth check failed, clearing localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('role');
          localStorage.removeItem('auth_user_name');
          localStorage.removeItem('auth_username');
          setIsLoggedIn(false);
          setUserRole('');
          setAuthUserName('');
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        // On error, clear auth state to be safe
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      } finally {
        setIsAuthChecking(false); // Always set false when done
      }
    };

    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // ==========================================

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
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    // hapus nama pengguna yang disimpan
    try {
      localStorage.removeItem('auth_user_name');
      localStorage.removeItem('auth_username');
    } catch (e) { /* ignore */ }
    setAuthUserName('');
  };

  // Show loading screen while checking auth
  if (isAuthChecking) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#666' }}>
        <div>Memeriksa sesi...</div>
      </div>
    );
  }

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
