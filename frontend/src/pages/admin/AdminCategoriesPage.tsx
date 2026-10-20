import type {Category} from '../../types/domain';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { WirePanel, StatusPanel, WorkspaceNavigation, Field, fieldClass, actionClass, RowCard, quietActionClass } from '../../components/common/WorkspaceUI';

export default function AdminCategoriesPage() {
  const { data, execute, confirm } = useApp();
  const [status, setStatus] = useState('');
  const [notice, setNotice] = useState('');
  function remove(category: Category) { confirm({ title: 'Xóa danh mục?', message: `Xóa vĩnh viễn danh mục “${category.name}”. Máy chủ sẽ kiểm tra địa điểm liên quan.`, onConfirm: async () => setNotice((await execute({ type: 'DELETE_CATEGORY', id: category.id })).message) }); }
  return <SimpleLayout title="Danh mục / Admin" node="2:380"><WirePanel label="Tên danh mục · Trạng thái" open><Field label="Trạng thái danh mục">{id => <select id={id} className={fieldClass} value={status} onChange={event => setStatus(event.target.value)}><option value="">Tất cả</option><option>ACTIVE</option><option>HIDDEN</option></select>}</Field><div>{data.categories.filter(category => !status || category.status === status).map(category => <RowCard key={category.id} title={category.name} status={category.status} subtitle={`${data.places.filter(place => place.categoryId === category.id && place.status === 'ACTIVE').length} địa điểm ACTIVE`}>{category.status === 'ACTIVE' && <><Link to={`/admin/categories/${category.id}/edit`} className={quietActionClass}>Sửa tên</Link><button type="button" className={quietActionClass} onClick={() => remove(category)}>Xóa</button></>}</RowCard>)}</div></WirePanel><StatusPanel notice={notice} /><Link to="/admin/categories/new" className={actionClass}>Thêm danh mục</Link><WorkspaceNavigation admin /></SimpleLayout>;
}
