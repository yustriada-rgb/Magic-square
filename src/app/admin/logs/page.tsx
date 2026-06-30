'use client';
import { useEffect, useState } from 'react';

type L = { id: string; createdAt: string; action: string; entityType: string; admin: { login: string; displayName?: string } };

export default function LogsPage() {
  const [logs, setLogs] = useState<L[]>([]);
  const [q, setQ] = useState('');

  const load = async (query = '') => {
    const r = await fetch(`/api/admin/admin-logs?q=${encodeURIComponent(query)}`);
    const d = await r.json();
    setLogs(d.data ?? []);
  };

  useEffect(() => { load(); }, []);

  return <div className="card"><h1>Журнал действий</h1>
    <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Поиск по типу" /> <button onClick={()=>load(q)}>Найти</button>
    <ul>{logs.map((l)=><li key={l.id}>{new Date(l.createdAt).toLocaleString('ru-RU')} — {(l.admin.displayName ?? l.admin.login)} — {l.action} ({l.entityType})</li>)}</ul>
  </div>;
}
