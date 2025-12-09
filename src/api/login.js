// Fungsi login untuk autentikasi user
export async function login(username, password) {
  const response = await fetch('https://be-production-6856.up.railway.app/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    credentials: 'include',
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('username', data.data.username);
    localStorage.setItem('role', data.data.role);
    // redirect ke dashboard
  } else {
    alert(data.message);
  }
}