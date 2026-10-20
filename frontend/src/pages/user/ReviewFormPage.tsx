import type {FormEvent} from 'react';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { usePopupForm } from '../../components/common/PopupContext';
import StarInput from '../../components/reviews/StarInput';
import ImageUpload from '../../components/common/ImageUpload';
import { Field, fieldClass, actionClass } from '../../components/common/WorkspaceUI';

export default function ReviewFormPage({ edit = false }) {
  const { data, activePlaces, actorId, execute } = useApp();
  const { id } = useParams();
  const [params] = useSearchParams();
  const review = edit ? data.reviews.find(item => item.id === id) : undefined;
  const [values, setValues] = useState({ placeId: review?.placeId || params.get('place') || activePlaces[0]?.id || '', title: review?.title || '', content: review?.content || '', stars: review?.stars || 5, images: review?.images || [] });
  const [notice, setNotice] = useState('');
  const saved = usePopupForm(values);
  const navigate = useNavigate();
  function change<K extends keyof typeof values>(name: K, value: (typeof values)[K]) { setValues(current => ({ ...current, [name]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = await execute({ type: 'SAVE_REVIEW', id: edit ? id : undefined, values }); setNotice(result.message); if (result.ok) { saved(); navigate(`/reviews/${result.id}`, { replace: true, state: { notice: result.message } }); } }
  if (edit && (!review || review.status !== 'ACTIVE')) return <p role="alert">Review không tồn tại hoặc đã bị xóa.</p>;
  if (edit && review && review.userId !== actorId) return <p role="alert">Bạn chỉ được sửa review của mình.</p>;
  if (!activePlaces.length) return <p role="status">Chưa có địa điểm ACTIVE để viết đánh giá.</p>;
  return <form onSubmit={submit} className="flex flex-col gap-5"><Field label="Địa điểm đánh giá">{inputId => <select id={inputId} required disabled={edit} className={fieldClass} value={values.placeId} onChange={event => change('placeId', event.target.value)}>{activePlaces.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}</select>}</Field><StarInput value={values.stars} onChange={value => change('stars', value)} /><Field label="Tiêu đề đánh giá" required minLength={3} maxLength={120} value={values.title} onChange={event => change('title', event.target.value)} /><Field label="Nội dung đánh giá">{inputId => <textarea id={inputId} required rows={5} minLength={10} maxLength={2000} className={fieldClass} value={values.content} onChange={event => change('content', event.target.value)} />}</Field><ImageUpload images={values.images} onChange={images => change('images', images)} /><p role="status" aria-live="polite" className="text-[13px] text-primary">{notice}</p><button type="submit" className={actionClass}>{edit ? 'Lưu thay đổi' : 'Đăng đánh giá'}</button></form>;
}
