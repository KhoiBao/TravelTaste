import type {Review} from '../../types/domain';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { RowCard, EmptyState, quietActionClass } from '../common/WorkspaceUI';

export default function ReviewRows({ reviews, manage = false, admin = false, onNotice }: {reviews: Review[]; manage?: boolean; admin?: boolean; onNotice?: (notice: string) => void}) {
  const { data, actorId, role, execute, confirm } = useApp();
  function remove(review: Review) { confirm({ title: 'Xóa đánh giá?', message: 'Đánh giá và toàn bộ bình luận sẽ bị xóa vĩnh viễn. Điểm sao được máy chủ tính lại.', onConfirm: async () => onNotice?.((await execute({ type: 'DELETE_REVIEW', id: review.id })).message) }); }
  return reviews.length ? <div>{reviews.map(review => <RowCard key={review.id} title={review.title} status={review.status} subtitle={`${data.places.find(place => place.id === review.placeId)?.name || 'Địa điểm đã xóa'} · ★ ${review.stars} · ${review.date} · ${data.users.find(user => user.id === review.userId)?.name || 'Thành viên'}`}>
    {review.status === 'ACTIVE' && <Link to={`/reviews/${review.id}`} className={quietActionClass}>Xem</Link>}
    {manage && review.status === 'ACTIVE' && <>{review.userId === actorId && <Link to={`/reviews/${review.id}/edit`} className={quietActionClass}>Sửa</Link>}{(review.userId === actorId || (admin && role === 'ADMIN')) && <button className={quietActionClass} onClick={() => remove(review)}>Xóa</button>}</>}
  </RowCard>)}</div> : <EmptyState>Không có review phù hợp.</EmptyState>;
}
