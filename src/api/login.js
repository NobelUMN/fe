// Fungsi login untuk autentikasi user
export async function login(username, password) {
  const response = await fetch('https://be-production-6856.up.railway.app/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify({ username, password }),
    mode: 'cors',
  });

  // Kadang backend balas HTML (error/redirect). Coba parse JSON, jika gagal pakai text.
  let rawText = '';
  let data = null;
  try {
    rawText = await response.text();
    data = JSON.parse(rawText);
  } catch (err) {
    console.error('LOGIN API non-JSON response:', rawText);
    return {
      success: false,
      data: null,
      token: null,
      role: null,
      status: response.status,
      rawText,
      message: `Login gagal (status ${response.status}): ${rawText?.slice(0, 120) || 'Non-JSON response'}`,
    };
  }

  // Normalisasi struktur: jika backend tidak memakai field "data", tetap lanjut
  const normalizedData = data?.data ?? data ?? null;
  const token = normalizedData?.token ?? data?.token ?? null;
  const role = normalizedData?.role ?? data?.role ?? null;
  const message = data?.message
    || (response.status >= 500
      ? `Server error ${response.status}. Cek log backend Railway. Isi: ${rawText?.slice(0, 120) || 'No body'}`
      : (response.ok ? 'Login berhasil' : `Login gagal (status ${response.status})`));

  console.log('LOGIN API RESPONSE:', data);
  return {
    success: response.ok,
    data: normalizedData,
    token,
    role,
    status: response.status,
    rawText,
    message,
  };
}