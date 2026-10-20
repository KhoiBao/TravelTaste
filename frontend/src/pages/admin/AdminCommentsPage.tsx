import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { WirePanel, WorkspaceNavigation, Field, fieldClass, actionClass } from '../../components/common/WorkspaceUI';
import CommentThread from '../../components/reviews/CommentThread';

export default function AdminCommentsPage() {
  const { data } = useApp();
  const [reviewId, setReviewId] = useState('');
  const [level, setLevel] = useState('');
  const [manage, setManage] = useState(false);
  const [notice, setNotice] = useState('');
  return <SimpleLayout title="Kiểm duyệt bình luận" node="2:416"><WirePanel label="Review cha · Cấp bình luận"><div className="grid gap-4 tablet:grid-cols-2"><Field label="Review cha">{id => <select id={id} className={fieldClass} value={reviewId || data.reviews[0]?.id || ''} onChange={event => setReviewId(event.target.value)}>{data.reviews.map(review => <option key={review.id} value={review.id}>{review.title} ({review.status})</option>)}</select>}</Field><Field label="Cấp bình luận">{id => <select id={id} className={fieldClass} value={level} onChange={event => setLevel(event.target.value)}><option value="">Tất cả</option>{[1, 2, 3].map(value => <option key={value} value={value}>Cấp {value}</option>)}</select>}</Field></div></WirePanel><WirePanel label="Xóa bình luận" height={140}><p>Xóa bình luận cũng xóa toàn bộ phản hồi bên dưới.</p><Link to={`/reviews/${reviewId || data.reviews[0]?.id || ''}`} className="text-primary underline">Xem review cha</Link></WirePanel><CommentThread reviewId={reviewId || data.reviews[0]?.id || ''} levelFilter={level} manage={manage} admin onNotice={setNotice} /><button className={actionClass} onClick={() => setManage(!manage)}>Xem · Xóa nội dung</button><p role="status" className="text-[13px] text-primary">{notice}</p><WorkspaceNavigation admin /></SimpleLayout>;
}
