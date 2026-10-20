import type {ReactNode} from 'react';
import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx';
import SearchPage from './pages/SearchPage.tsx';
import PlaceDetailPage from './pages/PlaceDetailPage.tsx';
import AuthPage from './pages/AuthPage.tsx';
import CategoriesPage from './pages/CategoriesPage.tsx';
import TopPlacesPage from './pages/TopPlacesPage.tsx';
import AuthGate from './components/layout/AuthGate.tsx';
import ProfilePage from './pages/user/ProfilePage.tsx';
import MyReviewsPage from './pages/user/MyReviewsPage.tsx';
import ReviewFormPage from './pages/user/ReviewFormPage.tsx';
import ReviewDetailPage from './pages/user/ReviewDetailPage.tsx';
import CommunityReviewsPage from './pages/user/CommunityReviewsPage.tsx';
import DashboardPage from './pages/admin/DashboardPage.tsx';
import AdminPlacesPage from './pages/admin/AdminPlacesPage.tsx';
import PlaceFormPage from './pages/admin/PlaceFormPage.tsx';
import CategoryForm from './pages/admin/CategoryForm.tsx';
import UserPopup from './pages/admin/UserPopup.tsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.tsx';
import AdminReviewsPage from './pages/admin/AdminReviewsPage.tsx';
import AdminCommentsPage from './pages/admin/AdminCommentsPage.tsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx';
import StatisticsPage from './pages/admin/StatisticsPage.tsx';
import SystemPage from './pages/SystemPage.tsx';
import { PopupShell } from './components/common/PopupContext.tsx';
import { popupRoute } from './routes/popupRoutes.ts';
import { useApp } from './state/AppContext.tsx';
import Toast from './components/feedback/Toast.tsx';

function PopupGate({ admin = false, children }: {admin?: boolean; children: ReactNode}) {
  const { role } = useApp();
  if (admin ? role !== 'ADMIN' : role === 'GUEST') return <p role="alert">Bạn cần đăng nhập {admin ? 'bằng tài khoản ADMIN' : ''} để sử dụng biểu mẫu này.</p>;
  return children;
}

export default function App() {
  const {loading, ready, error, refresh} = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const config = popupRoute(location.pathname);
  const previousPage = useRef(location.pathname);
  const background = config ? location.state?.backgroundLocation || { pathname: config.fallback, search: '', hash: '', state: null, key: 'popup-background' } : location;
  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Khám phá', '/profile': 'Hồ sơ', '/my-reviews': 'Review của tôi', '/reviews': 'Đánh giá cộng đồng', '/admin': 'Quản trị', '/admin/places': 'Quản lý địa điểm', '/admin/categories': 'Quản lý danh mục', '/admin/users': 'Người dùng', '/admin/statistics': 'Thống kê' };
    document.title = `${config?.title || titles[location.pathname] || 'Địa điểm'} · TravelTaste`;
    if (config) return;
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    else if (previousPage.current !== location.pathname) window.scrollTo(0, 0);
    previousPage.current = location.pathname;
  }, [location.pathname, location.hash]);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !popupRoute(url.pathname)) return;
      event.preventDefault();
      navigate(url.pathname + url.search + url.hash, { replace: !!config, state: { backgroundLocation: background, popupFromLink: config ? !!location.state?.popupFromLink : true } });
    };
    document.addEventListener('click', click, true);
    return () => document.removeEventListener('click', click, true);
  }, [location, config?.type]);
  function close() {
    if (location.state?.popupFromLink) navigate(-1);
    else navigate(config!.fallback, { replace: true });
  }
  if (!ready) return <main className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-bold">TravelTaste</h1>{loading ? <p role="status">Đang tải dữ liệu…</p> : <div role="alert"><p>{error}</p><button onClick={() => void refresh().catch(() => {})}>Thử lại</button></div>}</main>;
  return <>
    <Toast />
    {error && <div role="alert" className="bg-red-50 p-4">{error} <button onClick={() => void refresh().catch(() => {})}>Tải lại dữ liệu</button></div>}
    <Routes location={background}>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/places" element={<SearchPage />} />
      <Route path="/places/:id" element={<PlaceDetailPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/top-10" element={<TopPlacesPage />} />
      <Route path="/profile" element={<AuthGate><ProfilePage /></AuthGate>} />
      <Route path="/my-reviews" element={<AuthGate><MyReviewsPage /></AuthGate>} />
      <Route path="/reviews" element={<CommunityReviewsPage />} />
      <Route path="/reviews/:id" element={<ReviewDetailPage key={background.pathname} />} />
      <Route path="/admin" element={<AuthGate admin><DashboardPage /></AuthGate>} />
      <Route path="/admin/places" element={<AuthGate admin><AdminPlacesPage /></AuthGate>} />
      <Route path="/admin/categories" element={<AuthGate admin><AdminCategoriesPage /></AuthGate>} />
      <Route path="/admin/reviews" element={<AuthGate admin><AdminReviewsPage /></AuthGate>} />
      <Route path="/admin/comments" element={<AuthGate admin><AdminCommentsPage /></AuthGate>} />
      <Route path="/admin/users" element={<AuthGate admin><AdminUsersPage /></AuthGate>} />
      <Route path="/admin/statistics" element={<AuthGate admin><StatisticsPage /></AuthGate>} />
      <Route path="/status/:code" element={<SystemPage />} />
      <Route path="*" element={<SystemPage code="404" />} />
    </Routes>
    {config && <PopupShell key={config.type === 'auth' ? 'auth' : location.pathname} title={config.title} close={close} large={config.large}>
      <Routes location={location}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/reviews/new" element={<PopupGate><ReviewFormPage /></PopupGate>} />
        <Route path="/reviews/:id/edit" element={<PopupGate><ReviewFormPage edit /></PopupGate>} />
        <Route path="/admin/places/new" element={<PopupGate admin><PlaceFormPage /></PopupGate>} />
        <Route path="/admin/places/:id/edit" element={<PopupGate admin><PlaceFormPage edit /></PopupGate>} />
        <Route path="/admin/categories/new" element={<PopupGate admin><CategoryForm /></PopupGate>} />
        <Route path="/admin/categories/:id/edit" element={<PopupGate admin><CategoryForm edit /></PopupGate>} />
        <Route path="/admin/users/:id" element={<PopupGate admin><UserPopup /></PopupGate>} />
      </Routes>
    </PopupShell>}
  </>;
}
