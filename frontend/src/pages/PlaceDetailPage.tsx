import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DestinationCard from '../components/place/DestinationCard';
import ReviewRows from '../components/reviews/ReviewRows';
import LikeButton from '../components/places/LikeButton';
import { useApp } from '../state/AppContext';

export default function PlaceDetailPage() {
  const {id} = useParams();
  const {activePlaces, data} = useApp();
  const [limit, setLimit] = useState(6);
  const place = activePlaces.find(p => p.id === id);
  if (!place) return <PublicLayout><h1 className="text-3xl font-bold">Không tìm thấy địa điểm</h1><p className="text-muted">Địa điểm không tồn tại hoặc đã được gỡ.</p><Link to="/places" className="text-primary underline">Về danh sách địa điểm</Link></PublicLayout>;
  const reviews = data.reviews.filter(r => r.placeId === id && r.status === 'ACTIVE');
  const distribution = [5, 4, 3, 2, 1].map(stars => ({stars, count: reviews.filter(r => r.stars === stars).length}));
  return <PublicLayout node="39:73"><div className="w-full space-y-8"><nav aria-label="Đường dẫn" className="flex gap-2 text-xs text-muted"><Link to="/places" className="underline">Địa điểm</Link><span aria-hidden="true">/</span><span>{place.name}</span></nav>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold text-primary">{place.category}</p><h1 className="text-3xl font-bold tablet:text-4xl">{place.name}</h1><p className="mt-3 text-sm text-muted">{place.address} · {place.city}</p></div><div className="flex flex-wrap items-center gap-3"><LikeButton place={place} variant="full" /><Link to={`/reviews/new?place=${id}`} className="rounded-button bg-primary px-5 py-3.5 text-sm font-bold text-white hover:brightness-95">Viết đánh giá</Link></div></div>
    <img src={place.image} alt={place.name} width={1108} height={360} className="h-56 w-full rounded-[20px] object-cover tablet:h-[360px]" />
    <section className="grid gap-6 tablet:grid-cols-2"><div className="rounded-2xl border border-line bg-surface p-6"><h2 className="text-xl font-bold">Về địa điểm</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted">{place.description}</p><p className="mt-4 text-xs text-muted"></p></div><div className="rounded-2xl border border-line bg-surface p-6"><h2 className="text-xl font-bold">Đánh giá từ cộng đồng</h2><p className="my-4 text-3xl font-bold text-primary">★ {place.rating.toFixed(1)} <span className="text-sm font-normal text-muted">/ 5 · {place.reviewCount} đánh giá</span></p><div className="space-y-2">{distribution.map(item => <div key={item.stars} className="flex items-center gap-3 text-xs"><span>{item.stars} ★</span><progress aria-label={`${item.stars} sao`} max={Math.max(1, reviews.length)} value={item.count} className="h-2 min-w-0 flex-1 overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-pale [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" /><span className="w-6 text-right text-muted">{item.count}</span></div>)}</div></div></section>
    <section className="rounded-2xl border border-line bg-surface p-6"><h2 className="mb-4 text-xl font-bold">Trải nghiệm được chia sẻ</h2><ReviewRows reviews={reviews.slice(0, limit)} onNotice={() => {}} />{limit < reviews.length && <button onClick={() => setLimit(n => n + 6)} className="mt-5 rounded-button bg-pale px-4 py-3 text-sm font-bold text-primary">Xem thêm đánh giá</button>}</section>
    <section className="space-y-5"><h2 className="text-xl font-bold">Bạn cũng có thể thích</h2><div className="grid gap-4 tablet:grid-cols-3">{activePlaces.filter(p => p.id !== id).slice(0, 3).map(p => <DestinationCard key={p.id} place={p} />)}</div></section>
  </div></PublicLayout>;
}
