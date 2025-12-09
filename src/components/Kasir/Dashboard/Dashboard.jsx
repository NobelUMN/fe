import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const IconTransaksi = () => (
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">{/* changed 20 -> 28 */}
    <rect x="3" y="7" width="18" height="13" rx="2" stroke="#23398a" strokeWidth="2"/>
    <path d="M16 3v4M8 3v4" stroke="#23398a" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IconProduk = () => (
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
    <rect x="3" y="7" width="18" height="13" rx="2" stroke="#23398a" strokeWidth="2"/>
    <rect x="7" y="3" width="10" height="4" rx="1" stroke="#23398a" strokeWidth="2"/>
  </svg>
);

const IconRiwayat = () => (
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="#23398a" strokeWidth="2"/>
    <path d="M12 6v6l4 2" stroke="#23398a" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const IconLaporan = () => (
  <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#23398a" strokeWidth="2"/>
    <path d="M8 4v16M16 4v16" stroke="#23398a" strokeWidth="2"/>
  </svg>
);

function Dashboard({ onLogout, setActiveMenu, activeMenu }) {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  useEffect(() => {
    fetch('https://be-production-6856.up.railway.app/api/produk')
      .then(res => res.json())
      .then(data => {
        setProduk(data);
        setLoading(false);
      });
  }, []);

  // Filter dan pagination
  const filtered = produk.filter(item =>
    item.nama_produk.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">CAN<br />BENGKEL</div>
        <div
          className={activeMenu === 'transaksi' ? 'sidebar-link sidebar-active' : 'sidebar-link'}
          onClick={() => setActiveMenu('transaksi')}
        >
          <span className="sidebar-icon"><IconTransaksi /></span>Transaksi
        </div>
        <div
          className={activeMenu === 'produk' ? 'sidebar-link sidebar-active' : 'sidebar-link'}
          onClick={() => setActiveMenu('produk')}
        >
          <span className="sidebar-icon"><IconProduk /></span>Produk
        </div>
        <div
          className={activeMenu === 'riwayat' ? 'sidebar-link sidebar-active' : 'sidebar-link'}
          onClick={() => setActiveMenu('riwayat')}
        >
          <span className="sidebar-icon"><IconRiwayat /></span>
          Riwayat Transaksi
        </div>
      </div>
      {/* Main */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-title">Produk</div>
          <div className="dashboard-user">
            <span style={{marginRight:8}}></span>
            Chandra Kurnia Santoso - Kasir
            <button className="dashboard-logout" onClick={onLogout}>Logout</button>
          </div>
        </div>
        <div className="dashboard-searchbar">
          <input
            type="text"
            className="dashboard-search"
            placeholder="Cari produk..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama Produk</th>
              <th>Harga Satuan</th>
              <th>Jumlah</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Tanggal Input</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="center">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={7} className="center">Tidak ada produk</td></tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={item.id_produk}>
                  <td>{(page-1)*perPage + idx + 1}</td>
                  <td>{item.nama_produk}</td>
                  <td>Rp{Number(item.harga_jual).toLocaleString()}</td>
                  <td>{item.stok ?? '-'}</td>
                  <td>{item.kategori}</td>
                  <td>{item.lokasi}</td>
                  <td>{item.created_at ? item.created_at.slice(0,19).replace('T',' ') : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="dashboard-pagination">
          {Array.from({length: totalPages}, (_, i) => (
            <button
              key={i}
              className={page === i+1 ? 'pagination-btn active' : 'pagination-btn'}
              onClick={() => setPage(i+1)}
            >{String(i+1).padStart(2,'0')}</button>
          ))}
        </div>
      </div>
    </div>
  );

  
}

export default Dashboard;