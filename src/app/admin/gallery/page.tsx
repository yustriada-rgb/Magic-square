'use client';
import { useEffect, useState } from 'react';

type A={id:string;title:string};
export default function GalleryAdmin(){
  const [list,setList]=useState<A[]>([]); const [msg,setMsg]=useState('');
  const load=async()=>{const r=await fetch('/api/admin/albums'); if(r.ok) setList(await r.json());};
  useEffect(()=>{load();},[]);
  async function create(fd:FormData){const r=await fetch('/api/admin/albums',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:fd.get('title')})}); setMsg(r.ok?'Создано':'Ошибка'); if(r.ok) load();}
  return <div className='card'><h1>Управление галереей</h1><form action={create}><input name='title' placeholder='Альбом' required/> <button>Добавить</button></form><p>{msg}</p><ul>{list.map(a=><li key={a.id}>{a.title}</li>)}</ul></div>;
}
