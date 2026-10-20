import { useState, useEffect } from 'react'
import axios from '../api/axios'

export default function Top10({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/discover/top10')
      .then(res => setItems(res.data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="row">
      <div className="col-12">
        <h2 className="mb-4">Top 10 địa điểm nổi bật</h2>
        {loading ? (
          <div className="text-center">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="text-center">Chưa có dữ liệu</div>
        ) : (
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr><th>#</th><th>Địa điểm</th><th>Loại</th><th>Điểm TB</th><th>Số review</th></tr>
            </thead>
            <tbody>
              {items.map((d, i) => (
                <tr key={d.id}>
                  <td>{i + 1}</td>
                  <td>{d.ten}</td>
                  <td><span className="badge bg-info text-dark">{d.loai}</span></td>
                  <td>{d.ratingAvg?.toFixed(1)}</td>
                  <td>{d.reviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
