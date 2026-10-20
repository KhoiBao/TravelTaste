import { Link } from 'react-router-dom';
import { SimpleLayout } from '../components/layout/PublicLayout';
import { useApp } from '../state/AppContext';
export default function CategoriesPage() {
  const {data, activePlaces} = useApp();
  return <SimpleLayout node="39:301" title="Khám phá theo sở thích"><p className="text-sm text-muted">Chọn một chủ đề để tìm cảm hứng cho chuyến đi của bạn.</p><div className="grid w-full gap-5 tablet:grid-cols-2">{data.categories.filter(c => c.status === 'ACTIVE').map(category => <Link key={category.id} to={`/places?category=${encodeURIComponent(category.name)}`} className="group flex min-h-44 flex-col justify-between rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-primary hover:bg-pale"><span className="text-xs font-bold uppercase tracking-widest text-primary">{category.name === 'Du lịch' ? 'ĐIỂM ĐẾN & TRẢI NGHIỆM' : 'HƯƠNG VỊ & KHÁM PHÁ'}</span><div className="mt-5 flex items-center justify-between"><div><h2 className="text-2xl font-bold">{category.name}</h2><p className="mt-2 text-sm text-muted">{activePlaces.filter(p => p.categoryId === category.id).length} địa điểm</p></div><span className="text-xl text-primary" aria-hidden="true">→</span></div></Link>)}</div><Link to="/places" className="rounded-button bg-primary px-5 py-3.5 text-sm font-bold text-white">Xem tất cả địa điểm</Link></SimpleLayout>;
}
