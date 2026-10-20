import type {PlaceSummary} from '../../types/domain';
import { useNavigate } from 'react-router-dom';
import PlaceGrid from './PlaceGrid';

export default function PlaceSection({ title, places, id }: {title: string; places: PlaceSummary[]; id?: string}) {
  const navigate = useNavigate();
  return <section id={id} className="flex w-full flex-col items-start gap-[18px]" aria-label={title || 'Địa điểm'}>
    {title && <h2 className="text-[20px] font-bold leading-[24px]">{title}</h2>}
    {places.length ? <PlaceGrid places={places} onSelect={place => navigate(`/places/${place.id}`)} /> : <p role="status" className="w-full max-w-[797px] rounded-card bg-surface p-6 text-[15px] text-muted">Không tìm thấy địa điểm phù hợp.</p>}
  </section>;
}
