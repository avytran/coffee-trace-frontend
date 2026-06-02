import { motion } from 'framer-motion'

export default function LoadingSpinner({ label = 'Đang xử lý...', fullScreen = false }) {
  return (
    <div
      className={
        fullScreen
          ? 'min-h-screen w-full bg-brand-lightcream flex items-center justify-center'
          : 'w-full py-12 flex items-center justify-center'
      }
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="h-14 w-14 rounded-full border-4 border-coffee-200 border-t-forest-700"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm font-semibold text-forest-700">{label}</span>
      </div>
    </div>
  )
}
