import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { NotificationModal } from '../components/Common/NotificationModal';
import { parseWeb3Error } from '../utils/errorHandler';
import axiosInstance from '../utils/axiosInstance';

const DEFAULT_KPI = [];
const DEFAULT_PRODUCTION = [];
const DEFAULT_SEGMENT = [];
const DEFAULT_BATCHES = [];
const DEFAULT_ACTIVITIES = [];

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

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
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

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
});

export default function PublicDashboard() {
  const [kpi, setKpi] = useState(DEFAULT_KPI);
  const [production, setProduction] = useState(DEFAULT_PRODUCTION);
  const [segment, setSegment] = useState(DEFAULT_SEGMENT);
  const [batches, setBatches] = useState(DEFAULT_BATCHES);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('today');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const setDashboardData = useCallback((data) => {
    if (data.kpi) setKpi(data.kpi);
    if (data.production) setProduction(data.production);
    if (data.segment) setSegment(data.segment);
    if (data.batches) setBatches(data.batches);
    if (data.activities) setActivities(data.activities);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/public/dashboard`, {
          params: { period }
        });

        if (isMounted && response.data) {
          setDashboardData(response.data);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu Dashboard:", err);
        if (isMounted) {
          const parsedError = parseWeb3Error(err);
          setError("Không thể tải dữ liệu thời gian thực. Vui lòng kiểm tra lại đường truyền.");
          setModalConfig({
            isOpen: true,
            title: parsedError.title || "Lỗi Tải Dữ Liệu",
            message: parsedError.message || "Không thể đồng bộ dữ liệu mạng lưới.",
            type: "error"
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [period, setDashboardData]);

  const handleCloseModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="pt-4 pb-16 relative">
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", mixBlendMode: 'multiply' }}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        <motion.div {...fadeUp(0)} className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className=" text-3xl font-bold text-forest-900 mb-2">Tổng Quan Chuỗi Cung Ứng</h1>
            <p className="text-forest-700 text-sm">Dữ liệu thời gian thực từ mạng lưới ROBUSTRACE</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-panel flex items-center p-1 rounded-xl bg-white/60 backdrop-blur-xs">
              {[
                { key: 'today', label: 'Hôm nay' },
                { key: 'week', label: 'Tuần này' },
                { key: 'month', label: 'Tháng này' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  disabled={loading}
                  onClick={() => setPeriod(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === key
                    ? 'bg-white text-forest-900 shadow-xs font-semibold'
                    : 'text-forest-700 hover:text-forest-900 disabled:opacity-50'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i> {error}
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
        >
          {kpi.map((card, i) => (
            <motion.div key={card.id || i} {...fadeUp(0.05 * i)} className="dashboard-card p-6 bg-white rounded-xl shadow-xs border border-coffee-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-forest-600 font-medium mb-1">{card.label}</p>
                  <h3 className="text-3xl font-bold text-forest-900 ">{card.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.iconBg || 'bg-gray-100'} flex items-center justify-center ${card.iconColor || 'text-gray-600'}`}>
                  <i className={`fa-solid ${card.icon}`} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`${card.up ? 'text-forest-500' : 'text-coffee-600'} font-medium flex items-center gap-1`}>
                  <i className={`fa-solid ${card.up ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-xs`} />
                  {card.delta}
                </span>
                <span className="text-forest-400">so với kì trước</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {loading ? (
          <LoadingSpinner variant="card" loadingStatus="Đang đồng bộ dữ liệu mạng lưới..." />
        ) : (
          <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            <div className="lg:col-span-2 dashboard-card p-6 bg-white rounded-xl shadow-xs border border-coffee-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-forest-900 text-lg">Biểu Đồ Sản Lượng & Giao Dịch</h3>
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
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #EED5C1', borderRadius: 12, fontSize: 13 }} />
                  <Area type="monotone" dataKey="Robusta" stroke="#357F63" strokeWidth={2.5} fill="url(#gradRobusta)" dot={false} />
                  <Area type="monotone" dataKey="Arabica" stroke="#DDB892" strokeWidth={2.5} fill="url(#gradArabica)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-card p-6 bg-white rounded-xl shadow-xs border border-coffee-100 flex flex-col">
              <h3 className="font-bold text-forest-900 text-lg mb-6">Phân Bổ Phân Đoạn</h3>
              <div className="flex-grow flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={segment} cx="50%" cy="50%" outerRadius={90} innerRadius={52} dataKey="value" labelLine={false} label={PieLabel}>
                      {segment.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full mt-4 space-y-2">
                  {segment.map((seg, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                        <span className="text-forest-700">{seg.name}</span>
                      </div>
                      <span className="font-semibold text-forest-900">{seg.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div {...fadeUp(0.15)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="dashboard-card p-6 bg-white rounded-xl shadow-xs border border-coffee-100 flex flex-col">
            <h3 className="font-bold text-forest-900 text-lg mb-6">Hoạt Động Gần Đây</h3>
            <div className="space-y-6 flex-grow">
              {activities.map((act, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full ${act.iconBg} flex items-center justify-center text-white z-10 relative`}>
                      <i className={`fa-solid ${act.icon} text-sm`} />
                    </div>
                    {idx < activities.length - 1 && <div className="absolute top-10 bottom-[-24px] left-1/2 w-px bg-coffee-200 -translate-x-1/2" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-forest-900">{act.title}</p>
                    <p className="text-xs text-forest-500 mt-1">{act.sub}</p>
                    <p className="text-xs text-forest-400 mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card p-0 lg:col-span-2 overflow-hidden bg-white rounded-xl shadow-xs border border-coffee-100 flex flex-col">
            <div className="p-6 border-b border-coffee-100">
              <h3 className="font-bold text-forest-900 text-lg">Lô Hàng Đang Di Chuyển</h3>
            </div>
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-forest-55/40 text-forest-600 text-xs uppercase tracking-wider">
                    {['Mã Lô', 'Loại', 'Khối Lượng', 'Giai Đoạn', 'Trạng Thái'].map(h => <th key={h} className="px-6 py-4 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-coffee-100">
                  {batches.map((batch, index) => (
                    <tr key={batch.id || index} className="hover:bg-coffee-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-forest-900">{batch.id}</td>
                      <td className="px-6 py-4 text-forest-700">{batch.type}</td>
                      <td className="px-6 py-4 text-forest-700">{batch.weight}</td>
                      <td className="px-6 py-4 text-forest-700">{batch.stage}</td>
                      <td className="px-6 py-4"><StatusBadge status={batch.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

      </div>

      <NotificationModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}