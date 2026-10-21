import placeholder from '../../assets/images/placeholder.svg';
import { Link } from 'react-router-dom';
import type { Place } from '../../types/domain';
import LikeButton from '../places/LikeButton';

export default function DestinationCard({place, rank}: {place: Place; rank?: number}) {
  return <article data-destination-card={place.id} className="group min-w-0 overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-md motion-reduce:transition-none">
    <div className="relative">
      <Link to={`/places/${place.id}`} tabIndex={-1} aria-hidden="true"><img src={place.image} onError={e => {e.currentTarget.onerror = null; e.currentTarget.src = placeholder;}} alt="" width={360} height={170} loading="lazy" className="h-[170px] w-full object-cover" /></Link>
      <LikeButton place={place} />
    </div>
    <div className="flex flex-col gap-2 p-[18px]">
      {rank && <p className="text-[11px] font-bold text-rank-gold">TOP {String(rank).padStart(2, '0')} · NỔI BẬT</p>}
      <h3 className="text-xl font-bold"><Link className="hover:text-primary hover:underline" to={`/places/${place.id}`}>{place.name}</Link></h3>
      <p className="text-xs text-muted">{place.subtitle}</p>
      <p className="text-[13px] text-muted"><span aria-label={`${place.rating} trên 5 sao`}>★ {place.rating.toFixed(1)}</span> · {place.reviewCount} đánh giá</p>
      <Link to={`/places/${place.id}`} className="mt-1 inline-flex min-h-6 items-center text-[13px] font-bold text-primary hover:underline">Khám phá địa điểm <span aria-hidden="true" className="ml-2">→</span><span className="sr-only"> {place.name}</span></Link>
    </div>
  </article>;
}
