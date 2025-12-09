import React, { useEffect, useState } from "react";
import "./UserManagement.css";

const API_URL = "https://be-production-6856.up.railway.app/api/users"; // Use plural for RESTful endpoint

function UserManagement() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState(""); // "add" or "edit"
	const [formData, setFormData] = useState({
		username: "",
		password: "",
		role: "kasir"
	});
	const [editId, setEditId] = useState(null);

	const token = localStorage.getItem('auth_token');
	// Fetch users
	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await fetch('https://be-production-6856.up.railway.app/api/users', {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});
			if (!res.ok) throw new Error("Gagal mengambil data user");
			const data = await res.json();
			setUsers(data);
		} catch (err) {
			console.error(err);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchUsers();
	}, [token]);

	// Handle input change
	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// Open modal
	const openModal = (type, user = null) => {
		setModalType(type);
		setShowModal(true);
		if (type === "edit" && user) {
			setFormData({
				username: user.username,
				password: "", // Don't show password
				role: user.role
			});
			setEditId(user.id_user || user.id);
		} else {
			setFormData({ username: "", password: "", role: "kasir" });
			setEditId(null);
		}
	};

	// Close modal
	const closeModal = () => {
		setShowModal(false);
		setEditId(null);
		setFormData({ username: "", password: "", role: "kasir" });
	};

	// Add user
	const handleAdd = async (e) => {
		e.preventDefault();
		try {
			const res = await fetch('https://be-production-6856.up.railway.app/api/users', {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(formData)
			});
			if (!res.ok) throw new Error("Gagal menambah user");
			closeModal();
			fetchUsers();
		} catch (err) {
			alert(err.message);
		}
	};

	// Edit user
	const handleEdit = async (e) => {
		e.preventDefault();
		try {
			const res = await fetch(`https://be-production-6856.up.railway.app/api/users/${editId}`, {
				method: "PUT",
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(formData)
			});
			if (!res.ok) throw new Error("Gagal mengedit user");
			closeModal();
			fetchUsers();
		} catch (err) {
			alert(err.message);
		}
	};

	// Delete user
	const handleDelete = async (id) => {
		if (!window.confirm("Yakin ingin menghapus user ini?")) return;
		try {
			const res = await fetch(`https://be-production-6856.up.railway.app/api/users/${id}`, {
				method: "DELETE",
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});
			if (!res.ok) throw new Error("Gagal menghapus user");
			fetchUsers();
		} catch (err) {
			alert(err.message);
		}
	};

	return (
		<div className="user-management">
			<h2>Manajemen User</h2>
			<button className='tambah-user' onClick={() => openModal("add")}>Tambah User</button>
			{loading ? (
				<p>Loading...</p>
			) : error ? (
				<p style={{ color: "red" }}>{error}</p>
			) : (
					<table className="user-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Username</th>
								<th>Role</th>
								<th>Tanggal Dibuat</th>
								<th>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id_user || user.id}>
									<td>{user.id_user || user.id}</td>
									<td>{user.username}</td>
									<td>{user.role}</td>
									<td>{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
									<td>
										<button className='Edit' onClick={() => openModal("edit", user)}>Edit</button>
										<button onClick={() => handleDelete(user.id_user || user.id)}>Hapus</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
			)}

			{/* Modal */}
			{showModal && (
				<div className="modal-overlay">
					<div className="modal">
						<h3>{modalType === "add" ? "Tambah User" : "Edit User"}</h3>
						<form onSubmit={modalType === "add" ? handleAdd : handleEdit}>
							<label>
								Username:
								<input name="username" value={formData.username} onChange={handleChange} required />
							</label>
							<label>
								Password:
								<input name="password" type="password" value={formData.password} onChange={handleChange} required={modalType === "add"} />
							</label>
							<label>
								Role:
								<select name="role" value={formData.role} onChange={handleChange}>
									<option value="admin">Admin</option>
									<option value="kasir">Kasir</option>
								</select>
							</label>
							<div style={{ marginTop: 16 }}>
								<button type="submit">{modalType === "add" ? "Tambah" : "Simpan"}</button>
								<button type="button" onClick={closeModal} style={{ marginLeft: 8 }}>Batal</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default UserManagement;
