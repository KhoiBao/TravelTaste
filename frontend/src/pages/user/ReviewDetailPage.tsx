import type {FormEvent} from 'react';
import {useRef, useState} from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import {useApp} from '../../state/AppContext';
import PublicLayout from '../../components/layout/PublicLayout';
import CommentThread from '../../components/reviews/CommentThread';
import SystemPage from '../SystemPage';

function Avatar({name, src}: {name: string; src?: string}) {return <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pale text-xs font-bold text-primary" aria-hidden="true">{src ? <img src={src} alt="" className="h-full w-full object-cover" /> : name.split(' ').filter(Boolean).slice(-2).map(s=>s[0]).join('').toUpperCase() || 'TV'}</span>;}
export default function ReviewDetailPage() {
  const {id} = useParams(), {state} = useLocation();
  const {data, role, actorId, actor, execute} = useApp();
  const review = data.reviews.find(item => item.id === id && item.status === 'ACTIVE');
  const [content,setContent]=useState(''), [busy,setBusy]=useState(false), [notice,setNotice]=useState(state?.notice || ''), [sort,setSort]=useState<'newest'|'oldest'>('newest');
  const composer=useRef<HTMLTextAreaElement>(null);
  if (!review) return <SystemPage code="404" message="Review không tồn tại hoặc đã bị xóa." />;
  const place=data.places.find(p=>p.id===review.placeId), author=data.users.find(u=>u.id===review.userId);
  const count=data.comments.filter(c=>c.reviewId===review.id).length;
  const related=data.reviews.filter(r=>r.placeId===review.placeId && r.status==='ACTIVE').slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  async function submit(event:FormEvent) {event.preventDefault();if(busy || !content.trim())return;setBusy(true);try{const result=await execute({type:'ADD_COMMENT',reviewId:review!.id,content:content.trim()});setNotice(result.message);if(result.ok)setContent('');}finally{setBusy(false);}}
  return <PublicLayout node="2:340">
    <nav aria-label="Đường dẫn" className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted"><Link to="/places" className="hover:text-primary">Địa điểm</Link><span aria-hidden="true">›</span><Link to={`/places/${review.placeId}`} className="hover:text-primary">{place?.name || 'Chi tiết địa điểm'}</Link><span aria-hidden="true">›</span><span>Đánh giá</span></nav>
    <h1 className="text-[28px] font-bold leading-tight tablet:text-4xl">Đánh giá và thảo luận</h1>
    <div className="grid w-full min-w-0 items-start gap-5 desktop:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-4">
        <article className="rounded-2xl border border-line bg-surface p-5 tablet:p-6"><h2 className="break-words text-xl font-bold">{review.title}</h2><p className="mt-1 text-lg font-bold"><span aria-hidden="true" className="mr-2 text-amber-400">★</span>{review.stars}/5</p>
          <div className="mt-4 flex items-start gap-3"><Avatar name={author?.name || 'Thành viên'} src={author?.avatar} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-bold">{author?.name || 'Thành viên'}</span><span aria-hidden="true">·</span><time className="text-muted" dateTime={review.date}>{review.date}</time></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted [overflow-wrap:anywhere]">{review.content}</p></div>{review.userId===actorId && role!=='GUEST' && <Link to={`/reviews/${review.id}/edit`} className="shrink-0 text-xs font-semibold text-primary hover:underline">Sửa đánh giá</Link>}</div>
          {!!review.images.length && <div className="mt-4 grid grid-cols-2 gap-3 tablet:grid-cols-4">{review.images.map((image,i)=><a key={i} href={image.src} target="_blank" rel="noreferrer" aria-label={`Xem ảnh đánh giá ${i+1}`}><img src={image.src} alt={image.name || `Ảnh trải nghiệm ${i+1}`} className="h-28 w-full rounded-lg object-cover transition-opacity hover:opacity-80" /></a>)}</div>}
          <Link to={`/places/${review.placeId}`} className="mt-3 inline-flex items-center gap-2 text-xs text-primary underline"><span aria-hidden="true">⌖</span>{place?.name || 'Xem địa điểm'}</Link>
          <div className="mt-4"><button type="button" onClick={()=>{document.getElementById('comments-heading')?.scrollIntoView({behavior:'smooth',block:'center'});composer.current?.focus({preventScroll:true});}} className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-pale">Phản hồi · {count}</button></div>
        </article>
        <section aria-labelledby="comments-heading" className="rounded-2xl border border-line bg-surface p-5 tablet:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="comments-heading" className="text-lg font-bold">Bình luận <span className="ml-1 rounded-full bg-pale px-2.5 py-1 text-xs text-primary">{count}</span></h2><select aria-label="Sắp xếp bình luận" value={sort} onChange={e=>setSort(e.target.value as 'newest'|'oldest')} className="rounded-full border border-line bg-surface px-3 py-2 text-xs"><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option></select></div>
          {role==='GUEST' ? <p className="mb-5 rounded-xl bg-canvas p-4 text-sm text-muted"><Link to="/login" className="font-bold text-primary hover:underline">Đăng nhập</Link> để tham gia cuộc trò chuyện.</p> : <form onSubmit={submit} className="mb-4 flex items-start gap-3"><Avatar name={actor?.name || 'Thành viên'} src={actor?.avatar} /><div className="min-w-0 flex-1 rounded-xl border border-line bg-canvas p-3"><label htmlFor="new-comment" className="sr-only">Nội dung bình luận</label><textarea ref={composer} id="new-comment" required maxLength={1000} rows={2} placeholder="Chia sẻ suy nghĩ của bạn…" disabled={busy} value={content} onChange={e=>setContent(e.target.value)} className="w-full resize-y border-0 bg-transparent text-sm leading-6 placeholder:text-muted focus:outline-none" /><div className="mt-2 flex flex-wrap items-center justify-end gap-3"><span className="text-xs text-muted">{content.length}/1000</span><button disabled={busy || !content.trim()} className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{busy?'Đang gửi…':'Gửi bình luận'}</button></div></div></form>}
          <CommentThread reviewId={review.id} manage admin={role==='ADMIN'} onNotice={setNotice} sort={sort} />
          {notice && <p role="status" aria-live="polite" className="mt-4 text-xs text-primary">{notice}</p>}
        </section>
      </div>
      <aside aria-label="Thông tin liên quan" className="min-w-0 space-y-4">
        {place && <section className="rounded-2xl border border-line bg-surface p-5"><h2 className="mb-3 font-bold">Thông tin địa điểm</h2><Link to={`/places/${place.id}`}><img src={place.image} alt={place.name} className="h-36 w-full rounded-lg object-cover" /><h3 className="mt-4 text-lg font-bold hover:text-primary">{place.name} <span aria-hidden="true">›</span></h3></Link><p className="mt-2 text-xs text-muted">⌖ {place.city || place.address}</p><p className="mt-2 text-xs"><span aria-hidden="true" className="mr-2 text-lg text-amber-400">★</span><strong>{place.rating.toFixed(1)}</strong><span className="text-muted"> · {place.reviewCount} đánh giá</span></p><Link to={`/places/${place.id}`} className="mt-3 block rounded-button bg-pale px-3 py-3 text-center text-xs font-bold text-primary">Xem chi tiết địa điểm</Link></section>}
        <section className="rounded-2xl border border-line bg-surface p-2"><h2 className="px-3 py-3 font-bold">Các đánh giá liên quan</h2><ul>{related.map(r=><li key={r.id}><Link to={`/reviews/${r.id}`} aria-current={r.id===review.id?'page':undefined} className={`flex gap-3 rounded-lg px-3 py-4 ${r.id===review.id?'bg-pale':'hover:bg-canvas'}`}><span className="shrink-0 text-sm font-bold"><span aria-hidden="true" className="mr-2 text-lg text-amber-400">★</span>{r.stars}</span><span className="min-w-0"><span className="block break-words text-xs font-bold">{r.title}</span><span className="mt-1 block text-[11px] text-muted">{data.users.find(u=>u.id===r.userId)?.name || 'Thành viên'} · {r.date}</span></span></Link></li>)}</ul></section>
      </aside>
    </div>
  </PublicLayout>;
}
