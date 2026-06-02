/**
 * PublicDashboard – Bảng Điều Khiển Công Khai
 *
 * State architecture designed to accept live data from the API layer (Người 4).
 * All mock data lives in DEFAULT_* constants – swap them out by calling
 * the setters exposed via the useDashboardData() hook pattern.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/Common/LoadingSpinner';

/* ─────────────────────────────────────────────
   MOCK / DEFAULT DATA
   Replace by injecting real API responses via
   setDashboardData() or the future useApi hook.
───────────────────────────────────────────── */
const DEFAULT_KPI = [
  { id: 'production', label: 'Tổng Sản Lượng (Tấn)', value: '12,450', delta: '+15.3%', up: true, icon: 'fa-weight-scale', iconBg: 'bg-forest-100', iconColor: 'text-forest-600' },
  { id: 'batches', label: 'Lô Hàng Đang Xử Lý', value: '842', delta: '+5.2%', up: true, icon: 'fa-boxes-stacked', iconBg: 'bg-coffee-100', iconColor: 'text-coffee-600' },
  { id: 'farmers', label: 'Nông Hộ Tham Gia', value: '2,150', delta: '+120', up: true, icon: 'fa-users', iconBg: 'bg-forest-900', iconColor: 'text-white' },
  { id: 'txValue', label: 'Giá Trị Giao Dịch (ETH)', value: '458.2', delta: '-2.4%', up: false, icon: 'fa-ethereum fa-brands', iconBg: 'bg-coffee-400', iconColor: 'text-white' },
];

const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const DEFAULT_PRODUCTION = MONTHS.map((m, i) => ({
  month: m,
  Robusta: [1200, 1350, 1100, 1500, 1800, 2100, 2400, 2200, 1900, 1600, 1400, 1300][i],
  Arabica: [400, 450, 420, 480, 550, 600, 650, 620, 580, 500, 460, 430][i],
}));

/** Tỷ lệ phân bổ phân đoạn */
const DEFAULT_SEGMENT = [
  { name: 'Robusta', value: 68, color: '#357F63' },
  { name: 'Arabica', value: 22, color: '#DDB892' },
  { name: 'Blend', value: 7, color: '#6CB297' },
  { name: 'Khác', value: 3, color: '#9BCCB7' },
];

const DEFAULT_BATCHES = [
  { id: '#LOT-8492', type: 'Robusta Sơ Chế Ướt', weight: '2.5 Tấn', stage: 'Đang Vận Chuyển', status: 'processing' },
  { id: '#LOT-8491', type: 'Arabica Cầu Đất', weight: '1.2 Tấn', stage: 'Lưu Kho', status: 'done' },
  { id: '#LOT-8490', type: 'Robusta Honey', weight: '3.8 Tấn', stage: 'Kiểm Định Chất Lượng', status: 'processing' },
  { id: '#LOT-8489', type: 'Robusta Natural', weight: '5.0 Tấn', stage: 'Rang Xay', status: 'done' },
  { id: '#LOT-8488', type: 'Arabica Đặc Sản', weight: '0.5 Tấn', stage: 'Đóng Gói', status: 'pending' },
];

const DEFAULT_ACTIVITIES = [
  { icon: 'fa-circle-check', iconBg: 'bg-forest-600', title: 'Lô hàng #LOT-8492 vừa được xác thực', sub: 'Nông trại: Nguyễn Văn A – Buôn Mê Thuột', time: '5 phút trước' },
  { icon: 'fa-truck', iconBg: 'bg-coffee-500', title: 'Bắt đầu vận chuyển #LOT-8490', sub: 'Điểm đến: Nhà máy rang xay Trung Nguyên', time: '45 phút trước' },
  { icon: 'fa-ethereum fa-brands', iconBg: 'bg-forest-900', title: 'Smart Contract được cập nhật', sub: 'TxHash: 0x7f8c...3a9b', time: '2 giờ trước' },
  { icon: 'fa-user-plus', iconBg: 'bg-coffee-400', title: 'Nông hộ mới đăng ký tham gia', sub: 'Khu vực: Buôn Hồ, Đắk Lắk', time: '5 giờ trước' },
];

/* ─────────────────────────────────────────────
   STATUS badge helper
───────────────────────────────────────────── */
const STATUS_MAP = {
  processing: { bg: 'bg-coffee-100', text: 'text-coffee-700', dot: 'bg-coffee-500', label: 'Đang xử lý' },
  done: { bg: 'bg-forest-100', text: 'text-forest-700', dot: 'bg-forest-500', label: 'Hoàn thành' },
  pending: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500', label: 'Chờ xử lý' },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${s.bg} ${s.text} text-xs font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Custom Pie label
───────────────────────────────────────────── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
}

