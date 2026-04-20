import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google' // 1. Import thư viện Google

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Bọc toàn bộ App và dán Client ID bạn lấy từ Google Cloud vào đây */}
    <GoogleOAuthProvider clientId="41485650154-5p8qoqmvegoop1rv878hl1to98piqc9s.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)