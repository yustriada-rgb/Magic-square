'use client';
import { useEffect, useState } from 'react';

type N={id:string;title:string;text:string;publishedAt:string;source:string;isPublished:boolean};

export default function NewsAdmin(){
const [list,setList]=useState<N[]>([]); const [msg,setMsg]=useState('');
const load=async()=>{const r=await fetch('/api/admin/news'); if(r.ok) setList(await r.json());};
useEffect(()=>{load();},[]);
async function create(fd:FormData){const r=await fetch('/api/admin/news',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:fd.get('title'),text:fd.get('text')})}); setMsg(r.ok?'Создано':'Ошибка'); if(r.ok) load();}
async function importVk(){const r=await fetch('/api/admin/news/import-vk',{method:'POST'}); const d=await r.json(); setMsg(r.ok?`Импортировано: ${d.imported}`:`Ошибка импорта: ${d.error ?? ''}`); if(r.ok) load();}
async function edit(item:N){const title=prompt('Заголовок',item.title); if(!title) return; const text=prompt('Текст',item.text); if(!text) return; const r=await fetch(`/api/admin/news/${item.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,text,isPublished:item.isPublished})}); setMsg(r.ok?'Обновлено':'Ошибка'); if(r.ok) load();}
async function del(id:string){if(!confirm('Удалить новость?')) return; const r=await fetch(`/api/admin/news/${id}`,{method:'DELETE'}); setMsg(r.ok?'Удалено':'Ошибка'); if(r.ok) load();}
return <div className='card'><h1>Управление новостями</h1><button onClick={importVk}>Импорт из VK</button><form action={create}><input name='title' placeholder='Заголовок' required/> <textarea name='text' required/> <button>Добавить</button></form><p>{msg}</p><ul>{list.map(i=><li key={i.id}>{i.title} — {new Date(i.publishedAt).toLocaleDateString('ru-RU')} ({i.source}) <button onClick={()=>edit(i)}>Ред.</button> <button onClick={()=>del(i.id)}>Удал.</button></li>)}</ul></div>
}
