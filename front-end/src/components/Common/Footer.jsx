import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  'Sản phẩm': [
    { to: '/',          label: 'Trang Chủ' },
    { to: '/dashboard', label: 'Bảng Điều Khiển' },
    { to: '/trace',     label: 'Tra Cứu Lô Hàng' },
    { to: '/wallet',    label: 'Kết Nối Ví' },
  ],
  'Giải pháp': [
    { to: '#', label: 'Cho Nông Dân' },
    { to: '#', label: 'Cho Nhà Rang Xay' },
    { to: '#', label: 'Cho Doanh Nghiệp' },
    { to: '#', label: 'Smart Contracts' },
  ],
  'Tài nguyên': [
    { to: '#', label: 'Tài liệu API' },
    { to: '#', label: 'Hướng dẫn sử dụng' },
    { to: '#', label: 'Blog' },
    { to: '#', label: 'Hỗ trợ' },
  ],
};

const SOCIAL = [
  { icon: 'fa-brands fa-twitter',    href: '#' },
  { icon: 'fa-brands fa-linkedin-in', href: '#' },
  { icon: 'fa-brands fa-github',     href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-200 pt-20 pb-10 border-t border-forest-800">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center">
                <i className="fa-solid fa-seedling text-coffee-300 text-xl" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">ROBUSTRACE</span>
            </Link>
            <p className="text-forest-300 text-sm leading-relaxed max-w-sm mb-6">
              Nền tảng truy xuất nguồn gốc cà phê ứng dụng công nghệ Blockchain, minh bạch hóa chuỗi cung ứng và nâng tầm giá trị nông sản Việt.
            </p>
            <div className="flex gap-4">
              {SOCIAL.map(({ icon, href }) => (
                <a
                  key={icon}
                  href={href}
                  className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center hover:bg-coffee-400 hover:text-forest-900 transition-colors"
                >
                  <i className={icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">{title}</h4>
              <ul className="space-y-4 text-sm">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className="hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-forest-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-forest-400">
          <p>© 2026 ROBUSTRACE. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