/* ─────────────────────────────────────────────
   FADE ANIMATION
───────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
});

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default function PublicDashboard() {
  /* ── Dynamic state – ready to be populated by API (Người 4) ── */
  const [kpi, setKpi] = useState(DEFAULT_KPI);
  const [production, setProduction] = useState(DEFAULT_PRODUCTION);
  const [segment, setSegment] = useState(DEFAULT_SEGMENT);
  const [batches, setBatches] = useState(DEFAULT_BATCHES);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('today'); // 'today' | 'week' | 'month'

  const setDashboardData = useCallback((data) => {
    if (data.kpi) setKpi(data.kpi);
    if (data.production) setProduction(data.production);
    if (data.segment) setSegment(data.segment);
    if (data.batches) setBatches(data.batches);
    if (data.activities) setActivities(data.activities);
  }, []);

  /* ── Simulate API refetch on period change ── */
  useEffect(() => {
    // TODO: Replace this stub with real API call, e.g.:
    // fetchDashboardData(period).then(setDashboardData)
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [period]);

  return (
    <div className="pt-4 pb-16">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", mixBlendMode: 'multiply' }}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* ── Page header & period filters ── */}
        <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-forest-900 mb-2">Tổng Quan Chuỗi Cung Ứng</h1>
            <p className="text-forest-700 text-sm">Dữ liệu thời gian thực từ mạng lưới ROBUSTRACE</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-panel flex items-center p-1 rounded-xl">
              {[
                { key: 'today', label: 'Hôm nay' },
                { key: 'week', label: 'Tuần này' },
                { key: 'month', label: 'Tháng này' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === key
                    ? 'bg-white text-forest-900 shadow-sm'
                    : 'text-forest-700 hover:text-forest-900'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 rounded-xl border border-coffee-300 bg-white text-forest-800 font-medium hover:border-forest-500 transition-all text-sm flex items-center gap-2">
              <i className="fa-solid fa-filter" /> Lọc Nâng Cao
            </button>
          </div>
        </motion.div>

        {/* ── KPI Cards ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
        >
          {kpi.map((card, i) => (
            <motion.div key={card.id} {...fadeUp(0.05 * i)} className="dashboard-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-forest-600 font-medium mb-1">{card.label}</p>
                  <h3 className="text-3xl font-bold text-forest-900 font-serif">{card.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center ${card.iconColor}`}>
                  <i className={`fa-solid ${card.icon}`} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`${card.up ? 'text-forest-500' : 'text-coffee-600'} font-medium flex items-center gap-1`}>
                  <i className={`fa-solid ${card.up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-xs`} />
                  {card.delta}
                </span>
                <span className="text-forest-400">so với tháng trước</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Charts Row ── */}
        {loading ? (
          <LoadingSpinner variant="card" message="Đang tải biểu đồ..." />
        ) : (
          <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Production Area Chart (lg:col-span-2) */}
            <div className="lg:col-span-2 dashboard-card p-6">
              <div className="flex items-center justify-between mb-6">
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

              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={production} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradRobusta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#357F63" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#357F63" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradArabica" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DDB892" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#DDB892" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(228,190,160,0.2)" />
                  <XAxis dataKey="month" tick={{ fill: '#7F5539', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7F5539', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #EED5C1', borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ color: '#1B4332', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="Robusta" stroke="#357F63" strokeWidth={2.5} fill="url(#gradRobusta)" dot={false} activeDot={{ r: 5, fill: '#357F63' }} />
                  <Area type="monotone" dataKey="Arabica" stroke="#DDB892" strokeWidth={2.5} fill="url(#gradArabica)" dot={false} activeDot={{ r: 5, fill: '#DDB892' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Segment Pie Chart */}
            <div className="dashboard-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-forest-900 text-lg">Phân Bổ Phân Đoạn</h3>
                <button className="text-forest-500 hover:text-forest-700 text-sm">
                  <i className="fa-solid fa-expand" />
                </button>
              </div>

              <div className="flex-grow flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={segment}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={52}
                      dataKey="value"
                      labelLine={false}
                      label={PieLabel}
                    >
                      {segment.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="w-full mt-4 space-y-2">
                  {segment.map(({ name, value, color }) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-forest-700">{name}</span>
                      </div>
                      <span className="font-semibold text-forest-900">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Activity + Table Row ── */}
        <motion.div {...fadeUp(0.15)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity feed */}
          <div className="dashboard-card p-6 flex flex-col">
            <h3 className="font-bold text-forest-900 text-lg mb-6">Hoạt Động Gần Đây</h3>
            <div className="space-y-6 flex-grow">
              {activities.map(({ icon, iconBg, title, sub, time }, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center text-white z-10 relative`}>
                      <i className={`fa-solid ${icon} text-sm`} />
                    </div>
                    {idx < activities.length - 1 && (
                      <div className="absolute top-10 bottom-[-24px] left-1/2 w-px bg-coffee-200 -translate-x-1/2" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-forest-900">{title}</p>
                    <p className="text-xs text-forest-500 mt-1">{sub}</p>
                    <p className="text-xs text-forest-400 mt-1">{time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl border border-coffee-200 text-forest-700 text-sm font-medium hover:bg-coffee-50 transition-colors">
              Xem Tất Cả
            </button>
          </div>

          {/* Batches table (lg:col-span-2) */}
          <div className="dashboard-card p-0 lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-coffee-100 flex items-center justify-between">
              <h3 className="font-bold text-forest-900 text-lg">Lô Hàng Đang Di Chuyển</h3>
              <button className="text-forest-600 hover:text-forest-900 text-sm font-medium">
                Chi tiết <i className="fa-solid fa-arrow-right ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-forest-50 text-forest-600 text-xs uppercase tracking-wider">
                    {['Mã Lô', 'Loại', 'Khối Lượng', 'Giai Đoạn', 'Trạng Thái'].map(h => (
                      <th key={h} className="px-6 py-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-coffee-100">
                  {batches.map(({ id, type, weight, stage, status }) => (
                    <tr key={id} className="hover:bg-coffee-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-forest-900">{id}</td>
                      <td className="px-6 py-4 text-forest-700">{type}</td>
                      <td className="px-6 py-4 text-forest-700">{weight}</td>
                      <td className="px-6 py-4 text-forest-700">{stage}</td>
                      <td className="px-6 py-4"><StatusBadge status={status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
