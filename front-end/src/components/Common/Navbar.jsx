import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useWeb3Auth } from '../../context/Web3AuthContext'; // 🌟 Import context để lấy trạng thái phân quyền

const NAV_LINKS = [
  { to: '/', label: 'Trang Chủ' },
  { to: '/dashboard', label: 'Tổng quan' },
  { to: '/trace', label: 'Tra Cứu Minh Bạch' },
];

const PROTECTED_LINKS = [
  { to: '/workspace', label: 'Workspace', icon: 'fa-boxes-stacked' },
  { to: '/admin', label: 'Quản Trị', icon: 'fa-shield-halved' },
];

function shortenAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { account, role, authStatus, logout } = useWeb3Auth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 glass-panel border-b border-coffee-200/50 transition-all duration-300 ${scrolled ? 'shadow-md shadow-forest-900/5 backdrop-blur-md bg-white/80' : 'bg-transparent'
        }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">

        {/* 🌟 NHÓM 1: Gôm cụm Logo và Navigation sát nhau bên trái */}
        <div className="flex items-center gap-10">
          {/* gap-10 tạo khoảng cách vừa vặn giữa Logo và phần tử đầu tiên của Nav, có thể sửa thành gap-8 hoặc gap-12 tùy ý */}

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
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
                  `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive
                    ? 'bg-forest-50 text-forest-900'
                    : 'text-forest-700 hover:bg-coffee-100 hover:text-forest-900'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Các Link đặc quyền khi authStatus === 'ACTIVE' */}
            {authStatus === 'ACTIVE' && (
              <>
                <div className="w-px h-4 bg-coffee-300 mx-2" />
                {role && role !== 'ADMIN' && role !== 'ANONYMOUS' && (
                  <NavLink
                    to="/workspace"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-forest-50 text-forest-900' : 'text-forest-700 hover:bg-coffee-100 hover:text-forest-900'
                      }`
                    }
                  >
                    <i className="fa-solid fa-boxes-stacked text-xs" />
                    Lô Hàng
                  </NavLink>
                )}

                {role === 'ADMIN' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${isActive ? 'bg-forest-50 text-forest-900' : 'text-forest-700 hover:bg-coffee-100 hover:text-forest-900'
                      }`
                    }
                  >
                    <i className="fa-solid fa-shield-halved text-xs" />
                    Quản Trị
                  </NavLink>
                )}
              </>
            )}
          </nav>
        </div>

        {/* ── NHÓM 2: Khối CTA / Wallet Hub nằm độc lập bên phải ── */}
        <div className="flex items-center gap-4">
          {authStatus === 'ACTIVE' && account ? (
            <div className="flex items-center gap-3 bg-coffee-50 border border-coffee-200 pl-4 pr-2 py-1.5 rounded-xl shadow-xs">
              <div className="flex flex-col text-right">
                <span className="text-xs font-mono font-bold text-forest-900">{shortenAddress(account)}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">{role}</span>
              </div>
              <button
                onClick={logout}
                title="Đăng xuất phiên làm việc"
                className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 text-coffee-500 hover:text-red-600 transition-colors flex items-center justify-center border border-coffee-200"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
              </button>
            </div>
          ) : (
            <Link to="/connect" className="relative group overflow-hidden rounded-xl p-[1px] block">
              <span className="absolute inset-0 bg-gradient-to-r from-forest-400 via-coffee-400 to-forest-600 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-2 px-6 py-2.5 bg-forest-900 text-white rounded-xl font-medium text-sm transition-all group-hover:bg-opacity-90">
                <i className="fa-solid fa-wallet" /> Kết Nối Ví
              </div>
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            className="xl:hidden text-forest-900 text-2xl p-2 focus:outline-none"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>

      </div>

      {/* ── Mobile Side Menu ── */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-coffee-100 px-6 py-4 flex flex-col gap-1 shadow-lg animate-fadeIn">
          {/* Menu thông thường */}
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg font-medium text-sm transition-colors ${isActive ? 'bg-forest-50 text-forest-900' : 'text-forest-700 hover:bg-coffee-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Menu bảo mật trên Mobile */}
          {authStatus === 'ACTIVE' && (
            <>
              <div className="h-px bg-coffee-100 my-2" />

              <NavLink
                to="/workspace"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${isActive ? 'bg-forest-50 text-forest-900' : 'text-forest-700 hover:bg-coffee-50'
                  }`
                }
              >
                <i className="fa-solid fa-boxes-stacked text-forest-600" />
                Lô Hàng
              </NavLink>

              {role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-3 ${isActive ? 'bg-forest-50 text-forest-900' : 'text-forest-700 hover:bg-coffee-50'
                    }`
                  }
                >
                  <i className="fa-solid fa-shield-halved text-forest-600" />
                  Quản Trị
                </NavLink>
              )}
            </>
          )}

          <div className="pt-3 mt-2 border-t border-coffee-100">
            {authStatus === 'ACTIVE' && account ? (
              <div className="flex items-center justify-between p-3 bg-coffee-50 rounded-xl">
                <div>
                  <p className="text-xs font-mono font-bold text-forest-900">{shortenAddress(account)}</p>
                  <p className="text-[10px] uppercase font-extrabold tracking-wider text-amber-700">{role}</p>
                </div>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/connect"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-forest-900 text-white font-medium text-sm text-center shadow-xs"
              >
                <i className="fa-solid fa-wallet" /> Kết Nối Ví
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}