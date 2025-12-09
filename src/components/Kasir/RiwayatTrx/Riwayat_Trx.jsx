import React, { useEffect, useState } from 'react';
import './Riwayat_Trx.css';

const IconTransaksi = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#23398a" strokeWidth="2"/><path d="M16 3v4M8 3v4" stroke="#23398a" strokeWidth="2" strokeLinecap="round"/></svg>
);
const IconProduk = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#23398a" strokeWidth="2"/><rect x="7" y="3" width="10" height="4" rx="1" stroke="#23398a" strokeWidth="2"/></svg>
);
const IconRiwayat = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#23398a" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#23398a" strokeWidth="2" strokeLinecap="round"/></svg>
);
const IconLaporan = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="#23398a" strokeWidth="2"/><path d="M8 4v16M16 4v16" stroke="#23398a" strokeWidth="2"/></svg>
);

function RiwayatTransaksi({ onLogout, setActiveMenu, activeMenu }) {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrx, setSelectedTrx] = useState(null); // Tambah state untuk modal
  const [updatingStatus, setUpdatingStatus] = useState(false);
  // Fungsi untuk update status transaksi
  const handleUpdateStatus = async (trx, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`http://localhost:8000/api/transaksi/${trx.id_transaksi}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Refresh data transaksi
        const updated = await res.json();
        setSelectedTrx(prev => ({ ...prev, status: updated.status }));
        // Update di list riwayat juga
        setRiwayat(list => list.map(item => item.id_transaksi === trx.id_transaksi ? { ...item, status: updated.status } : item));
      } else {
        alert('Gagal update status');
      }
    } catch (err) {
      alert('Error update status');
    }
    setUpdatingStatus(false);
  };

  useEffect(() => {
  const loadData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/transaksi');
      const data = await res.json();

      // Tampilkan dulu datanya tanpa detail
      setRiwayat(data);
      setLoading(false);

      // Ambil detail di background tanpa menunda tampilan
      const detailed = await Promise.all(
        data.map(async trx => {
          try {
            const detailRes = await fetch(`http://localhost:8000/api/transaksi/${trx.id_transaksi}`);
            const detailData = await detailRes.json();
            return { ...trx, details: detailData.details || [] };
          } catch {
            return { ...trx, details: [] };
          }
        })
      );

      // Update state riwayat dengan data yang sudah ada detail-nya
      setRiwayat(detailed);
    } catch (err) {
      console.error('Gagal memuat transaksi:', err);
      setLoading(false);
    }
  };

    loadData();
  }, []);


  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">CAN<br />BENGKEL</div>
        <div className="sidebar-link" onClick={() => setActiveMenu('transaksi')}>
          <span className="sidebar-icon"><IconTransaksi /></span>Transaksi
        </div>
        <div className="sidebar-link" onClick={() => setActiveMenu('produk')}>
          <span className="sidebar-icon"><IconProduk /></span>Produk
        </div>
        <div className={activeMenu === 'riwayat' ? 'sidebar-link sidebar-active' : 'sidebar-link'}>
          <span className="sidebar-icon"><IconRiwayat /></span>Riwayat Transaksi
        </div>
      </div>
      {/* Main */}
      <div className="dashboard-main">
        <div style={{fontSize: '2rem', fontWeight: 'bold', margin: '24px 0 16px 0', textAlign: 'center'}}>Riwayat Transaksi</div>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nama Pembeli</th>
              <th>Nama Kasir</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="center">Loading...</td></tr>
            ) : riwayat.length === 0 ? (
              <tr><td colSpan={4} className="center">Belum ada transaksi</td></tr>
            ) : (
              riwayat.map(trx => {
                let status = '-';
                if (trx && trx.status && String(trx.status).trim() !== '') {
                  status = trx.status;
                } else if (typeof trx.nominal_bayar !== 'undefined' && typeof trx.total_pembayaran !== 'undefined') {
                  status = (Number(trx.nominal_bayar) >= Number(trx.total_pembayaran)) ? 'LUNAS' : 'BELUM LUNAS';
                }
                return (
                  <tr key={trx.id_transaksi}>
                    <td>{trx.nama_pelanggan || '-'}</td>
                    <td>{trx.nama_kasir || '-'}</td>
                    <td><b>{status}</b></td>
                    <td>
                      <button onClick={() => setSelectedTrx(trx)}>Lihat Detail</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Modal detail transaksi */}
        {selectedTrx && (() => {
          let status = '-';
          if (selectedTrx && selectedTrx.status && String(selectedTrx.status).trim() !== '') {
            status = selectedTrx.status;
          } else if (typeof selectedTrx.nominal_bayar !== 'undefined' && typeof selectedTrx.total_pembayaran !== 'undefined') {
            status = (Number(selectedTrx.nominal_bayar) >= Number(selectedTrx.total_pembayaran)) ? 'LUNAS' : 'BELUM LUNAS';
          }
          return (
            <div className="modal-overlay" onClick={() => setSelectedTrx(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Detail Transaksi</h3>
                <div><b>Tanggal:</b> {selectedTrx.tanggal?.replace('T', ' ').slice(0, 19)}</div>
                <div><b>Pembeli:</b> {selectedTrx.nama_pelanggan || '-'}</div>
                <div><b>Kasir:</b> {selectedTrx.nama_kasir}</div>
                <div><b>Status:</b> <span style={{fontWeight:'bold'}}>{status}</span>
                  <button className='ubah-status'
                    style={{marginLeft:8, fontSize:'0.9em'}}
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus(selectedTrx, status === 'LUNAS' ? 'BELUM LUNAS' : 'LUNAS')}
                  >{updatingStatus ? '...' : `Ubah ke ${status === 'LUNAS' ? 'BELUM LUNAS' : 'LUNAS'}`}</button>
                </div>
                <table style={{width: '100%', marginTop: 10}}>
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th>Harga Produk</th>
                      <th>Jumlah</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTrx.details && selectedTrx.details.length > 0 ? (
                      selectedTrx.details.map((item, i) => (
                        <tr key={i}>
                          <td>{item.produk?.nama_produk || '-'}</td>
                          <td>Rp{Number(item.harga).toLocaleString()}</td>
                          <td>{item.qty}</td>
                          <td>Rp{Number(item.subtotal).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="center">Tidak ada detail</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{textAlign: 'right', fontWeight: 'bold'}}>Total</td>
                      <td style={{fontWeight: 'bold'}}>Rp{Number(selectedTrx.total_pembayaran).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
                <div style={{marginTop:8}}>
                  <b>Tunai:</b> Rp{Number(selectedTrx.nominal_bayar).toLocaleString()}<br/>
                  <b>Kembalian:</b> Rp{Number((selectedTrx.nominal_bayar || 0) - (selectedTrx.total_pembayaran || 0)).toLocaleString()}
                </div>
                <button className='tutup-modal' style={{marginTop: 16}} onClick={() => setSelectedTrx(null)}>Tutup</button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default RiwayatTransaksi;
