// Fungsi login untuk autentikasi user
export async function login(username, password) {
  const response = await fetch('http://localhost:8000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  // Log response untuk debug
  console.log('LOGIN API RESPONSE:', data);
  return {
    success: response.ok,
    data: data.data, // pastikan hanya data user yang dikirim ke frontend
    message: data.message,
  };
}