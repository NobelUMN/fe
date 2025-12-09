// Helper to call backend hardware bridge
export async function sendHardwareCommand(cmd, device = null) {
  const token = localStorage.getItem('auth_token');
  const body = { cmd };
  if (device) body.device = device;

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch('/api/hardware/command', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });

  return res.json();
}
