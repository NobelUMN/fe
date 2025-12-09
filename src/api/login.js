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

  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    console.error('LOGIN API: Failed to parse JSON', err);
    return {
      success: false,
      message: 'Login gagal: Invalid response from server',
    };
  }

  console.log('LOGIN API RESPONSE:', data);
  
  return {
    success: data.success || false,
    data: data.data || null,
    message: data.message || 'Login gagal',
  };
  };
}