import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { WirePanel, StatusPanel, Field, fieldClass, Pagination } from '../../components/common/WorkspaceUI';
import ReviewRows from '../../components/reviews/ReviewRows';

export default function CommunityReviewsPage() {
  const { data, activePlaces } = useApp();
  const [place, setPlace] = useState('');
  const [page, setPage] = useState(1);
  const reviews = data.reviews.filter(review => review.status === 'ACTIVE' && (!place || review.placeId === place) && activePlaces.some(item => item.id === review.placeId));
  const total = Math.max(1, Math.ceil(reviews.length / 6));
  const currentPage = Math.min(page, total);
  return <SimpleLayout title="Đánh giá cộng đồng" node="2:316"><WirePanel label="Lọc theo địa điểm"><Field label="Địa điểm có review">{id => <select id={id} className={fieldClass} value={place} onChange={event => { setPlace(event.target.value); setPage(1); }}><option value="">Tất cả địa điểm</option>{activePlaces.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}</Field></WirePanel><WirePanel label="Danh sách đánh giá ACTIVE" height={140} open><ReviewRows reviews={reviews.slice((currentPage - 1) * 6, currentPage * 6)} /><Pagination page={currentPage} total={total} onChange={setPage} /></WirePanel><StatusPanel notice="Đánh giá từ cộng đồng TravelTaste." /></SimpleLayout>;
}
