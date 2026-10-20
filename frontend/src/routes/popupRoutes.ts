export function popupRoute(pathname: string): {type: string; title: string; subtitle?: string; fallback: string; large?: boolean; footer?: boolean} | null {
  if (pathname === '/reviews/new') return { type: 'review', title: 'Viết đánh giá', subtitle: 'Chia sẻ trải nghiệm của bạn để giúp cộng đồng khám phá những địa điểm tuyệt vời hơn.', fallback: '/my-reviews', large: true, footer: false };
  if (/^\/reviews\/[^/]+\/edit$/.test(pathname)) return { type: 'review-edit', title: 'Chỉnh sửa đánh giá', subtitle: 'Cập nhật lại trải nghiệm của bạn để đánh giá luôn hữu ích với cộng đồng.', fallback: pathname.replace(/\/edit$/, ''), large: true, footer: false };
  if (pathname === '/admin/places/new' || /^\/admin\/places\/[^/]+\/edit$/.test(pathname)) return { type: 'place', title: pathname.endsWith('/new') ? 'Thêm địa điểm' : 'Chỉnh sửa địa điểm', fallback: '/admin/places', large: true };
  if (pathname === '/admin/categories/new' || /^\/admin\/categories\/[^/]+\/edit$/.test(pathname)) return { type: 'category', title: pathname.endsWith('/new') ? 'Thêm danh mục' : 'Sửa tên danh mục', fallback: '/admin/categories' };
  if (/^\/admin\/users\/[^/]+$/.test(pathname)) return { type: 'user', title: 'Hồ sơ người dùng', fallback: '/admin/users' };
  return null;
}
