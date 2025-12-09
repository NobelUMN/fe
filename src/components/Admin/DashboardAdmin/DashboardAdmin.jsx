import React from "react";
import "./DashboardAdmin.css";
import ProdukAdmin from "../ProdukAdmin/ProdukAdmin";
import TransaksiAdmin from "../TransaksiAdmin/TransaksiAdmin";
import UserManagement from "../UserManagement/UserManagement";
import SpendingReport from "../SpendingReport/SpendingReport";

const IconDashboard = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" stroke="#23398a" strokeWidth="2" />
  </svg>
);
const IconProduk = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <rect x="3" y="7" width="18" height="13" rx="2" stroke="#23398a" strokeWidth="2" />
    <rect x="7" y="3" width="10" height="4" rx="1" stroke="#23398a" strokeWidth="2" />
  </svg>
);
const IconTransaksi = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <rect x="3" y="7" width="18" height="13" rx="2" stroke="#23398a" strokeWidth="2" />
    <path d="M16 3v4M8 3v4" stroke="#23398a" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconUserMgmt = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#23398a" strokeWidth="2" />
    <path d="M8 4v16M16 4v16" stroke="#23398a" strokeWidth="2" />
  </svg>
);

function DashboardAdmin({ onLogout, setActiveMenu, activeMenu }) {
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
          className={activeMenu === 'userManagement' ? 'sidebar-link sidebar-active' : 'sidebar-link'}
          onClick={() => setActiveMenu('userManagement')}
        >
          <span className="sidebar-icon"><IconUserMgmt /></span>User Management
        </div>
        <div
          className={activeMenu === 'SpendingReport' ? 'sidebar-link sidebar-active' : 'sidebar-link'}
          onClick={() => setActiveMenu('SpendingReport')}
        >
          <span className="sidebar-icon"><IconDashboard /></span> SpendingReport
        </div>
        <button className="dashboardAdmin-logout" onClick={onLogout}>Logout</button>
      </div>
      {/* Main */}
      <div className="dashboard-main">
        {activeMenu === 'produk' ? (
          <ProdukAdmin />
        ) : activeMenu === 'transaksi' ? (
          <TransaksiAdmin />
        ) : activeMenu === 'userManagement' ? (
          <UserManagement />

        ) : activeMenu === 'SpendingReport' ? (
          <SpendingReport />
        ) : (
          <div className="statistik-empty">Dashboard Admin</div>
        )}
      </div>
    </div>
  );
}

export default DashboardAdmin;
