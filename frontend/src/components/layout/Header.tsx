import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
interface Props {items?: {label: string; to: string}[]; accountTo?: string; accountLabel?: string; onNavigate?: (label: string) => void}
const defaultItems = [{label: 'Khám phá', to: '/'}, {label: 'Địa điểm', to: '/places'}, {label: 'Top 10', to: '/top-10'}, {label: 'Đánh giá', to: '/reviews'}];
export default function Header({items = defaultItems, accountTo, accountLabel, onNavigate}: Props) {
  const [expanded, setExpanded] = useState(false);
  const {role, logout} = useApp();
  const navigate = useNavigate();
  const to = accountTo || (role === 'ADMIN' ? '/admin' : role === 'USER' ? '/profile' : '/login');
  const label = accountLabel || (role === 'GUEST' ? 'Đăng nhập' : role === 'ADMIN' ? 'Quản trị' : 'Tài khoản');
  function select(label: string) {setExpanded(false); onNavigate?.(label);}
  return <header className="w-full border-b border-line bg-surface"><div className="mx-auto flex min-h-[76px] max-w-[1200px] flex-wrap items-center gap-4 px-6 desktop:px-[46px]">
    <Link to="/" onClick={() => select('Khám phá')} className="mr-auto whitespace-nowrap text-[22px] font-bold text-primary tablet:text-2xl desktop:mr-8 desktop:w-[210px]">● TravelTaste</Link>
    <button type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Đóng menu' : 'Menu'} aria-expanded={expanded} aria-controls="public-navigation" className="min-h-11 rounded-button px-3 text-sm text-primary desktop:hidden">{expanded ? 'Đóng' : '☰'}</button>
    <nav id="public-navigation" aria-label="Điều hướng chính" className={`${expanded ? 'flex' : 'hidden'} order-3 w-full flex-col gap-2 pb-4 desktop:order-none desktop:mr-auto desktop:flex desktop:w-auto desktop:flex-row desktop:gap-6 desktop:pb-0`}>
      {items.map(item => <NavLink key={item.label} to={item.to} end={item.to === '/'} onClick={() => select(item.label)} className={({isActive}) => `rounded py-2 text-[15px] hover:text-primary ${isActive ? 'font-bold text-primary' : 'text-ink'}`}>{item.label}</NavLink>)}
    </nav>
    <Link to={to} onClick={() => select(label)} className="rounded-pill bg-pale px-4 py-2.5 text-[13px] font-bold text-primary hover:brightness-95">{label}</Link>
    {role !== 'GUEST' && <button className="text-xs text-muted hover:underline" onClick={async () => {const result = await logout(); if (result.ok) navigate('/'); else window.dispatchEvent(new CustomEvent('traveltaste:notice', {detail: result}));}}>Đăng xuất</button>}
  </div></header>;
}
