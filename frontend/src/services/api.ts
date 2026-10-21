export interface Envelope<T> { success: boolean; data: T; message?: string; errors?: Record<string, string> }
export interface ApiUser { id: string; username?: string; hoTen: string; email?: string; avatar?: string; role: 'ADMIN' | 'USER'; trangThai?: string; ngayTao?: string }
export interface ApiCategory { id: string; ten: string; slug: string; trangThai: string; moTa?: string; icon?: string; thuTu?: number }
export interface ApiComment { likeCount?: number; liked?: boolean; commentId: string; userId: string; tenUser: string; avatarUser?: string; noiDung: string; ngayTao: string; traLoi?: ApiComment[] }
export interface ApiReview { reviewId: string; userId: string; tenUser: string; avatarUser?: string; soSao: number; tieuDe: string; noiDung: string; hinhAnh?: string[]; ngayTao: string; binhLuan?: ApiComment[] }
export interface ApiPlace { id: string; ten: string; slug: string; loai: string; danhMuc?: {danhMucId: string; ten?: string; slug?: string}[]; moTa?: string; diaChi?: {so?: string; duong?: string; quan?: string; thanhPho?: string}; viTri?: number[] | {coordinates: number[]}; hinhAnh?: string[]; ratingAvg: number; reviewCount: number; trangThai?: string; luotThich?: number; daYeuThich?: boolean; reviews?: ApiReview[] }
export interface Page<T> { content: T[]; page: number; size: number; totalPages: number; totalElements: number }
export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}) { super(message); }
}
let csrf: Promise<{token: string; headerName: string}> | undefined;
const base = import.meta.env.VITE_API_BASE_URL || '';
export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET')) {
    csrf ??= request<{token: string; headerName: string}>('/api/auth/csrf').catch(error => { csrf = undefined; throw error; });
    const token = await csrf; headers.set(token.headerName, token.token);
  }
  let response: Response;
  try { response = await fetch(base + url, {...options, headers, credentials: 'include'}); }
  catch { throw new ApiError('Không kết nối được máy chủ. Vui lòng thử lại.', 0); }
  const body: Envelope<T> | null = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    if (response.status === 401 || response.status === 403) csrf = undefined;
    if (response.status === 401) window.dispatchEvent(new Event('traveltaste:unauthorized'));
    throw new ApiError([body?.message || `Yêu cầu thất bại (${response.status}).`, ...Object.values(body?.errors || {})].join(' '), response.status, body?.errors);
  }
  return body.data;
}
const json = (method: string, body?: unknown): RequestInit => ({method, ...(body === undefined ? {} : {body: JSON.stringify(body)})});
const id = encodeURIComponent;
export const api = {
  me: () => request<ApiUser>('/api/auth/me'),
  login: (usernameOrEmail: string, password: string) => request<ApiUser>('/api/auth/login', json('POST', {usernameOrEmail, password})),
  register: (username: string, hoTen: string, email: string, password: string) => request<ApiUser>('/api/auth/register', json('POST', {username, hoTen, email, password})),
  logout: async () => { await request('/api/auth/logout', json('POST')); csrf = undefined; },
  categories: (admin = false) => request<ApiCategory[]>(admin ? '/api/admin/danh-muc' : '/api/danh-muc'),
  places: (params = new URLSearchParams(), search = false) => request<Page<ApiPlace>>(`${search ? '/api/search' : '/api/dia-diem'}?${params}`),
  adminPlaces: () => request<ApiPlace[]>('/api/admin/dia-diem'),
  detail: (slug: string) => request<ApiPlace>(`/api/dia-diem/${id(slug)}`),
  top: (discover = true) => request<ApiPlace[]>(discover ? '/api/discover/top10' : '/api/dia-diem/top10'),
  near: (lat: number, lng: number, radiusKm = 5, discover = true) => request<ApiPlace[]>(`${discover ? '/api/discover' : '/api/dia-diem'}/gan-toi?lat=${lat}&lng=${lng}&banKinhKm=${radiusKm}&limit=20`),
  savePlace: (body: unknown, placeId?: string, admin = true) => request<ApiPlace>(`${admin ? '/api/admin' : '/api'}/dia-diem${placeId ? '/' + id(placeId) : ''}`, json(placeId ? 'PUT' : 'POST', body)),
  deletePlace: (placeId: string, admin = true) => request(`${admin ? '/api/admin' : '/api'}/dia-diem/${id(placeId)}`, json('DELETE')),
  saveCategory: (body: unknown, categoryId?: string) => request(`/api/admin/danh-muc${categoryId ? '/' + id(categoryId) : ''}`, json(categoryId ? 'PUT' : 'POST', body)),
  deleteCategory: (categoryId: string) => request(`/api/admin/danh-muc/${id(categoryId)}`, json('DELETE')),
  reviews: (placeId: string, page = 0, size = 100) => request<Page<ApiReview>>(`/api/dia-diem/${id(placeId)}/reviews?page=${page}&size=${size}`),
  saveReview: (placeId: string, body: unknown, reviewId?: string) => request<{review?: ApiReview} | null>(`/api/dia-diem/${id(placeId)}/reviews${reviewId ? '/' + id(reviewId) : ''}`, json(reviewId ? 'PUT' : 'POST', body)),
  deleteReview: (placeId: string, reviewId: string) => request(`/api/dia-diem/${id(placeId)}/reviews/${id(reviewId)}`, json('DELETE')),
  comment: (placeId: string, reviewId: string, content: string, parentId?: string) => request(`/api/dia-diem/${id(placeId)}/reviews/${id(reviewId)}/comments${parentId ? '/' + id(parentId) + '/replies' : ''}`, json('POST', {noiDung: content})),
  likeComment: (placeId: string, reviewId: string, commentId: string, liked: boolean) => request<{commentId: string; likeCount: number; liked: boolean}>(`/api/dia-diem/${id(placeId)}/reviews/${id(reviewId)}/comments/${id(commentId)}/like`, json(liked ? 'PUT' : 'DELETE')),
  deleteComment: (placeId: string, reviewId: string, commentId: string) => request(`/api/dia-diem/${id(placeId)}/reviews/${id(reviewId)}/comments/${id(commentId)}`, json('DELETE')),
  users: () => request<ApiUser[]>('/api/admin/nguoi-dung'),
  userStatus: (userId: string, trangThai: string) => request(`/api/admin/nguoi-dung/${id(userId)}/trang-thai`, json('PATCH', {trangThai})),
  upload: async (file: File) => { const data = new FormData(); data.append('file', file); return request<{url: string}>('/api/upload', {method: 'POST', body: data}); },
  likePlace: (placeId: string, liked: boolean) => request<{diaDiemId: string; daYeuThich: boolean; luotThich: number}>(`/api/yeu-thich/${id(placeId)}`, json(liked ? 'POST' : 'DELETE')),
};
