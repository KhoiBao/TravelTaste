import {createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import type {AppValue, AppData, Action, Result, User, Place} from '../types/domain';
import {api, ApiError, type ApiUser, type ApiPlace, type ApiComment, type ApiCategory} from '../services/api';
import {usePopup} from '../components/common/PopupContext';
import placeholder from '../assets/images/placeholder.svg';

const empty = (): AppData => ({users: [], categories: [], places: [], reviews: [], comments: []});
const Context = createContext<AppValue | null>(null);
const message = (e: unknown) => e instanceof Error ? e.message : 'Yêu cầu thất bại.';
export const mapUser = (u: ApiUser): User => ({id: u.id, name: u.hoTen, username: u.username, email: u.email || '', role: u.role,
  accountStatus: u.trangThai, avatar: u.avatar || '', joined: u.ngayTao?.slice(0, 10) || ''});
export function mapPlace(p: ApiPlace): Place {
  const address = p.diaChi || {}, coordinates = Array.isArray(p.viTri) ? p.viTri : p.viTri?.coordinates || [];
  return {id: p.id, slug: p.slug, name: p.ten, kind: p.loai, categoryId: p.danhMuc?.[0]?.danhMucId || '', category: p.danhMuc?.map(d => d.ten).filter(Boolean).join(', ') || '',
    city: address.thanhPho || '', houseNumber: address.so || '', street: address.duong || '', district: address.quan || '',
    address: [address.so, address.duong, address.quan].filter(Boolean).join(', '), longitude: coordinates[0] ?? 0, latitude: coordinates[1] ?? 0,
    subtitle: [address.thanhPho, p.loai === 'AN_UONG' ? 'Ăn uống' : p.loai === 'LUU_TRU' ? 'Lưu trú' : 'Du lịch'].filter(Boolean).join(' · '),
    description: p.moTa || '', image: p.hinhAnh?.[0] || placeholder, status: p.trangThai === 'HIDDEN' ? 'HIDDEN' : 'ACTIVE', rating: p.ratingAvg || 0, reviewCount: p.reviewCount || 0};
}

export function AppProvider({children}: {children: ReactNode}) {
  const [data, setData] = useState<AppData>(empty);
  const [actor, setActor] = useState<User>();
  const [loading, setLoading] = useState(true), [ready, setReady] = useState(false), [error, setError] = useState('');
  const {confirm} = usePopup();
  const mutating = useRef(false);
  const generation = useRef(0), rawCategories = useRef(new Map<string, ApiCategory>()), rawPlaces = useRef(new Map<string, ApiPlace>()), dataRef = useRef(data);
  dataRef.current = data;
  const refresh = useCallback(async () => {
    const run = ++generation.current; setLoading(true); setError('');
    try {
      let current: ApiUser | undefined;
      try { current = await api.me(); } catch (e) { if (!(e instanceof ApiError && e.status === 401)) throw e; }
      if (run !== generation.current) return;
      setActor(current ? mapUser(current) : undefined);
      const admin = current?.role === 'ADMIN';
      const categories = await api.categories(admin);
      let places: ApiPlace[];
      if (admin) places = await api.adminPlaces();
      else {
        const first = await api.places(new URLSearchParams({page: '1', size: '50'}));
        const summaries = [...first.content];
        for (let page = 2; page <= first.totalPages; page++) summaries.push(...(await api.places(new URLSearchParams({page: String(page), size: '50'}))).content);
        // Bound concurrent requests; detail responses supply the real reviews and comments.
        places = [];
        for (let i = 0; i < summaries.length; i += 4) places.push(...await Promise.all(summaries.slice(i, i + 4).map(p => api.detail(p.slug))));
      }
      const users = admin ? await api.users() : current ? [current] : [];
      const next: AppData = {users: users.map(mapUser), categories: categories.map(c => ({id: c.id, name: c.ten, status: c.trangThai === 'ACTIVE' ? 'ACTIVE' : 'HIDDEN'})), places: places.map(mapPlace), reviews: [], comments: []};
      const authors = new Map(next.users.map(u => [u.id, u]));
      const author = (id: string, name: string, avatar?: string) => { if (!authors.has(id)) authors.set(id, {id, name, avatar: avatar || '', role: 'USER', email: '', joined: ''}); };
      const comments = (nodes: ApiComment[], reviewId: string, parentId: string | null = null) => nodes.forEach(c => {
        author(c.userId, c.tenUser, c.avatarUser);
        next.comments.push({id: c.commentId, reviewId, parentId, userId: c.userId, content: c.noiDung, date: c.ngayTao?.slice(0, 10) || '', status: 'ACTIVE'});
        comments(c.traLoi || [], reviewId, c.commentId);
      });
      places.forEach(p => (p.reviews || []).forEach(r => {
        author(r.userId, r.tenUser, r.avatarUser);
        next.reviews.push({id: r.reviewId, placeId: p.id, userId: r.userId, title: r.tieuDe, content: r.noiDung, stars: r.soSao,
          images: (r.hinhAnh || []).map(src => ({src, name: 'Ảnh đánh giá'})), date: r.ngayTao?.slice(0, 10) || '', status: 'ACTIVE'});
        comments(r.binhLuan || [], r.reviewId);
      }));
      // Public author snapshots provide names, not administrative account records.
      next.users = [...authors.values()];
      if (run !== generation.current) return;
      rawCategories.current = new Map(categories.map(c => [c.id, c])); rawPlaces.current = new Map(places.map(p => [p.id, p])); dataRef.current = next; setData(next); setReady(true);
    } catch (e) { if (run === generation.current) { setError(message(e)); throw e; } }
    finally { if (run === generation.current) setLoading(false); }
  }, []);
  useEffect(() => { void refresh().catch(() => {}); return () => { generation.current++; }; }, [refresh]);
  useEffect(() => {
    const expired = () => { setActor(undefined); setData(empty()); rawPlaces.current.clear(); };
    window.addEventListener('traveltaste:unauthorized', expired);
    return () => window.removeEventListener('traveltaste:unauthorized', expired);
  }, []);
  const placeBody = (p: Place) => ({ten: p.name, loai: p.kind, danhMucId: [p.categoryId, ...(rawPlaces.current.get(p.id)?.danhMuc?.slice(1).map(c => c.danhMucId) || [])], moTa: p.description,
    diaChi: {so: p.houseNumber, duong: p.street, quan: p.district, thanhPho: p.city}, viTri: {coordinates: [p.longitude, p.latitude]},
    hinhAnh: [p.image, ...(rawPlaces.current.get(p.id)?.hinhAnh?.slice(1) || [])], trangThai: p.status});
  async function execute(action: Action): Promise<Result> {
    if (mutating.current) return {ok: false, message: 'Đang xử lý yêu cầu trước.'};
    mutating.current = true;
    let savedId: string | undefined;
    try {
      const current = dataRef.current;
      if (action.type === 'SAVE_REVIEW') {
        const v = action.values;
        const result = await api.saveReview(v.placeId, {soSao: v.stars, tieuDe: v.title, noiDung: v.content, hinhAnh: v.images.map(i => i.src)}, action.id);
        savedId = action.id || result?.review?.reviewId;
      } else if (action.type === 'DELETE_REVIEW') {
        const r = current.reviews.find(r => r.id === action.id); if (!r) throw new Error('Không tìm thấy đánh giá.');
        await api.deleteReview(r.placeId, r.id);
      } else if (action.type === 'ADD_COMMENT') {
        const r = current.reviews.find(r => r.id === action.reviewId); if (!r) throw new Error('Không tìm thấy đánh giá.');
        await api.comment(r.placeId, r.id, action.content, action.parentId);
      } else if (action.type === 'EDIT_COMMENT' || action.type === 'DELETE_COMMENT') {
        const c = current.comments.find(c => c.id === action.id), r = current.reviews.find(r => r.id === c?.reviewId);
        if (!c || !r) throw new Error('Không tìm thấy bình luận.');
        if (action.type === 'EDIT_COMMENT') await api.editComment(r.placeId, r.id, c.id, action.content);
        else await api.deleteComment(r.placeId, r.id, c.id);
      } else if (action.type === 'SAVE_PLACE') {
        const existing = current.places.find(p => p.id === action.id);
        const result = await api.savePlace(placeBody({...existing, ...action.values, id: action.id || '', status: existing?.status || 'ACTIVE'} as Place), action.id);
        savedId = result.id;
      } else if (action.type === 'PLACE_STATUS') {
        const p = current.places.find(p => p.id === action.id); if (!p) throw new Error('Không tìm thấy địa điểm.');
        await api.savePlace(placeBody({...p, status: action.status}), p.id);
      } else if (action.type === 'DELETE_PLACE') await api.deletePlace(action.id);
      else if (action.type === 'SAVE_CATEGORY') {
        const category = action.id ? rawCategories.current.get(action.id) : undefined;
        await api.saveCategory({ten: action.name, moTa: category?.moTa, icon: category?.icon, thuTu: category?.thuTu, trangThai: category?.trangThai || 'ACTIVE'}, action.id);
      }
      else if (action.type === 'DELETE_CATEGORY') await api.deleteCategory(action.id);
      try { await refresh(); } catch { /* The mutation succeeded; display the refresh error separately. */ }
      const result = {ok: true, id: savedId, message: 'Đã lưu thay đổi trên máy chủ.'};
      window.dispatchEvent(new CustomEvent('traveltaste:notice', {detail: result})); return result;
    } catch (e) {
      const result = {ok: false, message: message(e)};
      window.dispatchEvent(new CustomEvent('traveltaste:notice', {detail: result})); return result;
    } finally { mutating.current = false; }
  }
  async function authenticate(identity: string, password: string) {
    try { const user = await api.login(identity, password); await refresh(); return {ok: true, role: user.role, message: 'Đăng nhập thành công.'}; }
    catch (e) { return {ok: false, message: message(e)}; }
  }
  async function register(username: string, name: string, email: string, password: string) {
    try { await api.register(username, name, email, password); return {ok: true, message: 'Đăng ký thành công. Bạn có thể đăng nhập.'}; }
    catch (e) { return {ok: false, message: message(e)}; }
  }
  async function logout(): Promise<Result> {
    try { await api.logout(); setActor(undefined); setData(empty()); rawPlaces.current.clear(); await refresh(); return {ok: true, message: 'Đã đăng xuất.'}; }
    catch (e) { return {ok: false, message: message(e)}; }
  }
  return <Context.Provider value={{data, actor, actorId: actor?.id || '', role: actor?.role || 'GUEST', activePlaces: data.places.filter(p => p.status === 'ACTIVE'),
    loading, ready, error, refresh, execute, confirm, authenticate, register, logout}}>{children}</Context.Provider>;
}
export function useApp() { const value = useContext(Context); if (!value) throw new Error('AppProvider is required'); return value; }
