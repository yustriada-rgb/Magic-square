'use client';
import { useEffect, useState } from 'react';

type Settings = {
  recipientEmail: string;
  legalInn?: string;
  legalOgrn?: string;
  legalName?: string;
  legalAddress?: string;
  legalPhone?: string;
  legalEmail?: string;
  consentLabel: string;
  consentText: string;
};

export default function SettingsPage() {
  const [form, setForm] = useState<Settings | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/site-settings').then(async (r) => {
      if (!r.ok) return setMsg('Нужен вход в админку');
      setForm(await r.json());
    });
  }, []);

  async function save() {
    if (!form) return;
    const res = await fetch('/api/admin/site-settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    setMsg(res.ok ? 'Сохранено' : 'Ошибка сохранения');
  }

  if (!form) return <p>Загрузка...</p>;

  return <div className="card"><h1>Настройки сайта</h1>
    <input value={form.recipientEmail} onChange={(e)=>setForm({...form,recipientEmail:e.target.value})} placeholder="Email заявок" /><br/><br/>
    <input value={form.legalName ?? ''} onChange={(e)=>setForm({...form,legalName:e.target.value})} placeholder="Юр. наименование" /><br/><br/>
    <input value={form.legalInn ?? ''} onChange={(e)=>setForm({...form,legalInn:e.target.value})} placeholder="ИНН" /><br/><br/>
    <input value={form.legalOgrn ?? ''} onChange={(e)=>setForm({...form,legalOgrn:e.target.value})} placeholder="ОГРН" /><br/><br/>
    <textarea rows={3} value={form.consentLabel} onChange={(e)=>setForm({...form,consentLabel:e.target.value})} /><br/><br/>
    <textarea rows={6} value={form.consentText} onChange={(e)=>setForm({...form,consentText:e.target.value})} /><br/><br/>
    <button onClick={save}>Сохранить</button><p>{msg}</p></div>;
}
