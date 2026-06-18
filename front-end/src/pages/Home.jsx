import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 👈 Thêm useNavigate ở đây
import {
  motion,
  useInView,
  useMotionValue,
  animate,
} from 'framer-motion';

/* ─────────────────────────────────────────────
   Animated counter (replaces old JS setInterval)
   Fix: MotionValue cannot be used as React child directly.
   We subscribe to the MotionValue and store it in local state.
───────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const isIn = useInView(ref, { once: true, margin: '-80px' });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  // Subscribe MotionValue → local state for safe rendering
  useEffect(() => {
    const unsubscribe = count.on('change', (v) => {
      setDisplay(Math.round(v).toLocaleString('vi-VN'));
    });
    return unsubscribe;
  }, [count]);

  useEffect(() => {
    if (!isIn) return;
    const controls = animate(count, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [isIn, target, duration, count]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}{suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Fade-up variant for scroll sections
───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerChildren = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function ScrollReveal({ children, className = '', delay = 0, once = true }) {
  const ref = useRef(null);
  const isIn = useInView(ref, { once, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={isIn ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   STAT cards data
───────────────────────────────────────────── */
const STATS = [
  { icon: 'fa-tractor', bg: 'bg-forest-100', color: 'text-forest-600', target: 2450, suffix: '+', label: 'Nông dân tham gia' },
  { icon: 'fa-boxes-stacked', bg: 'bg-coffee-200', color: 'text-forest-800', target: 18400, suffix: '+', label: 'Lô hàng xác thực' },
  { icon: 'fa-ethereum fa-brands', bg: 'bg-forest-900', color: 'text-white', target: 156000, suffix: '+', label: 'Giao dịch Blockchain' },
  { icon: 'fa-handshake-angle', bg: 'bg-coffee-400', color: 'text-white', target: 85, suffix: '+', label: 'Đối tác thương mại' },
];

/* ─────────────────────────────────────────────
   JOURNEY steps
───────────────────────────────────────────── */
const JOURNEY = [
  {
    icon: 'fa-leaf',
    step: '1. Thu hoạch',
    desc: 'Nông dân ghi nhận thông tin lô thu hoạch: giống loại, tọa độ vườn, ngày hái và khối lượng ban đầu lên hệ thống.',
  },
  {
    icon: 'fa-water',
    step: '2. Sơ chế',
    desc: 'Nhà máy sơ chế cập nhật quy trình (ướt/khô/honey), chất lượng hạt nhân và khối lượng sau khi chế biến.',
  },
  {
    icon: 'fa-fire-burner',
    step: '3. Rang xay',
    desc: 'Xưởng rang ghi nhận profile rang, ngày rang và các chỉ số kiểm định chất lượng (Cupping score).',
  },
  {
    icon: 'fa-mug-hot',
    step: '4. Phân phối',
    desc: 'Sản phẩm cuối cùng được gắn mã QR. Người dùng quét mã để truy xuất toàn bộ lịch sử lô hàng.',
  },
];

