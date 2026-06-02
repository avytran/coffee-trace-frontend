import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useInView } from 'framer-motion'
import Footer from '../components/Common/Footer.jsx'
import Navbar from '../components/Common/Navbar.jsx'

const journeySteps = [
  {
    title: '1. Thu hoạch',
    description:
      'Nông dân ghi nhận thông tin lô thu hoạch: giống loại, tọa độ vườn, ngày hái và khối lượng ban đầu lên hệ thống.',
    icon: 'fa-leaf',
  },
  {
    title: '2. Sơ chế',
    description:
      'Nhà máy sơ chế cập nhật quy trình (ướt/khô/honey), chất lượng hạt nhân và khối lượng sau khi chế biến.',
    icon: 'fa-water',
  },
  {
    title: '3. Rang xay',
    description: 'Xưởng rang ghi nhận profile rang, ngày rang và các chỉ số kiểm định chất lượng (Cupping score).',
    icon: 'fa-fire-burner',
  },
  {
    title: '4. Phân phối',
    description: 'Sản phẩm cuối cùng được gắn mã QR. Người dùng quét mã để truy xuất toàn bộ lịch sử lô hàng.',
    icon: 'fa-mug-hot',
  },
]

const trustMetrics = [
  {
    value: 2450,
    suffix: '+',
    label: 'Nông dân tham gia',
    icon: 'fa-tractor',
    iconClass: 'bg-forest-100 text-forest-600',
  },
  {
    value: 18400,
    suffix: '+',
    label: 'Lô hàng xác thực',
    icon: 'fa-boxes-stacked',
    iconClass: 'bg-coffee-200 text-forest-800',
  },
  {
    value: 156000,
    suffix: '+',
    label: 'Giao dịch Blockchain',
    icon: 'fa-ethereum',
    iconFamily: 'fa-brands',
    iconClass: 'bg-forest-900 text-white',
  },
  {
    value: 85,
    label: 'Đối tác thương mại',
    icon: 'fa-handshake-angle',
    iconClass: 'bg-coffee-400 text-white',
  },
]

const featuredLots = [
  {
    name: "Robusta Cư M'gar",
    description: 'Độ ẩm 12.5%, Sàng 18, Chế biến Washed',
    score: '95đ',
    image:
      'https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    alt: 'Robusta',
  },
  {
    name: 'Arabica Cầu Đất',
    description: 'Độ cao 1500m, Chế biến Honey',
    score: '92đ',
    image:
      'https://images.unsplash.com/photo-1620054703953-b9cc9c62c3f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    alt: 'Arabica',
  },
  {
    name: 'Robusta Đắk Mil',
    description: 'Organic Certified, Chế biến Natural',
    score: '94đ',
    image:
      'https://images.unsplash.com/photo-1581404179374-1e0db028cb93?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    alt: 'Robusta',
  },
  {
    name: 'Blend Đặc Biệt',
    description: '70% Robusta, 30% Arabica, Medium Roast',
    score: '96đ',
    image:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    alt: 'Blend',
  },
]

const sectionFade = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

function AnimatedCounter({ value, suffix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return undefined

    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setCount(Math.round(latest)),
    })

    return () => controls.stop()
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count.toLocaleString('vi-VN')}
      {isInView ? suffix : ''}
    </span>
  )
}

function JourneyCard({ step }) {
  return (
    <motion.div
      variants={sectionFade}
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-100 border-b-4 border-b-brand-darkgreen transition-shadow duration-300 group"
    >
      <div className="w-16 h-16 rounded-2xl bg-brand-creambg flex items-center justify-center text-brand-darkgreen text-2xl mb-6 group-hover:scale-110 group-hover:bg-brand-darkgreen group-hover:text-white transition-all">
        <i className={`fa-solid ${step.icon}`} />
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
    </motion.div>
  )
}

