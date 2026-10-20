import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { Link } from 'react-router-dom'

export default function DiaDiemList({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    axios.get('/dia-diem', { params: { q, page: 1, size: 20 } })
      .then(res => setItems(res.data.data.content || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm địa điểm (phở, bún, cà phê...)"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="col-12 text-center">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="col-12 text-center">Không tìm thấy địa điểm nào</div>
      ) : (
        <div className="col-md-4 col-sm-6 mb-3" key={Math.random()}>
          {items.map(d => (
            <div key={d.id} className="card h-100 shadow-sm">
              {d.hinhAnh && d.hinhAnh[0] ? (
                <img src={d.hinhAnh[0]} className="card-img-top" alt={d.ten} style={{ height: '180px', objectFit: 'cover' }} />
              ) : (
                <div className="card-img-top bg-secondary d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                  <span className="text-white-50">Không ảnh</span>
                </div>
              )}
              <div className="card-body">
                <h5 className="card-title"><Link to={`/dia-diem/${d.slug}`}>{d.ten}</Link></h5>
                <span className="badge bg-info text-dark mb-2">{d.loai}</span>
                <p className="card-text text-muted small">{d.diaChi?.quan}, {d.diaChi?.thanhPho}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{d.ratingAvg?.toFixed(1)}</strong> / 5
                  <span className="text-muted small">({d.reviewCount} đánh giá)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
