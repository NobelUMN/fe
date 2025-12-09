import React, { useEffect, useState } from "react";
import "./TransaksiAdmin.css";

function TransaksiAdmin() {
    const [transaksi, setTransaksi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchTransaksi();
    }, []);

    const fetchTransaksi = async () => {
        setLoading(true);
        try {
            const res = await fetch("https://be-production-6856.up.railway.app/api/transaksi", {
                mode: 'cors',
                credentials: 'include'
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error('API ERROR RESPONSE:', errorText);
                setLoading(false);
                return;
            }
            
            const data = await res.json();
            console.log('TRANSAKSI DATA RECEIVED:', data);
            setTransaksi(data);
            setLoading(false);

            // fetch detailnya di background biar gak nunggu semua selesai
            const updatePromises = data.map(async (trx) => {
                try {
                    const detailRes = await fetch(`https://be-production-6856.up.railway.app/api/transaksi/${trx.id_transaksi}`, {
                        mode: 'cors',
                        credentials: 'include'
                    });
                    const detailData = await detailRes.json();

                    // update transaksi yang bersangkutan saja
                    setTransaksi(prev =>
                        prev.map(item =>
                            item.id_transaksi === trx.id_transaksi
                                ? { ...item, details: detailData.details || [] }
                                : item
                        )
                    );
                } catch {
                    // kalau error, lewatin aja
                }
            });

            // jalanin di background (gak perlu await)
            Promise.allSettled(updatePromises);
        } catch (err) {
            console.error('FETCH TRANSAKSI ERROR:', err);
            setLoading(false);
        }
    };


    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://be-production-6856.up.railway.app/api/transaksi/${id}`, { 
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` },
                mode: 'cors',
                credentials: 'include'
            });
            if (!res.ok) throw new Error("Gagal menghapus transaksi");
            setTransaksi(list => list.filter(item => item.id_transaksi !== id));
            if (selectedTrx && selectedTrx.id_transaksi === id) setSelectedTrx(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateStatus = async (trx, newStatus) => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`https://be-production-6856.up.railway.app/api/transaksi/${trx.id_transaksi}/status`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Gagal update status");
            const updated = await res.json();
            setSelectedTrx(prev => ({ ...prev, status: updated.status }));
            setTransaksi(list => list.map(item =>
                item.id_transaksi === trx.id_transaksi ? { ...item, status: updated.status } : item
            ));
        } catch (err) {
            alert(err.message);
        }
        setUpdating(false);
    };

    return (
        <div className="trx-container">
            <h2 className="trx-title">Riwayat Transaksi</h2>

            <table className="trx-table">
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
                        <tr><td colSpan={4} className="trx-center">Loading...</td></tr>
                    ) : transaksi.length === 0 ? (
                        <tr><td colSpan={4} className="trx-center">Belum ada transaksi</td></tr>
                    ) : (
                        transaksi.map(trx => (
                            <tr key={trx.id_transaksi}>
                                <td>{trx.nama_pelanggan || '-'}</td>
                                <td>{trx.nama_kasir}</td>
                                <td><b>{trx.status}</b></td>
                                <td>
                                    <button className="trx-btn" onClick={() => setSelectedTrx(trx)}>Lihat Detail</button>
                                    <button className="trx-btn delete" onClick={() => handleDelete(trx.id_transaksi)}>Hapus</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {selectedTrx && (
                <div className="modal-overlay" onClick={() => setSelectedTrx(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Detail Transaksi</h3>
                        <p><b>Tanggal:</b> {selectedTrx.tanggal?.replace('T', ' ').slice(0, 19)}</p>
                        <p><b>Pembeli:</b> {selectedTrx.nama_pelanggan || '-'}</p>
                        <p><b>Kasir:</b> {selectedTrx.nama_kasir}</p>
                        <p><b>Status:</b> <span><b>{selectedTrx.status}</b></span>
                            <button
                                className="trx-btn small"
                                disabled={updating}
                                onClick={() => handleUpdateStatus(selectedTrx, selectedTrx.status === 'LUNAS' ? 'BELUM LUNAS' : 'LUNAS')}
                            >
                                {updating ? '...' : `Ubah ke ${selectedTrx.status === 'LUNAS' ? 'BELUM LUNAS' : 'LUNAS'}`}
                            </button>
                        </p>

                        <table className="trx-detail-table">
                            <thead>
                                <tr>
                                    <th>Nama Produk</th>
                                    <th>Harga Produk</th>
                                    <th>Jumlah</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedTrx.details?.length ? (
                                    selectedTrx.details.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.produk?.nama_produk || '-'}</td>
                                            <td>Rp{Number(item.harga).toLocaleString()}</td>
                                            <td>{item.qty}</td>
                                            <td>Rp{Number(item.subtotal).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="trx-center">Tidak ada detail</td></tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="trx-total-label">Total</td>
                                    <td className="trx-total-value">Rp{Number(selectedTrx.total_pembayaran).toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        </table>

                        <button className="trx-btn close" onClick={() => setSelectedTrx(null)}>Tutup</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TransaksiAdmin;
