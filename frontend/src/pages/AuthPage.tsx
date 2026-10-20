import {Link, useNavigate} from 'react-router-dom';
import {useState, type FormEvent} from 'react';
import {usePopup} from '../components/common/PopupContext';
import {useApp} from '../state/AppContext';
import {Button, Input} from '../components/common/Controls';
import type {AuthDraft} from '../types/domain';
export default function AuthPage({register = false}: {register?: boolean}) {
  const {authDraft: draft, setAuthDraft, setDirty} = usePopup();
  const {authenticate, register: createAccount} = useApp();
  const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  function change(name: keyof AuthDraft, value: string) {const next = {...draft, [name]: value}; setAuthDraft(next); setDirty(Object.values(next).some(Boolean)); setNotice('');}
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    if (register && draft.password !== draft.confirmation) {setNotice('Mật khẩu xác nhận không khớp.'); return;}
    setBusy(true);
    if (register) {const result = await createAccount(draft.username, draft.name, draft.email, draft.password); setNotice(result.message); if (result.ok) {setAuthDraft({...draft, identity: draft.email, password: '', confirmation: ''}); setDirty(false);}}
    else {const result = await authenticate(draft.identity, draft.password); setNotice(result.message); if (result.ok) {setAuthDraft({...draft, password: '', confirmation: ''}); setDirty(false); navigate(result.role === 'ADMIN' ? '/admin' : '/profile');}}
    setBusy(false);
  }
  return <div><nav aria-label="Chọn biểu mẫu tài khoản" className="mb-6 flex gap-3"><Link to="/login" aria-current={!register ? 'page' : undefined} className={`flex-1 rounded-button px-4 py-3 text-center text-sm ${register ? 'bg-canvas text-muted' : 'bg-pale font-bold text-primary'}`}>Đăng nhập</Link><Link to="/register" aria-current={register ? 'page' : undefined} className={`flex-1 rounded-button px-4 py-3 text-center text-sm ${register ? 'bg-pale font-bold text-primary' : 'bg-canvas text-muted'}`}>Đăng ký</Link></nav><form onSubmit={submit} className="flex flex-col gap-5">
    {register ? <><Input label="Tên đăng nhập" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" disabled={busy} value={draft.username} onChange={e => change('username', e.target.value)} /><Input label="Tên hiển thị" required disabled={busy} autoComplete="name" maxLength={100} value={draft.name} onChange={e => change('name', e.target.value)} /><Input label="Email" type="email" required disabled={busy} autoComplete="email" value={draft.email} onChange={e => change('email', e.target.value)} /></> : <Input label="Email hoặc username" required disabled={busy} autoComplete="username" value={draft.identity} onChange={e => change('identity', e.target.value)} />}
    <Input label="Mật khẩu" type="password" required minLength={register ? 8 : 1} disabled={busy} autoComplete={register ? 'new-password' : 'current-password'} value={draft.password} onChange={e => change('password', e.target.value)} />
    {register && <Input label="Xác nhận mật khẩu" type="password" required disabled={busy} autoComplete="new-password" value={draft.confirmation} onChange={e => change('confirmation', e.target.value)} />}
    <p role="status" aria-live="polite" className="text-sm leading-relaxed text-primary">{notice}</p><Button type="submit" disabled={busy}>{busy ? 'Đang xử lý…' : register ? 'Đăng ký' : 'Đăng nhập'}</Button>
  </form><Link to={register ? '/login' : '/register'} className="mt-5 inline-block text-[13px] text-primary underline">{register ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</Link></div>;
}
