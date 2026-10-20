import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import Header from './Header';
import { useApp } from '../../state/AppContext';

function Footer() {return <footer className="mt-6 border-t border-line bg-surface"><div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted desktop:px-[46px]"><Link to="/" className="text-base font-bold text-primary">● TravelTaste</Link><p>Khám phá Việt Nam qua những trải nghiệm.</p><nav aria-label="Điều hướng cuối trang" className="flex gap-4"><Link to="/categories" className="hover:underline">Danh mục</Link><Link to="/top-10" className="hover:underline">Top 10</Link><Link to="/reviews" className="hover:underline">Cộng đồng</Link></nav></div></footer>;}
export default function PublicLayout({children, node, admin = false}: {children: ReactNode; node?: string; admin?: boolean}) {
  return <><a href="#main-content" className="fixed -top-20 left-4 z-50 rounded bg-primary p-3 text-white focus:top-2">Đến nội dung chính</a><Header accountLabel={admin ? 'ADMIN' : undefined} accountTo={admin ? '/admin' : undefined} /><main id="main-content" data-figma-node={node} className="mx-auto flex min-h-[65vh] w-full max-w-[1200px] flex-col items-start gap-6 px-6 py-6 desktop:px-[46px]">{children}</main><Footer /></>;
}
export function SimpleLayout({children, title, node}: {children: ReactNode; title: string; node?: string}) {
  return <PublicLayout node={node}><h1 className="text-[28px] font-bold leading-tight tablet:text-4xl">{title}</h1>{children}</PublicLayout>;
}
