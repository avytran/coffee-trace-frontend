import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Footer from '../components/Common/Footer.jsx'
import LoadingSpinner from '../components/Common/LoadingSpinner.jsx'
import Navbar from '../components/Common/Navbar.jsx'
import { initialDashboardData, loadPublicDashboardData } from '../data/publicDashboardData.js'

const periods = ['Hôm nay', 'Tuần này', 'Tháng này']

function KpiCard({ item }) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <p className="text-sm text-forest-600 font-medium mb-1">{item.label}</p>
          <h3 className="text-3xl font-bold text-forest-900 font-serif">{item.value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-lg ${item.iconClass} flex items-center justify-center shrink-0`}>
          <i className={`${item.iconFamily || 'fa-solid'} ${item.icon}`} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={`${item.deltaClass} font-medium flex items-center gap-1`}>
          <i className={`fa-solid ${item.trendIcon} text-xs`} />
          {item.delta}
        </span>
        <span className="text-forest-400">{item.note}</span>
      </div>
    </div>
  )
}

function ProductionChart({ data }) {
  return (
    <div className="lg:col-span-2 dashboard-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-bold text-forest-900 text-lg">Biểu Đồ Sản Lượng & Giao Dịch</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-forest-600" />
            <span className="text-forest-700">Robusta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-coffee-400" />
            <span className="text-forest-700">Arabica</span>
          </div>
        </div>
      </div>
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="robustaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#357F63" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#357F63" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="arabicaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DDB892" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#DDB892" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(228, 190, 160, 0.35)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#7F5539', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#7F5539', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(221, 184, 146, 0.45)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              }}
              formatter={(value, name) => [`${value.toLocaleString('vi-VN')} tấn`, name === 'robusta' ? 'Robusta' : 'Arabica']}
              labelFormatter={(label) => `Tháng ${label}`}
            />
            <Area
              type="monotone"
              dataKey="robusta"
              stroke="#357F63"
              strokeWidth={3}
              fill="url(#robustaFill)"
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="arabica"
              stroke="#DDB892"
              strokeWidth={3}
              fill="url(#arabicaFill)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SegmentChart({ data }) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-forest-900 text-lg">Phân Bổ Phân Đoạn</h3>
        <span className="text-xs font-semibold uppercase tracking-wider text-forest-500">Tỷ lệ</span>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={100}
              paddingAngle={3}
              stroke="#fff"
              strokeWidth={4}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
            <Legend
              iconType="circle"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 12, color: '#2A6550', paddingTop: 16 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function HeatmapCard() {
  return (
    <div className="dashboard-card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-forest-900 text-lg">Bản Đồ Nhiệt: Đắk Lắk</h3>
        <button className="text-forest-500 hover:text-forest-700" aria-label="Mở rộng bản đồ">
          <i className="fa-solid fa-expand" />
        </button>
      </div>
      <div className="min-h-[300px] flex-grow relative rounded-xl overflow-hidden bg-forest-50 border border-coffee-100 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-tr from-forest-900/40 to-coffee-400/20" />

        <div className="absolute z-10 w-full h-full p-4">
          <div className="absolute top-[30%] left-[40%] bg-white p-3 rounded-lg shadow-lg border border-coffee-200 text-sm z-20 transform -translate-x-1/2 -translate-y-full mb-2">
            <div className="font-bold text-forest-900 border-b border-coffee-100 pb-1 mb-1">Huyện Cư M'gar</div>
            <div className="text-forest-600">
              Sản lượng: <span className="font-semibold text-forest-800">4,200 Tấn</span>
            </div>
            <div className="text-forest-600">
              Nông hộ: <span className="font-semibold text-forest-800">850</span>
            </div>
            <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-coffee-200 rotate-45" />
          </div>
          <div className="absolute top-[30%] left-[40%] w-12 h-12 bg-coffee-500/60 rounded-full blur-md animate-pulse" />
          <div className="absolute top-[50%] left-[60%] w-16 h-16 bg-forest-500/50 rounded-full blur-md" />
          <div className="absolute top-[70%] left-[30%] w-10 h-10 bg-coffee-400/50 rounded-full blur-md" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-forest-600">
        <span>Thấp</span>
        <div className="flex-grow mx-4 h-2 rounded-full bg-gradient-to-r from-forest-100 via-coffee-300 to-coffee-600" />
        <span>Cao</span>
      </div>
    </div>
  )
}

function ActivityFeed({ activities }) {
  return (
    <div className="dashboard-card p-6 lg:col-span-1">
      <h3 className="font-bold text-forest-900 text-lg mb-6">Hoạt Động Mới Nhất</h3>
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div className="flex gap-4" key={`${activity.title}-${activity.time}`}>
            <div className="relative">
              <div className={`w-10 h-10 rounded-full ${activity.iconClass} flex items-center justify-center z-10 relative`}>
                <i className={`${activity.iconFamily || 'fa-solid'} ${activity.icon}`} />
              </div>
              {index < activities.length - 1 && (
                <div className="absolute top-10 bottom-[-24px] left-1/2 w-px bg-coffee-200 transform -translate-x-1/2" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-forest-900">{activity.title}</p>
              <p className="text-xs text-forest-500 mt-1">{activity.meta}</p>
              <p className="text-xs text-forest-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-3 rounded-xl border border-coffee-200 text-forest-700 text-sm font-medium hover:bg-coffee-50 transition-colors">
        Xem Tất Cả
      </button>
    </div>
  )
}

function LotsTable({ lots }) {
  return (
    <div className="dashboard-card p-0 lg:col-span-2 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-coffee-100 flex items-center justify-between">
        <h3 className="font-bold text-forest-900 text-lg">Lô Hàng Đang Di Chuyển</h3>
        <button className="text-forest-600 hover:text-forest-900 text-sm font-medium">
          Chi tiết <i className="fa-solid fa-arrow-right ml-1" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-forest-50 text-forest-600 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Mã Lô</th>
              <th className="px-6 py-4 font-medium">Loại</th>
              <th className="px-6 py-4 font-medium">Khối Lượng</th>
              <th className="px-6 py-4 font-medium">Giai Đoạn</th>
              <th className="px-6 py-4 font-medium">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-coffee-100">
            {lots.map((lot) => (
              <tr key={lot.id} className="hover:bg-coffee-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-forest-900">{lot.id}</td>
                <td className="px-6 py-4 text-forest-700">{lot.type}</td>
                <td className="px-6 py-4 text-forest-700">{lot.weight}</td>
                <td className="px-6 py-4 text-forest-700">{lot.stage}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${lot.statusClass} text-xs font-medium`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${lot.dotClass}`} />
                    {lot.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PublicDashboard() {
  const [period, setPeriod] = useState('Hôm nay')
  const [dashboardData, setDashboardData] = useState(initialDashboardData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    setLoading(true)
    loadPublicDashboardData({ period }).then((data) => {
      if (!active) return
      setDashboardData(data)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [period])

  return (
    <div className="m-0 p-0 bg-coffee-50 text-forest-900 font-sans relative overflow-x-hidden min-h-screen flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-grain mix-blend-multiply opacity-50" />
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-forest-900 mb-2">Tổng Quan Chuỗi Cung Ứng</h1>
              <p className="text-forest-700 text-sm">Dữ liệu thời gian thực từ mạng lưới ROBUSTRACE</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="glass-panel flex items-center p-1 rounded-xl">
                {periods.map((item) => (
                  <button
                    key={item}
                    onClick={() => setPeriod(item)}
                    className={[
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      period === item
                        ? 'bg-white text-forest-900 shadow-sm'
                        : 'text-forest-700 hover:text-forest-900',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 rounded-xl border border-coffee-300 bg-white text-forest-800 font-medium hover:border-forest-500 transition-all text-sm flex items-center gap-2">
                <i className="fa-solid fa-filter" />
                Lọc Nâng Cao
              </button>
            </div>
          </div>

          {loading ? (
            <div className="dashboard-card">
              <LoadingSpinner label="Đang đồng bộ dữ liệu công khai..." />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardData.kpis.map((item) => (
                  <KpiCard key={item.label} item={item} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <ProductionChart data={dashboardData.production} />
                <SegmentChart data={dashboardData.segments} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <HeatmapCard />
                <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ActivityFeed activities={dashboardData.activities} />
                  <LotsTable lots={dashboardData.lots} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
