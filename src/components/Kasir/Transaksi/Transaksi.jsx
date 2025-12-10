import React, { useEffect, useState, useRef, useCallback } from 'react';
import './Transaksi.css';

const IconTransaksi = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#23398a" strokeWidth="2"/><path d="M16 3v4M8 3v4" stroke="#23398a" strokeWidth="2" strokeLinecap="round"/></svg>
);
const IconProduk = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#23398a" strokeWidth="2"/><rect x="7" y="3" width="10" height="4" rx="1" stroke="#23398a" strokeWidth="2"/></svg>
);
const IconRiwayat = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#23398a" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#23398a" strokeWidth="2" strokeLinecap="round"/></svg>
);

function BonTransaksi({ data, onClose }) {
  if (!data) return null;
  const { kasir, tanggal, jam, pelanggan, items, total, tunai, kembalian } = data;
  const status = tunai >= total ? 'LUNAS' : 'BELUM LUNAS';

  // Download struk sebagai .txt
  const handleDownload = () => {
    const content = [
      'CAN BENGKEL',
      'Pekanbaru',
      'No. Telp: 0812-3456789',
      '--------------------------------',
      `Kasir     : ${kasir}`,
      `Tanggal   : ${tanggal} ${jam}`,
      `Pelanggan : ${pelanggan}`,
      '--------------------------------',
      ...items.map(i => `${i.nama_produk} x${i.qty} = Rp${(i.qty * i.harga).toLocaleString()}`),
      '--------------------------------',
      `Total     : Rp${total.toLocaleString()}`,
      `Tunai     : Rp${tunai.toLocaleString()}`,
      `Kembalian : ${kembalian !== null ? kembalian.toLocaleString() : '-'}`,
      `Status    : ${status}`,
      '--------------------------------',
      'BARANG YANG TELAH DIBELI TIDAK DAPAT DIKEMBALIKAN',
      'KECUALI ADA PERJANJIAN'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `struk_${(pelanggan || 'umum').replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Print with new window
  const handlePrint = () => {
    const printContent = `
      <pre class="print-struk" style="font-family: monospace; font-size: 12px;">
      CAN BENGKEL
      Pekanbaru
      No. Telp: 0812-3456789
      --------------------------------
      Kasir     : ${kasir}
      Tanggal   : ${tanggal} ${jam}
      Pelanggan : ${pelanggan}
      --------------------------------
      ${items.map(i => `${i.nama_produk} x${i.qty} = Rp${(i.harga).toLocaleString()}`).join('\n')}
      --------------------------------
      Total     : Rp${total.toLocaleString()}
      Tunai     : Rp${tunai.toLocaleString()}
      Kembalian : ${kembalian !== null ? kembalian.toLocaleString() : '-'}
      Status    : ${status}
      --------------------------------
      BARANG YANG TELAH DIBELI TIDAK DAPAT DIKEMBALIKAN
      KECUALI ADA PERJANJIAN
      </pre>
    `;
    const w = window.open('', '_blank', 'width=400,height=600');
    if (!w) {
      alert('Popup diblokir — izinkan popup untuk mencetak.');
      return;
    }
    w.document.write(`<html><head><title>Struk</title></head><body>${printContent}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="bon-modal" role="dialog" aria-modal="true" aria-label="Struk transaksi">
      <div className="bon-content">
        <div className="bon-body">
          <div className="bon-header">
            <div className="bon-shop">
              <div>CAN BENGKEL</div>
              <div>Pekanbaru</div>
              <div>No. Telp: 0812-3456789</div>
            </div>
            <div className="bon-meta">
              <div>Kasir : <strong>{kasir}</strong></div>
              <div>{tanggal} {jam}</div>
            </div>
          </div>

          <div className="bon-customer">
            <div>Pel. : {pelanggan}</div>
          </div>

          <hr />

          <div className="bon-items">
            {items.map((item, idx) => (
              <div key={idx} className="bon-item-row">
                <div className="bon-item-left">
                  <span className="bon-item-name">{item.nama_produk}</span>
                  {item.qty > 1 && <span className="bon-item-qty"> x{item.qty}</span>}
                </div>
                <div className="bon-item-right">
                  <span className="bon-item-price">Rp{item.harga.toLocaleString()}</span>
                  <span className="bon-item-sub">Rp{(item.qty * item.harga).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <hr />

          <div className="bon-summary">
            <div className="bon-summary-row">
              <span>Item(s): {items.length}</span>
              <span>Qty(s): {items.reduce((a,b)=>a+b.qty,0)}</span>
            </div>

            <div className="bon-total">
              <div className="bon-total-row">
                <span>Total :</span>
                <span>Rp{total.toLocaleString()}</span>
              </div>
              <div className="bon-total-row">
                <span>Tunai :</span>
                <span>Rp{tunai.toLocaleString()}</span>
              </div>
              <div className="bon-total-row">
                <span>Kembalian :</span>
                <span>{kembalian !== null ? `Rp${kembalian.toLocaleString()}` : '-'}</span>
              </div>
            </div>

            <div className="bon-status">{status}</div>

            <div className="bon-note">
              BARANG YANG TELAH DIBELI TIDAK DAPAT DIKEMBALIKAN<br/>KECUALI ADA PERJANJIAN
            </div>
          </div>
        </div>

        <div className="bon-footer">
          <button className="bon-btn" onClick={onClose}>Done</button>
          <button className="bon-btn" onClick={handleDownload}>Download Struk</button>
          <button className="bon-btn" onClick={handlePrint}>Print</button>
        </div>
      </div>
    </div>
  );
}

function Transaksi({ onLogout, setActiveMenu, activeMenu, authUserName }) {
  const [produk, setProduk] = useState([]);
  const produkRef = useRef([]); // snapshot produk agar callback tidak stale
  const [cart, setCart] = useState([]);
  const initialKasir = (() => {
    try {
      return authUserName || localStorage.getItem('username') || localStorage.getItem('auth_user_name') || localStorage.getItem('auth_username') || 'Chandra Kurnia Santoso';
    } catch (e) {
      return 'Chandra Kurnia Santoso';
    }
  })();
  const [kasir, setKasir] = useState(initialKasir);
  const [tanggal] = useState(new Date().toLocaleString());
  const [barcode, setBarcode] = useState('');
  const [barcodeError, setBarcodeError] = useState(null);
  const [metode, setMetode] = useState('tunai');
  const [bayar, setBayar] = useState('');
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [showBon, setShowBon] = useState(false);
  const [bonData, setBonData] = useState(null);
  const barcodeTimerRef = useRef(null);

  useEffect(() => {
    fetch('https://be-production-6856.up.railway.app/api/produk')
      .then(res => res.json())
      .then(data => {
        const normalized = (data || []).map(p => ({
          ...p,
          id_produk: p.id_produk ?? p.id ?? p.product_id,
          id_barcode: p.id_barcode ?? p.barcode ?? p.kode_barcode ?? '',
          nama_produk: p.nama_produk ?? p.nama ?? p.name ?? 'Produk',
          harga_jual: p.harga_jual ?? p.harga ?? p.price ?? 0,
          stok: typeof p.stok !== 'undefined' ? p.stok : (p.stock ?? p.qty ?? 0),
          kategori: p.kategori ?? p.category ?? p.kat ?? '-',
        }));
        setProduk(normalized);
        produkRef.current = normalized;
      })
      .catch(() => { /* ignore */ });
  }, []);

  // cleanup barcode debounce timer on unmount
  useEffect(() => {
    return () => {
      if (barcodeTimerRef.current) {
        clearTimeout(barcodeTimerRef.current);
      }
    };
  }, []);

  // update kasir display name when parent passes new authUserName
  useEffect(() => {
    if (authUserName) setKasir(authUserName);
  }, [authUserName]);

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const currentProduk = produkRef.current.find(p => p.id_produk === item.id_produk);
      const stokTerkini = currentProduk ? currentProduk.stok : item.stok;

      const exist = prev.find(i => i.id_produk === item.id_produk);
      if (exist) {
        if (exist.jumlah + 1 > stokTerkini) {
          alert('Stok tidak cukup!');
          return prev;
        }
        return prev.map(i =>
          i.id_produk === item.id_produk ? { ...i, jumlah: i.jumlah + 1 } : i
        );
      }
      if (stokTerkini < 1) {
        alert('Stok produk habis!');
        return prev;
      }
      const normalizedItem = {
        id_produk: item.id_produk,
        id_barcode: item.id_barcode ?? item.barcode ?? '',
        nama_produk: item.nama_produk,
        harga_jual: Number(item.harga_jual ?? 0),
        stok: item.stok ?? 0,
        kategori: item.kategori ?? '-',
        jumlah: 1,
      };
      return [...prev, normalizedItem];
    });
  }, []);

  // Cari produk berdasarkan barcode (local -> backend) lalu tambahkan ke cart
  const processBarcode = useCallback(async (code) => {
    const trimmed = String(code || '').trim();
    if (!trimmed) return;

    console.log('processBarcode: start', { code, trimmed });

    let local = produkRef.current.find(p =>
      [p.id_barcode, p.barcode, p.kode_barcode, p.id_produk, p.id]
        .map(x => String(x ?? ''))
        .includes(trimmed)
    );
    if (local) {
      addToCart(local);
      setBarcode('');
      setBarcodeError(null);
      console.log(`Produk ditambahkan: ${local.nama_produk}`);
      console.log('processBarcode: found locally', local);
      return;
    }

    try {
      const listRes = await fetch('https://be-production-6856.up.railway.app/api/produk');
      if (listRes.ok) {
        const list = await listRes.json();
        const normalizedList = (list || []).map(p => ({
          ...p,
          id_produk: p.id_produk ?? p.id ?? p.product_id,
          id_barcode: p.id_barcode ?? p.barcode ?? p.kode_barcode ?? '',
          nama_produk: p.nama_produk ?? p.nama ?? p.name ?? 'Produk',
          harga_jual: p.harga_jual ?? p.harga ?? p.price ?? 0,
          stok: typeof p.stok !== 'undefined' ? p.stok : (p.stock ?? p.qty ?? 0),
          kategori: p.kategori ?? p.category ?? p.kat ?? '-',
        }));
        produkRef.current = normalizedList;
        setProduk(normalizedList);
        local = normalizedList.find(p =>
          [p.id_barcode, p.barcode, p.kode_barcode, p.id_produk, p.id]
            .map(x => String(x ?? ''))
            .includes(trimmed)
        );
        if (local) {
          addToCart(local);
          setBarcode('');
          setBarcodeError(null);
          console.log(`Produk ditambahkan: ${local.nama_produk}`);
          console.log('processBarcode: found after fresh list', local);
          return;
        }
      }
    } catch (err) {
      // ignore
    }

    // Jika tidak ditemukan di lokal maupun backend
    const msg = `Produk dengan barcode ${trimmed} tidak tersedia (produk kosong).`;
    setBarcodeError(msg);
    console.warn('processBarcode: not found -> showing message', msg);
    alert(msg);
    setBarcode('');
  }, [addToCart]);

  // === AUTO GET BARCODE DARI ESP32 ===
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
const res = await fetch('https://be-production-6856.up.railway.app/api/hardware/barcode');
        if (!res.ok) return;

        const data = await res.json();
        const code = data && data.barcode ? String(data.barcode).trim() : '';

        // Backend pakai Cache::pull, jadi setiap GET cuma ngasih satu event scan
        if (code) {
          console.log('Barcode dari ESP32 (Transaksi):', code);
          setBarcode(code);
          // Langsung proses, supaya kalau produk udah ada di cart -> qty nambah
          processBarcode(code);
        }
      } catch (err) {
        console.error('Gagal ambil barcode (Transaksi):', err);
      }
    }, 1000); // cek tiap 1 detik

    return () => clearInterval(interval);
  }, [processBarcode]);

  const updateJumlah = (id_produk, delta) => {
    setCart(prev =>
      prev.map(i => {
        if (i.id_produk === id_produk) {
          const produkItem = produk.find(p => p.id_produk === id_produk);
          const stokTerkini = produkItem ? produkItem.stok : i.stok;
          const newJumlah = i.jumlah + delta;
          if (newJumlah > stokTerkini) {
            alert('Stok tidak cukup!');
            return i;
          }
          return { ...i, jumlah: Math.max(1, newJumlah) };
        }
        return i;
      })
    );
  };

  const removeFromCart = (id_produk) => {
    setCart(prev => prev.filter(i => i.id_produk !== id_produk));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.harga_jual * i.jumlah, 0);

  const statusSummary = (() => {
    try {
      if (!cart || cart.length === 0) return '-';
      if (bayar === '' || bayar === null || typeof bayar === 'undefined') return '-';
      const nBayar = Number(bayar);
      if (isNaN(nBayar)) return '-';
      return nBayar >= subtotal ? 'LUNAS' : 'BELUM LUNAS';
    } catch (e) {
      return '-';
    }
  })();

  const handleBayar = async () => {
    const bayarAmount = metode === 'transfer' ? subtotal : (bayar ? Number(bayar) : NaN);

    if (metode === 'tunai') {
      if (!bayar || isNaN(Number(bayar)) || Number(bayar) < subtotal) {
        alert('Nominal bayar tidak valid atau kurang dari total!');
        return;
      }
    }

    try {
      const items = cart.map(i => ({
        id_produk: i.id_produk,
        qty: i.jumlah,
        harga: Number(i.harga_jual),
        subtotal: Number(i.harga_jual) * i.jumlah,
      }));

      const now = new Date();
      const tanggal = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

      // Ambil token dari localStorage
      const token = localStorage.getItem('token');

      const response = await fetch('https://be-production-6856.up.railway.app/api/transaksi', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // ✅ TAMBAH AUTHORIZATION TOKEN
        },
        body: JSON.stringify({
          tanggal,
          nama_pelanggan: namaPelanggan || 'UMUM/CASH/-',
          nama_kasir: kasir,
          total_pembayaran: subtotal,
          nominal_bayar: bayarAmount,
          metode_pembayaran: metode,
          status: (isNaN(bayarAmount) ? 'BELUM LUNAS' : (Number(bayarAmount) >= Number(subtotal) ? 'LUNAS' : 'BELUM LUNAS')),
          items,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert('Gagal simpan transaksi: ' + JSON.stringify(err));
        return;
      }
      const data = await response.json();

      setBonData({
        kasir,
        tanggal: new Date().toLocaleDateString('id-ID'),
        jam: new Date().toLocaleTimeString('id-ID'),
        pelanggan: namaPelanggan || 'UMUM/CASH/-',
        items: cart.map(i => ({
          nama_produk: i.nama_produk,
          qty: i.jumlah,
          harga: Number(i.harga_jual),
        })),
        total: subtotal,
        tunai: metode === 'transfer' ? subtotal : (isNaN(bayarAmount) ? 0 : Number(bayarAmount)),
        kembalian: metode === 'transfer' ? null : (isNaN(bayarAmount) ? null : (Number(bayarAmount) - subtotal)),
        id_transaksi: data.id_transaksi,
        status: data.status || (isNaN(bayarAmount) ? 'BELUM LUNAS' : (Number(bayarAmount) >= Number(subtotal) ? 'LUNAS' : 'BELUM LUNAS'))
      });

      fetch('https://be-production-6856.up.railway.app/api/produk')
        .then(res => res.json())
        .then(data => setProduk(data))
        .catch(() => {});

      setShowBon(true);
      setCart([]);
      setBayar('');
      setNamaPelanggan('');
    } catch (err) {
      alert('Gagal menyimpan transaksi!');
    }
  };

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
          <span className="sidebar-icon"><IconRiwayat /></span>Riwayat Transaksi
        </div>
      </div>
      {/* Main */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-title">Transaksi</div>
          <div className="dashboard-user">
            <span style={{marginRight:8}}></span>
            {kasir} - Kasir
            <button className="dashboard-logout" onClick={onLogout}>Logout</button>
          </div>
        </div>
        {/* search bar removed per request */}
        <div className="transaksi-barcode" style={{ margin: '12px 0' }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>ID Barcode</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="text"
              className={`transaksi-barcode-input ${barcodeError ? 'transaksi-barcode-input--error' : ''}`}
              placeholder="Scan atau ketik ID barcode"
              value={barcode}
              onChange={e => {
                const v = e.target.value;
                setBarcode(v);
                setBarcodeError(null);
                if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
                barcodeTimerRef.current = setTimeout(() => {
                  processBarcode(v);
                  barcodeTimerRef.current = null;
                }, 1000);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (barcodeTimerRef.current) {
                    clearTimeout(barcodeTimerRef.current);
                    barcodeTimerRef.current = null;
                  }
                  processBarcode(barcode);
                }
              }}
              onPaste={e => {
                const pasted = (e.clipboardData || window.clipboardData).getData('Text');
                if (pasted) {
                  setBarcode(pasted);
                  if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
                  barcodeTimerRef.current = setTimeout(() => {
                    processBarcode(pasted);
                    barcodeTimerRef.current = null;
                  }, 1000);
                }
              }}
            />
            {barcodeError && (
              <div role="status" aria-live="polite" className="barcode-error" style={{ whiteSpace: 'nowrap' }}>
                {barcodeError}
              </div>
            )}
          </div>
        </div>

        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th>Harga Satuan</th>
              <th>Jumlah</th>
              <th>Stok</th>
              <th>Kategori</th>
              <th>Sub Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr><td colSpan={7} className="center">Belum ada produk</td></tr>
            ) : cart.map(item => (
              <tr key={item.id_produk}>
                <td>{item.nama_produk}</td>
                <td>Rp{Number(item.harga_jual).toLocaleString()}</td>
                <td>
                  <button onClick={() => updateJumlah(item.id_produk, -1)}>-</button>
                  <span style={{ margin: '0 8px' }}>{item.jumlah}</span>
                  <button onClick={() => updateJumlah(item.id_produk, 1)}>+</button>
                </td>
                <td>{item.stok ?? '-'}</td>
                <td>{item.kategori}</td>
                <td>Rp{Number(item.harga_jual * item.jumlah).toLocaleString()}</td>
                <td>
                  <button onClick={() => removeFromCart(item.id_produk)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="transaksi-ringkasan">
          <div>
            <div>Nama Kasir: <b>{kasir}</b></div>
            <div>Tanggal: <b>{tanggal}</b></div>
            <div>Sub Total: <b>Rp{subtotal.toLocaleString()}</b></div>
            <div>Diskon: <b>Rp-</b></div>
            <div className="total">Total Pembayaran: Rp{subtotal.toLocaleString()}</div>
            <div>Status: <b>{statusSummary}</b></div>
          </div>
          <div>
            <div>
              <button
                className={`transaksi-metode-btn${metode === 'tunai' ? ' active' : ''}`}
                onClick={() => setMetode('tunai')}
              >Tunai</button>
              <button
                className={`transaksi-metode-btn${metode === 'transfer' ? ' active' : ''}`}
                onClick={() => setMetode('transfer')}
              >Transfer</button>
            </div>
            {metode === 'transfer' && (
              <div style={{margin:'12px 0 8px 0', fontSize:17, marginTop:12}}>
                <div style={{fontWeight:'bold'}}>BCA</div>
                <div>0000000001 A.n Chandra Kurnia Santoso</div>
                <div style={{fontWeight:'bold', marginTop:8}}>MANDIRI</div>
                <div>0000000002 A.n Chandra Kurnia Santoso</div>
              </div>
            )}
            {metode === 'tunai' && (
            <>
              <div>
                <input
                  type="text"
                  placeholder="Nominal Bayar"
                  value={bayar}
                  onChange={e => setBayar(e.target.value)}
                  className="transaksi-input"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Nama Pelanggan (Opsional)"
                  value={namaPelanggan}
                  onChange={e => setNamaPelanggan(e.target.value)}
                  className="transaksi-input"
                />
              </div>
            </>
            )}
            <button className="transaksi-bayar-btn" onClick={handleBayar}>BAYAR</button>
          </div>
        </div>
        {showBon && <BonTransaksi data={bonData} onClose={() => setShowBon(false)} />}
      </div>
    </div>
  );
}

export default Transaksi;