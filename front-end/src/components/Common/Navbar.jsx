import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const publicLinks = [
  { label: 'Trang Chủ', to: '/' },
  { label: 'Bảng Điều Khiển', to: '/dashboard' },
  { label: 'Tra Cứu Minh Bạch', to: '/#trace' },
]

const workspaceLinks = [
  { label: 'Workspace', href: '#workspace', icon: 'fa-layer-group' },
  { label: 'Lô Hàng', href: '#lots', icon: 'fa-boxes-stacked' },
  { label: 'Quản Trị', href: '#admin', icon: 'fa-shield-halved' },
]

function linkClass({ isActive }) {
  return [
    'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
    isActive ? 'bg-forest-50 text-forest-900' : 'text-forest-700 hover:bg-coffee-100 hover:text-forest-900',
  ].join(' ')
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 glass-panel border-b border-coffee-200/50 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group" aria-label="ROBUSTRACE">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-900 flex items-center justify-center shadow-lg shadow-forest-900/20 group-hover:scale-105 transition-transform">
            <i className="fa-solid fa-seedling text-white text-xl" />
          </div>
          <span className="font-serif text-2xl font-bold text-forest-900 tracking-tight">ROBUSTRACE</span>
        </NavLink>

        <nav className="hidden xl:flex items-center gap-1" aria-label="Điều hướng công khai">
          {publicLinks.map((link) => (
            <NavLink key={link.label} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
          <div className="w-px h-4 bg-coffee-300 mx-2" />
          {workspaceLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-lg text-forest-700 hover:bg-coffee-100 hover:text-forest-900 font-medium text-sm transition-colors flex items-center gap-2"
            >
              <i className={`fa-solid ${link.icon} text-xs`} />
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          <button className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-coffee-300 bg-white text-forest-800 font-medium hover:border-forest-500 hover:shadow-md transition-all text-sm">
            <i className="fa-solid fa-user-circle" />
            Chọn Vai Trò
          </button>
          <button className="relative group overflow-hidden rounded-xl p-[1px]">
            <span className="absolute inset-0 bg-gradient-to-r from-forest-400 via-coffee-400 to-forest-600 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 bg-forest-900 text-white rounded-xl font-medium text-sm transition-all group-hover:bg-opacity-90">
              <i className="fa-solid fa-wallet" />
              <span className="hidden sm:inline">Kết Nối Ví</span>
            </span>
          </button>
          <button
            type="button"
            className="xl:hidden text-forest-900 text-2xl p-2"
            aria-label="Mở menu"
            onClick={() => setOpen((value) => !value)}
          >
            <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {open && (
        <nav className="xl:hidden border-t border-coffee-200 bg-white/95 px-6 py-4 shadow-xl" aria-label="Menu di động">
          <div className="max-w-[1440px] mx-auto grid gap-2">
            {publicLinks.map((link) => (
              <NavLink key={link.label} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {workspaceLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-lg text-forest-700 hover:bg-coffee-100 hover:text-forest-900 font-medium text-sm transition-colors flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <i className={`fa-solid ${link.icon} text-xs`} />
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
