import { Link, useParams } from 'react-router-dom';
import { SimpleLayout } from '../components/layout/PublicLayout';
const statuses: Record<string, {title: string; description: string}> = {
  '403': {title: 'Bạn chưa có quyền truy cập', description: 'Đăng nhập tài khoản có quyền phù hợp.'},
  '404': {title: 'Chưa tìm thấy trang này', description: 'Đường dẫn có thể đã thay đổi. Hãy quay lại để tiếp tục khám phá.'},
  '500': {title: 'Có lỗi xảy ra', description: 'Chúng tôi chưa thể hiển thị nội dung này. Bạn có thể thử lại.'},
};
export default function SystemPage({code: explicitCode, message}: {code?: string; message?: string}) {
  const params = useParams(); const code = explicitCode || params.code || '404'; const status = statuses[code] || statuses['404'];
  return <SimpleLayout title={status.title} node="39:551"><section role={code === '403' || code === '500' ? 'alert' : 'status'} className="w-full rounded-2xl border border-line bg-surface px-6 py-14 text-center"><p className="text-8xl font-bold text-primary">{code}</p><p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-muted">{message || status.description}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/" className="rounded-button bg-primary px-5 py-3 text-sm font-bold text-white">Quay lại trang chủ</Link>{code === '500' && <button className="rounded-button bg-pale px-5 py-3 text-sm font-bold text-primary" onClick={() => window.location.reload()}>Thử lại</button>}</div></section></SimpleLayout>;
}
