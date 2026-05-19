'use client';
import { useEffect, useState } from 'react';

type N={id:string;title:string;text:string;publishedAt:string;source:string};

export default function NewsAdmin(){
const [list,setList]=useState<N[]>([]); const [msg,setMsg]=useState('');
const load=async()=>{const r=await fetch('/api/admin/news'); if(r.ok) setList(await r.json());};
useEffect(()=>{load();},[]);
async function create(fd:FormData){const r=await fetch('/api/admin/news',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:fd.get('title'),text:fd.get('text')})}); setMsg(r.ok?'Создано':'Ошибка'); if(r.ok) load();}
async function importVk(){const r=await fetch('/api/admin/news/import-vk',{method:'POST'}); setMsg(r.ok?'Импорт завершен':'Ошибка импорта'); if(r.ok) load();}
return <div className='card'><h1>Управление новостями</h1><button onClick={importVk}>Импорт из VK</button><form action={create}><input name='title' placeholder='Заголовок' required/> <textarea name='text' required/> <button>Добавить</button></form><p>{msg}</p><ul>{list.map(i=><li key={i.id}>{i.title} — {new Date(i.publishedAt).toLocaleDateString('ru-RU')} ({i.source})</li>)}</ul></div>
}
