import type {FormEvent} from 'react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { usePopup, usePopupForm } from '../../components/common/PopupContext';
import StarInput from '../../components/reviews/StarInput';
import ImageUpload from '../../components/common/ImageUpload';
import { fieldClass, actionClass } from '../../components/common/WorkspaceUI';

const labelClass = 'flex min-w-0 flex-col gap-2 text-[13px] font-medium text-ink';
const required = <span aria-hidden="true" className="text-danger">*</span>;

export default function ReviewFormPage({ edit = false }) {
  const { data, activePlaces, actorId, execute } = useApp();
  const { id } = useParams();
  const [params] = useSearchParams();
  const review = edit ? data.reviews.find(item => item.id === id) : undefined;
  const [values, setValues] = useState({ placeId: review?.placeId || params.get('place') || activePlaces[0]?.id || '', title: review?.title || '', content: review?.content || '', stars: review?.stars || 5, images: review?.images || [] });
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const saved = usePopupForm(values);
  const { closeRef } = usePopup();
  const navigate = useNavigate();
  const fixedPlace = edit || Boolean(params.get('place'));
  function change<K extends keyof typeof values>(name: K, value: (typeof values)[K]) { setValues(current => ({ ...current, [name]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = await execute({ type: 'SAVE_REVIEW', id: edit ? id : undefined, values });
      setNotice(result.message);
      if (result.ok) { saved(); navigate(`/reviews/${result.id}`, { replace: true, state: { notice: result.message } }); }
    } finally { setBusy(false); }
  }
  if (edit && (!review || review.status !== 'ACTIVE')) return <p role="alert" className="text-[14px] text-ink">Review không tồn tại hoặc đã bị xóa.</p>;
  if (edit && review && review.userId !== actorId) return <p role="alert" className="text-[14px] text-ink">Bạn chỉ được sửa review của mình.</p>;
  if (!activePlaces.length) return <p role="status" className="text-[14px] text-muted">Chưa có địa điểm ACTIVE để viết đánh giá.</p>;
  return <form onSubmit={submit} className="flex flex-col">
    <div className="grid gap-6 tablet:grid-cols-2 tablet:gap-8">
      <div className="flex min-w-0 flex-col gap-5">
        <label className={labelClass}>
          <span>Địa điểm đánh giá {required}</span>
          <span className="relative block">
            <select id="review-place" required disabled={fixedPlace} aria-label="Địa điểm đánh giá" className={`${fieldClass} cursor-pointer appearance-none bg-surface pr-10 disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted`} value={values.placeId} onChange={event => change('placeId', event.target.value)}>
              {activePlaces.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
            </select>
            <svg viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7 5 5 5-5" /></svg>
          </span>
        </label>
        {fixedPlace && <p className="-mt-2 flex items-start gap-1.5 text-[12px] leading-5 text-muted"><svg viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="12" height="8" rx="2" /><path d="M7 9V7a3 3 0 0 1 6 0v2" /></svg>{edit ? 'Không thể đổi địa điểm của đánh giá đã đăng.' : 'Địa điểm được khóa theo bài bạn đang xem.'}</p>}
        <StarInput value={values.stars} onChange={value => change('stars', value)} />
        <label className={labelClass}>
          <span>Tiêu đề đánh giá {required}</span>
          <input type="text" required minLength={3} maxLength={120} value={values.title} onChange={event => change('title', event.target.value)} placeholder="Ví dụ: Không gian ấm cúng, món ăn đáng thử" className={fieldClass} aria-label="Tiêu đề đánh giá" />
          <span className="self-end text-[11px] tabular-nums text-muted">{values.title.length}/120</span>
        </label>
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <label className={labelClass}>
          <span>Nội dung đánh giá {required}</span>
          <textarea required rows={7} minLength={10} maxLength={1000} value={values.content} onChange={event => change('content', event.target.value)} placeholder="Chia sẻ trải nghiệm của bạn về không gian, món ăn, dịch vụ..." className={`${fieldClass} min-h-[168px] resize-y leading-6`} aria-label="Nội dung đánh giá" />
          <span className="self-end text-[11px] tabular-nums text-muted">{values.content.length}/1000</span>
        </label>
        <ImageUpload images={values.images} onChange={images => change('images', images)} label="Ảnh đính kèm" />
      </div>
    </div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
      <p role="status" aria-live="polite" className="min-h-5 text-[13px] text-primary">{notice}</p>
      <div className="ml-auto flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => closeRef.current?.()} className="inline-flex items-center justify-center rounded-button border border-line bg-surface px-5 py-[13px] text-[14px] font-bold leading-[18px] text-ink hover:bg-canvas">Hủy</button>
        <button type="submit" disabled={busy} className={actionClass}>{busy ? 'Đang lưu…' : edit ? 'Lưu thay đổi' : 'Đăng đánh giá'}</button>
      </div>
    </div>
  </form>;
}
