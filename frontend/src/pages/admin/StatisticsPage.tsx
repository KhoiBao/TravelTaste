import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { aggregateReviews } from '../../state/selectors';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { WirePanel, StatusPanel, WorkspaceNavigation, Field, actionClass, quietActionClass, EmptyState } from '../../components/common/WorkspaceUI';

export default function StatisticsPage() {
  const { data, activePlaces } = useApp();
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState({ from: '', to: '' });
  const [range, setRange] = useState(draft);
  const reviews = data.reviews.filter(review => (!range.from || review.date >= range.from) && (!range.to || review.date <= range.to));
  const stats = aggregateReviews(reviews);
  const top = activePlaces.map(place => ({ ...place, ...aggregateReviews(reviews, place.id) })).filter(place => place.reviewCount).sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 10);
  return <SimpleLayout title="Thống kê và báo cáo" node="2:444"><WirePanel key={`stats-${filterOpen}`} label="ratingAvg · reviewCount" open={filterOpen}>{filterOpen && <form onSubmit={event => { event.preventDefault(); setRange(draft); }} className="flex flex-col items-start gap-4"><div className="grid gap-4 tablet:grid-cols-2"><Field label="Thống kê từ ngày" type="date" value={draft.from} onChange={event => setDraft({ ...draft, from: event.target.value })} /><Field label="Thống kê đến ngày" type="date" min={draft.from} value={draft.to} onChange={event => setDraft({ ...draft, to: event.target.value })} /></div><div className="flex flex-wrap gap-3"><button className={quietActionClass}>Áp dụng khoảng thời gian</button><button type="button" className={quietActionClass} onClick={() => { setDraft({ from: '', to: '' }); setRange({ from: '', to: '' }); }}>Xóa khoảng thời gian</button></div></form>}<p className="text-[18px] font-bold" data-statistics-count={stats.reviewCount}>★ {stats.rating} · {stats.reviewCount} review ACTIVE</p></WirePanel><WirePanel label="Phân bố sao · Top 10" height={140}><div className="flex max-w-[500px] flex-col gap-3">{stats.distribution.map(item => <label key={item.stars} className="flex items-center gap-3 text-[13px]">{item.stars}★<progress aria-label={`${item.stars} sao`} value={item.count} max={Math.max(stats.reviewCount, 1)} className="h-3 min-w-0 flex-1 overflow-hidden rounded-pill [&::-webkit-progress-bar]:bg-canvas [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary" /><span>{item.count}</span></label>)}</div>{top.length ? <ol className="flex flex-col gap-3 text-[14px]">{top.map((place, index) => <li key={place.id}>{index + 1}. {place.name} · ★ {place.rating} · {place.reviewCount} review</li>)}</ol> : <EmptyState>Không có review trong khoảng thời gian này.</EmptyState>}</WirePanel><StatusPanel notice={`${stats.reviewCount} review ACTIVE từ máy chủ${range.from || range.to ? ' theo khoảng thời gian đã chọn' : ''}.`} /><button className={actionClass} onClick={() => setFilterOpen(!filterOpen)}>Lọc khoảng thời gian</button><WorkspaceNavigation admin /></SimpleLayout>;
}
