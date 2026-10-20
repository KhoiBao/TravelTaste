import { useParams } from 'react-router-dom';
import { useApp } from '../../state/AppContext';

export default function UserPopup() {
  const { id } = useParams();
  const { data } = useApp();
  const user = data.users.find(item => item.id === id);
  if (!user) return <p role="alert">Không tìm thấy người dùng.</p>;
  return <div className="flex flex-col gap-5">{user.avatar && <img src={user.avatar} alt={`Ảnh đại diện ${user.name}`} className="h-24 w-24 rounded-card object-cover" />}<dl className="grid gap-4 text-[14px]">{[['Tên hiển thị', user.name], ['Email', user.email], ['Vai trò', user.role], ['Ngày tham gia', user.joined]].map(([label, value]) => <div key={label}><dt className="text-[12px] text-muted">{label}</dt><dd className="mt-1 break-words font-bold">{value}</dd></div>)}</dl><p className="text-[12px] text-muted">Thông tin chỉ đọc.</p></div>;
}
