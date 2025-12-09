import React, { useState, useEffect } from "react";
import "./SpendingReport.css";

function CatatanPengeluaran() {
  const [pengeluaran, setPengeluaran] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [form, setForm] = useState({
    keterangan: "",
    kategori: "",
    tanggal: "",
    details: [
      { nama_barang: "", jumlah: "", harga: "", supplier: "", catatan: "" }
    ]
  });
  // Logic total harga di frontend
  const totalHarga = form.details.reduce((sum, d) => {
    const harga = d.harga ? Number(d.harga) : 0;
    const jumlah = d.jumlah ? Number(d.jumlah) : 1;
    return sum + (harga * jumlah);
  }, 0);

  // Ambil data pengeluaran dari API saat komponen mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("https://be-production-6856.up.railway.app/api/spending-report");
        const data = await res.json();
        setPengeluaran(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (idx, e) => {
    const newDetails = [...form.details];
    newDetails[idx][e.target.name] = e.target.value;
    setForm({ ...form, details: newDetails });
  };

  const addDetail = () => {
    setForm({
      ...form,
      details: [...form.details, { nama_barang: "", jumlah: "", harga: "", supplier: "", catatan: "" }]
    });
  };

  const removeDetail = idx => {
    setForm({
      ...form,
      details: form.details.filter((_, i) => i !== idx)
    });
  };

  // Submit data ke backend
  const handleSubmit = async e => {
    e.preventDefault();
    console.log('SpendingReport: handleSubmit start');
    // Hitung total harga dari detail barang
    const totalHarga = form.details.reduce((sum, d) => {
      const harga = d.harga ? Number(d.harga) : 0;
      const jumlah = d.jumlah ? Number(d.jumlah) : 1;
      return sum + (harga * jumlah);
    }, 0);
    const payload = {
      keterangan: form.keterangan,
      kategori: form.kategori,
      tanggal: form.tanggal,
      harga: totalHarga,
      details: form.details.map(d => ({
        nama_barang: d.nama_barang,
        jumlah: d.jumlah ? Number(d.jumlah) : null,
        harga: d.harga ? Number(d.harga) : null,
        supplier: d.supplier,
        catatan: d.catatan
      }))
    };
    // Sertakan token jika tersedia — mencegah server merespon tak terduga jika butuh auth
    const token = localStorage.getItem('token');
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
      res = await fetch("https://be-production-6856.up.railway.app/api/spending-report", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('SpendingReport: fetch error', err);
      alert('Terjadi error saat mengirim data: ' + err.message);
      return;
    }

    console.log('SpendingReport: POST response status', res.status);
    if (res.ok) {
      // Setelah submit, fetch ulang data dari backend
      fetch("https://be-production-6856.up.railway.app/api/spending-report")
        .then(res => res.json())
        .then(data => setPengeluaran(data));
      setForm({
        keterangan: "",
        kategori: "",
        tanggal: "",
        details: [{ nama_barang: "", jumlah: "", harga: "", supplier: "", catatan: "" }]
      });
    } else {
      const err = await res.text();
      console.warn('SpendingReport: POST failed', res.status, err);
      alert("Gagal menambah pengeluaran!\n" + err);
    }
  };

  return (
    <div className="restock-admin-container">
      <h2>Catatan Pengeluaran Toko</h2>
      <button 
        className="open-form-btn" 
        type="button" 
        onClick={() => setShowFormModal(true)}
      >
        + Tambah Pengeluaran
      </button>
      {showFormModal && (
          <div className="spending-modal-overlay">
            <div className="spending-modal-content">
              {/* Tombol close (X) */}
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowFormModal(false)}
              >
                ✕
              </button>

              <h2>Catatan Pengeluaran Toko</h2>

              <form className="restock-form" onSubmit={handleSubmit}>
                <input
                  name="keterangan"
                  value={form.keterangan}
                  onChange={handleChange}
                  placeholder="Keterangan Pengeluaran"
                  required
                />
                <input
                  name="kategori"
                  value={form.kategori}
                  onChange={handleChange}
                  placeholder="Kategori"
                />

                <div style={{ marginBottom: 8 }}>
                  <b>Total Harga:</b> <span>{totalHarga.toLocaleString()}</span>
                </div>

                <input
                  name="tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={handleChange}
                  required
                />

                <div style={{ width: "100%" }}>
                  <b>Detail Barang:</b>
                  {form.details.map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <input
                        name="nama_barang"
                        value={d.nama_barang}
                        onChange={(e) => handleDetailChange(idx, e)}
                        placeholder="Nama Barang"
                        required
                      />
                      <input
                        name="jumlah"
                        type="number"
                        value={d.jumlah}
                        onChange={(e) => handleDetailChange(idx, e)}
                        placeholder="Jumlah"
                      />
                      <input
                        name="harga"
                        type="number"
                        value={d.harga}
                        onChange={(e) => handleDetailChange(idx, e)}
                        placeholder="Harga"
                      />
                      <input
                        name="supplier"
                        value={d.supplier}
                        onChange={(e) => handleDetailChange(idx, e)}
                        placeholder="Supplier"
                      />
                      <input
                        name="catatan"
                        value={d.catatan}
                        onChange={(e) => handleDetailChange(idx, e)}
                        placeholder="Catatan"
                      />
                    </div>
                  ))}

                  {/* Tombol tambah & hapus baris barang */}
                  <div className="detail-btn-group">
                    <button type="button" onClick={addDetail}>
                      Tambah Barang
                    </button>
                    <button
                      type="button"
                      className="hapus-btn"
                      onClick={() => {
                        if (form.details.length > 1)
                          removeDetail(form.details.length - 1);
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <button type="submit">Catat Pengeluaran</button>
              </form>
            </div>
          </div>
        )}

      {/* Tabel pengeluaran */}
      <div style={{marginTop:32}}>
        <h3>Riwayat Pengeluaran</h3>
        <table className="spending-table">
          <thead>
            <tr>
              <th>Keterangan</th>
              <th>Kategori</th>
              <th>Tanggal</th>
              <th>Total Harga</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pengeluaran.map((p, idx) => (
              <tr key={p.id || idx}>
                <td>{p.keterangan}</td>
                <td>{p.kategori}</td>
                <td>{p.tanggal}</td>
                <td>{p.harga}</td>
                <td>
                  <button className="detail-btn" type="button" onClick={() => {setSelectedDetail(p);setShowDetail(true);}}>Lihat Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal/detail view */}
      {showDetail && selectedDetail && (() => {
        const detailArr = selectedDetail.detail_spending || selectedDetail.detailSpending || [];
        // Jika tidak ada detail barang, tampilkan pesan kosong
        const isEmpty = !detailArr || detailArr.length === 0;
        // Total harga: jika detail barang ada, hitung dari detail, jika tidak ada ambil dari selectedDetail.harga
        const totalHargaDetail = isEmpty ? (selectedDetail.harga || 0) : detailArr.reduce((sum, d) => {
          const harga = d.harga ? Number(d.harga) : 0;
          const jumlah = d.jumlah ? Number(d.jumlah) : 1;
          return sum + (harga * jumlah);
        }, 0);
        return (
          <div className="spending-modal-overlay">
            <div className="spending-modal-content">
              <h4>Detail Pengeluaran</h4>
              <div><b>Keterangan:</b> {selectedDetail.keterangan}</div>
              <div><b>Kategori:</b> {selectedDetail.kategori}</div>
              <div><b>Tanggal:</b> {selectedDetail.tanggal}</div>
              <div style={{marginBottom:8}}>
                <b>Total Harga:</b> <span>{totalHargaDetail.toLocaleString()}</span>
              </div>
              <hr/>
              <b>Barang:</b>
              <table style={{width:'100%',marginTop:8}}>
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Harga</th>
                    <th>Jumlah</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {isEmpty ? (
                    <tr><td colSpan={4} style={{textAlign:'center'}}>Tidak ada detail barang</td></tr>
                  ) : detailArr.map((d, i) => (
                    <tr key={i}>
                      <td>{d.nama_barang}</td>
                      <td>Rp{(d.harga ? Number(d.harga) : 0).toLocaleString()}</td>
                      <td>{d.jumlah}</td>
                      <td>Rp{((d.harga ? Number(d.harga) : 0) * (d.jumlah ? Number(d.jumlah) : 1)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{textAlign:'right',marginTop:8}}>
                <b>Total Rp{totalHargaDetail.toLocaleString()}</b>
              </div>
              <button className="close-detail-btn" onClick={()=>setShowDetail(false)}>Tutup</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default CatatanPengeluaran;