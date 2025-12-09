// Helper to call backend hardware bridge
const BASE_URL = 'https://be-production-6856.up.railway.app';

export async function sendHardwareCommand(cmd, device = null) {
  const token = localStorage.getItem('token');
  const body = { cmd };
  if (device) body.device = device;

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/hardware/command`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
    mode: 'cors',
  });

  return res.json();
}
