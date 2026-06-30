'use client';
import { useEffect, useState } from 'react';

type A = { id: string; login: string; displayName?: string; status: 'ACTIVE'|'BLOCKED' };

export default function AdminsPage() {
  const [list, setList] = useState<A[]>([]);
  const [msg, setMsg] = useState('');

  async function load(){ const r=await fetch('/api/admin/admins'); if(r.ok) setList(await r.json()); else setMsg('Нужен вход'); }
  useEffect(()=>{ load(); },[]);

  async function create(formData: FormData){
    const r=await fetch('/api/admin/admins',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:formData.get('login'),password:formData.get('password'),displayName:formData.get('displayName')})});
    setMsg(r.ok?'Создано':'Ошибка'); if(r.ok) load();
  }

  async function toggle(a:A){
    const status = a.status === 'ACTIVE' ? 'BLOCKED':'ACTIVE';
    const r=await fetch(`/api/admin/admins/${a.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName:a.displayName,status})});
    setMsg(r.ok?'Обновлено':'Ошибка'); if(r.ok) load();
  }

  return <div className="card"><h1>Администраторы</h1>
    <form action={create}><input name="login" placeholder="Логин" required /> <input name="password" placeholder="Пароль" required /> <input name="displayName" placeholder="Имя" /> <button>Создать</button></form>
    <p>{msg}</p>
    <ul>{list.map((a)=><li key={a.id}>{a.login} ({a.status}) <button onClick={()=>toggle(a)}>Переключить статус</button></li>)}</ul>
  </div>;
}
