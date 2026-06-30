'use client';
import { useEffect, useState } from 'react';

type D={id:string;title:string;description:string;room?:string|null;isPublished:boolean};

export default function DirectionsAdmin(){
const [list,setList]=useState<D[]>([]); const [msg,setMsg]=useState('');
const load=async()=>{const r=await fetch('/api/admin/directions'); if(r.ok) setList(await r.json());};
useEffect(()=>{load();},[]);
async function create(fd:FormData){const r=await fetch('/api/admin/directions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:fd.get('title'),description:fd.get('description'),room:fd.get('room')})}); setMsg(r.ok?'Создано':'Ошибка'); if(r.ok) load();}
async function edit(item:D){const title=prompt('Название',item.title); if(!title) return; const description=prompt('Описание',item.description); if(!description) return; const room=prompt('Кабинет',item.room??'') ?? ''; const r=await fetch(`/api/admin/directions/${item.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description,room,isPublished:item.isPublished})}); setMsg(r.ok?'Обновлено':'Ошибка'); if(r.ok) load();}
async function del(id:string){if(!confirm('Удалить направление?')) return; const r=await fetch(`/api/admin/directions/${id}`,{method:'DELETE'}); setMsg(r.ok?'Удалено':'Ошибка'); if(r.ok) load();}
return <div className='card'><h1>Управление направлениями</h1><form action={create}><input name='title' placeholder='Название' required/> <input name='room' placeholder='Кабинет'/> <textarea name='description' required/> <button>Добавить</button></form><p>{msg}</p><ul>{list.map(i=><li key={i.id}>{i.title} ({i.room??'—'}) <button onClick={()=>edit(i)}>Редактировать</button> <button onClick={()=>del(i.id)}>Удалить</button></li>)}</ul></div>
}
