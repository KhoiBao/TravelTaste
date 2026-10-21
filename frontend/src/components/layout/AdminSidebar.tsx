import {NavLink} from 'react-router-dom';
export function WorkspaceIcon({name, className = 'h-4 w-4'}: {name: string; className?: string}) {
  const paths: Record<string, string> = {
    home: 'm3 10 9-7 9 7v10H3V10Zm6 10v-7h6v7', place: 'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM9 10h6',
    category: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    review: 'M4 3h16v15H9l-5 4V3Zm4 5h8M8 12h6', comment: 'M21 11a8 8 0 0 1-8 8H9l-6 3 2-6a8 8 0 1 1 16-5Z',
    user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
    chart: 'M4 3v18h17M8 16v-5M13 16V6M18 16V9', star: 'm12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.home} /></svg>;
}
export default function AdminSidebar() {
  const items = [['/admin','Tổng quan','home'], ['/admin/places','Địa điểm','place'], ['/admin/categories','Danh mục','category'], ['/admin/reviews','Đánh giá','review'], ['/admin/comments','Bình luận','comment'], ['/admin/users','Người dùng','user'], ['/admin/statistics','Thống kê','chart']];
  const personal = [['/profile','Hồ sơ','user'], ['/my-reviews','Đánh giá của tôi','star']];
  const links = (list: string[][]) => list.map(([to,label,icon]) => <NavLink key={to} to={to} end={to === '/admin'} className={({isActive}) => `flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-xs transition-colors ${isActive ? 'bg-pale font-bold text-primary' : 'text-muted hover:bg-pale hover:text-primary'}`}><WorkspaceIcon name={icon} />{label}</NavLink>);
  return <aside className="border-b border-line bg-surface p-3 desktop:sticky desktop:top-[69px] desktop:h-[calc(100dvh-69px)] desktop:w-[210px] desktop:shrink-0 desktop:border-b-0 desktop:border-r desktop:px-4 desktop:py-6"><nav aria-label="Quản trị" className="flex gap-1 overflow-x-auto desktop:flex-col"><span className="hidden px-3 pb-3 text-[10px] font-bold tracking-widest text-muted desktop:block">QUẢN LÝ HỆ THỐNG</span>{links(items)}<span className="hidden px-3 pb-2 pt-6 text-[10px] font-bold tracking-widest text-muted desktop:block">TÀI KHOẢN</span>{links(personal)}</nav></aside>;
}
