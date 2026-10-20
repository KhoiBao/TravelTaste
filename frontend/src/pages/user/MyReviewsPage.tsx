import { useState } from 'react';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { useApp } from '../../state/AppContext';
import { WirePanel, StatusPanel, WorkspaceNavigation, Field, fieldClass, actionClass, Pagination } from '../../components/common/WorkspaceUI';
import ReviewRows from '../../components/reviews/ReviewRows';

export default function MyReviewsPage() {
  const { data, actorId } = useApp();
  const [filters, setFilters] = useState({ from: '', to: '', stars: '', status: 'ACTIVE' });
  const [page, setPage] = useState(1);
  const [manage, setManage] = useState(false);
  const [notice, setNotice] = useState('');
  function change(name: keyof typeof filters, value: string) { setFilters({ ...filters, [name]: value }); setPage(1); }
  const reviews = data.reviews.filter(review => review.userId === actorId && (!filters.stars || review.stars === Number(filters.stars)) && (!filters.status || review.status === filters.status) && (!filters.from || review.date >= filters.from) && (!filters.to || review.date <= filters.to));
  const total = Math.max(1, Math.ceil(reviews.length / 6));
  const currentPage = Math.min(page, total);
  return <SimpleLayout title="Đánh giá của tôi" node="2:316">
    <WirePanel label="Lọc theo ngày và số sao"><div className="grid gap-4 tablet:grid-cols-2"><Field label="Từ ngày" type="date" value={filters.from} onChange={event => change('from', event.target.value)} /><Field label="Đến ngày" type="date" value={filters.to} min={filters.from} onChange={event => change('to', event.target.value)} /><Field label="Số sao">{id => <select id={id} className={fieldClass} value={filters.stars} onChange={event => change('stars', event.target.value)}><option value="">Tất cả</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} sao</option>)}</select>}</Field><Field label="Trạng thái review">{id => <select id={id} className={fieldClass} value={filters.status} onChange={event => change('status', event.target.value)}><option value="">Tất cả</option><option>ACTIVE</option></select>}</Field></div></WirePanel>
    <WirePanel key={`list-${manage}`} label="Danh sách review hiện có" height={140} open={manage}><ReviewRows reviews={reviews.slice((currentPage - 1) * 6, currentPage * 6)} manage={manage} onNotice={setNotice} /><Pagination page={currentPage} total={total} onChange={setPage} /></WirePanel>
    <StatusPanel notice={notice} />
    <button className={actionClass} onClick={() => { setManage(!manage); setNotice(manage ? '' : 'Chọn Sửa hoặc Xóa trên bài đánh giá của bạn.'); }}>{manage ? 'Đóng thao tác' : 'Sửa · Xóa'}</button>
    <WorkspaceNavigation />
  </SimpleLayout>;
}
