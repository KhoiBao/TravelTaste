import { useState, useEffect } from 'react'
import axios from '../api/axios'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function GanToi({ user }) {
  const [items, setItems] = useState([])
  const [center, setCenter] = useState([21.0285, 105.8542])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        setCenter([latitude, longitude])
        axios.get('/dia-diem/gan-toi', { params: { lat: latitude, lng: longitude, banKinhKm: 10 } })
          .then(res => setItems(res.data.data || []))
          .catch(() => setItems([]))
          .finally(() => setLoading(false))
      },
      () => {
        axios.get('/dia-diem/gan-toi', { params: { lat: 21.0285, lng: 105.8542, banKinhKm: 10 } })
          .then(res => setItems(res.data.data || []))
          .catch(() => setItems([]))
          .finally(() => setLoading(false))
      }
    )
  }, [])

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <h2>Gần tôi</h2>
        <p className="text-muted">Tìm địa điểm gần vị trí hiện tại của bạn</p>
      </div>
      <div className="col-md-8">
        <div style={{ height: '400px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {items.map(d => (
              <Marker key={d.id} position={[d.viTri?.[1], d.viTri?.[0]]}>
                <Popup>{d.ten}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
      <div className="col-md-4">
        {loading ? (
          <div className="text-center">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="text-center">Không có địa điểm gần đây</div>
        ) : (
          <div className="list-group">
            {items.map(d => (
              <div key={d.id} className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{d.ten}</h6>
                  <small>{d.ratingAvg?.toFixed(1)} / 5</small>
                </div>
                <p className="mb-1 text-muted small">{d.diaChi?.quan}, {d.diaChi?.thanhPho}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