function FeaturedLotCard({ lot }) {
  return (
    <motion.div
      variants={sectionFade}
      whileHover={{ y: -8 }}
      className="bg-white rounded-[32px] p-6 pt-28 relative shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center text-center"
    >
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[180px] h-[180px] rounded-full overflow-hidden border-[6px] border-white shadow-md">
        <img src={lot.image} alt={lot.alt} className="w-full h-full object-cover" />
      </div>
      <h3 className="font-bold text-gray-900 text-[17px] mb-2">{lot.name}</h3>
      <p className="text-xs text-gray-500 mb-8 max-w-[200px] leading-relaxed min-h-8">{lot.description}</p>
      <div className="w-full flex items-center justify-between mt-auto">
        <span className="font-bold text-brand-darkgreen text-xl">{lot.score}</span>
        <button className="bg-[#EFF3EF] text-brand-darkgreen px-5 py-1.5 rounded-full text-xs font-bold hover:bg-brand-darkgreen hover:text-white transition-colors">
          Chi tiết
        </button>
      </div>
    </motion.div>
  )
}

export default function Home() {
  return (
    <div className="m-0 p-0 bg-brand-lightcream text-forest-900 font-sans relative overflow-x-hidden min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="relative pt-16 pb-24 md:pt-28 md:pb-32 bg-brand-lightgreen overflow-hidden">
          <div className="absolute top-0 left-0 w-[85%] md:w-[65%] h-full bg-[#F3EFE9] rounded-br-full z-0" />

          <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="flex flex-col items-start pr-0 md:pr-10 lg:pr-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-forest-700 text-[10px] font-bold mb-6 tracking-wide shadow-sm">
                <span className="w-2 h-2 rounded-full bg-forest-600" />
                BLOCKCHAIN TRACEABILITY
              </div>

              <h1 className="font-serif text-5xl md:text-6xl lg:text-[64px] font-bold text-coffee-900 mb-6 leading-[1.15]">
                Minh Bạch Từng,
                <br />
                <span className="text-brand-darkgreen">Hạt Cà Phê</span>
              </h1>

              <p className="text-gray-700 text-sm md:text-base mb-10 max-w-md leading-relaxed">
                Nền tảng DApp ROBUSTRACE giúp theo dõi toàn bộ vòng đời của hạt cà phê qua công nghệ Blockchain,
                đảm bảo chất lượng, tính bền vững từ vườn trồng đến ly cà phê của bạn.
              </p>

              <div id="trace" className="w-full max-w-[450px] bg-white rounded-full p-1.5 flex items-center shadow-lg shadow-black/5 mb-8 border border-gray-100 relative">
                <div className="pl-4 pr-2 text-brand-darkgreen opacity-70">
                  <i className="fa-solid fa-qrcode text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập Batch ID, mã QR..."
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-700 text-sm px-2 font-medium placeholder-gray-400"
                />
                <button className="bg-brand-darkgreen hover:bg-forest-800 text-white px-6 md:px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-md">
                  Tra Cứu
                </button>
              </div>

              <a
                href="#journey"
                className="px-8 py-2.5 rounded-full border border-brand-darkgreen text-brand-darkgreen hover:bg-brand-darkgreen hover:text-white font-bold text-sm transition-colors"
              >
                Tìm Hiểu Thêm
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 36, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="relative w-full aspect-[4/3] md:aspect-square max-w-[550px] mx-auto lg:ml-auto mt-10 lg:mt-0"
            >
              <img
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Coffee Cherries"
                className="w-full h-full object-cover rounded-[40px] border-[10px] border-white shadow-2xl rotate-[3deg] hover:rotate-0 transition-transform duration-700"
              />

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-8 -right-2 md:-right-10 bg-white rounded-2xl p-4 flex items-center gap-4 shadow-2xl z-20 transform -rotate-2"
              >
                <div className="w-10 h-10 rounded-full bg-brand-lightgreen flex items-center justify-center text-brand-darkgreen">
                  <i className="fa-solid fa-leaf text-sm" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">CHẤT LƯỢNG</div>
                  <div className="text-sm font-bold text-gray-800">100% Organic</div>
                </div>
              </motion.div>

              <div className="absolute -bottom-10 -left-2 md:-left-12 w-[160px] md:w-[180px] h-[160px] md:h-[180px] rounded-full border-[6px] border-[#EFF3EF] overflow-hidden shadow-2xl z-20 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                  alt="Roasted Beans"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section id="journey" className="py-24 bg-white text-forest-900 relative">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-120px' }}
              variants={sectionFade}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-coffee-900">
                Hành trình của hạt cà phê
              </h2>
              <p className="text-forest-700 text-lg">
                Khám phá cách chúng tôi số hóa quy trình cung ứng, từ trang trại đến tay người tiêu dùng, đảm bảo
                mọi thông tin đều minh bạch và có thể xác minh.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {journeySteps.map((step) => (
                <JourneyCard key={step.title} step={step} />
              ))}
            </motion.div>

            <div className="mt-16 text-center">
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-brand-darkgreen hover:bg-forest-900 text-white rounded-full font-bold text-sm transition-colors shadow-lg shadow-brand-darkgreen/30 inline-flex items-center gap-2"
              >
                Khám phá Bảng Điều Khiển
                <i className="fa-solid fa-arrow-right ml-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 bg-brand-creambg relative">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-120px' }}
                variants={sectionFade}
              >
                <h2 className="font-serif text-4xl font-bold text-forest-900 mb-6">
                  Mạng lưới tin cậy được xây dựng trên Blockchain
                </h2>
                <p className="text-forest-700 text-lg mb-10 leading-relaxed">
                  Mỗi hạt cà phê đều có câu chuyện riêng. ROBUSTRACE ghi lại mọi bước đi của sản phẩm trên sổ cái
                  không thể thay đổi, mang lại giá trị thực cho toàn bộ chuỗi cung ứng.
                </p>

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {trustMetrics.map((metric) => (
                    <motion.div
                      key={metric.label}
                      variants={sectionFade}
                      className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl ${metric.iconClass} flex items-center justify-center mb-4 text-xl`}
                      >
                        <i className={`${metric.iconFamily || 'fa-solid'} ${metric.icon}`} />
                      </div>
                      <div className="text-4xl font-bold text-forest-900 mb-2 font-serif">
                        <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                      </div>
                      <div className="text-forest-600 font-medium text-sm uppercase tracking-wider">{metric.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="relative"
              >
                <div className="relative rounded-[2rem] p-4 bg-white border border-gray-100 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Coffee Processing"
                    className="w-full h-[450px] object-cover rounded-3xl"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-[1100px] mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-120px' }}
              variants={sectionFade}
              className="bg-brand-lightgreen rounded-[40px] relative overflow-hidden flex flex-col md:flex-row items-center p-10 md:p-14 gap-12 border border-[#dce8dc]"
            >
              <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#DFE9DF] rounded-full translate-x-[30%] -translate-y-[30%] z-0" />

              <div className="relative z-10 flex-1 md:pl-4">
                <div className="w-[85px] h-[85px] bg-brand-darkgreen rounded-full flex items-center justify-center text-white font-serif font-bold text-[26px] italic -rotate-12 mb-8 shadow-xl shadow-brand-darkgreen/30">
                  Mới!
                </div>
                <h2 className="font-serif text-[38px] font-bold text-coffee-900 mb-4 tracking-tight">
                  Mùa Thu Hoạch Mới!
                </h2>
                <p className="text-gray-700 text-sm max-w-[380px] mb-8 leading-relaxed">
                  Khám phá các lô hàng vụ mùa 2023 vừa được cập nhật lên hệ thống với đầy đủ thông tin truy xuất.
                </p>
                <button className="bg-brand-brownbtn hover:bg-black text-white px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-lg">
                  Xem Ngay
                </button>
              </div>

              <div className="relative z-10 w-full max-w-[380px] flex justify-center md:justify-end md:pr-4">
                <div className="w-full aspect-square rounded-full overflow-hidden border-[10px] border-white shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                    alt="Basket of Coffee Cherries"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-brand-creambg">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionFade}
              className="text-center font-serif text-3xl md:text-[40px] font-bold text-coffee-900 mb-20"
            >
              Lô Hàng Tiêu Biểu
            </motion.h2>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-20 mt-12"
            >
              {featuredLots.map((lot) => (
                <FeaturedLotCard key={lot.name} lot={lot} />
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
