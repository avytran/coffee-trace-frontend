import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Sản phẩm',
    links: ['Trang Chủ', 'Bảng Điều Khiển', 'Tra Cứu Lô Hàng', 'Kết Nối Ví'],
  },
  {
    title: 'Giải pháp',
    links: ['Cho Nông Dân', 'Cho Nhà Rang Xay', 'Cho Doanh Nghiệp', 'Smart Contracts'],
  },
  {
    title: 'Tài nguyên',
    links: ['Tài liệu API', 'Hướng dẫn sử dụng', 'Blog', 'Hỗ trợ'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-200 pt-20 pb-10 border-t border-forest-800 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center">
                <i className="fa-solid fa-seedling text-coffee-300 text-xl" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">ROBUSTRACE</span>
            </Link>
            <p className="text-forest-300 text-sm leading-relaxed max-w-sm mb-6">
              Nền tảng truy xuất nguồn gốc cà phê ứng dụng công nghệ Blockchain, minh bạch hóa chuỗi cung ứng và
              nâng tầm giá trị nông sản Việt.
            </p>
            <div className="flex gap-4">
              {['fa-twitter', 'fa-linkedin-in', 'fa-github'].map((icon) => (
                <a
                  key={icon}
                  href="#social"
                  className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center hover:bg-coffee-400 hover:text-forest-900 transition-colors"
                  aria-label={icon.replace('fa-', '')}
                >
                  <i className={`fa-brands ${icon}`} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">{column.title}</h4>
              <ul className="space-y-4 text-sm">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#footer" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-forest-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-forest-400">
          <p>&copy; 2026 ROBUSTRACE. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Điều khoản dịch vụ
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
