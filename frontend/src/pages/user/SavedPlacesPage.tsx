import {Link} from 'react-router-dom';
import {SimpleLayout} from '../../components/layout/PublicLayout';
import DestinationCard from '../../components/place/DestinationCard';
import {useApp} from '../../state/AppContext';

export default function SavedPlacesPage() {
  const {data} = useApp();
  const saved = data.places.filter(place => place.liked && place.status === 'ACTIVE');
  return <SimpleLayout title="Địa điểm đã lưu">
    <div className="-mt-3 w-full">
      <p className="text-sm text-muted">Những địa điểm bạn đã lưu để xem lại bất cứ lúc nào.</p>
    </div>
    {saved.length ? <section className="w-full">
      <h2 className="mb-4 text-sm font-bold">Bạn đã lưu {saved.length} địa điểm</h2>
      <div className="grid gap-4 tablet:grid-cols-3">{saved.map(place => <DestinationCard key={place.id} place={place} />)}</div>
    </section> : <section className="w-full rounded-xl border border-line bg-surface px-5 py-12 text-center">
      <h2 className="font-bold">Bạn chưa lưu địa điểm nào</h2>
      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-muted">Nhấn vào biểu tượng trái tim trên thẻ địa điểm hoặc trang chi tiết để lưu lại cho chuyến đi sau.</p>
      <Link to="/places" className="mt-5 inline-block rounded-lg bg-primary px-5 py-3 text-xs font-bold text-white">Khám phá địa điểm</Link>
    </section>}
  </SimpleLayout>;
}
