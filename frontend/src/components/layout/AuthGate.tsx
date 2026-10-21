import type {ReactNode} from 'react';
import { useApp } from '../../state/AppContext';
import SystemPage from '../../pages/SystemPage';

export default function AuthGate({ admin = false, children }: {admin?: boolean; children: ReactNode}) {
  const { role } = useApp();
  const permitted = admin ? role === 'ADMIN' : role !== 'GUEST';
  return permitted ? children : <SystemPage code="403" message={`Vui lòng đăng nhập bằng tài khoản ${admin ? 'ADMIN' : 'USER hoặc ADMIN'}.`} />;
}
