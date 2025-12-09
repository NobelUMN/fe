import React, { useState } from 'react';
import { sendHardwareCommand } from '../../api/hardware';

export default function HardwareWifi() {
  const [device, setDevice] = useState('');
  const [cmd, setCmd] = useState('');
  const [resp, setResp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!cmd) return alert('Masukkan command');
    setLoading(true);
    try {
      const json = await sendHardwareCommand(cmd, device || null);
      setResp(JSON.stringify(json, null, 2));
    } catch (e) {
      setResp('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:12,maxWidth:520}}>
      <h3>Hardware (Wi‑Fi) Bridge</h3>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <input
          placeholder="Device URL atau IP (kosong pakai default dari .env)"
          value={device}
          onChange={e=>setDevice(e.target.value)}
          style={{flex:1}}
        />
      </div>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <input
          placeholder="Command (mis. STATUS)"
          value={cmd}
          onChange={e=>setCmd(e.target.value)}
          style={{flex:1}}
        />
        <button onClick={handleSend} disabled={loading}>{loading ? 'Sending...' : 'Kirim'}</button>
      </div>
      <pre style={{background:'#f4f4f4',padding:8,whiteSpace:'pre-wrap'}}>{resp}</pre>
    </div>
  );
}