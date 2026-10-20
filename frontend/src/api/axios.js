import axios from 'axios'

const instance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor để xử lý lỗi chung
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      window.location.href = '/dang-nhap'
    }
    return Promise.reject(err)
  }
)

export default instance
