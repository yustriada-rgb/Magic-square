'use client';
import { DragEvent, useEffect, useState } from 'react';

type A = { id: string; title: string; photos?: { id: string; imageUrl: string }[] };

export default function GalleryAdmin() {
  const [list, setList] = useState<A[]>([]);
  const [msg, setMsg] = useState('');
  const [albumId, setAlbumId] = useState('');

  const load = async () => {
    const r = await fetch('/api/admin/albums');
    if (r.ok) {
      const data: A[] = await r.json();
      setList(data);
      if (!albumId && data.length) setAlbumId(data[0].id);
    }
  };
  useEffect(() => { load(); }, []);

  async function create(fd: FormData) { const r = await fetch('/api/admin/albums', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: fd.get('title') }) }); setMsg(r.ok ? 'Альбом создан' : 'Ошибка'); if (r.ok) load(); }
  async function edit(a:A){const title=prompt('Название альбома',a.title); if(!title) return; const r=await fetch(`/api/admin/albums/${a.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,isPublished:true})}); setMsg(r.ok?'Обновлено':'Ошибка'); if(r.ok) load();}
  async function delAlbum(id:string){if(!confirm('Удалить альбом?')) return; const r=await fetch(`/api/admin/albums/${id}`,{method:'DELETE'}); setMsg(r.ok?'Удалено':'Ошибка'); if(r.ok) load();}

  async function uploadFiles(files: FileList | File[]) {
    if (!albumId) return setMsg('Сначала выберите альбом');
    if (!files.length) return;
    const fd = new FormData(); fd.append('albumId', albumId); Array.from(files).forEach((f) => fd.append('files', f));
    const r = await fetch('/api/admin/photos/upload', { method: 'POST', body: fd }); if (!r.ok) return setMsg('Ошибка загрузки файлов');
    const data = await r.json(); setMsg(`Загружено ${data.createdCount} из ${data.requestedCount} файлов`);
  }
  async function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) { if (!e.target.files) return; await uploadFiles(e.target.files); e.target.value = ''; }
  async function onDrop(e: DragEvent<HTMLDivElement>) { e.preventDefault(); await uploadFiles(e.dataTransfer.files); }

  return (<div className="card"><h1>Управление галереей</h1><form action={create}><input name="title" placeholder="Новый альбом" required /> <button>Добавить</button></form><hr />
      <label>Альбом для загрузки: <select value={albumId} onChange={(e) => setAlbumId(e.target.value)}>{list.map((a) => (<option key={a.id} value={a.id}>{a.title}</option>))}</select></label>
      <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} style={{ marginTop: 12, padding: 16, border: '2px dashed #c7b49a', borderRadius: 10 }}>Перетащите изображения сюда</div>
      <p style={{ margin: '10px 0' }}>или</p><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onFileInputChange} />
      <p>{msg}</p><ul>{list.map((a) => (<li key={a.id}>{a.title} <button onClick={()=>edit(a)}>Ред.</button> <button onClick={()=>delAlbum(a.id)}>Удал.</button></li>))}</ul></div>);
}
