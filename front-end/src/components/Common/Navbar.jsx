import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/',          label: 'Trang Chủ' },
  { to: '/dashboard', label: 'Bảng Điều Khiển' },
  { to: '/trace',     label: 'Tra Cứu Minh Bạch' },
];

const PROTECTED_LINKS = [
  { to: '/workspace', label: 'Workspace',  icon: 'fa-layer-group' },
  { to: '/batches',   label: 'Lô Hàng',    icon: 'fa-boxes-stacked' },
  { to: '/admin',     label: 'Quản Trị',   icon: 'fa-shield-halved' },
];

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 glass-panel border-b border-coffee-200/50 transition-all duration-300 ${
        scrolled ? 'shadow-md shadow-forest-900/5' : ''
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-900 flex items-center justify-center shadow-lg shadow-forest-900/20 group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-seedling text-white text-xl" />
          </div>
          <span className="font-serif text-2xl font-bold text-forest-900 tracking-tight">ROBUSTRACE</span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden xl:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-forest-50 text-forest-900'
                    : 'text-forest-700 hover:bg-coffee-100 hover:text-forest-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <div className="w-px h-4 bg-coffee-300 mx-2" />

          {PROTECTED_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-forest-50 text-forest-900'
                    : 'text-forest-700 hover:bg-coffee-100 hover:text-forest-900'
                }`
              }
            >
              <i className={`fa-solid ${icon} text-xs`} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── CTA / Wallet ── */}
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-coffee-300 bg-white text-forest-800 font-medium hover:border-forest-500 hover:shadow-md transition-all text-sm">
            <i className="fa-solid fa-user-circle" /> Chọn Vai Trò
          </button>

          <Link to="/connect" className="relative group overflow-hidden rounded-xl p-[1px]">
            <span className="absolute inset-0 bg-gradient-to-r from-forest-400 via-coffee-400 to-forest-600 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-2 px-6 py-2.5 bg-forest-900 text-white rounded-xl font-medium text-sm transition-all group-hover:bg-opacity-90">
              <i className="fa-solid fa-wallet" /> Kết Nối Ví
            </div>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="xl:hidden text-forest-900 text-2xl p-2"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-coffee-100 px-6 py-4 flex flex-col gap-1 shadow-lg">
          {[...NAV_LINKS, ...PROTECTED_LINKS].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-forest-50 text-forest-900'
                    : 'text-forest-700 hover:bg-coffee-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-coffee-100 flex gap-3">
            <button className="flex-1 py-2.5 rounded-xl border border-coffee-300 text-forest-800 font-medium text-sm">
              Chọn Vai Trò
            </button>
            <Link
              to="/connect"
              className="flex-1 py-2.5 rounded-xl bg-forest-900 text-white font-medium text-sm text-center"
            >
              Kết Nối Ví
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
