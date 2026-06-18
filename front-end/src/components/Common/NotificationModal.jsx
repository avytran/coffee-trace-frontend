export const NotificationModal = ({ isOpen, onClose, title, message, type = "success" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel p-6 rounded-[1.5rem] border border-coffee-200 bg-white max-w-sm w-full shadow-2xl text-center transform scale-100 transition-all outline-none focus:outline-none">
        <div className="mb-4 flex justify-center">
          {type === "success" ? (
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl border border-emerald-200">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl border border-rose-200">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
          )}
        </div>
        
        <h3 className={`text-base font-serif font-bold mb-2 ${type === 'success' ? 'text-forest-900' : 'text-rose-900'}`}>
          {title}
        </h3>
        <p className="text-xs text-forest-600 leading-relaxed mb-6">{message}</p>
        
        <button
          onClick={onClose}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-colors shadow-sm focus:outline-none ${
            type === 'success' ? 'bg-forest-800 hover:bg-forest-900' : 'bg-rose-600 hover:bg-rose-700'
          }`}
        >
          Đóng
        </button>
      </div>
    </div>
  );
};