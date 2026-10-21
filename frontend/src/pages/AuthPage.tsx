import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useState, type FormEvent} from 'react';
import {useApp} from '../state/AppContext';
import {Input} from '../components/common/Controls';
import hero from '../assets/images/travel-hero.png';

export default function AuthPage({register = false}: {register?: boolean}) {
  const location = useLocation();
  const {authenticate, register: createAccount} = useApp();
  const [draft, setDraft] = useState({name: '', username: '', identity: location.state?.identity || '', email: '', password: '', confirmation: ''});
  const [notice, setNotice] = useState(location.state?.registered ? 'Tài khoản đã được tạo. Đăng nhập để bắt đầu khám phá.' : '');
  const [busy, setBusy] = useState(false), [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  function change(name: keyof typeof draft, value: string) {setDraft(old => ({...old, [name]: value})); setNotice('');}
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    if (register && draft.password !== draft.confirmation) {setNotice('Mật khẩu xác nhận không khớp.'); return;}
    setBusy(true);
    try {
      if (register) {
        const result = await createAccount(draft.username, draft.name, draft.email, draft.password);
        if (result.ok) navigate('/login', {replace: true, state: {registered: true, identity: draft.email}});
        else setNotice(result.message);
      } else {
        const result = await authenticate(draft.identity, draft.password);
        if (result.ok) navigate(result.role === 'ADMIN' ? '/admin' : '/profile', {replace: true});
        else setNotice(result.message);
      }
    } finally {setBusy(false);}
  }
  return <div className="relative min-h-dvh bg-canvas desktop:grid desktop:grid-cols-2">
    <header className="relative z-20 flex items-center justify-between gap-4 px-6 py-6 tablet:px-10 desktop:absolute desktop:inset-x-0 desktop:top-0 desktop:px-10 desktop:py-8">
      <Link to="/" className="text-xl font-bold tracking-tight text-primary desktop:text-white desktop:[text-shadow:0_1px_16px_rgba(0,0,0,0.45)]">● TravelTaste</Link>
      <Link to="/" className="text-xs font-bold text-muted hover:text-primary desktop:px-10 desktop:hover:text-ink">← Về khám phá</Link>
    </header>
    <section className="relative hidden overflow-hidden bg-primary desktop:sticky desktop:top-0 desktop:flex desktop:h-dvh desktop:flex-col desktop:justify-end desktop:p-12 desktop:pb-16 desktop:pt-32" aria-label="Khám phá cùng TravelTaste">
      <img src={hero} alt="Phong cảnh vịnh biển Việt Nam lúc hoàng hôn" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-t from-[#062f2b]/95 via-[#062f2b]/20 to-[#062f2b]/5" />
      <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[#062f2b]/60 to-transparent" />
      <div className="relative max-w-[560px] text-white"><span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-bold tracking-widest">ĐI XA HƠN · TRẢI NGHIỆM NHIỀU HƠN</span><h2 className="mt-6 text-[clamp(32px,3vw,42px)] font-bold leading-tight">Mỗi chuyến đi,<br />một câu chuyện.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-white/80">Tìm một nơi đáng đến, lưu lại những trải nghiệm và chia sẻ góc nhìn của bạn cùng cộng đồng.</p><div className="mt-10 flex items-center gap-3 border-t border-white/20 pt-6"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg" aria-hidden="true">↗</span><p className="text-xs leading-5 text-white/80">Một tài khoản.<br /><strong className="text-white">Ngàn cảm hứng khám phá.</strong></p></div></div>
    </section>
    <main className="flex px-5 pb-12 pt-2 tablet:px-10 desktop:min-h-dvh desktop:items-center desktop:justify-center desktop:px-14 desktop:py-24">
      <section className="mx-auto w-full max-w-[460px] rounded-[24px] border border-line bg-surface px-6 py-8 tablet:px-9 tablet:py-10 desktop:max-w-[420px] desktop:rounded-none desktop:border-0 desktop:bg-transparent desktop:px-0 desktop:py-0" aria-labelledby="auth-title">
        <p className="mb-3 text-[11px] font-bold tracking-[0.18em] text-primary">CỘNG ĐỒNG TRAVELTASTE</p>
        <h1 id="auth-title" className="text-3xl font-bold tracking-tight tablet:text-4xl">{register ? 'Bắt đầu hành trình mới' : 'Chào mừng trở lại'}</h1>
        <p className="mb-8 mt-3 text-sm leading-6 text-muted">{register ? 'Tạo tài khoản để chia sẻ những nơi bạn yêu thích.' : 'Đăng nhập để tiếp tục chia sẻ trải nghiệm của bạn.'}</p>
        <form onSubmit={submit} className="space-y-5">
          {register ? <><div className="grid gap-5 tablet:grid-cols-2"><Input label="Tên hiển thị" required minLength={2} maxLength={100} disabled={busy} autoComplete="name" value={draft.name} onChange={e => change('name', e.target.value)} /><Input label="Tên đăng nhập" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" disabled={busy} autoComplete="username" value={draft.username} onChange={e => change('username', e.target.value)} /></div><Input label="Email" type="email" required disabled={busy} autoComplete="email" placeholder="ban@example.com" value={draft.email} onChange={e => change('email', e.target.value)} /></> : <Input label="Email hoặc username" required disabled={busy} autoComplete="username" placeholder="Nhập email hoặc tên đăng nhập" value={draft.identity} onChange={e => change('identity', e.target.value)} />}
          <div className="relative"><Input label="Mật khẩu" type={visible ? 'text' : 'password'} required minLength={register ? 8 : 1} pattern={register ? '(?=.*[a-zA-Z])(?=.*[0-9]).+' : undefined} disabled={busy} autoComplete={register ? 'new-password' : 'current-password'} value={draft.password} onChange={e => change('password', e.target.value)} /><button type="button" aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={visible} onClick={() => setVisible(v => !v)} className="absolute right-1 top-0 rounded px-1 text-[11px] font-bold text-primary">{visible ? 'Ẩn' : 'Hiện'}</button></div>
          {register && <><p className="!mt-2 text-xs text-muted">Ít nhất 8 ký tự, bao gồm chữ và số.</p><Input label="Xác nhận mật khẩu" type="password" required disabled={busy} autoComplete="new-password" value={draft.confirmation} onChange={e => change('confirmation', e.target.value)} /></>}
          {notice && <p role={location.state?.registered ? 'status' : 'alert'} aria-live="polite" className={`rounded-xl p-3 text-sm leading-6 ${location.state?.registered ? 'bg-pale text-primary' : 'bg-red-50 text-red-800'}`}>{notice}</p>}
          <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60">{busy ? 'Đang xử lý…' : register ? 'Tạo tài khoản' : 'Đăng nhập'}{!busy && <span aria-hidden="true">→</span>}</button>
        </form>
        <p className="mt-7 border-t border-line pt-6 text-center text-sm text-muted">{register ? 'Bạn đã có tài khoản? ' : 'Chưa có tài khoản? '}<Link to={register ? '/login' : '/register'} className="font-bold text-primary hover:underline">{register ? 'Đăng nhập' : 'Đăng ký ngay'}</Link></p>
        <p className="mt-8 text-center text-[11px] text-muted">TravelTaste · Khám phá, trải nghiệm và sẻ chia.</p>
      </section>
    </main>
  </div>;
}
