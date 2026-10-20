import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from '../api/axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

export default function Layout({ user }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout')
    } catch (e) {
      // ignore
    }
    window.location.href = '/dang-nhap'
  }

  const navClasses = `collapse navbar-collapse ${menuOpen ? 'show' : ''}`

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <Link to="/" className="navbar-brand">TravelTaste</Link>
          <button className="navbar-toggler" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={navClasses} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><Link to="/" className="nav-link">Trang chủ</Link></li>
              <li className="nav-item"><Link to="/dia-diem" className="nav-link">Địa điểm</Link></li>
              <li className="nav-item"><Link to="/top-10" className="nav-link">Top 10 nổi bật</Link></li>
              <li className="nav-item"><Link to="/gan-toi" className="nav-link">Gần tôi</Link></li>
            </ul>
            <ul className="navbar-nav mb-2 mb-lg-0">
              {user ? (
                <>
                  <li className="nav-item"><span className="nav-link text-white-50">Xin chào, {user.hoTen}</span></li>
                  {user.role === 'ADMIN' && (
                    <li className="nav-item"><Link to="/admin/danh-muc" className="nav-link">Quản trị</Link></li>
                  )}
                  <li className="nav-item"><button className="nav-link btn btn-outline-light btn-sm" onClick={handleLogout}>Đăng xuất</button></li>
                </>
              ) : (
                <>
                  <li className="nav-item"><Link to="/dang-nhap" className="nav-link">Đăng nhập</Link></li>
                  <li className="nav-item"><Link to="/dang-ky" className="nav-link btn btn-success btn-sm ms-2">Đăng ký</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mt-5 pt-4">
        {typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && user && user.role !== 'ADMIN' && (
          <div className="alert alert-danger">Bạn không có quyền truy cập trang quản trị.</div>
        )}
        <main style={{ minHeight: '60vh' }} />
      </div>

      <footer className="bg-dark text-white-50 py-4 mt-auto">
        <div className="container text-center">
          <small>TravelTaste - Nền tảng đánh giá địa điểm du lịch / ăn uống</small>
        </div>
      </footer>
    </>
  )
}
