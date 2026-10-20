import type {PlaceSummary} from '../../types/domain';
import Rating from '../common/Rating';

export default function PlaceCard({ place, onSelect }: {place: PlaceSummary; onSelect: (place: PlaceSummary) => void}) {
  return (
    <article className="flex min-h-[220px] min-w-0 flex-col items-start gap-2 rounded-card bg-surface pb-[10px]" data-place-card={place.id}>
      <button type="button" onClick={() => onSelect(place)} aria-label={`Xem ${place.name}`} className="block h-[125px] w-full rounded-card">
        <img src={place.image} alt={place.name} width="255" height="125" loading="lazy" className="h-[125px] w-full rounded-card object-cover" />
      </button>
      <h3 className="text-[16px] font-bold leading-[normal]"><button type="button" onClick={() => onSelect(place)} className="text-left hover:underline">{place.name}</button></h3>
      <Rating value={place.rating} count={place.reviewCount} />
    </article>
  );
}
