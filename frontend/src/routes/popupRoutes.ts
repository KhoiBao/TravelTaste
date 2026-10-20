export function popupRoute(pathname: string): {type: string; title: string; fallback: string; large?: boolean} | null {
  if (pathname === '/login' || pathname === '/register') return { type: 'auth', title: pathname === '/login' ? 'Đăng nhập' : 'Tạo tài khoản', fallback: '/' };
  if (pathname === '/reviews/new') return { type: 'review', title: 'Viết đánh giá', fallback: '/my-reviews', large: true };
  if (/^\/reviews\/[^/]+\/edit$/.test(pathname)) return { type: 'review-edit', title: 'Chỉnh sửa đánh giá', fallback: pathname.replace(/\/edit$/, ''), large: true };
  if (pathname === '/admin/places/new' || /^\/admin\/places\/[^/]+\/edit$/.test(pathname)) return { type: 'place', title: pathname.endsWith('/new') ? 'Thêm địa điểm' : 'Chỉnh sửa địa điểm', fallback: '/admin/places', large: true };
  if (pathname === '/admin/categories/new' || /^\/admin\/categories\/[^/]+\/edit$/.test(pathname)) return { type: 'category', title: pathname.endsWith('/new') ? 'Thêm danh mục' : 'Sửa tên danh mục', fallback: '/admin/categories' };
  if (/^\/admin\/users\/[^/]+$/.test(pathname)) return { type: 'user', title: 'Hồ sơ người dùng', fallback: '/admin/users' };
  return null;
}
