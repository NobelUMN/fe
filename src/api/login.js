export async function login(email, password) {
  const response = await fetch('http://localhost:8000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Tambahkan header lain jika perlu
    },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
}