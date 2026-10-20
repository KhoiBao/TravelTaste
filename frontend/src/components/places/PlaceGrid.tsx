import type {PlaceSummary} from '../../types/domain';
import PlaceCard from './PlaceCard';

export default function PlaceGrid({ places, onSelect }: {places: PlaceSummary[]; onSelect: (place: PlaceSummary) => void}) {
  return <div className="grid w-full max-w-[797px] grid-cols-1 gap-4 bg-surface tablet:grid-cols-2 desktop:grid-cols-3">{places.map(place => <PlaceCard key={place.id} place={place} onSelect={onSelect} />)}</div>;
}
