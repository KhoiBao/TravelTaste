import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useApp} from '../../state/AppContext';
import PublicLayout from '../../components/layout/PublicLayout';
import {WorkspaceIcon} from '../../components/layout/AdminSidebar';
import {Button, Input, Select} from '../../components/common/Controls';
import {EmptyState} from '../../components/feedback/AsyncState';
import {normalize} from '../../utils/ranking';
import type {Place} from '../../types/domain';

function ActionIcon({eye = false}: {eye?: boolean}) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">{eye ? <><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.8 5.2A11 11 0 0112 5c6 0 10 7 10 7a17 17 0 01-4 4M6.2 6.2A20 20 0 002 12s4 7 10 7a12 12 0 005-1" /></> : <><path d="M15 5l4 4M4 20l4-1L20 7a2.8 2.8 0 00-4-4L4 15z" /></>}</svg>;
}
export default function AdminPlacesPage() {
  const {data, execute, confirm} = useApp();
  const [query, setQuery] = useState(''), [status, setStatus] = useState(''), [category, setCategory] = useState(''), [city, setCity] = useState(''), [sort, setSort] = useState('default');
  const [page, setPage] = useState(1), [busy, setBusy] = useState(''), [notice, setNotice] = useState('');
  const cities = [...new Set(data.places.map(p => p.city).filter(Boolean))].sort((a,b) => a.localeCompare(b,'vi'));
  const places = data.places.filter(p => (!status || p.status === status) && (!category || (p.categoryIds || [p.categoryId]).includes(category)) && (!city || p.city === city) && normalize(`${p.name} ${p.city} ${p.address}`).includes(normalize(query))).sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name,'vi') : sort === 'rating' ? b.rating-a.rating || b.reviewCount-a.reviewCount : sort === 'reviews' ? b.reviewCount-a.reviewCount : 0);
  const total = Math.max(1, Math.ceil(places.length / 8)), current = Math.min(page,total), start = (current-1)*8;
  const pages = Array.from({length:total},(_,i)=>i+1).filter(n => n === 1 || n === total || Math.abs(n-current)<=1);
  function changeStatus(place: Place) {
    const next = place.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    confirm({title: next === 'HIDDEN' ? 'Ẩn địa điểm?' : 'Hiển thị địa điểm?', message: `${place.name} sẽ ${next === 'HIDDEN' ? 'được ẩn khỏi danh sách công khai' : 'được hiển thị trở lại'}.`, onConfirm: async () => {
      setBusy(place.id); setNotice('');
      try {const result = await execute({type:'PLACE_STATUS',id:place.id,status:next}); setNotice(result.message);} finally {setBusy('');}
    }});
  }
  return <PublicLayout node="39:143">
    <div className="flex w-full flex-wrap items-center justify-between gap-4"><div><h1 className="text-[28px] font-bold leading-tight tablet:text-4xl">Quản lý địa điểm</h1><p className="mt-3 text-sm text-muted">Quản lý danh sách địa điểm du lịch và ăn uống trên hệ thống.</p></div><Link to="/admin/places/new" className="inline-flex min-h-11 items-center gap-2 rounded-button bg-primary px-5 py-3 text-sm font-bold text-white hover:brightness-95"><span aria-hidden="true" className="text-xl font-normal">＋</span>Tạo địa điểm mới</Link></div>
    <section aria-label="Bộ lọc địa điểm" className="grid w-full gap-4 rounded-2xl border border-line bg-surface p-5 tablet:grid-cols-2 desktop:grid-cols-[1.7fr_1fr_1fr_1fr]">
      <Input label="Tìm địa điểm" placeholder="Tên địa điểm hoặc thành phố..." value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} />
      <Select label="Danh mục" value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}}><option value="">Tất cả</option>{data.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select>
      <Select label="Trạng thái" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">Tất cả</option><option value="ACTIVE">Hiển thị</option><option value="HIDDEN">Đã ẩn</option></Select>
      <Select label="Thành phố" value={city} onChange={e=>{setCity(e.target.value);setPage(1);}}><option value="">Tất cả</option>{cities.map(c=><option key={c}>{c}</option>)}</Select>
    </section>
    {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
    <section className="w-full min-w-0 rounded-2xl border border-line bg-surface p-4 tablet:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-lg font-bold"><WorkspaceIcon name="place" className="h-5 w-5 text-primary" />Danh sách địa điểm ({places.length})</h2><select aria-label="Sắp xếp địa điểm" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}} className="rounded-button border border-line bg-surface px-3 py-2 text-sm"><option value="default">Mặc định</option><option value="name">Tên A – Z</option><option value="rating">Điểm cao nhất</option><option value="reviews">Nhiều đánh giá nhất</option></select></div>
      {places.length ? <div className="w-full overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm"><caption className="sr-only">Danh sách địa điểm và thao tác quản lý</caption><thead className="bg-pale/70 text-xs"><tr>{['#','Địa điểm','Danh mục','Thành phố','Trạng thái','Đánh giá','Thao tác'].map(t=><th key={t} scope="col" className="whitespace-nowrap px-3 py-3 font-semibold">{t}</th>)}</tr></thead><tbody>{places.slice(start,start+8).map((place,i)=><tr key={place.id} className="border-b border-line hover:bg-canvas/60"><td className="px-3 py-2">{start+i+1}</td><th scope="row" className="min-w-[245px] px-3 py-2 font-normal"><Link to={`/places/${place.id}`} className="flex items-center gap-3"><img src={place.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /><span><span className="font-bold hover:text-primary">{place.name}</span><span className="mt-1 flex items-start gap-1 text-xs text-muted"><WorkspaceIcon name="place" className="h-3.5 w-3.5 shrink-0" />{place.address || place.city || 'Chưa có địa chỉ'}</span></span></Link></th><td className="px-3 py-2 text-xs">{place.category || 'Chưa phân loại'}</td><td className="px-3 py-2 text-xs">{place.city || '—'}</td><td className="whitespace-nowrap px-3 py-2"><span className={`rounded-full px-3 py-1 text-xs ${place.status === 'ACTIVE' ? 'bg-pale text-primary' : 'bg-canvas text-muted'}`}>{place.status==='ACTIVE'?'Hiển thị':'Đã ẩn'}</span></td><td className="whitespace-nowrap px-3 py-2"><span className="mr-2 text-lg text-amber-400" aria-hidden="true">★</span>{place.reviewCount ? `${place.rating.toFixed(1)} (${place.reviewCount})` : 'Chưa có'}</td><td className="px-3 py-2"><div className="flex gap-2"><Link to={`/admin/places/${place.id}/edit`} aria-label={`Chỉnh sửa ${place.name}`} className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-button bg-pale px-3 py-2 text-xs font-semibold text-primary"><ActionIcon />Chỉnh sửa</Link><Button variant="secondary" disabled={!!busy} aria-label={`${place.status==='ACTIVE'?'Ẩn':'Hiển thị'} ${place.name}`} className="min-h-10 gap-2 whitespace-nowrap px-3 py-2 text-xs" onClick={()=>changeStatus(place)}><ActionIcon eye />{busy===place.id?'Đang lưu…':place.status==='ACTIVE'?'Ẩn':'Hiển thị'}</Button></div></td></tr>)}</tbody></table></div> : <EmptyState>Không có địa điểm phù hợp. Hãy thay đổi bộ lọc để tìm lại.</EmptyState>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p aria-live="polite" className="text-sm text-muted">Hiển thị {places.length ? start+1 : 0} - {Math.min(start+8,places.length)} trong tổng {places.length} địa điểm</p><nav aria-label="Phân trang địa điểm" className="flex items-center gap-1"><button aria-label="Trang trước" disabled={current===1} onClick={()=>setPage(current-1)} className="h-9 w-9 rounded-button border border-line disabled:opacity-30">‹</button>{pages.map((n,i)=><span key={n} className="flex items-center gap-1">{i>0 && n-pages[i-1]>1 && <span className="px-1">…</span>}<button aria-label={`Trang ${n}`} aria-current={current===n?'page':undefined} onClick={()=>setPage(n)} className={`h-9 w-9 rounded-button ${current===n?'bg-primary font-bold text-white':'bg-canvas'}`}>{n}</button></span>)}<button aria-label="Trang sau" disabled={current===total} onClick={()=>setPage(current+1)} className="h-9 w-9 rounded-button border border-line disabled:opacity-30">›</button></nav></div>
    </section>
  </PublicLayout>;
}
