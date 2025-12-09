import React, { useEffect, useState, useRef } from "react";
import "./ProdukAdmin.css";

function ProdukAdmin() {
		const [produk, setProduk] = useState([]);
		const [loading, setLoading] = useState(true);
		const [error, setError] = useState(null);
		const [showModal, setShowModal] = useState(false);
		const [modalMode, setModalMode] = useState('tambah'); // 'tambah' | 'edit'
			const [formData, setFormData] = useState({
					id_barcode: '',
					nama_produk: '',
					harga_modal: '',
					harga_jual: '',
					stok: '',
					kategori: '',
					lokasi: '',
			});
		const [editId, setEditId] = useState(null);
	// Handler buka modal tambah
		const handleOpenTambah = () => {
			setModalMode('tambah');
			setFormData({ id_barcode: '', nama_produk: '', harga_modal: '', harga_jual: '', stok: '', kategori: '', lokasi: '' });
			setShowModal(true);
			setEditId(null);
		};

	// Handler buka modal edit
		const handleOpenEdit = (item) => {
			setModalMode('edit');
			setFormData({
				id_barcode: item.id_barcode || '',
				nama_produk: item.nama_produk || '',
				harga_modal: item.harga_modal || '',
				harga_jual: item.harga_jual || '',
				stok: item.stok || '',
				kategori: item.kategori || '',
				lokasi: item.lokasi || '',
			});
			setEditId(item.id_produk);
			setShowModal(true);
		};

	// Handler input form
	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(f => ({ ...f, [name]: value }));
	};

	// ref untuk fokus input barcode
	const barcodeRef = useRef(null);

	// kalau modal dibuka, fokus ke input barcode agar scanner keyboard HID langsung mengetik
	// AUTO GET BARCODE DARI ESP32 -> BACKEND -> FRONTEND
	useEffect(() => {
		const interval = setInterval(async () => {
			try {
const res = await fetch("https://be-production-6856.up.railway.app/api/hardware/barcode");
				if (!res.ok) return;

				const data = await res.json();
				if (data.barcode) {
					console.log("Barcode dari ESP32:", data.barcode);

					// Jika modal belum terbuka → buka modal tambah otomatis
					if (!showModal) {
						handleOpenTambah();
					}

					// Set otomatis ke input barcode modal
					setFormData(f => ({
						...f,
						id_barcode: data.barcode
					}));
				}
			} catch (err) {
				console.error("Gagal ambil barcode:", err);
			}
		}, 1000); // check tiap 1 detik

		return () => clearInterval(interval);
	}, [showModal]);

	// helper: cari produk di local state dulu, kalau tidak ada coba ke backend
	const findByBarcode = async (code) => {
		if (!code) return null;
		const trimmed = String(code).trim();
		let found = produk.find(p => String(p.id_barcode) === String(trimmed));
		if (found) return found;
		// try backend lookup (if endpoint exists)
		try {
			const res = await fetch(`https://be-production-6856.up.railway.app/api/produk/barcode/${encodeURIComponent(trimmed)}`);
			if (res.status === 200) {
				const data = await res.json();
				return data;
			}
		} catch (err) {
			// ignore lookup errors; treat as not found
			console.warn('barcode lookup failed', err);
		}
		return null;
	};

	const handleBarcodeKeyDown = async (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			const code = formData.id_barcode?.trim();
			if (!code) {
				document.querySelector('input[name="nama_produk"]')?.focus();
				return;
			}
			const found = await findByBarcode(code);
			if (found) {
				// barcode already exists -> switch to edit and prefill
				setModalMode('edit');
				setFormData({
					id_barcode: found.id_barcode || code,
					nama_produk: found.nama_produk || '',
					harga_modal: found.harga_modal || '',
					harga_jual: found.harga_jual || '',
					stok: found.stok || '',
					kategori: found.kategori || '',
					lokasi: found.lokasi || '',
				});
				setEditId(found.id_produk);
				alert('Barcode sudah terdaftar — membuka produk untuk diedit.');
				setTimeout(() => document.querySelector('input[name="nama_produk"]')?.focus(), 50);
			} else {
				// not found -> allow new product creation
				document.querySelector('input[name="nama_produk"]')?.focus();
			}
		}
	};

	// onBlur handler: when the user leaves barcode input, check for duplicates
	const handleBarcodeBlur = async () => {
		const code = formData.id_barcode?.trim();
		if (!code) return;
		const found = await findByBarcode(code);
		if (found) {
			setModalMode('edit');
			setFormData({
				id_barcode: found.id_barcode || code,
				nama_produk: found.nama_produk || '',
				harga_modal: found.harga_modal || '',
				harga_jual: found.harga_jual || '',
				stok: found.stok || '',
				kategori: found.kategori || '',
				lokasi: found.lokasi || '',
			});
			setEditId(found.id_produk);
			// no alert on blur to avoid annoying UX, just focus name
			setTimeout(() => document.querySelector('input[name="nama_produk"]')?.focus(), 50);
		}
	};

	// token dari login
	const token = localStorage.getItem('auth_token');

	// fungsi fetch produk (GET)
	const fetchProduk = async () => {
		try {
			const res = await fetch('https://be-production-6856.up.railway.app/api/produk');
			if (!res.ok) throw new Error('Gagal mengambil data produk');
			const data = await res.json();
			setProduk(data);
		} catch (err) {
			setError(err.message);
		}
	};

	// Handler submit form untuk POST/PUT produk
	const handleSubmit = async e => {
		e.preventDefault();
		// Validasi harga dan stok
		if (formData.harga_modal < 0 || formData.harga_jual < 0 || formData.stok < 0) {
			alert('Harga dan stok tidak boleh negatif!');
			return;
		}

		// Pastikan ada token (hanya admin yang boleh CUD)
		if (!token) {
			alert('Akses ditolak: silakan login terlebih dahulu.');
			return;
		}

		try {
			const url = modalMode === 'tambah'
				? 'https://be-production-6856.up.railway.app/api/produk'
				: `https://be-production-6856.up.railway.app/api/produk/${editId}`;
			const method = modalMode === 'tambah' ? 'POST' : 'PUT';
			const res = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(formData)
			});

			if (!res.ok) {
				// coba parse response error jika ada
				let errMsg = 'Gagal simpan produk';
				try { const err = await res.json(); errMsg = err.message || JSON.stringify(err); } catch(_){ }
				alert(errMsg);
				return;
			}
			setShowModal(false);
			setFormData({ id_barcode: '', nama_produk: '', harga_modal: '', harga_jual: '', stok: '', kategori: '', lokasi: '' });
			// Refresh produk
			await fetchProduk();
		} catch (err) {
			alert('Gagal terhubung ke server: ' + (err.message || err));
		}
	};

	const handleDelete = async (id_produk) => {
		if (!token) {
			alert('Akses ditolak: silakan login terlebih dahulu.');
			return;
		}
		if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
		try {
			const res = await fetch(`https://be-production-6856.up.railway.app/api/produk/${id_produk}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (!res.ok) {
				let errMsg = 'Gagal menghapus produk';
				try { const err = await res.json(); errMsg = err.message || JSON.stringify(err); } catch(_){ }
				throw new Error(errMsg);
			}
			await fetchProduk();
		} catch (err) {
			alert(err.message);
		}
	};

	useEffect(() => {
		// panggil fetchProduk dan set loading
		setLoading(true);
		fetchProduk().then(() => setLoading(false));
	}, []);

	if (loading) return <div className="produk-loading">Loading...</div>;
	if (error) return <div className="produk-error">Error: {error}</div>;

			return (
				<div className="produk-admin-container">
					<div className="title">Daftar Produk</div>
					<button className='tambah-produk' onClick={handleOpenTambah}>Tambah Produk</button>
					<table className="produk-table">
						<thead>
							<tr>
								<th>No.</th>
								<th>Barcode</th>
								<th>Nama Produk</th>
								<th>Harga</th>
								<th>Stok</th>
								<th>Kategori</th>
								<th>Lokasi</th>
								<th>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{produk.length === 0 ? (
								<tr><td colSpan={8} className="produk-empty">Tidak ada produk</td></tr>
							) : (
								produk.map((item, idx) => (
									<tr key={item.id_produk}>
										<td>{idx+1}</td>
										<td>{item.id_barcode || '-'}</td>
										<td>{item.nama_produk}</td>
										<td>Rp{Number(item.harga_jual).toLocaleString()}</td>
										<td>{item.stok}</td>
										<td>{item.kategori}</td>
										<td>{item.lokasi}</td>
										<td>
											<button onClick={() => handleOpenEdit(item)}>Edit</button>
											<button onClick={() => handleDelete(item.id_produk)}>Hapus</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>

					{/* Modal Form Tambah/Edit Produk */}
					{showModal && (
						<div className="produk-modal-overlay" onClick={() => setShowModal(false)}>
							<div className="produk-modal-content" onClick={e => e.stopPropagation()}>
								<h3>{modalMode === 'tambah' ? 'Tambah Produk' : 'Edit Produk'}</h3>
											<form onSubmit={handleSubmit}>
												<div className="produk-form-group">
													<label>Nama Produk</label>
													<input name="nama_produk" value={formData.nama_produk} onChange={handleChange} required />
												</div>
												<div className="produk-form-group">
													<label>Barcode</label>
													<input name="id_barcode" ref={barcodeRef} value={formData.id_barcode} onChange={handleChange} onKeyDown={handleBarcodeKeyDown} onBlur={handleBarcodeBlur} placeholder="(optional)" />
												</div>
												<div className="produk-form-group">
													<label>Harga Modal</label>
													<input name="harga_modal" type="number" value={formData.harga_modal} onChange={handleChange} required />
												</div>
												<div className="produk-form-group">
													<label>Harga Jual</label>
													<input name="harga_jual" type="number" value={formData.harga_jual} onChange={handleChange} required />
												</div>
												<div className="produk-form-group">
													<label>Stok</label>
													<input name="stok" type="number" value={formData.stok} onChange={handleChange} required />
												</div>
												<div className="produk-form-group">
													<label>Kategori</label>
													<input name="kategori" value={formData.kategori} onChange={handleChange} required />
												</div>
												<div className="produk-form-group">
													<label>Lokasi</label>
													<input name="lokasi" value={formData.lokasi} onChange={handleChange} required />
												</div>
												<div style={{marginTop:12}}>
													<button type="submit">Simpan</button>
													<button type="button" style={{marginLeft:8}} onClick={() => setShowModal(false)}>Batal</button>
												</div>
											</form>
							</div>
						</div>
					)}
				</div>
			);
}

export default ProdukAdmin;
