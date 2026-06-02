<<<<<<< HEAD
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
=======
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation.jsx'
import Home from './pages/Home/Home.jsx'
import About from './pages/About/About.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import './App.css'

function App() {
  return (
    <>
      <Navigation />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

export default App
>>>>>>> 3defb4b2b39bef0599cd3f25d44aa463d40ba079
