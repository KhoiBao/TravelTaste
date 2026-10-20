import {api} from '../services/api';
import {mapPlace} from '../state/AppContext';
import type {Place} from '../types/domain';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import PublicSearch from '../components/common/PublicSearch';
import DestinationCard from '../components/place/DestinationCard';
import { EmptyState, ErrorState, Skeleton } from '../components/feedback/AsyncState';
import { useApp } from '../state/AppContext';
import { normalize } from '../utils/ranking';

const selectClass = 'mt-2 min-h-11 w-full rounded-button border border-line bg-surface px-3 text-sm';
export default function SearchPage() {
  const {activePlaces, data} = useApp();
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(1);
  const [results, setResults] = useState<Place[]>([]), [total, setTotal] = useState(0), [busy, setBusy] = useState(true), [failure, setFailure] = useState(''), [retry, setRetry] = useState(0);
  const query = params.get('q') || '';
  const category = params.get('category') || '';
  const city = params.get('city') || '';
  const minimum = Number(params.get('minimum') || 0);
  const sort = params.get('sort') || '';

  function change(key: string, value: string) {const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setLimit(1); setParams(next);}
  useEffect(() => {
    let cancelled = false; setBusy(true); setFailure('');
    const categoryId = data.categories.find(c => c.name === category)?.id || '';
    api.places(new URLSearchParams({q: query, danhMuc: categoryId, thanhPho: city, minRating: String(minimum), sort, page: String(limit), size: '6'}), true)
      .then(page => {if (!cancelled) {setResults(old => limit === 1 ? page.content.map(mapPlace) : [...old, ...page.content.map(mapPlace)]); setTotal(page.totalElements);}})
      .catch(e => {if (!cancelled) setFailure(e instanceof Error ? e.message : 'Không tải được dữ liệu.');})
      .finally(() => {if (!cancelled) setBusy(false);});
    return () => {cancelled = true;};
  }, [query, category, city, minimum, sort, limit, retry, data.categories]);
  const places = results;
  function nearby() {
    if (!navigator.geolocation) {setFailure('Trình duyệt không hỗ trợ vị trí.'); return;}
    setBusy(true); setFailure('');
    navigator.geolocation.getCurrentPosition(async position => {
      try {const found = await api.near(position.coords.latitude, position.coords.longitude); setResults(found.map(mapPlace)); setTotal(found.length);}
      catch(e) {setFailure(e instanceof Error ? e.message : 'Không tìm được địa điểm gần bạn.');}
      finally {setBusy(false);}
    }, () => {setFailure('Không lấy được vị trí. Vui lòng kiểm tra quyền truy cập vị trí.'); setBusy(false);}, {timeout: 10000});
  }
  return <PublicLayout node="39:35"><div className="w-full space-y-6"><div><p className="mb-3 text-xs font-bold tracking-wide text-primary">KHÁM PHÁ TRAVELTASTE</p><h1 className="text-[28px] font-bold tablet:text-4xl">Tìm địa điểm phù hợp với bạn</h1><p className="mt-3 text-sm text-muted">Một nơi đáng đến, một trải nghiệm đáng chia sẻ.</p></div>
    <PublicSearch key={query} initialValue={query} onSearch={(value: string) => change('q', value)} />
    <button onClick={nearby} disabled={busy} className="rounded-button bg-pale px-4 py-3 text-sm text-primary">Địa điểm trong 5 km quanh tôi</button><section aria-label="Bộ lọc địa điểm" className="rounded-2xl border border-line bg-surface p-5"><div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
      <label className="text-xs">Danh mục<select aria-label="Danh mục" className={selectClass} value={category} onChange={event => change('category', event.target.value)}><option value="">Tất cả</option>{data.categories.filter(c => c.status === 'ACTIVE').map(c => <option key={c.id}>{c.name}</option>)}</select></label>
      <label className="text-xs">Thành phố<select aria-label="Thành phố" className={selectClass} value={city} onChange={event => change('city', event.target.value)}><option value="">Tất cả</option>{[...new Set(activePlaces.map(p => p.city))].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="text-xs">Điểm sao<select aria-label="Điểm sao" className={selectClass} value={String(minimum)} onChange={event => change('minimum', event.target.value)}><option value="0">Tất cả</option><option value="4">4 sao trở lên</option><option value="4.5">4.5 sao trở lên</option><option value="5">5 sao</option></select></label>
      <label className="text-xs">Sắp xếp<select aria-label="Sắp xếp" className={selectClass} value={sort} onChange={event => change('sort', event.target.value)}><option value="">Đề xuất</option><option value="newest">Mới nhất</option><option value="rating">Điểm cao nhất</option></select></label>
    </div><Link to="/search" onClick={() => setLimit(1)} className="mt-4 inline-block text-xs font-bold text-primary underline">Xóa bộ lọc</Link></section>
    <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Kết quả tìm kiếm</h2><p role="status" className="text-xs text-muted">{total} địa điểm</p></div>
    {busy && limit === 1 ? <Skeleton /> : !!failure ? <ErrorState retry={() => setRetry(n => n + 1)} /> : !places.length ? <EmptyState>Không tìm thấy địa điểm phù hợp.</EmptyState> : <><div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">{places.map(place => <DestinationCard key={place.id} place={place} />)}</div>{places.length < total && <div className="text-center"><button disabled={busy} onClick={() => setLimit(value => value + 1)} className="min-h-11 rounded-button bg-primary px-6 py-3 text-sm font-bold text-white">Tải thêm địa điểm</button></div>}<p className="text-center text-xs text-muted">Đang hiển thị {places.length} / {total} địa điểm</p></>}
    {failure && <p role="alert">{failure}</p>}
  </div></PublicLayout>;
}
