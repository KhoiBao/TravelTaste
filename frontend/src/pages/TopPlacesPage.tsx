import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { EmptyState } from '../components/feedback/AsyncState';
import { useApp } from '../state/AppContext';
import { rankPlaces, type RankingSort } from '../utils/ranking';
import travelHero from '../assets/images/travel-hero.png';

function Heart({ saved, onClick, name }: { saved: boolean; onClick: () => void; name: string }) {
  return <button type="button" onClick={onClick} aria-pressed={saved} aria-label={`${saved ? 'Bỏ lưu' : 'Lưu'} ${name}`} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 text-ink shadow-sm transition-colors hover:bg-surface">
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 ${saved ? 'fill-danger stroke-danger' : 'fill-none stroke-current'}`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>
  </button>;
}

export default function TopPlacesPage() {
  const { activePlaces, data } = useApp();
  const [sort, setSort] = useState<RankingSort>('rating');
  const [categoryId, setCategoryId] = useState('');
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const categories = data.categories.filter(category => category.status === 'ACTIVE');
  const places = rankPlaces(categoryId ? activePlaces.filter(place => place.categoryId === categoryId) : activePlaces, sort);
  function toggleSaved(id: string) { setSaved(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }
  return <PublicLayout node="39:318">
    <div className="flex w-full flex-col gap-6">
      <section className="relative isolate overflow-hidden rounded-page bg-pale">
        <img src={travelHero} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20 tablet:inset-y-0 tablet:left-auto tablet:right-0 tablet:w-[58%] tablet:opacity-100 tablet:[mask-image:linear-gradient(to_right,transparent,black_65%)] desktop:w-[64%] desktop:[mask-image:linear-gradient(to_right,transparent,black_36%)]" />
        <div className="relative z-10 px-6 py-9 tablet:px-9 tablet:py-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">ĐIỂM ĐẾN NỔI BẬT</p>
          <h1 className="mt-3 max-w-[430px] text-[30px] font-bold leading-[1.12] tablet:text-[38px]">Top 10 được yêu thích</h1>
          <p className="mt-3 max-w-[400px] text-[14px] leading-6 text-muted">Cảm hứng cho chuyến đi tiếp theo, tuyển chọn từ những trải nghiệm thật của cộng đồng TravelTaste.</p>
        </div>
      </section>

      <div role="group" aria-label="Lọc và sắp xếp bảng xếp hạng" className="flex flex-wrap items-center gap-2">
        {([['rating', 'Đánh giá cao'], ['reviews', 'Nhiều đánh giá']] as const).map(([key, label]) => <button key={key} type="button" onClick={() => setSort(key)} aria-pressed={sort === key} className={`min-h-10 rounded-pill border px-4 text-[12px] font-bold transition-colors ${sort === key ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-ink hover:border-primary hover:text-primary'}`}>{label}</button>)}
        <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-line tablet:block" />
        {categories.map(category => <button key={category.id} type="button" onClick={() => setCategoryId(current => current === category.id ? '' : category.id)} aria-pressed={categoryId === category.id} className={`min-h-10 rounded-pill border px-4 text-[12px] font-bold transition-colors ${categoryId === category.id ? 'border-primary bg-pale text-primary' : 'border-line bg-surface text-ink hover:border-primary hover:text-primary'}`}>{category.name}</button>)}
      </div>

      {!places.length ? <EmptyState action={<Link to="/places" className="text-primary underline">Khám phá địa điểm</Link>}>Chưa có địa điểm phù hợp trong bảng xếp hạng.</EmptyState> : <>
        <p className="sr-only" role="status">Hiển thị {places.length} địa điểm trong bảng xếp hạng.</p>
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          {places.map((place, index) => <article key={place.id} className="group flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-[0_12px_28px_rgba(6,47,43,0.10)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-line"><svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.6" /></svg></span>
              <img src={place.image} alt={place.name} onError={event => { event.currentTarget.style.display = 'none'; }} className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading={index < 4 ? 'eager' : 'lazy'} />
              <span className="absolute left-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-surface/95 px-2 text-[12px] font-bold text-primary shadow-sm" aria-label={`Hạng ${index + 1}`}>{index + 1}</span>
              <Heart saved={saved.has(place.id)} onClick={() => toggleSaved(place.id)} name={place.name} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="truncate text-[15px] font-bold leading-5 text-ink" title={place.name}>{place.name}</h3>
              <p className="flex flex-wrap items-center gap-1 text-[12px] leading-4">
                <span aria-hidden="true" className="tracking-[-1px] text-accent">{'★★★★★'.slice(0, Math.round(place.rating) || 1)}<span className="text-line">{'★★★★★'.slice(Math.round(place.rating) || 1)}</span></span>
                <span className="font-bold text-ink">{place.rating.toFixed(1)}</span>
                <span className="text-muted">({place.reviewCount} đánh giá)</span>
              </p>
              <p className="flex items-center gap-1 truncate text-[12px] text-muted"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.4" /></svg><span className="truncate">{[place.city, place.category].filter(Boolean).join(' · ')}</span></p>
              <p className="line-clamp-2 text-[12px] leading-5 text-muted">{place.description}</p>
              <Link to={`/places/${place.id}`} className="mt-auto pt-1 text-[12px] font-bold text-primary hover:underline">Xem chi tiết <span aria-hidden="true">→</span><span className="sr-only"> về {place.name}</span></Link>
            </div>
          </article>)}
        </div>
        <p className="text-[11px] leading-relaxed text-muted">Xếp hạng dựa trên điểm sao và số lượng đánh giá thật từ cộng đồng TravelTaste.</p>
      </>}
    </div>
  </PublicLayout>;
}
