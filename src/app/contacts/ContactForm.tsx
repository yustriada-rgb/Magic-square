'use client';
import { useState } from 'react';

export default function ContactForm({ consentLabel, consentText }: { consentLabel: string; consentText: string }) {
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState('');
  async function onSubmit(formData: FormData) {
    setMsg('');
    const res = await fetch('/api/public/contact-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formData.get('name'), contact: formData.get('contact'), message: formData.get('message'), consentAccepted: formData.get('consentAccepted') === 'on' }) });
    if (!res.ok) return setMsg('Проверьте поля и согласие на обработку данных.');
    setOk(true); setMsg('Заявка отправлена! Спасибо.');
  }
  return (<form className="card" action={onSubmit}><h3>Обратная связь</h3>
    <input name="name" placeholder="Ваше имя" required /><br /><br />
    <input name="contact" placeholder="Телефон или email" required /><br /><br />
    <textarea name="message" placeholder="Сообщение" rows={4} required />
    <p style={{ fontSize: 12 }}>{consentText}</p>
    <label style={{ display: 'block', marginBottom: 12 }}><input type="checkbox" name="consentAccepted" required /> {consentLabel}</label>
    <button type="submit" disabled={ok}>Отправить</button>{msg ? <p>{msg}</p> : null}
  </form>);
}
