/**
 * LoadingSpinner
 * Variants: "full" (full-page overlay), "inline" (inline block), "card" (card-sized)
 */
export default function LoadingSpinner({ variant = 'inline', message = 'Đang tải...' }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Dual-ring coffee-themed spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-coffee-200" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-forest-600 animate-spin" />
        <div className="absolute inset-[6px] rounded-full border-2 border-transparent border-b-coffee-400 animate-spin [animation-duration:0.8s] [animation-direction:reverse]" />
      </div>
      {message && (
        <span className="text-sm text-forest-600 font-medium animate-pulse">{message}</span>
      )}
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-lightcream/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="w-full min-h-[280px] flex items-center justify-center rounded-2xl bg-white/60 border border-coffee-100">
        {spinner}
      </div>
    );
  }

  // default: inline
  return <div className="flex items-center justify-center py-8">{spinner}</div>;
}