/* ─────────────────────────────────────────────
   FEATURED BATCHES
───────────────────────────────────────────── */
const BATCHES = [
  { name: 'Robusta Cư M\'gar', meta: 'Độ ẩm 12.5%, Sàng 18, Washed', score: '95đ', img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80' },
  { name: 'Arabica Cầu Đất', meta: 'Độ cao 1500m, Honey', score: '92đ', img: 'https://images.unsplash.com/photo-1620054703953-b9cc9c62c3f8?w=500&q=80' },
  { name: 'Robusta Đắk Mil', meta: 'Organic Certified, Natural', score: '94đ', img: 'https://images.unsplash.com/photo-1581404179374-1e0db028cb93?w=500&q=80' },
  { name: 'Blend Đặc Biệt', meta: '70% Robusta, 30% Arabica, Medium Roast', score: '96đ', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80' },
];

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate(); // 👈 Khởi tạo hook điều hướng
  const [searchId, setSearchId] = useState(''); // 👈 Khởi tạo state quản lý mã nhập

  // Hàm xử lý khi người dùng nhấn nút Tra Cứu hoặc Enter
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    // Điều hướng sang trang /trace kèm theo query parameter 'id'
    navigate(`/trace?id=${encodeURIComponent(searchId.trim())}`);
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-32 bg-brand-lightgreen overflow-hidden">
        {/* Cream background blob */}
        <div className="absolute top-0 left-0 w-[85%] md:w-[65%] h-full bg-[#F3EFE9] rounded-br-full z-0" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left text */}
          <motion.div
            className="flex flex-col items-start pr-0 md:pr-10 lg:pr-20"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-forest-700 text-[10px] font-bold mb-6 tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
              BLOCKCHAIN TRACEABILITY
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-[64px] font-bold text-coffee-900 mb-6 leading-[1.15]">
              Minh Bạch Từng,<br />
              <span className="text-brand-darkgreen">Hạt Cà Phê</span>
            </h1>

            <p className="text-gray-700 text-sm md:text-base mb-10 max-w-md leading-relaxed">
              Nền tảng DApp ROBUSTRACE giúp theo dõi toàn bộ vòng đời của hạt cà phê qua công nghệ Blockchain, đảm bảo chất lượng, tính bền vũn từ vườn trồng đến ly cà phê của bạn.
            </p>

            {/* Search bar */}
            <button
              type="submit"
              className="bg-brand-darkgreen hover:bg-forest-800 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-md"
              onClick={() => { navigate("/trace") }}
            >
              Tra Cứu
            </button>
          </motion.div>

          {/* Right image */}
          <motion.div
            className="relative w-full aspect-[4/3] md:aspect-square max-w-[550px] mx-auto lg:ml-auto mt-10 lg:mt-0"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1000&q=80"
              alt="Coffee Cherries"
              className="w-full h-full object-cover rounded-[40px] border-[10px] border-white shadow-2xl rotate-[3deg] hover:rotate-0 transition-transform duration-700"
            />
            {/* Badge top-right */}
            <div className="absolute top-8 -right-6 md:-right-10 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-2xl z-20 -rotate-2">
              <div className="w-10 h-10 rounded-full bg-brand-lightgreen flex items-center justify-center text-brand-darkgreen">
                <i className="fa-solid fa-leaf text-sm" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">CHẤT LƯỢNG</div>
                <div className="text-sm font-bold text-gray-800">100% Organic</div>
              </div>
            </div>
            {/* Small circle bottom-left */}
            <div className="absolute -bottom-10 -left-6 md:-left-12 w-[160px] md:w-[180px] h-[160px] md:h-[180px] rounded-full border-[6px] border-[#EFF3EF] overflow-hidden shadow-2xl z-20 bg-white">
              <img
                src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80"
                alt="Roasted Beans"
                className="w-full h-full object-cover scale-110"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── JOURNEY ── */}
      <section id="journey" className="py-24 bg-white text-forest-900 relative">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-coffee-900">Hành trình của hạt cà phê</h2>
            <p className="text-forest-700 text-lg">
              Khám phá cách chúng tôi số hóa quy trình cung ứng, từ trang trại đến tay người tiêu dùng, đảm bảo mọi thông tin đều minh bạch và có thể xác minh.
            </p>
          </ScrollReveal>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {JOURNEY.map(({ icon, step, desc }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-100 border-b-4 border-b-brand-darkgreen hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-creambg flex items-center justify-center text-brand-darkgreen text-2xl mb-6 group-hover:scale-110 group-hover:bg-brand-darkgreen group-hover:text-white transition-all">
                  <i className={`fa-solid ${icon}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <ScrollReveal className="mt-16 text-center">
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-brand-darkgreen hover:bg-forest-900 text-white rounded-full font-bold text-sm transition-colors shadow-lg shadow-brand-darkgreen/30 inline-flex items-center gap-2"
            >
              Khám phá Bảng Điều Khiển <i className="fa-solid fa-arrow-right ml-1" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── STATISTICS (with animated counters) ── */}
      <section id="statistics" className="py-24 bg-brand-creambg relative">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <div>
              <ScrollReveal>
                <h2 className="font-serif text-4xl font-bold text-forest-900 mb-6">
                  Mạng lưới tin cậy được xây dựng trên Blockchain
                </h2>
                <p className="text-forest-700 text-lg mb-10 leading-relaxed">
                  Mỗi hạt cà phê đều có câu chuyện riêng. ROBUSTRACE ghi lại mọi bước đi của sản phẩm trên sổ cái không thể thay đổi, mang lại giá trị thực cho toàn bộ chuỗi cung ứng.
                </p>
              </ScrollReveal>

              {/* Counter grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                variants={staggerChildren}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {STATS.map(({ icon, bg, color, target, suffix, label }) => (
                  <motion.div
                    key={label}
                    variants={fadeUp}
                    className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 ${color} text-xl`}>
                      <i className={`fa-solid ${icon}`} />
                    </div>
                    <div className="text-4xl font-bold text-forest-900 mb-2 font-serif">
                      <AnimatedCounter target={target} suffix={suffix} />
                    </div>
                    <div className="text-forest-600 font-medium text-sm uppercase tracking-wider">{label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right image */}
            <ScrollReveal delay={0.2}>
              <div className="relative rounded-[2rem] p-4 bg-white border border-gray-100 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1000&q=80"
                  alt="Coffee Processing"
                  className="w-full h-[450px] object-cover rounded-3xl"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── NEW SEASON BANNER ── */}
      <section className="py-16 bg-white">
        <div className="max-w-[1100px] mx-auto px-6">
          <ScrollReveal>
            <div className="bg-brand-lightgreen rounded-[40px] relative overflow-hidden flex flex-col md:flex-row items-center p-10 md:p-14 gap-12 border border-[#dce8dc]">
              <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#DFE9DF] rounded-full translate-x-[30%] -translate-y-[30%] z-0" />

              <div className="relative z-10 flex-1 pl-4">
                <div className="w-[85px] h-[85px] bg-brand-darkgreen rounded-full flex items-center justify-center text-white font-serif font-bold text-[26px] italic -rotate-12 mb-8 shadow-xl shadow-brand-darkgreen/30">
                  Mới!
                </div>
                <h2 className="font-serif text-[38px] font-bold text-coffee-900 mb-4 tracking-tight">Mùa Thu Hoạch Mới!</h2>
                <p className="text-gray-700 text-sm max-w-[380px] mb-8 leading-relaxed">
                  Khám phá các lô hàng vụ mùa 2026 vừa được cập nhật lên hệ thống với đầy đủ thông tin truy xuất.
                </p>
                <button className="bg-brand-brownbtn hover:bg-black text-white px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-lg">
                  Xem Ngay
                </button>
              </div>

              <div className="relative z-10 w-full max-w-[380px] flex justify-center md:justify-end pr-4">
                <div className="w-full aspect-square rounded-full overflow-hidden border-[10px] border-white shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80"
                    alt="Coffee Cherries Basket"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FEATURED BATCHES ── */}
      <section className="py-24 bg-brand-creambg">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
          <ScrollReveal className="text-center mb-20">
            <h2 className="font-serif text-3xl md:text-[40px] font-bold text-coffee-900">Lô Hàng Tiêu Biểu</h2>
          </ScrollReveal>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-20 mt-12"
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {BATCHES.map(({ name, meta, score, img }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                className="bg-white rounded-[32px] p-6 pt-28 relative shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center text-center"
              >
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full overflow-hidden border-[6px] border-white shadow-md">
                  <img src={img} alt={name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-gray-900 text-[17px] mb-2">{name}</h3>
                <p className="text-xs text-gray-500 mb-8 max-w-[200px] leading-relaxed h-8">{meta}</p>
                <div className="w-full flex items-center justify-between mt-auto">
                  <span className="font-bold text-brand-darkgreen text-xl">{score}</span>
                  <button className="bg-[#EFF3EF] text-brand-darkgreen px-5 py-1.5 rounded-full text-xs font-bold hover:bg-brand-darkgreen hover:text-white transition-colors">
                    Chi tiết
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}