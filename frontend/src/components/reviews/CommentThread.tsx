import type {ReactNode} from 'react';
import type {Comment} from '../../types/domain';
import { useApp } from '../../state/AppContext';
import { commentDepth } from '../../state/selectors';
import { quietActionClass, EmptyState } from '../common/WorkspaceUI';
import { useState } from 'react';

export default function CommentThread({ reviewId, manage = false, admin = false, onReply, onNotice, levelFilter = '' }: {reviewId: string; manage?: boolean; admin?: boolean; onReply?: (comment: Comment) => void; onNotice?: (notice: string) => void; levelFilter?: string}) {
  const { data, role, actorId, confirm, execute } = useApp();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const comments = data.comments.filter(comment => comment.reviewId === reviewId);
  function remove(comment: Comment) { confirm({ title: admin ? 'Xóa bình luận?' : 'Xóa bình luận?', message: 'Bình luận và tất cả phản hồi bên dưới sẽ bị xóa vĩnh viễn.', onConfirm: async () => onNotice?.((await execute({ type: 'DELETE_COMMENT', id: comment.id })).message) }); }
  function branch(parentId: string | null = null): ReactNode {
    return comments.filter(comment => comment.parentId === parentId).map(comment => {
      const level = commentDepth(comments, comment.id);
      const show = !levelFilter || level === Number(levelFilter);
      return <div key={comment.id} className="contents">{show && <article data-comment-id={comment.id} data-comment-level={level} className="min-h-[70px] w-full rounded-card bg-surface px-4 pb-3 pt-[14px]">
        <p className="break-words text-[15px] leading-[18px] text-muted">{level > 1 && <span aria-hidden="true">{level === 2 ? '\u00a0\u00a0\u00a0\u00a0↳ ' : '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0↳ '}</span>}Cấp {level}: {comment.status === 'ACTIVE' ? comment.content : '[Bình luận đã ẩn]'}</p>
        {editing === comment.id && <form onSubmit={async event => { event.preventDefault(); const result = await execute({ type: 'EDIT_COMMENT', id: comment.id, content: draft }); onNotice?.(result.message); if (result.ok) setEditing(null); }} className="mt-3 flex flex-col gap-3"><label className="text-xs">Sửa nội dung bình luận<textarea aria-label="Sửa nội dung bình luận" required maxLength={1000} value={draft} onChange={event => setDraft(event.target.value)} className="mt-2 w-full rounded-button border border-line p-3" /></label><div className="flex gap-3"><button className={quietActionClass}>Lưu bình luận</button><button type="button" onClick={() => setEditing(null)} className={quietActionClass}>Hủy sửa</button></div></form>}
        {manage && <div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-[12px] text-muted">{data.users.find(user => user.id === comment.userId)?.name} · {comment.date}</span>{role !== 'GUEST' && onReply && level < 3 && <button type="button" className={quietActionClass} onClick={() => onReply(comment)}>Trả lời cấp {level + 1}</button>}{level === 3 && <span className="text-[12px] text-muted">Tối đa 3 cấp</span>}{comment.status === 'ACTIVE' && role !== 'GUEST' && comment.userId === actorId && <button type="button" className={quietActionClass} onClick={() => {setDraft(comment.content); setEditing(comment.id);}}>Sửa bình luận</button>}{comment.status === 'ACTIVE' && role !== 'GUEST' && (comment.userId === actorId || (admin && role === 'ADMIN')) && <button type="button" className={quietActionClass} onClick={() => remove(comment)}>Xóa bình luận</button>}</div>}
      </article>}{branch(comment.id)}</div>;
    });
  }
  return comments.some(comment => !levelFilter || commentDepth(comments, comment.id) === Number(levelFilter)) ? <>{branch()}</> : <EmptyState>Chưa có bình luận phù hợp.</EmptyState>;
}
