import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { WorkspaceNavigation } from '../../components/common/WorkspaceUI';
import { Button, Input, Select, Badge, Pagination } from '../../components/common/Controls';
import { EmptyState } from '../../components/feedback/AsyncState';
import { normalize } from '../../utils/ranking';
import type { Place } from '../../types/domain';
export default function AdminPlacesPage() {
  const {data, execute, confirm} = useApp();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [page, setPage] = useState(1);
  const places = data.places.filter(p => (!status || p.status === status) && normalize(p.name + ' ' + p.city).includes(normalize(query)));
  const total = Math.max(1, Math.ceil(places.length / 6));
  const current = Math.min(total, page);
  function changeStatus(place: Place) {const next = place.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE'; confirm({title: next === 'HIDDEN' ? 'Ẩn địa điểm?' : 'Khôi phục địa điểm?', message: `${place.name} sẽ ${next === 'HIDDEN' ? 'được ẩn khỏi danh sách công khai' : 'được hiển thị trở lại'}.`, onConfirm: () => {execute({type: 'PLACE_STATUS', id: place.id, status: next});}});}
  return <SimpleLayout node="39:143" title="Quản lý địa điểm"><WorkspaceNavigation admin /><div className="flex w-full flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted">{places.length} địa điểm phù hợp</p><Link to="/admin/places/new" className="rounded-button bg-primary px-5 py-3 text-sm font-bold text-white">Tạo địa điểm mới</Link></div><section className="w-full space-y-5 rounded-2xl border border-line bg-surface p-5"><div className="grid gap-4 tablet:grid-cols-2"><Input label="Tìm địa điểm quản trị" placeholder="Tên địa điểm hoặc thành phố" value={query} onChange={e => {setQuery(e.target.value); setPage(1);}} /><Select label="Trạng thái địa điểm" value={status} onChange={e => {setStatus(e.target.value); setPage(1);}}><option value="">Tất cả</option><option value="ACTIVE">Đang hiển thị</option><option value="HIDDEN">Đã ẩn</option></Select></div>
    {places.length ? <div className="w-full overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Danh sách địa điểm và thao tác quản lý</caption><thead className="border-b border-line text-xs text-muted"><tr><th scope="col" className="py-3 pr-4">Địa điểm</th><th scope="col" className="hidden px-3 py-3 tablet:table-cell">Danh mục</th><th scope="col" className="hidden px-3 py-3 tablet:table-cell">Trạng thái</th><th scope="col" className="py-3 text-right">Thao tác</th></tr></thead><tbody>{places.slice((current - 1) * 6, current * 6).map(place => <tr key={place.id} className="border-b border-line last:border-0"><th scope="row" className="py-4 pr-3 font-normal"><Link to={`/places/${place.id}`} className="font-bold hover:text-primary">{place.name}</Link><p className="mt-1 text-xs text-muted">{place.city}</p></th><td className="hidden p-3 text-xs tablet:table-cell">{place.category}</td><td className="hidden p-3 tablet:table-cell"><Badge>{place.status === 'ACTIVE' ? 'Hiển thị' : 'Đã ẩn'}</Badge></td><td className="py-4"><div className="flex flex-wrap justify-end gap-2">{<Link to={`/admin/places/${place.id}/edit`} className="rounded-button bg-pale px-3 py-2 text-xs text-primary">Chỉnh sửa</Link>}<Button variant="secondary" className="min-h-0 px-3 py-2 text-xs" onClick={() => changeStatus(place)}>{place.status === 'ACTIVE' ? 'Ẩn' : 'Khôi phục'}</Button><Button variant="danger" className="min-h-0 px-3 py-2 text-xs" onClick={() => confirm({title: 'Xóa vĩnh viễn địa điểm?', message: 'Địa điểm, đánh giá và bình luận bên trong sẽ bị xóa.', onConfirm: async () => {await execute({type: 'DELETE_PLACE', id: place.id});}})}>Xóa</Button></div></td></tr>)}</tbody></table></div> : <EmptyState>Không có địa điểm phù hợp.</EmptyState>}
    <Pagination page={current} total={total} onChange={setPage} /></section></SimpleLayout>;
}
