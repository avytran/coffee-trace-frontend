import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3Auth } from '../context/Web3AuthContext';

function shortenAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

export default function ConnectWallet() {
  const navigate = useNavigate();
  
  const {
    account, network, role, userData, authStatus, connecting, error, connectMetaMask
  } = useWeb3Auth();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-lightcream text-forest-900 font-sans">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at top left, rgba(108, 178, 151, 0.2), transparent 30%), radial-gradient(circle at bottom right, rgba(221, 184, 146, 0.18), transparent 28%)',
          }}
        />

        <section className="relative max-w-[1440px] mx-auto px-6 lg:px-12 pt-28 pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.9fr] items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold uppercase tracking-[0.24em] shadow-sm">
                <i className="fa-solid fa-shield-halved text-base" />
                Kết Nối Ví An Toàn
              </div>

              <div>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-forest-900">
                  Kết nối ví của bạn với ROBUSTRACE
                </h1>
                <p className="mt-6 max-w-2xl text-base sm:text-lg text-coffee-700 leading-8">
                  Bật kết nối an toàn, xác thực danh tính và bắt đầu truy xuất nguồn gốc hạt cà phê bằng blockchain. Chọn ví bạn tin tưởng, sau đó theo dõi, quản lý và chia sẻ quyền truy cập dễ dàng.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="button"
                  onClick={connectMetaMask}
                  disabled={connecting}
                  className="rounded-full bg-forest-900 text-white px-8 py-3 text-sm font-semibold shadow-lg shadow-forest-900/10 hover:bg-forest-800 transition-colors disabled:opacity-50"
                >
                  {connecting ? 'Đang xác thực...' : account ? 'Ví đã xác thực JWT' : 'Kết nối MetaMask'}
                </button>
                
                {authStatus === 'ACTIVE' && (
                  <Link
                    to="/workspace"
                    className="rounded-full border border-forest-500 bg-forest-50 px-8 py-3 text-sm font-semibold text-forest-900 hover:bg-forest-100 transition-all shadow-sm"
                  >
                    Vào Không Gian Làm Việc ({role}) →
                  </Link>
                )}
              </div>
              
              {error && (
                <div className={`p-4 rounded-xl text-sm border ${
                  authStatus === 'SUSPENDED' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <strong>⚠️ Thông báo hệ thống:</strong> {error}
                </div>
              )}
            </div>

            <div className="relative rounded-[2rem] border border-coffee-200 bg-white/95 p-8 shadow-2xl shadow-coffee-200/30 overflow-hidden">
              <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-forest-100 opacity-70 blur-3xl" />
              <div className="absolute -bottom-10 left-6 w-40 h-40 rounded-full bg-coffee-100 opacity-80 blur-3xl" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase text-coffee-500 tracking-[0.22em]">Trạng thái định danh</p>
                    <h2 className="text-2xl font-bold text-forest-900 mt-2">
                      {account ? (authStatus === 'ACTIVE' ? `Đối tác: ${role}` : 'Bị từ chối truy cập') : 'Sẵn sàng kết nối'}
                    </h2>
                  </div>
                  
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border ${
                    authStatus === 'ACTIVE' 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : authStatus === 'SUSPENDED'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-forest-50 text-forest-700 border-forest-100'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      authStatus === 'ACTIVE' ? 'bg-green-500' : authStatus === 'SUSPENDED' ? 'bg-red-500' : 'bg-forest-500'
                    }`} />
                    {authStatus === 'ACTIVE' ? 'Đã xác thực JWT' : authStatus === 'SUSPENDED' ? 'Tạm khóa' : 'Chờ ví'}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-coffee-50 p-5 border border-coffee-100">
                    <p className="text-xs uppercase tracking-[0.2em] text-coffee-500">Mạng Blockchain</p>
                    <h3 className="mt-3 text-lg font-semibold text-forest-900">{network}</h3>
                    <p className="mt-2 text-sm text-coffee-600">Đồng bộ on-chain, ghi nhận dữ liệu lịch sử và chứng chỉ vùng trồng.</p>
                  </div>
                  <div className="rounded-3xl bg-forest-50 p-5 border border-forest-100">
                    <p className="text-xs uppercase tracking-[0.2em] text-forest-500">Thông tin đối tác</p>
                    <h3 className="mt-3 text-sm font-mono font-semibold text-forest-900">
                      {account ? shortenAddress(account) : 'Chưa chọn tài khoản ví'}
                    </h3>
                    <p className="mt-2 text-xs text-forest-600 leading-relaxed">
                      {userData ? `Họ tên: ${userData.name}. Tài khoản liên kết hợp lệ trong chuỗi cung ứng.` : 'Nhấn nút kết nối để kiểm tra phân quyền tài khoản của bạn.'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-gradient-to-br from-coffee-100 via-brand-lightgreen to-forest-100 p-6 border border-coffee-200/80">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee-700">Quy trình cấp quyền Web3</p>
                  <ol className="mt-4 space-y-3 text-sm text-coffee-700 leading-7 list-decimal list-inside pl-2">
                    <li>MetaMask cung cấp địa chỉ ví công khai.</li>
                    <li>Người dùng thực hiện ký mã hóa một lần duy nhất nếu phiên làm việc cũ hết hạn.</li>
                    <li>Token bảo mật được lưu giữ dài hạn để tối ưu trải nghiệm dApp.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}