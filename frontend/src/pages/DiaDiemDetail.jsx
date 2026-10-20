import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from '../api/axios'

export default function DiaDiemDetail({ user }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newReview, setNewReview] = useState({ soSao: 5, tieuDe: '', noiDung: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios.get(`/dia-diem/${slug}`)
      .then(res => setPlace(res.data.data))
      .catch(() => setPlace(null))
      .finally(() => setLoading(false))
  }, [slug])

  const handleStar = (val) => setNewReview({ ...newReview, soSao: val })

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`/dia-diem/${place.id}/reviews`, newReview)
      navigate(0, { replace: true }) // reload same page
    } catch (err) {
      alert(err.response?.data?.message || 'Gửi đánh giá thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center">Đang tải...</div>
  if (!place) return <div className="text-center">Không tìm thấy địa điểm</div>

  const stars = [5, 4, 3, 2, 1]
  const ratingRounded = Math.round(place.ratingAvg || 0)

  return (
    <div className="container py-4">
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item active">{place.ten}</li>
        </ol>
      </nav>

      <div className="row">
        <div className="col-lg-8">
          {place.hinhAnh && place.hinhAnh[0] && (
            <img src={place.hinhAnh[0]} className="img-fluid rounded mb-3" alt={place.ten} style={{ maxHeight: '400px', objectFit: 'cover' }} />
          )}
          <h1>{place.ten}</h1>
          <span className="badge bg-warning text-dark mb-2">{place.loai}</span>
          <p className="lead">{place.moTa}</p>
          <p><i className="bi bi-geo-alt"></i> {place.diaChi?.so} {place.diaChi?.duong}, {place.diaChi?.quan}, {place.diaChi?.thanhPho}</p>

          <hr />
          <h4>
            {place.ratingAvg?.toFixed(1)} <span className="text-warning">/ 5</span>
            <span className="text-muted small"> ({place.reviewCount} đánh giá)</span>
          </h4>
          <div className="mb-3">
            {[5, 4, 3, 2, 1].map(i => (
              <span key={i} className={`star ${i <= ratingRounded ? '' : 'empty'}`}>★</span>
            ))}
          </div>

          <hr />
          <h3>Đánh giá ({place.reviews?.length || 0})</h3>
          {user ? (
            <form onSubmit={handleSubmitReview} className="card p-3 mb-4 bg-light">
              <h5>Viết đánh giá của bạn</h5>
              <div className="mb-3">
                <label className="form-label">Chọn số sao</label>
                <div className="d-flex flex-row-reverse">
                  {stars.map(s => (
                    <div key={s} className="me-2">
                      <input
                        type="radio"
                        name="star"
                        id={`star-${s}`}
                        value={s}
                        checked={newReview.soSao === s}
                        onChange={() => handleStar(s)}
                        className="btn-check"
                      />
                      <label
                        className={`btn btn-outline-warning star ${newReview.soSao === s ? 'btn-warning active' : ''}`}
                        htmlFor={`star-${s}`}
                      >
                        {s}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Tiêu đề</label>
                <input type="text" className="form-control" value={newReview.tieuDe} onChange={e => setNewReview({ ...newReview, tieuDe: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Nội dung</label>
                <textarea className="form-control" rows="4" value={newReview.noiDung} onChange={e => setNewReview({ ...newReview, noiDung: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-warning" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi đánh giá'}</button>
            </form>
          ) : (
            <div className="alert alert-info">Vui lòng <Link to="/dang-nhap">đăng nhập</Link> để viết đánh giá.</div>
          )}

          {place.reviews?.map((r, idx) => (
            <div key={r.reviewId || idx} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <h6 className="mb-1">{r.tenUser}</h6>
                  <span className="text-warning">★ {r.soSao}</span>
                </div>
                <p className="card-text">{r.noiDung}</p>
                {r.hinhAnh?.length && (
                  <div className="mt-2">
                    {r.hinhAnh.map((h, i) => (
                      <img key={i} src={h} alt="review" className="img-thumbnail" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    ))}
                  </div>
                )}
                {r.binhLuan?.length && (
                  <div className="mt-3 border-top pt-2">
                    <h6 className="text-muted small">Bình luận ({r.binhLuan.length})</h6>
                    {r.binhLuan.map(c => (
                      <div key={c.commentId} className="small mb-1">
                        <strong>{c.tenUser}</strong>: {c.noiDung}
                        {c.traLoi?.length && (
                          <div className="ms-3 mt-1 small text-muted">
                            {c.traLoi.map(t => (
                              <div key={t.commentId} className="mb-1">
                                <strong>{t.tenUser}</strong> (trả lời): {t.noiDung}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Thông tin</h5>
              <p className="card-text small text-muted">{place.diaChi?.thanhPho}</p>
              <p className="card-text small text-muted">{place.danhMuc?.map(d => d.ten).join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
