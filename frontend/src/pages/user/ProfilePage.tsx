import { Link } from 'react-router-dom';
import { useApp } from '../../state/AppContext';
import { SimpleLayout } from '../../components/layout/PublicLayout';
import { WirePanel, StatusPanel, WorkspaceNavigation, actionClass } from '../../components/common/WorkspaceUI';

export default function ProfilePage() {
  const { actor, actorId, data } = useApp();
  const reviews = data.reviews.filter(review => review.userId === actorId && review.status === 'ACTIVE');
  if (!actor) return null;
  return <SimpleLayout title="Hồ sơ thành viên" node="2:304"><WirePanel label="Thông tin tài khoản" open><div className="flex flex-wrap items-center gap-4">{actor.avatar && <img src={actor.avatar} alt={`Ảnh đại diện của ${actor.name}`} className="h-20 w-20 rounded-card object-cover" />}<div><p className="font-bold">{actor.name}</p><p className="mt-2 text-muted">{actor.email}</p><p className="mt-2">Tên đăng nhập: {actor.username}</p></div></div></WirePanel><WirePanel label="Các đánh giá đã đăng" height={140}><p>{reviews.length} đánh giá ACTIVE.</p><Link to="/my-reviews" className="text-primary underline">Xem và quản lý đánh giá của tôi</Link></WirePanel><StatusPanel /><WorkspaceNavigation /></SimpleLayout>;
}
