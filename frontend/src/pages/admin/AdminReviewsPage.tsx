import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { WirePanel, StatusPanel, WorkspaceNavigation, Field, fieldClass, actionClass, Pagination } from '../../components/common/WorkspaceUI';
import ReviewRows from '../../components/reviews/ReviewRows';

// Shared Figma template, explicitly authorized after MCP limit blocked 2:404.
export default function AdminReviewsPage() {
  const { data } = useApp();
  const [status, setStatus] = useState('ACTIVE');
  const [stars, setStars] = useState('');
  const [page, setPage] = useState(1);
  const [manage, setManage] = useState(false);
  const [notice, setNotice] = useState('');
  const reviews = data.reviews.filter(review => (!status || review.status === status) && (!stars || review.stars === Number(stars)));
  const total = Math.max(1, Math.ceil(reviews.length / 6));
  const currentPage = Math.min(page, total);
  return <SimpleLayout title="Kiểm duyệt đánh giá" node="2:404"><WirePanel label="Lọc trạng thái và số sao"><div className="grid gap-4 tablet:grid-cols-2"><Field label="Trạng thái kiểm duyệt">{id => <select id={id} className={fieldClass} value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Tất cả</option><option>ACTIVE</option></select>}</Field><Field label="Lọc số sao">{id => <select id={id} className={fieldClass} value={stars} onChange={event => { setStars(event.target.value); setPage(1); }}><option value="">Tất cả</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} sao</option>)}</select>}</Field></div></WirePanel><WirePanel key={`moderation-${manage}`} label="Review · Chủ sở hữu · Địa điểm" height={140} open={manage}><ReviewRows reviews={reviews.slice((currentPage - 1) * 6, currentPage * 6)} manage={manage} admin onNotice={setNotice} /><Pagination page={currentPage} total={total} onChange={setPage} /></WirePanel><StatusPanel notice={notice} /><button className={actionClass} onClick={() => setManage(!manage)}>Xem · Xóa</button><WorkspaceNavigation admin /></SimpleLayout>;
}
