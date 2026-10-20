import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
interface Props {workspace?: boolean;items?: {label: string; to: string}[]; accountTo?: string; accountLabel?: string; onNavigate?: (label: string) => void}
const defaultItems = [{label: 'Khám phá', to: '/'}, {label: 'Địa điểm', to: '/places'}, {label: 'Top 10', to: '/top-10'}, {label: 'Đánh giá', to: '/reviews'}];

const icons: Record<string, ReactNode> = {
  'Khám phá': <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>,
  'Địa điểm': <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.6" /></svg>,
  'Top 10': <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M7 21V10l5-7 1.5 1.3a3 3 0 0 1 1 2.5L14 10h5a2 2 0 0 1 2 2.3l-1.3 6.2A2 2 0 0 1 17.7 21Z" /><path d="M7 10H3v11h4" /></svg>,
  'Đánh giá': <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.8 9.8 0 0 1-3.9-.8L3 21l1.9-4.7A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /></svg>,
};

function initials(name?: string) {
  return (name || 'TV').split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase();
}

export default function Header({workspace = false, items = defaultItems, accountTo, accountLabel, onNavigate}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const {role, logout, actor} = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const to = accountTo || (role === 'ADMIN' ? '/admin' : role === 'USER' ? '/profile' : '/login');
  const label = accountLabel || (role === 'GUEST' ? 'Đăng nhập' : actor?.name?.trim() || actor?.username || 'Hồ sơ');

  useEffect(() => { setExpanded(false); setMenuOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    if (!menuOpen) return;
    function outside(event: MouseEvent) { if (!menu.current?.contains(event.target as Node)) setMenuOpen(false); }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') setMenuOpen(false); }
    document.addEventListener('mousedown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', escape); };
  }, [menuOpen]);

  function select(link: string) { setExpanded(false); onNavigate?.(link); }
  function search(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
    setExpanded(false);
  }

  return <header className="sticky top-0 z-30 w-full border-b border-line bg-surface/95 backdrop-blur">
    <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center gap-3 px-6 desktop:gap-6 desktop:px-[46px]">
      <Link to="/" onClick={() => select('Khám phá')} className="mr-auto shrink-0 whitespace-nowrap text-[21px] font-bold text-primary desktop:mr-0">● TravelTaste</Link>

      <nav aria-label="Điều hướng chính" className={workspace ? 'hidden' : 'hidden items-center gap-1 desktop:flex'}>
        {items.map(item => <NavLink key={item.label} to={item.to} end={item.to === '/'} onClick={() => select(item.label)} className={({isActive}) => `flex min-h-[68px] items-center gap-1.5 border-b-2 px-3 text-[13px] transition-colors ${isActive ? 'border-primary font-bold text-primary' : 'border-transparent text-ink hover:text-primary'}`}>{icons[item.label]}{item.label}</NavLink>)}
      </nav>

      <form role="search" onSubmit={search} className="relative ml-auto hidden w-[260px] shrink-0 tablet:block">
        <label htmlFor="global-search" className="sr-only">Tìm địa điểm, món ăn</label>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input id="global-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm địa điểm, món ăn..." className="min-h-10 w-full rounded-pill border border-line bg-canvas pl-10 pr-3 text-[13px] text-ink placeholder:text-muted" />
      </form>

      <Link to={to} onClick={() => select(label)} className="max-w-[140px] truncate rounded-pill bg-pale px-4 py-2.5 text-[12px] font-bold text-primary hover:brightness-95">{label}</Link>

      {role !== 'GUEST' && <div className="relative shrink-0" ref={menu}>
        <button type="button" aria-haspopup="true" aria-expanded={menuOpen} aria-label="Mở menu tài khoản" onClick={() => setMenuOpen(value => !value)} className="flex items-center gap-1.5 rounded-full p-1 pr-1.5 hover:bg-pale">
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-pale text-[11px] font-bold text-primary" aria-hidden="true">{actor?.avatar ? <img src={actor.avatar} alt="" className="h-full w-full object-cover" /> : initials(actor?.name)}</span>
          <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-3.5 w-3.5 text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7 5 5 5-5" /></svg>
        </button>
        {menuOpen && <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-[0_16px_40px_rgba(6,47,43,0.16)]">
          <p className="truncate px-4 py-2 text-[12px] font-bold text-ink">{actor?.name || 'Tài khoản'}</p>
          <Link to="/profile" className="block px-4 py-2 text-[13px] text-ink hover:bg-pale">Hồ sơ</Link>
          <Link to="/my-reviews" className="block px-4 py-2 text-[13px] text-ink hover:bg-pale">Đánh giá của tôi</Link>
          {role === 'ADMIN' && <Link to="/admin" className="block px-4 py-2 text-[13px] text-ink hover:bg-pale">Quản trị</Link>}
          <button type="button" onClick={async () => { const result = await logout(); if (result.ok) navigate('/'); else window.dispatchEvent(new CustomEvent('traveltaste:notice', {detail: result})); }} className="block w-full px-4 py-2 text-left text-[13px] text-ink hover:bg-pale">Đăng xuất</button>
        </div>}
      </div>}

      <button type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Đóng menu' : 'Menu'} aria-expanded={expanded} aria-controls="public-navigation" className="flex h-10 w-10 items-center justify-center rounded-button text-primary desktop:hidden">{expanded ? '✕' : '☰'}</button>
    </div>

    <div id="public-navigation" className={`border-t border-line px-6 pb-4 pt-3 desktop:hidden ${expanded ? '' : 'hidden'}`}>
      <form role="search" onSubmit={search} className="relative mb-3">
        <label htmlFor="mobile-search" className="sr-only">Tìm địa điểm, món ăn</label>
        <input id="mobile-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm địa điểm, món ăn..." className="min-h-11 w-full rounded-pill border border-line bg-canvas pl-4 pr-4 text-[13px]" />
      </form>
      <nav aria-label="Điều hướng di động" className="flex flex-col gap-1">
        {items.map(item => <NavLink key={item.label} to={item.to} end={item.to === '/'} onClick={() => select(item.label)} className={({isActive}) => `flex items-center gap-2 rounded-button px-3 py-2.5 text-[14px] ${isActive ? 'bg-pale font-bold text-primary' : 'text-ink'}`}>{icons[item.label]}{item.label}</NavLink>)}
      </nav>
    </div>
  </header>;
}
