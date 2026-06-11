import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const METAMASK = {
  name: 'MetaMask',
  icon: 'fa-fox',
  description: 'Kết nối ví trình duyệt nhanh, bảo mật và phổ biến nhất.',
  accent: 'from-orange-300 to-coffee-500',
};

function shortenAddress(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState('Chưa kết nối');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const parseChainId = (chainId) => {
    if (chainId === '0x1') return 'Ethereum Mainnet';
    if (chainId === '0xaa36a7') return 'Sepolia Testnet';
    if (chainId === '0x5') return 'Goerli Testnet';
    return `Chain ID: ${chainId}`;
  };

  const connectMetaMask = async () => {
    setError('');
    if (!window.ethereum) {
      setError('Không tìm thấy MetaMask. Vui lòng cài đặt MetaMask hoặc mở trong trình duyệt hỗ trợ.');
      return;
    }

    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const [selected] = accounts;
      setAccount(selected || null);

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setNetwork(parseChainId(chainId));
    } catch (err) {
      if (err?.code === 4001) {
        setError('Yêu cầu bị từ chối. Vui lòng xác nhận kết nối trong MetaMask.');
      } else {
        setError('Không thể kết nối MetaMask. Vui lòng thử lại.');
      }
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          window.ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
            setNetwork(parseChainId(chainId));
          });
        }
      })
      .catch((err) => console.error(err));

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || null);
      if (accounts.length === 0) setNetwork('Chưa kết nối');
    };

    const handleChainChanged = (chainId) => {
      setNetwork(parseChainId(chainId));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

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
                  className="rounded-full bg-forest-900 text-white px-8 py-3 text-sm font-semibold shadow-lg shadow-forest-900/10 hover:bg-forest-800 transition-colors"
                >
                  {connecting ? 'Đang kết nối...' : account ? 'Ví đã kết nối' : 'Kết nối MetaMask'}
                </button>
                <Link
                  to="/dashboard"
                  className="rounded-full border border-coffee-300 bg-white px-8 py-3 text-sm font-semibold text-forest-900 hover:border-forest-500 transition-all"
                >
                  Xem Dashboard
                </Link>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>

            <div className="relative rounded-[2rem] border border-coffee-200 bg-white/95 p-8 shadow-2xl shadow-coffee-200/30 overflow-hidden">
              <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-forest-100 opacity-70 blur-3xl" />
              <div className="absolute -bottom-10 left-6 w-40 h-40 rounded-full bg-coffee-100 opacity-80 blur-3xl" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase text-coffee-500 tracking-[0.22em]">Trạng thái ví</p>
                    <h2 className="text-2xl font-bold text-forest-900 mt-2">
                      {account ? 'Đã liên kết' : 'Sẵn sàng kết nối'}
                    </h2>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border ${
                    account ? 'bg-green-50 text-green-700 border-green-100' : 'bg-forest-50 text-forest-700 border-forest-100'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${account ? 'bg-green-500' : 'bg-forest-500'}`} />
                    {account ? 'Đang hoạt động' : 'An toàn'}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-coffee-50 p-5 border border-coffee-100">
                    <p className="text-xs uppercase tracking-[0.2em] text-coffee-500">Mạng</p>
                    <h3 className="mt-3 text-lg font-semibold text-forest-900">{network}</h3>
                    <p className="mt-2 text-sm text-coffee-600">Kết nối trực tiếp với mạng lưới chính, bảo mật giao dịch và dữ liệu.</p>
                  </div>
                  <div className="rounded-3xl bg-forest-50 p-5 border border-forest-100">
                    <p className="text-xs uppercase tracking-[0.2em] text-forest-500">Phiên</p>
                    <h3 className="mt-3 text-lg font-semibold text-forest-900">{account ? shortenAddress(account) : 'Chưa có ví nào được chọn'}</h3>
                    <p className="mt-2 text-sm text-forest-600">
                      {account ? `Đã kết nối với MetaMask trên mạng này.` : 'Nhấn nút kết nối để chọn tài khoản trong MetaMask.'}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] bg-gradient-to-br from-coffee-100 via-brand-lightgreen to-forest-100 p-6 border border-coffee-200/80">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-coffee-700">Bước tiếp theo</p>
                  <ol className="mt-4 space-y-3 text-sm text-coffee-700 leading-7 list-decimal list-inside pl-2">
                    <li>Chọn ví và khởi tạo kết nối.</li>
                    <li>Xác nhận yêu cầu trên ứng dụng ví.</li>
                    <li>Quản lý quyền truy cập, quyền chia sẻ và lịch sử giao dịch.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-24">
        <div className="group rounded-[2rem] border border-coffee-200 bg-white p-8 shadow-lg shadow-coffee-200/20 transition-transform hover:-translate-y-1">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${METAMASK.accent} text-white text-xl shadow-lg shadow-black/10`}>
            <i className={`fa-brands ${METAMASK.icon}`} />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-forest-900">{METAMASK.name}</h3>
          <p className="mt-3 text-sm leading-7 text-coffee-700">{METAMASK.description}</p>
          <button
            type="button"
            onClick={connectMetaMask}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-forest-900 px-6 py-3 text-sm font-semibold text-white hover:bg-forest-800 transition-colors"
          >
            {connecting ? 'Đang kết nối...' : account ? 'MetaMask đã kết nối' : 'Kết nối MetaMask'}
          </button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </section>
    </div>
  );
}