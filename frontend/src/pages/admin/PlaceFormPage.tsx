import type {FormEvent} from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { usePopupForm } from '../../components/common/PopupContext';
import { Field, fieldClass, actionClass } from '../../components/common/WorkspaceUI';
import ImageUpload from '../../components/common/ImageUpload';

export default function PlaceFormPage({ edit = false }) {
  const { id } = useParams();
  const { data, execute } = useApp();
  const place = edit ? data.places.find(item => item.id === id) : undefined;
  const [values, setValues] = useState({ name: place?.name || '', description: place?.description || '', categoryId: place?.categoryId || data.categories.find(item => item.status === 'ACTIVE')?.id || '', address: place?.address || '', city: place?.city || '', image: place?.image || '', kind: place?.kind || 'DU_LICH', longitude: place?.longitude ?? 0, latitude: place?.latitude ?? 0, district: place?.district || '', street: place?.street || '', houseNumber: place?.houseNumber || '' });
  const [notice, setNotice] = useState('');
  const saved = usePopupForm(values);
  const navigate = useNavigate();
  function change<K extends keyof typeof values>(name: K, value: (typeof values)[K]) { setValues(current => ({ ...current, [name]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = await execute({ type: 'SAVE_PLACE', id: edit ? id : undefined, values }); setNotice(result.message); if (result.ok) { saved(); navigate('/admin/places', { replace: true }); } }
  if (edit && !place) return <p role="alert">Không tìm thấy địa điểm cần sửa.</p>;
  return <form onSubmit={submit} className="flex flex-col gap-5"><div className="grid gap-5 tablet:grid-cols-2"><Field label="Loại địa điểm">{id => <select id={id} className={fieldClass} value={values.kind} onChange={e => change('kind', e.target.value)}><option value="DU_LICH">Du lịch</option><option value="AN_UONG">Ăn uống</option><option value="LUU_TRU">Lưu trú</option></select>}</Field><Field label="Số nhà" maxLength={20} value={values.houseNumber} onChange={e => change('houseNumber', e.target.value)} /><Field label="Đường" required maxLength={150} value={values.street} onChange={e => change('street', e.target.value)} /><Field label="Quận/huyện" required maxLength={100} value={values.district} onChange={e => change('district', e.target.value)} /><Field label="Kinh độ" required type="number" min={-180} max={180} step="any" value={values.longitude} onChange={e => change('longitude', Number(e.target.value))} /><Field label="Vĩ độ" required type="number" min={-90} max={90} step="any" value={values.latitude} onChange={e => change('latitude', Number(e.target.value))} /><Field label="Tên địa điểm" required minLength={2} maxLength={150} value={values.name} onChange={event => change('name', event.target.value)} /><Field label="Danh mục địa điểm">{inputId => <select id={inputId} required className={fieldClass} value={values.categoryId} onChange={event => change('categoryId', event.target.value)}><option value="">Chọn danh mục</option>{data.categories.filter(category => category.status === 'ACTIVE').map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>}</Field></div><Field label="Mô tả địa điểm">{inputId => <textarea id={inputId} rows={4} required minLength={20} maxLength={2000} className={fieldClass} value={values.description} onChange={event => change('description', event.target.value)} />}</Field><div className="grid gap-5 tablet:grid-cols-2"><Field label="Thành phố" required maxLength={100} value={values.city} onChange={event => change('city', event.target.value)} /></div><ImageUpload max={1} label="Hình ảnh địa điểm" images={values.image ? [{ src: values.image, name: values.name || 'Hình ảnh địa điểm' }] : []} onChange={images => change('image', images[0]?.src || '')} /><p role="status" className="text-[13px] text-primary">{notice}</p><button type="submit" className={actionClass}>Lưu địa điểm</button></form>;
}
