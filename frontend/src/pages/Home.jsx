import { useState, useEffect } from 'react'
import axios from '../api/axios'

export default function Home({ user }) {
  const [top10, setTop10] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/discover/top10')
      .then(res => setTop10(res.data.data || []))
      .catch(() => setTop10([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="mb-4">Top 10 địa điểm nổi bật</h2>
        {loading ? (
          <div className="text-center">Đang tải...</div>
        ) : top10.length === 0 ? (
          <div className="text-center">Chưa có dữ liệu</div>
        ) : (
          <div className="row">
            {top10.map(d => (
              <div key={d.id} className="col-md-4 col-sm-6 mb-3">
                <div className="card h-100 shadow-sm">
                  {d.hinhAnh && d.hinhAnh[0] ? (
                    <img src={d.hinhAnh[0]} className="card-img-top" alt={d.ten} style={{ height: '200px', objectFit: 'cover' }} />
                  ) : (
                    <div className="card-img-top bg-secondary d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                      <span className="text-white-50">Không có ảnh</span>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{d.ten}</h5>
                    <span className="badge bg-warning text-dark mb-2">{d.loai}</span>
                    <div className="mt-auto">
                      <strong>{d.ratingAvg?.toFixed(1)}</strong> / 5 ({d.reviewCount} đánh giá)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
