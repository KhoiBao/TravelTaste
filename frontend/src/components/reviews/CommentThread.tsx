import type {ReactNode} from 'react';
import type {Comment} from '../../types/domain';
import {useApp} from '../../state/AppContext';
import {commentDepth} from '../../state/selectors';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export default function CommentThread({reviewId, manage = true, onNotice, levelFilter = '', sort = 'oldest'}: {reviewId: string; manage?: boolean; admin?: boolean; onNotice?: (notice: string) => void; levelFilter?: string; sort?: 'newest' | 'oldest'}) {
  const {data, role, actorId, confirm, execute} = useApp();
  const navigate = useNavigate();
  const [liking, setLiking] = useState<Set<string>>(new Set());
  async function like(comment: Comment) {
    if (role === 'GUEST') {navigate('/login'); return;}
    if (liking.has(comment.id)) return;
    setLiking(old => new Set(old).add(comment.id));
    try {const result = await execute({type: 'LIKE_COMMENT', id: comment.id, liked: !comment.liked}); if (!result.ok) onNotice?.(result.message);}
    finally {setLiking(old => {const next = new Set(old); next.delete(comment.id); return next;});}
  }
  const [saving, setSaving] = useState(false);
  const [replying, setReplying] = useState<string | null>(null), [replyDraft, setReplyDraft] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set()), [expanded, setExpanded] = useState<Set<string>>(new Set());
  const comments = data.comments.filter(c => c.reviewId === reviewId);
  const review = data.reviews.find(r => r.id === reviewId);
  function toggle(set: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) {set(old => {const next = new Set(old); next.has(id) ? next.delete(id) : next.add(id); return next;});}
  function remove(comment: Comment) {confirm({title: 'Xóa bình luận?', message: 'Bình luận và tất cả phản hồi bên dưới sẽ bị xóa vĩnh viễn.', onConfirm: async () => onNotice?.((await execute({type: 'DELETE_COMMENT', id: comment.id})).message)});}
  function branch(parentId: string | null = null): ReactNode {
    return comments.filter(c => c.parentId === parentId).sort((a,b) => sort === 'newest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)).map(comment => {
      const level = commentDepth(comments, comment.id), author = data.users.find(u => u.id === comment.userId);
      const name = author?.name || 'Thành viên', children = comments.filter(c => c.parentId === comment.id);
      const parent = comments.find(c => c.id === comment.parentId), parentName = data.users.find(u => u.id === parent?.userId)?.name;
      const show = !levelFilter || level === Number(levelFilter);
      const long = comment.content.length > 300, full = expanded.has(comment.id);
      return <li key={comment.id} className="min-w-0 list-none">
        {show && <article data-comment-id={comment.id} data-comment-level={level} className="group flex min-w-0 gap-2.5 py-3 tablet:gap-3">
          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-pale text-xs font-bold text-primary tablet:h-10 tablet:w-10" aria-hidden="true">{author?.avatar ? <img src={author.avatar} alt="" className="h-full w-full object-cover" /> : name.split(' ').filter(Boolean).slice(-2).map(s => s[0]).join('').toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"><span className="font-bold text-ink tablet:text-sm">{name}</span>{comment.userId === review?.userId && <span className="rounded bg-pale px-1.5 py-0.5 text-[10px] font-bold text-primary">Tác giả</span>}<span aria-hidden="true" className="text-muted">·</span><time dateTime={comment.date} className="text-[11px] text-muted">{comment.date ? new Intl.DateTimeFormat('vi-VN', {day: 'numeric', month: 'short', year: 'numeric'}).format(new Date(comment.date)) : ''}</time></div>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-ink [overflow-wrap:anywhere]">{parentName && <span className="mr-1 font-semibold text-primary">{parentName}</span>}{long && !full ? comment.content.slice(0, 300) + '…' : comment.content}{long && <button onClick={() => toggle(setExpanded, comment.id)} className="ml-1 font-bold text-muted hover:text-primary">{full ? 'Thu gọn' : 'Xem thêm'}</button>}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-muted">
              <button type="button" aria-label={comment.liked ? 'Bỏ thích bình luận' : 'Thích bình luận'} aria-pressed={comment.liked} disabled={liking.has(comment.id)} onClick={() => void like(comment)} title={role === 'GUEST' ? 'Đăng nhập để thích bình luận' : comment.liked ? 'Bỏ thích' : 'Thích'} className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-1 transition-colors hover:bg-pale hover:text-primary disabled:opacity-50 ${comment.liked ? 'text-primary' : 'text-muted'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill={comment.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 10v11H3V10h4Zm0 0 4-8c3 0 3 3 2 7h5a3 3 0 0 1 3 3l-2 7a3 3 0 0 1-3 2H7" /></svg><span aria-label={`${comment.likeCount} lượt thích`}>{comment.likeCount}</span></button>
              {manage && role !== 'GUEST' && level < 3 && <button type="button" onClick={() => {setReplying(comment.id); setReplyDraft('');}} className="py-1 hover:text-primary">Trả lời</button>}
              {manage && role !== 'GUEST' && (role === 'ADMIN' || comment.userId === actorId) && <button type="button" onClick={() => remove(comment)} className="py-1 hover:text-red-700">Xóa</button>}
            </div>
            {replying === comment.id && <form className="mt-3 space-y-2" onSubmit={async event => {event.preventDefault(); if (saving || !replyDraft.trim()) return; setSaving(true); try {const result = await execute({type: 'ADD_COMMENT', reviewId, parentId: comment.id, content: replyDraft.trim()}); onNotice?.(result.message); if (result.ok) {setReplying(null); setReplyDraft(''); setCollapsed(old => {const next = new Set(old); next.delete(comment.id); return next;});}} finally {setSaving(false);}}}><label className="text-xs text-muted" htmlFor={'reply-' + comment.id}>Trả lời {name}</label><textarea id={'reply-' + comment.id} autoFocus aria-label={'Trả lời ' + name} required maxLength={1000} rows={2} disabled={saving} value={replyDraft} onChange={e => setReplyDraft(e.target.value)} placeholder="Viết phản hồi…" className="w-full rounded-xl border border-line bg-canvas p-3 text-sm" /><div className="flex gap-3 text-xs font-bold"><button disabled={saving || !replyDraft.trim()} className="rounded-full bg-primary px-4 py-2 text-white disabled:opacity-50">{saving ? 'Đang gửi…' : 'Gửi phản hồi'}</button><button type="button" disabled={saving} onClick={() => setReplying(null)} className="text-muted">Hủy</button></div></form>}
          </div>
        </article>}
        {children.length > 0 && <div className={show ? 'ml-4 border-l border-line pl-4 tablet:ml-5 tablet:pl-6' : ''}>
          {(!collapsed.has(comment.id) || !!levelFilter) && <ul className="relative space-y-0 [&>li]:relative [&>li]:before:absolute [&>li]:before:-left-4 [&>li]:before:top-7 [&>li]:before:h-3 [&>li]:before:w-3 [&>li]:before:rounded-bl-lg [&>li]:before:border-b [&>li]:before:border-line tablet:[&>li]:before:-left-6 tablet:[&>li]:before:w-5">{branch(comment.id)}</ul>}
          {!levelFilter && <button type="button" aria-expanded={!collapsed.has(comment.id)} onClick={() => toggle(setCollapsed, comment.id)} className="my-2 flex min-h-8 items-center gap-2 text-xs font-bold text-primary hover:underline"><span aria-hidden="true">{collapsed.has(comment.id) ? '↳' : '−'}</span>{collapsed.has(comment.id) ? `Xem ${children.length} phản hồi` : 'Ẩn phản hồi'}</button>}
        </div>}
      </li>;
    });
  }
  return comments.some(c => !levelFilter || commentDepth(comments, c.id) === Number(levelFilter)) ? <ul className="space-y-3" aria-label="Danh sách bình luận">{branch()}</ul> : <p className="rounded-xl bg-canvas px-4 py-8 text-center text-sm text-muted">Chưa có bình luận. Hãy bắt đầu cuộc trò chuyện.</p>;
}

