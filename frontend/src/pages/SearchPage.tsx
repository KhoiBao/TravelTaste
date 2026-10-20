import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { EmptyState, ErrorState, Skeleton } from '../components/feedback/AsyncState';
import { api } from '../services/api';
import { mapPlace, useApp } from '../state/AppContext';
import type { Place } from '../types/domain';
import travelHero from '../assets/images/travel-hero.png';

const controlClass = 'min-h-10 w-full rounded-button border border-line bg-surface px-3 text-[13px] text-ink';
const PAGE_SIZE = 8;

function Heart({ saved, onClick, name }: { saved: boolean; onClick: () => void; name: string }) {
  return <button type="button" onClick={onClick} aria-pressed={saved} aria-label={`${saved ? 'Bỏ lưu' : 'Lưu'} ${name}`} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 text-ink shadow-sm transition-colors hover:bg-surface">
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 ${saved ? 'fill-danger stroke-danger' : 'fill-none stroke-current'}`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>
  </button>;
}

export default function SearchPage() {
  const { activePlaces, data } = useApp();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const [show, setShow] = useState(PAGE_SIZE);
  const [radius, setRadius] = useState('5');
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [results, setResults] = useState<Place[]>([]), [busy, setBusy] = useState(true), [failure, setFailure] = useState(''), [retry, setRetry] = useState(0);
  const query = params.get('q') || '';
  const category = params.get('category') || '';
  const city = params.get('city') || '';
  const district = params.get('district') || '';
  const minimum = params.get('minimum') || '';
  const sort = params.get('sort') || '';

  useEffect(() => { setSearch(query); }, [query]);
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key === 'city') next.delete('district');
    setShow(PAGE_SIZE); setParams(next);
  }
  function reset() { setSearch(''); setRadius('5'); setShow(PAGE_SIZE); setParams(new URLSearchParams()); }

  const districts = [...new Set(activePlaces.filter(place => !city || place.city === city).map(place => place.district).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));
  useEffect(() => {
    let cancelled = false; setBusy(true); setFailure('');
    const categoryId = data.categories.find(item => item.name === category)?.id || '';
    const filters = new URLSearchParams({ page: '1', size: '100' });
    if (query) filters.set('q', query);
    if (categoryId) filters.set('danhMuc', categoryId);
    if (city) filters.set('thanhPho', city);
    if (minimum) filters.set('minRating', minimum);
    if (sort) filters.set('sort', sort);
    const descriptions = new Map(activePlaces.map(place => [place.id, place.description]));
    api.places(filters, true)
      .then(page => { if (!cancelled) setResults(page.content.map(mapPlace).map(place => ({ ...place, description: descriptions.get(place.id) || place.description }))); })
      .catch(error => { if (!cancelled) setFailure(error instanceof Error ? error.message : 'Không tải được dữ liệu.'); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [query, category, city, minimum, sort, retry, data.categories, activePlaces]);
  const filtered = district ? results.filter(place => place.district === district) : results;
  const visible = filtered.slice(0, show);
  const cities = [...new Set(activePlaces.map(place => place.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));

  function nearby(km: number) {
    if (!navigator.geolocation) { setFailure('Trình duyệt không hỗ trợ vị trí.'); return; }
    setBusy(true); setFailure('');
    navigator.geolocation.getCurrentPosition(async position => {
      try { const found = await api.near(position.coords.latitude, position.coords.longitude, km); setResults(found.map(mapPlace)); setShow(PAGE_SIZE); }
      catch (error) { setFailure(error instanceof Error ? error.message : 'Không tìm được địa điểm gần bạn.'); }
      finally { setBusy(false); }
    }, () => { setFailure('Không lấy được vị trí. Vui lòng kiểm tra quyền truy cập vị trí.'); setBusy(false); }, { timeout: 10000 });
  }
  function toggleSaved(id: string) { setSaved(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }

  function searchSubmit(event: FormEvent) { event.preventDefault(); change('q', search.trim()); }

  return <PublicLayout node="39:35">
    <div className="flex w-full flex-col gap-6">
      <section className="relative isolate overflow-hidden rounded-page bg-pale">
        <img src={travelHero} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20 tablet:inset-y-0 tablet:left-auto tablet:right-0 tablet:w-[58%] tablet:opacity-100 tablet:[mask-image:linear-gradient(to_right,transparent,black_65%)] desktop:w-[62%] desktop:[mask-image:linear-gradient(to_right,transparent,black_36%)]" />
        <div className="relative z-10 px-6 py-9 tablet:px-9 tablet:py-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">KHÁM PHÁ TRAVELTASTE</p>
          <h1 className="mt-3 max-w-[560px] text-[30px] font-bold leading-[1.12] tablet:text-[38px]">Tìm địa điểm phù hợp với bạn</h1>
          <p className="mt-3 max-w-[400px] text-[14px] leading-6 text-muted">Một nơi đáng đến, một trải nghiệm đáng chia sẻ.</p>
        </div>
      </section>

      <section aria-label="Bộ lọc địa điểm" className="rounded-page border border-line bg-surface p-4 tablet:p-5">
        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center">
          <form role="search" onSubmit={searchSubmit} className="relative min-w-0 flex-1">
            <label htmlFor="place-search" className="sr-only">Tìm kiếm địa điểm</label>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input id="place-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm kiếm địa điểm, món ăn..." className="min-h-11 w-full rounded-button border border-line bg-canvas pl-10 pr-[76px] text-[13px] text-ink placeholder:text-muted" />
            <button type="submit" className="absolute right-1.5 top-1/2 min-h-8 -translate-y-1/2 rounded-button bg-primary px-3 text-[12px] font-bold text-white hover:brightness-95">Tìm</button>
          </form>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-button border border-line bg-pale/70 px-2 py-1.5">
            <label htmlFor="nearby-radius" className="pl-1 text-[12px] font-medium text-primary">Địa điểm trong</label>
            <select id="nearby-radius" value={radius} disabled={busy} onChange={event => setRadius(event.target.value)} className="min-h-8 rounded-button border border-line bg-surface px-2 text-[12px] text-ink disabled:opacity-60">
              <option value="5">5 km</option><option value="10">10 km</option><option value="20">20 km</option>
            </select>
            <button type="button" onClick={() => nearby(Number(radius))} disabled={busy} className="min-h-8 rounded-button bg-primary px-3 text-[12px] font-bold text-white hover:brightness-95 disabled:cursor-wait disabled:opacity-60">Quanh tôi</button>
          </div>
        </div>

        <div className="mt-3 grid gap-3 tablet:grid-cols-2 desktop:grid-cols-5">
          <label className="min-w-0"><span className="sr-only">Danh mục</span><select aria-label="Danh mục" className={controlClass} value={category} onChange={event => change('category', event.target.value)}><option value="">Danh mục</option>{data.categories.filter(item => item.status === 'ACTIVE').map(item => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
          <label className="min-w-0"><span className="sr-only">Quận/huyện</span><select aria-label="Quận/huyện" className={controlClass} value={district} onChange={event => change('district', event.target.value)}><option value="">Quận/huyện</option>{districts.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="min-w-0"><span className="sr-only">Thành phố</span><select aria-label="Thành phố" className={controlClass} value={city} onChange={event => change('city', event.target.value)}><option value="">Thành phố</option>{cities.map(item => <option key={item}>{item}</option>)}</select></label>
          <label className="min-w-0"><span className="sr-only">Đánh giá tối thiểu</span><select aria-label="Đánh giá tối thiểu" className={controlClass} value={minimum} onChange={event => change('minimum', event.target.value)}><option value="">Đánh giá tối thiểu</option><option value="4">Từ 4 sao</option><option value="4.5">Từ 4.5 sao</option><option value="5">5 sao</option></select></label>
          <label className="min-w-0"><span className="sr-only">Sắp xếp</span><select aria-label="Sắp xếp" className={controlClass} value={sort} onChange={event => change('sort', event.target.value)}><option value="">Sắp xếp</option><option value="newest">Mới nhất</option><option value="rating">Điểm cao nhất</option></select></label>
        </div>

        <div className="mt-3 flex justify-end">
          <button type="button" onClick={reset} className="text-[12px] font-bold text-primary hover:underline">Xóa bộ lọc</button>
        </div>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-[21px] font-bold leading-7">Kết quả tìm kiếm</h2>
        <p role="status" className="text-[12px] text-muted">Tìm thấy <strong className="text-ink">{filtered.length}</strong> địa điểm</p>
      </div>

      {busy ? <Skeleton /> : failure ? <ErrorState retry={() => setRetry(value => value + 1)} /> : !filtered.length ? <EmptyState action={<button type="button" onClick={reset} className="text-primary underline">Xóa bộ lọc</button>}>Không tìm thấy địa điểm phù hợp.</EmptyState> : <>
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          {visible.map(place => <article key={place.id} className="group flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface transition-shadow hover:shadow-[0_12px_28px_rgba(6,47,43,0.10)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-line"><svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.6" /></svg></span>
              <Link to={`/places/${place.id}`} tabIndex={-1} aria-hidden="true" className="relative block h-full w-full"><img src={place.image} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" /></Link>
              <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-pill bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"><span aria-hidden="true" className="text-accent">★</span>{place.rating.toFixed(1)}<span className="sr-only"> trên 5 sao</span></span>
              <Heart saved={saved.has(place.id)} onClick={() => toggleSaved(place.id)} name={place.name} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="truncate text-[15px] font-bold leading-5 text-ink" title={place.name}>{place.name}</h3>
              <p className="truncate text-[12px] text-muted">{[place.category, place.district].filter(Boolean).join(' · ')}</p>
              <p className="line-clamp-2 text-[12px] leading-5 text-muted">{place.description}</p>
              <Link to={`/places/${place.id}`} className="mt-auto pt-1 text-[12px] font-bold text-primary hover:underline">Xem chi tiết <span aria-hidden="true">→</span><span className="sr-only"> về {place.name}</span></Link>
            </div>
          </article>)}
        </div>
        {show < filtered.length && <div className="text-center"><button type="button" onClick={() => setShow(value => value + PAGE_SIZE)} className="min-h-11 rounded-button border border-line bg-surface px-6 text-[13px] font-bold text-primary hover:border-primary">Tải thêm địa điểm</button></div>}
        {show < filtered.length && <p className="text-center text-[11px] text-muted">Đang hiển thị {visible.length} / {filtered.length} địa điểm</p>}
      </>}
    </div>
  </PublicLayout>;
}
