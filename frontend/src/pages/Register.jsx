import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../api/axios'

export default function Register() {
  const [form, setForm] = useState({ username: '', hoTen: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/auth/register', form)
      navigate('/dang-nhap')
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-4">
        <h2 className="text-center mb-4">Đăng ký</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <input type="text" className="form-control" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Họ tên</label>
            <input type="text" className="form-control" value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-success w-100" disabled={loading}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</button>
        </form>
        <p className="text-center mt-3">Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link></p>
      </div>
    </div>
  )
}
