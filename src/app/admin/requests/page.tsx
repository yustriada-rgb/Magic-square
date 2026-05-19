'use client';
import { useEffect, useState } from 'react';

type R = { id: string; createdAt: string; name: string; contact: string; message: string };

export default function RequestsPage() {
  const [items, setItems] = useState<R[]>([]);
  const [q, setQ] = useState('');

  const load = async (query = '') => {
    const r = await fetch(`/api/admin/contact-requests?q=${encodeURIComponent(query)}`);
    const d = await r.json();
    setItems(d.data ?? []);
  };

  useEffect(() => { load(); }, []);

  return <div className="card"><h1>Заявки</h1>
    <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Поиск" /> <button onClick={()=>load(q)}>Найти</button>
    <table><thead><tr><th>Дата</th><th>Имя</th><th>Контакт</th><th>Сообщение</th></tr></thead><tbody>
      {items.map((i)=><tr key={i.id}><td>{new Date(i.createdAt).toLocaleString('ru-RU')}</td><td>{i.name}</td><td>{i.contact}</td><td>{i.message}</td></tr>)}
    </tbody></table></div>;
}
