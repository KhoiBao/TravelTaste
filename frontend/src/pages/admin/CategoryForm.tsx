import type {FormEvent} from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { usePopupForm } from '../../components/common/PopupContext';
import { Field, actionClass } from '../../components/common/WorkspaceUI';

export default function CategoryForm({ edit = false }) {
  const { id } = useParams();
  const { data, execute } = useApp();
  const category = edit ? data.categories.find(item => item.id === id) : undefined;
  const [name, setName] = useState(category?.name || '');
  const [notice, setNotice] = useState('');
  const saved = usePopupForm(name);
  const navigate = useNavigate();
  if (edit && (!category || category.status !== 'ACTIVE')) return <p role="alert">Danh mục không tồn tại hoặc đã bị xóa.</p>;
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const result = await execute({ type: 'SAVE_CATEGORY', id: edit ? id : undefined, name }); setNotice(result.message); if (result.ok) { saved(); navigate('/admin/categories', { replace: true }); } }
  return <form onSubmit={submit} className="flex flex-col gap-5"><Field label="Tên danh mục" required minLength={2} maxLength={80} value={name} onChange={event => setName(event.target.value)} /><p className="text-[13px] text-muted">Tên danh mục được lưu trên máy chủ.</p><p role="status" className="text-[13px] text-primary">{notice}</p><button type="submit" className={actionClass}>{edit ? 'Lưu tên danh mục' : 'Thêm danh mục'}</button></form>;
}
