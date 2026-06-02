import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import Home from './pages/Home';
import PublicDashboard from './pages/PublicDashboard';
import Explorer from './pages/Explorer';
import AdminControl from './pages/AdminControl';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-lightcream text-forest-900 font-sans relative overflow-x-hidden">
      <Navbar />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/dashboard" element={<PublicDashboard />} />
          <Route path="/trace" element={<Explorer />} />
          <Route path="/admin" element={<AdminControl />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
