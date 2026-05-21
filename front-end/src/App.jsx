import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoadingSpinner from './components/Common/LoadingSpinner.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const PublicDashboard = lazy(() => import('./pages/PublicDashboard.jsx'))

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner label="Đang tải giao diện..." fullScreen />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<PublicDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
