import { useApp } from '../../state/AppContext';

export const selectClasses = 'max-w-full rounded-button border border-line bg-surface px-3 py-2 text-[13px] text-ink';

export default function PlaceFilters({ category, city, minimum, onChange }: {category: string; city: string; minimum: string; onChange: (name: string, value: string) => void}) {
  const { data, activePlaces } = useApp();
  const categories = data.categories.filter(item => item.status === 'ACTIVE');
  const cities = [...new Set(activePlaces.map(place => place.city))];
  return <div className="flex flex-wrap items-end gap-4">
    <label className="flex flex-col gap-2 text-[13px]">Danh mục<select aria-label="Danh mục" value={category} onChange={event => onChange('category', event.target.value)} className={selectClasses}><option value="">Tất cả</option>{categories.map(item => <option key={item.id}>{item.name}</option>)}</select></label>
    <label className="flex flex-col gap-2 text-[13px]">Thành phố<select aria-label="Thành phố" value={city} onChange={event => onChange('city', event.target.value)} className={selectClasses}><option value="">Tất cả</option>{cities.map(value => <option key={value}>{value}</option>)}</select></label>
    <label className="flex flex-col gap-2 text-[13px]">Điểm sao<select aria-label="Điểm sao" value={minimum} onChange={event => onChange('minimum', event.target.value)} className={selectClasses}><option value="">Tất cả</option><option value="4">4 sao trở lên</option><option value="4.5">4.5 sao trở lên</option><option value="5">5 sao</option></select></label>
  </div>;
}
