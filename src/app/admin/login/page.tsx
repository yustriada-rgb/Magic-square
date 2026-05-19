'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function onSubmit(formData: FormData) {
    setError('');
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: formData.get('login'), password: formData.get('password') }),
    });
    if (!res.ok) {
      setError('Неверный логин или пароль');
      return;
    }
    router.push('/admin');
  }

  return (
    <div className="card">
      <h1>Вход в админку</h1>
      <form action={onSubmit}>
        <input name="login" placeholder="Логин" required />
        <br /><br />
        <input name="password" type="password" placeholder="Пароль" required />
        <br /><br />
        <button type="submit">Войти</button>
      </form>
      {error ? <p>{error}</p> : null}
    </div>
  );
}
