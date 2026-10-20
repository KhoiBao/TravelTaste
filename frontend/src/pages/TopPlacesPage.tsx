import {api} from '../services/api';
import {mapPlace} from '../state/AppContext';
import type {Place} from '../types/domain';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DestinationCard from '../components/place/DestinationCard';
import { EmptyState, ErrorState, Skeleton } from '../components/feedback/AsyncState';
import { useApp } from '../state/AppContext';
import { rankPlaces, type RankingSort } from '../utils/ranking';

export default function TopPlacesPage() {
  const { activePlaces } = useApp();
  const [sort, setSort] = useState<RankingSort>('rating');
  const [ranked, setRanked] = useState<Place[]>([]), [busy, setBusy] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => {let cancelled = false; setBusy(true); setError(''); api.top().then(rows => {if (!cancelled) setRanked(rows.map(mapPlace));}).catch(e => {if (!cancelled) setError(e.message);}).finally(() => {if (!cancelled) setBusy(false);}); return () => {cancelled = true;};}, [retry, activePlaces.length]);
  const places = sort === 'reviews' ? rankPlaces(ranked, 'reviews') : ranked;
  return <PublicLayout node="39:318">
    <div className="flex w-full flex-col gap-6 py-3">
      <div className="space-y-2.5"><p className="text-[11px] font-bold tracking-wide text-primary">ĐIỂM ĐẾN NỔI BẬT</p><h1 className="text-[28px] font-bold leading-tight tablet:text-4xl">Top 10 được yêu thích</h1><p className="text-sm leading-relaxed text-muted">Cảm hứng cho chuyến đi tiếp theo, từ trải nghiệm của cộng đồng.</p></div>
      <div role="group" aria-label="Sắp xếp bảng xếp hạng" className="flex flex-wrap gap-2.5">{([['rating', 'Đánh giá cao'], ['reviews', 'Nhiều đánh giá']] as const).map(([key, label]) => <button key={key} onClick={() => setSort(key)} aria-pressed={sort === key} className={`min-h-11 min-w-36 rounded-button px-4 py-3 text-xs font-bold transition-colors ${sort === key ? 'bg-primary text-white' : 'bg-surface text-muted hover:bg-pale'}`}>{label}</button>)}</div>
      {busy ? <Skeleton /> : !!error ? <ErrorState retry={() => setRetry(n => n + 1)} /> : !places.length ? <EmptyState action={<Link to="/places" className="text-primary underline">Khám phá địa điểm</Link>}>Chưa có địa điểm trong bảng xếp hạng.</EmptyState> : <>
        <section aria-labelledby="top-three-title" className="space-y-6"><h2 id="top-three-title" className="text-[21px] font-bold">Ba điểm đến dẫn đầu</h2><div className="grid gap-4 tablet:grid-cols-3">{places.slice(0, 3).map((place, index) => <DestinationCard key={place.id} place={place} rank={index + 1} />)}</div></section>
        <section aria-labelledby="remaining-title" className="space-y-6"><h2 id="remaining-title" className="text-[21px] font-bold">Tiếp tục khám phá</h2><ol start={4} className="space-y-2.5">{places.slice(3).map((place, index) => <li key={place.id} data-ranked-place={place.id}><Link to={`/places/${place.id}`} className="flex min-h-[84px] items-center gap-4 rounded-[14px] border border-line bg-surface px-4 py-4 transition-colors hover:border-primary hover:bg-pale tablet:px-5"><span className="w-9 shrink-0 text-[22px] font-bold text-primary">{String(index + 4).padStart(2, '0')}</span><div className="min-w-0 flex-1"><h3 className="break-words text-base font-bold">{place.name}</h3><p className="mt-1.5 text-xs text-muted">{place.subtitle}</p></div><span className="shrink-0 text-sm font-bold text-primary" aria-label={`${place.rating} trên 5 sao`}>★ {place.rating.toFixed(1)}</span></Link></li>)}</ol></section>
      </>}
      <p className="text-[11px] leading-relaxed text-muted">Xếp hạng nổi bật được tính bởi máy chủ từ điểm sao và số lượng đánh giá.</p>
    </div>
  </PublicLayout>;
}
