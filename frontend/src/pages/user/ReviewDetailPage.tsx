import type {FormEvent} from 'react';
import type {Comment} from '../../types/domain';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { WirePanel, WorkspaceNavigation, fieldClass, actionClass, quietActionClass } from '../../components/common/WorkspaceUI';
import CommentThread from '../../components/reviews/CommentThread';
import SystemPage from '../SystemPage';

export default function ReviewDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const { data, role, actorId, execute } = useApp();
  const review = data.reviews.find(item => item.id === id && item.status === 'ACTIVE');
  const [manage, setManage] = useState(false);
  const [parent, setParent] = useState<Comment | null>(null);
  const [content, setContent] = useState('');
  const [notice, setNotice] = useState(state?.notice || '');
  if (!review) return <SystemPage code="404" message="Review không tồn tại hoặc đã bị xóa." />;
  const place = data.places.find(item => item.id === review.placeId);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = await execute({ type: 'ADD_COMMENT', reviewId: review!.id, parentId: parent?.id, content }); setNotice(result.message); if (result.ok) { setContent(''); setParent(null); } }
  return <SimpleLayout title="Đánh giá và thảo luận" node="2:340">
    <WirePanel label="Nội dung đánh giá và ảnh" open><h2 className="text-[18px] font-bold">{review.title}</h2><p className="text-[13px] text-muted">★ {review.stars} · {data.users.find(user => user.id === review.userId)?.name} · {review.date}</p><p className="whitespace-pre-wrap break-words">{review.content}</p><div className="flex flex-wrap gap-3">{review.images.map((image, index) => <img key={index} src={image.src} alt={image.name || 'Ảnh đánh giá'} className="h-[125px] w-[200px] max-w-full rounded-card object-cover" />)}</div><div className="flex flex-wrap gap-4"><Link to={`/places/${review.placeId}`} className="text-primary underline">{place?.name || 'Xem địa điểm'}</Link>{review.userId === actorId && role !== 'GUEST' && <Link to={`/reviews/${review.id}/edit`} className="text-primary underline">Sửa đánh giá</Link>}</div></WirePanel>
    <WirePanel key={`composer-${manage}`} label="Bình luận cấp 1 → 2 → 3" height={140} open={manage}>
      {role === 'GUEST' ? <p>Đăng nhập để viết bình luận.</p> : <form onSubmit={submit} className="flex flex-col items-start gap-3">{parent && <div className="flex flex-wrap items-center gap-3"><p className="text-[13px]">Đang trả lời: {parent.status === 'ACTIVE' ? parent.content : '[Bình luận đã ẩn]'}</p><button type="button" className="text-primary underline" onClick={() => setParent(null)}>Hủy trả lời</button></div>}<label htmlFor="new-comment" className="text-[13px]">Nội dung bình luận</label><textarea id="new-comment" required maxLength={1000} value={content} onChange={event => setContent(event.target.value)} rows={3} className={fieldClass} /><button className={quietActionClass}>Gửi bình luận</button></form>}
    </WirePanel>
    <CommentThread reviewId={review.id} manage={manage} onReply={comment => { setParent(comment); setManage(true); document.getElementById('new-comment')?.focus(); }} onNotice={setNotice} />
    <button type="button" className={actionClass} onClick={() => { setManage(!manage); if (role === 'GUEST') setNotice('Đăng nhập để bình luận.'); }}>Trả lời · Xóa nội dung</button>
    <p role="status" aria-live="polite" className="text-[13px] text-primary">{notice}</p><WorkspaceNavigation />
  </SimpleLayout>;
}
