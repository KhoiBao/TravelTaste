import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import axios from './api/axios'

import Home from './pages/Home'
import DiaDiemList from './pages/DiaDiemList'
import DiaDiemDetail from './pages/DiaDiemDetail'
import Top10 from './pages/Top10'
import GanToi from './pages/GanToi'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/auth/me')
      .then(res => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <BrowserRouter>
      <Layout user={user} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/dia-diem" element={<DiaDiemList user={user} />} />
        <Route path="/dia-diem/:slug" element={<DiaDiemDetail user={user} />} />
        <Route path="/top-10" element={<Top10 user={user} />} />
        <Route path="/gan-toi" element={<GanToi user={user} />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="/admin/*" element={
          user && user.role === 'ADMIN' ? <Navigate to="/admin/danh-muc" replace /> : <Navigate to="/dang-nhap" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
