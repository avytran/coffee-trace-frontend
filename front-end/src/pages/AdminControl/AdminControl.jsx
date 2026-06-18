import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./AdminControl.css";
import CreateUserForm from "../../components/Admin/CreateUserForm";
import { getRoleStyles, getStatusStyles } from "../../utils/getStyles";
import { NotificationModal } from "../../components/Common/NotificationModal";
import { parseWeb3Error } from "../../utils/errorHandler";

const AdminControl = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalPerms: 0, totalFarmers: 0, totalRoasters: 0, pendingRequests: 0, totalWorkspaces: 142 });

  const [searchWallet, setSearchWallet] = useState("");
  const [filterWorkspace, setFilterWorkspace] = useState("");
  const [filterRole, setFilterRole] = useState(""); 
  const [permPage, setPermPage] = useState(1);
  const [totalPermsCount, setTotalPermsCount] = useState(0);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
    callback: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/admin/dashboard-stats");
        setStats({
          totalPerms: response.data.data?.totalUsers || 0,
          totalFarmers: response.data.data?.activeUsers || 0,
          totalRoasters: response.data.data?.suspendedUsers || 0,
          pendingRequests: response.data.data?.totalTransactions || 0,
          totalWorkspaces: 142
        });
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thống kê kpi:", err);
      }
    };
    fetchStats();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/admin/permissions", {
        params: {
          search: searchWallet,
          workspace: filterWorkspace,
          role: filterRole, 
          page: permPage,
          limit: 10
        }
      });
      const formattedData = (response.data.users || []).map(item => ({
        id: item.id,
        address: item.wallet_address,
        name: item.name,
        role: item.role,
        status: item.status,
      }));

      setPermissions(formattedData);
      setTotalPermsCount(response.data.pagination?.totalRecords || formattedData.length);
    } catch (err) {
      console.error("Lỗi tải danh sách phân quyền:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [searchWallet, filterWorkspace, filterRole, permPage]);

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
    if (modalConfig.callback) {
      modalConfig.callback();
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchPermissions();
  };

  const handleGrantOnChain = async (walletAddress, role) => {
    try {
      await axiosInstance.post("/admin/blockchain/grant-role", {
        walletAddress,
        role, 
        chainId: 1,
      });
      
      setModalConfig({
        isOpen: true,
        title: "Giao Dịch Đã Gửi!",
        message: `Đã gửi yêu cầu cấp quyền on-chain cho địa chỉ ví ${walletAddress}.`,
        type: "success"
      });
    } catch (err) {
      setModalConfig(parseWeb3Error(err));
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="m-0 p-0 bg-coffee-50 text-forest-900 font-sans relative overflow-x-hidden min-h-screen flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-[-1] bg-grain mix-blend-multiply opacity-50"></div>

      <main className="flex-grow pt-10 pb-24 flex items-start justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-[1440px] w-full mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-8">

          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            <div className="glass-panel p-6 rounded-[2rem] border border-coffee-200 shadow-sm bg-white/90 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-forest-100 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-forest-100 rounded-2xl flex items-center justify-center text-forest-600 text-xl shadow-inner">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <h2 className="font-bold text-forest-900 text-lg leading-tight">Quản Trị Hệ Thống</h2>
                    <p className="text-xs text-forest-600 mt-1">Vai trò: System Admin</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                    <span className="text-sm text-forest-700">Trạng thái mạng</span>
                    <span className="text-sm font-semibold text-forest-900 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-forest-500"></span> Online
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                    <span className="text-sm text-forest-700">Tổng Workspaces</span>
                    <span className="text-sm font-semibold text-forest-900">{stats.totalWorkspaces}</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="glass-panel p-4 rounded-[2rem] border border-coffee-200 shadow-sm bg-white/90">
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center gap-3 p-3 rounded-xl bg-forest-50 text-forest-900 font-semibold transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center text-forest-600">
                      <i className="fa-solid fa-users-gear"></i>
                    </div>
                    Quản Lý Phân Quyền
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <div className="flex-grow space-y-6 w-full max-w-full overflow-hidden">
            
            <div className="glass-panel p-6 rounded-[1.5rem] border border-coffee-200 bg-white/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-forest-900">Quản Trị Hệ Thống</h1>
                <p className="text-sm text-forest-600 mt-1">Quản lý quyền truy cập chuỗi cung ứng nông sản.</p>
              </div>
              <div className="bg-coffee-50 p-1 rounded-xl border border-coffee-200 inline-flex">
                <button className="px-6 py-2 rounded-lg text-sm font-semibold transition-all tab-active shadow-sm">
                  <i className="fa-solid fa-user-shield mr-2"></i>Phân Quyền
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4 text-forest-700 font-medium bg-white/80 rounded-xl border border-coffee-100">
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Đang đồng bộ với Ledger...
              </div>
            )}

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl border border-coffee-200 backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-forest-400"></i>
                    <input
                      type="text"
                      value={searchWallet}
                      onChange={(e) => { setSearchWallet(e.target.value); setPermPage(1); }}
                      placeholder="Tìm kiếm địa chỉ ví..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 text-sm text-forest-900"
                    />
                  </div>
                  
                  <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPermPage(1); }} className="px-4 py-2 rounded-xl border border-coffee-200 bg-white text-sm text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-500">
                    <option value="">Tất cả Vai trò</option>
                    <option value="FARMER">Nông dân (FARMER)</option>
                    <option value="ROASTER">Nhà Rang Xay (ROASTER)</option>
                    <option value="DISTRIBUTOR">Nhà Phân Phối (DISTRIBUTOR)</option>
                    <option value="EXPORTER">Nhà Xuất Khẩu (EXPORTER)</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN)</option>
                  </select>
                </div>
                
                <button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-forest-800 text-white font-semibold hover:bg-forest-900 transition-all text-sm flex items-center justify-center gap-2 shadow-sm">
                  <i className="fa-solid fa-plus"></i> Cấp quyền đối tác mới
                </button>
              </div>

              <div className="dashboard-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-coffee-50/80 border-b border-coffee-200 text-xs uppercase tracking-wider text-forest-700 font-semibold">
                        <th className="p-4 w-12"><input type="checkbox" className="custom-checkbox" /></th>
                        <th className="p-4">Địa chỉ Ví / Đối Tác</th>
                        <th className="p-4">Vai trò Hệ Thống</th>
                        <th className="p-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-coffee-100 text-sm">
                      {permissions.map((perm) => {
                        const roleStyle = getRoleStyles(perm.role);
                        const statusStyle = getStatusStyles(perm.status);
                        return (
                          <tr key={perm.id} className="hover:bg-coffee-50/50 transition-colors group">
                            <td className="p-4"><input type="checkbox" className="custom-checkbox" /></td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-200 to-coffee-300 flex items-center justify-center text-forest-800 font-bold text-xs shadow-sm">
                                  {perm.address ? perm.address.slice(0, 4) : "0x"}
                                </div>
                                <div>
                                  <div className="font-mono font-medium text-forest-900 flex items-center gap-1">
                                    {perm.address ? `${perm.address.slice(0, 6)}...${perm.address.slice(-4)}` : "Chưa có ví"}
                                    <button onClick={() => handleCopy(perm.address)} className="text-gray-400 hover:text-forest-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                      <i className="fa-regular fa-copy text-xs"></i>
                                    </button>
                                  </div>
                                  <div className="text-xs text-forest-500">{perm.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleStyle.bg} ${roleStyle.text}`}>
                                {roleStyle.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span> {perm.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-coffee-100 bg-white/50 flex items-center justify-between">
                  <span className="text-sm text-forest-600">Tổng số đối tác: {totalPermsCount}</span>
                  <div className="flex gap-1">
                    <button disabled={permPage === 1} onClick={() => setPermPage(p => p - 1)} className="px-3 py-1 rounded-lg border border-coffee-200 text-forest-700 bg-white text-sm disabled:opacity-50">Trước</button>
                    <button className="px-3 py-1 rounded-lg border border-forest-500 bg-forest-50 text-forest-800 font-medium text-sm">{permPage}</button>
                    <button disabled={permissions.length < 10} onClick={() => setPermPage(p => p + 1)} className="px-3 py-1 rounded-lg border border-coffee-200 bg-white text-sm text-forest-700 disabled:opacity-50">Tiếp</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl relative">
            <CreateUserForm 
              onClose={() => setIsCreateModalOpen(false)} 
              onSuccess={handleCreateSuccess}
            />
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default AdminControl;