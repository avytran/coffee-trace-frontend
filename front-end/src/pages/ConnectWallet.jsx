import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3Auth } from '../context/Web3AuthContext';

function shortenAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

export default function ConnectWallet() {
  const {
    account, network, role, userData, authStatus, connecting, error, connectMetaMask
  } = useWeb3Auth();

  // 💡 ĐỌC MÔI TRƯỜNG HIỆN TẠI TỪ FILE ENV FRONTEND
  const targetEnv = import.meta.env?.VITE_NODE_ENV || 'local';
  const isSepoliaTarget = targetEnv === 'sepolia';

  // 💡 HÀM HỖ TRỢ NGƯỜI DÙNG CHUYỂN MẠNG NHANH TRÊN METAMASK
  const handleSwitchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      if (isSepoliaTarget) {
        // Yêu cầu chuyển sang Sepolia Testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // 11155111 dạng Hex
        });
      } else {
        // Yêu cầu chuyển sang Hardhat Localhost
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7cd7' }], // 31337 dạng Hex
        });
      }
    } catch (switchError) {
      // Nếu mạng Localhost chưa được thêm vào MetaMask, tiến hành cấu hình thêm tự động
      if (switchError.code === 4902 && !isSepoliaTarget) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7cd7',
              chainName: 'Hardhat Localhost',
              rpcUrls: [import.meta.env?.VITE_LOCAL_RPC_URL || 'http://127.0.0.1:8545'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
            }]
          });
        } catch (addError) {
          console.error("Không thể thêm mạng Localhost vào MetaMask", addError);
        }
      }
    }
  };

  const isWrongNetwork = account && (
    (isSepoliaTarget && network?.toLowerCase() !== 'sepolia') ||
    (!isSepoliaTarget &&
      !network?.toLowerCase().includes('localhost') &&
      !network?.toLowerCase().includes('hardhat') &&
      !network?.toLowerCase().includes('local')
    )
  );

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
                Môi trường: {targetEnv.toUpperCase()}
              </div>

              <div>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-forest-900">
                  Kết nối ví của bạn với ROBUSTRACE
                </h1>
                <p className="mt-6 max-w-2xl text-base sm:text-lg text-coffee-700 leading-8">
                  Bật kết nối an toàn, xác thực danh tính và bắt đầu truy xuất nguồn gốc hạt cà phê bằng blockchain {isSepoliaTarget ? 'Sepolia Testnet' : 'Hardhat Node Local'}.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* NÚT BẤM KẾT NỐI CHÍNH */}
                {isWrongNetwork ? (
                  <button
                    type="button"
                    onClick={handleSwitchNetwork}
                    className="rounded-full bg-amber-600 text-white px-8 py-3 text-sm font-semibold shadow-lg hover:bg-amber-700 transition-colors"
                  >
                    <i className="fa-solid fa-triangle-exclamation mr-2" />
                    Đổi sang mạng {isSepoliaTarget ? 'Sepolia' : 'Localhost'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={connectMetaMask}
                    disabled={connecting}
                    className="rounded-full bg-forest-900 text-white px-8 py-3 text-sm font-semibold shadow-lg hover:bg-forest-800 transition-colors disabled:opacity-50"
                  >
                    {connecting ? 'Đang xác thực...' : account ? 'Ví đã xác thực' : 'Kết nối MetaMask'}
                  </button>
                )}

                {authStatus === 'ACTIVE' && !isWrongNetwork && (
                  <Link
                    to={role === "ADMIN" ? "/admin" : "/workspace"}
                    className="rounded-full border border-forest-500 bg-forest-50 px-8 py-3 text-sm font-semibold text-forest-900 hover:bg-forest-100 transition-all shadow-sm"
                  >
                    Vào Không Gian Làm Việc ({role}) →
                  </Link>
                )}
              </div>

              {/* HIỂN THỊ CẢNH BÁO SAI MẠNG HOẶC LỖI HỆ THỐNG */}
              {isWrongNetwork && (
                <div className="p-4 rounded-xl text-sm border bg-amber-50 text-amber-800 border-amber-200">
                  <strong>Sai cấu hình chuỗi:</strong> Hệ thống yêu cầu môi trường mạng <b>{isSepoliaTarget ? 'Sepolia Testnet' : 'Hardhat Local'}</b>. Vui lòng nhấn nút chuyển đổi mạng để đồng bộ hóa dữ liệu.
                </div>
              )}

              {error && !isWrongNetwork && (
                <div className={`p-4 rounded-xl text-sm border ${authStatus === 'SUSPENDED' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                  <strong>Thông báo hệ thống:</strong> {error}
                </div>
              )}
            </div>

            {/* THẺ BÊN PHẢI: CHI TIẾT TRẠNG THÁI VÍ */}
            <div className="relative rounded-[2rem] border border-coffee-200 bg-white/95 p-8 shadow-2xl overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase text-coffee-500 tracking-[0.22em]">Trạng thái định danh</p>
                    <h2 className="text-2xl font-bold text-forest-900 mt-2">
                      {account ? (isWrongNetwork ? 'Sai thông số mạng' : authStatus === 'ACTIVE' ? `Đối tác: ${role}` : 'Bị từ chối truy cập') : 'Sẵn sàng kết nối'}
                    </h2>
                  </div>

                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border ${isWrongNetwork
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : authStatus === 'ACTIVE'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-forest-50 text-forest-700 border-forest-100'
                    }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${isWrongNetwork ? 'bg-amber-500' : authStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-forest-500'
                      }`} />
                    {isWrongNetwork ? 'Sai mạng' : authStatus === 'ACTIVE' ? 'Đã xác thực bảo mật' : 'Chờ ví'}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={`rounded-3xl p-5 border ${isWrongNetwork ? 'bg-amber-50/50 border-amber-100' : 'bg-coffee-50 border-coffee-100'}`}>
                    <p className="text-xs uppercase tracking-[0.2em] text-coffee-500">Mạng Blockchain hiện tại</p>
                    <h3 className="mt-3 text-lg font-semibold text-forest-900 capitalize">{network || 'Chưa kết nối'}</h3>
                    <p className="mt-2 text-sm text-coffee-600">Yêu cầu hệ thống: {isSepoliaTarget ? 'Sepolia' : 'Hardhat Local'}</p>
                  </div>
                  <div className="rounded-3xl bg-forest-50 p-5 border border-forest-100">
                    <p className="text-xs uppercase tracking-[0.2em] text-forest-500">Thông tin địa chỉ ví</p>
                    <h3 className="mt-3 text-sm font-mono font-semibold text-forest-900">
                      {account ? shortenAddress(account) : 'Chưa chọn tài khoản'}
                    </h3>
                    <p className="mt-2 text-xs text-forest-600 leading-relaxed">
                      {userData ? `Chủ tài khoản: ${userData.name}.` : 'Hệ thống sẽ đối soát quyền hạn của ví trên cơ sở dữ liệu.'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-gradient-to-br from-coffee-100 via-brand-lightgreen to-forest-100 p-6 border border-coffee-200/80">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee-700">Quy trình cấp quyền Web3</p>
                  <ol className="mt-4 space-y-3 text-sm text-coffee-700 leading-7 list-decimal list-inside pl-2">
                    <li>MetaMask cung cấp địa chỉ ví công khai của đối tác.</li>
                    <li>Hệ thống kiểm tra tính hợp lệ của mạng <b>{targetEnv.toUpperCase()}</b>.</li>
                    <li>Người dùng thực hiện ký mã hóa bảo mật định danh để truy cập Không gian làm việc.</li>
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