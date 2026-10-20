import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { useApp } from '../../state/AppContext';
import placeholder from '../../assets/images/placeholder.svg';
import type { Review } from '../../types/domain';

const PAGE_SIZE = 5;

function compact(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(value);
}

function initials(name?: string) {
  return (name || 'TV').split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase();
}

function Stars({ value }: { value: number }) {
  return <span className="flex items-center gap-[3px]" aria-label={`${value} trên 5 sao`}>{[1, 2, 3, 4, 5].map(star => <svg key={star} viewBox="0 0 20 20" aria-hidden="true" className={`h-[15px] w-[15px] ${star <= Math.round(value) ? 'text-[#f4b740]' : 'text-line'}`} fill="currentColor"><path d="M10 1.7l2.5 5.1 5.6.8-4.1 4 1 5.6L10 14.5l-5 2.7 1-5.6-4.1-4 5.6-.8z" /></svg>)}</span>;
}

function PinIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.6" /></svg>;
}

function CommentIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.8 9.8 0 0 1-3.9-.8L3 21l1.9-4.7A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /></svg>;
}

function FunnelIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8v6l-4 2v-8Z" /></svg>;
}

function Stat({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-primary shadow-[0_2px_10px_rgba(6,47,43,0.06)]">{icon}</span><div><dt className="text-[20px] font-bold leading-tight text-ink">{value}</dt><dd className="text-[11px] text-muted">{label}</dd></div></div>;
}

export default function CommunityReviewsPage() {
  const { data, activePlaces } = useApp();
  const [draft, setDraft] = useState({ q: '', category: '', district: '', sort: 'newest' });
  const [applied, setApplied] = useState(draft);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');

  const places = new Map(activePlaces.map(place => [place.id, place]));
  const users = new Map(data.users.map(user => [user.id, user]));
  const comments = new Map<string, number>();
  data.comments.forEach(comment => { if (comment.status === 'ACTIVE') comments.set(comment.reviewId, (comments.get(comment.reviewId) || 0) + 1); });

  const activeReviews = data.reviews.filter(review => review.status === 'ACTIVE' && places.has(review.placeId));
  const average = activeReviews.length ? activeReviews.reduce((sum, review) => sum + review.stars, 0) / activeReviews.length : 0;
  const reviewedPlaces = new Set(activeReviews.map(review => review.placeId)).size;
  const districts = [...new Set(activePlaces.map(place => place.district).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi'));

  const collage = [...activeReviews.flatMap(review => review.images.map(image => image.src)), ...activePlaces.map(place => place.image)].filter(src => src && src !== placeholder).slice(0, 3);

  const needle = applied.q.trim().toLowerCase();
  const filtered = activeReviews.filter(review => {
    const place = places.get(review.placeId);
    if (!place) return false;
    if (applied.category && place.categoryId !== applied.category) return false;
    if (applied.district && place.district !== applied.district) return false;
    if (!needle) return true;
    return [review.title, review.content, place.name, place.city, place.district, place.category].some(value => value?.toLowerCase().includes(needle));
  }).sort((a, b) => applied.sort === 'rating' ? b.stars - a.stars : applied.sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const shown = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = Boolean(applied.q || applied.category || applied.district);

  function filter(event: FormEvent) {
    event.preventDefault();
    setApplied(draft);
    setPage(1);
  }
  function reset() {
    const cleared = { q: '', category: '', district: '', sort: 'newest' };
    setDraft(cleared); setApplied(cleared); setPage(1);
  }

  function card(review: Review) {
    const place = places.get(review.placeId);
    const author = users.get(review.userId);
    const image = review.images?.[0]?.src || place?.image || placeholder;
    const commentCount = comments.get(review.id) || 0;
    return <article key={review.id} className="rounded-xl border border-line bg-surface p-3 transition hover:border-primary/40 tablet:p-4">
      <div className={view === 'list' ? 'flex flex-col gap-3 tablet:flex-row' : 'flex flex-col gap-3'}>
        <Link to={`/reviews/${review.id}`} tabIndex={-1} aria-hidden="true" className={`shrink-0 overflow-hidden rounded-lg ${view === 'list' ? 'tablet:w-[162px]' : ''}`}>
          <img src={image} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = placeholder; }} alt="" loading="lazy" className={`w-full object-cover ${view === 'list' ? 'h-[160px] tablet:h-[120px]' : 'h-[170px]'}`} />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-bold leading-snug"><Link to={`/reviews/${review.id}`} className="hover:text-primary hover:underline">{review.title}</Link></h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted"><PinIcon className="h-3.5 w-3.5 shrink-0" /><Link to={`/places/${review.placeId}`} className="hover:text-primary hover:underline">{place?.name || 'Địa điểm đã xóa'}</Link><span aria-hidden="true">|</span><span>{place?.district || place?.city}</span></p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted"><Stars value={review.stars} /><strong className="text-[13px] text-rank-gold">{review.stars.toFixed(1)}</strong><span aria-hidden="true">•</span><time dateTime={review.date} className="whitespace-nowrap">{review.date}</time><span aria-hidden="true">•</span><span className="flex items-center gap-1.5 whitespace-nowrap"><span className="flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full bg-pale text-[9px] font-bold text-primary" aria-hidden="true">{author?.avatar ? <img src={author.avatar} alt="" loading="lazy" className="h-full w-full object-cover" /> : initials(author?.name)}</span>{author?.name || 'Thành viên'}</span></div>
          <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted">{review.content}</p>
          <span className="mt-3 inline-block rounded-pill bg-pale px-2.5 py-1 text-[10px] font-bold tracking-wide text-primary">ACTIVE</span>
        </div>
        <div className={`flex shrink-0 items-center justify-between gap-3 border-t border-line pt-3 text-muted tablet:border-l tablet:border-t-0 tablet:pl-4 tablet:pt-0 ${view === 'list' ? 'tablet:w-[150px] tablet:flex-col tablet:items-end tablet:justify-center tablet:gap-4' : ''}`}>
          <p className="flex items-center gap-1.5 text-[12px]" aria-label={`${commentCount} bình luận`}><CommentIcon />{commentCount}</p>
          <Link to={`/reviews/${review.id}`} className="inline-flex min-h-9 items-center rounded-pill bg-pale px-4 py-2 text-[12px] font-bold text-primary hover:brightness-95">Xem chi tiết <span aria-hidden="true" className="ml-1.5">→</span></Link>
        </div>
      </div>
    </article>;
  }

  return <PublicLayout>
    <section aria-labelledby="community-title" className="relative w-full overflow-hidden rounded-[24px] bg-[#eaf5f1] px-6 py-7 tablet:px-9 desktop:flex desktop:items-center desktop:justify-between desktop:gap-10 desktop:py-8">
      <svg aria-hidden="true" className="pointer-events-none absolute -left-2 top-8 h-10 w-10 text-primary/20" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 30c6-14 16-20 28-22M24 6l10 6-4 11" /></svg>
      <div className="relative">
        <h1 id="community-title" className="text-[28px] font-bold leading-tight tablet:text-[36px]">Đánh giá cộng đồng</h1>
        <p className="mt-2 text-[13px] text-muted tablet:text-sm">Khám phá trải nghiệm thực tế từ cộng đồng TravelTaste</p>
        <dl className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 tablet:gap-x-10">
          <Stat icon={<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-[#f4b740]" fill="currentColor"><path d="M12 2.5l3 6.1 6.7 1-4.9 4.7 1.2 6.7-6-3.2-6 3.2 1.2-6.7L2.3 9.6l6.7-1z" /></svg>} value={average.toFixed(1)} label="Đánh giá trung bình" />
          <Stat icon={<svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></svg>} value={compact(activeReviews.length)} label="Lượt đánh giá" />
          <Stat icon={<PinIcon className="h-5 w-5" />} value={compact(reviewedPlaces)} label="Địa điểm được đánh giá" />
        </dl>
      </div>
      <div className="relative hidden h-[170px] w-[430px] shrink-0 items-center justify-center desktop:flex" aria-hidden="true">
        <span className="absolute left-1 top-2 h-4 w-4 rounded-full bg-primary/15" />
        <span className="absolute bottom-2 right-2 h-6 w-6 rounded-full border-2 border-primary/20" />
        {collage.map((src, index) => <img key={src} src={src} onError={event => { event.currentTarget.style.display = 'none'; }} alt="" className={`h-[122px] w-[158px] rounded-[12px] border-[5px] border-white object-cover shadow-[0_10px_24px_rgba(6,47,43,0.18)] ${index === 0 ? 'z-10 -rotate-6' : index === 1 ? 'z-20 -ml-5 rotate-2' : 'z-10 -ml-5 rotate-6'}`} />)}
      </div>
    </section>

    <section aria-label="Lọc theo địa điểm" className="w-full rounded-2xl border border-line bg-surface p-4 tablet:p-5">
      <form onSubmit={filter} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-[15px] font-bold"><FunnelIcon />Lọc theo địa điểm</p>
          {hasFilters && <button type="button" onClick={reset} className="text-[12px] font-bold text-primary underline">Đặt lại bộ lọc</button>}
        </div>
        <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.9fr))_auto] desktop:items-center">
          <div className="relative min-w-0">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input type="search" aria-label="Tìm kiếm địa điểm, món ăn, quận huyện" placeholder="Tìm kiếm địa điểm, món ăn, quận/huyện..." value={draft.q} onChange={event => setDraft(current => ({ ...current, q: event.target.value }))} className="min-h-11 w-full rounded-[10px] border border-line bg-surface pl-10 pr-3 text-[13px] text-ink placeholder:text-muted" />
          </div>
          <select aria-label="Tất cả danh mục" value={draft.category} onChange={event => setDraft(current => ({ ...current, category: event.target.value }))} className="min-h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-[13px] text-ink"><option value="">Tất cả danh mục</option>{data.categories.filter(category => category.status === 'ACTIVE').map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          <select aria-label="Tất cả quận huyện" value={draft.district} onChange={event => setDraft(current => ({ ...current, district: event.target.value }))} className="min-h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-[13px] text-ink"><option value="">Tất cả quận/huyện</option>{districts.map(district => <option key={district}>{district}</option>)}</select>
          <select aria-label="Sắp xếp đánh giá" value={draft.sort} onChange={event => setDraft(current => ({ ...current, sort: event.target.value }))} className="min-h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-[13px] text-ink"><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="rating">Điểm cao nhất</option></select>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-primary px-6 py-3 text-sm font-bold text-white hover:brightness-95"><FunnelIcon />Lọc</button>
        </div>
      </form>
    </section>

    <section aria-label="Danh sách đánh giá" className="w-full rounded-2xl border border-line bg-surface p-4 tablet:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" aria-expanded={open} aria-controls="community-review-results" aria-label={open ? 'Thu gọn danh sách đánh giá' : 'Mở rộng danh sách đánh giá'} onClick={() => setOpen(value => !value)} className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-pale"><svg viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? '' : '-rotate-90'}`} fill="currentColor"><path d="M7 9.5h10L12 16z" /></svg></button>
          <h2 className="text-[18px] font-bold">Danh sách đánh giá</h2>
          <span className="rounded-pill bg-pale px-2.5 py-1 text-[10px] font-bold tracking-wide text-primary">ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <p role="status" className="text-[12px] text-muted">Hiện thị {shown.length} đánh giá</p>
          <div role="group" aria-label="Kiểu hiển thị" className="flex items-center gap-1 rounded-[10px] bg-canvas p-1">
            <button type="button" aria-pressed={view === 'list'} aria-label="Xem dạng danh sách" onClick={() => setView('list')} className={`flex h-8 w-8 items-center justify-center rounded-md ${view === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-primary'}`}><svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg></button>
            <button type="button" aria-pressed={view === 'grid'} aria-label="Xem dạng lưới" onClick={() => setView('grid')} className={`flex h-8 w-8 items-center justify-center rounded-md ${view === 'grid' ? 'bg-primary text-white' : 'text-muted hover:text-primary'}`}><svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg></button>
          </div>
        </div>
      </div>
      <div id="community-review-results" hidden={!open}>
        {shown.length ? <div className={view === 'list' ? 'mt-4 flex flex-col gap-3' : 'mt-4 grid gap-3 tablet:grid-cols-2'}>{shown.map(card)}</div> : <p role="status" className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">Không tìm thấy đánh giá phù hợp.</p>}
        {open && totalPages > 1 && <nav aria-label="Phân trang đánh giá" className="mt-5 flex items-center justify-center gap-1.5 text-[13px]">
          <button type="button" aria-label="Trang trước" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-pale disabled:opacity-40">‹</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`Trang ${number}`} aria-current={number === currentPage ? 'page' : undefined} onClick={() => setPage(number)} className={`h-9 min-w-9 rounded-full px-2 ${number === currentPage ? 'bg-primary font-bold text-white' : 'text-muted hover:bg-pale hover:text-primary'}`}>{number}</button>)}
          <button type="button" aria-label="Trang sau" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-pale disabled:opacity-40">›</button>
        </nav>}
      </div>
    </section>
  </PublicLayout>;
}
