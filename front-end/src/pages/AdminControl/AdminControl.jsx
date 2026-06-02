import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./AdminControl.css";

// ─── Role & Workspace Config ────────────────────────────────────────────────
const ROLES = [
  {
    value: "FARMER_ROLE",
    label: "Nông Dân",
    roleBg: "bg-forest-100",
    roleText: "text-forest-800",
  },
  {
    value: "COOPERATIVE_ROLE",
    label: "Hợp Tác Xã",
    roleBg: "bg-emerald-100",
    roleText: "text-emerald-800",
  },
  {
    value: "PROCESSOR_ROLE",
    label: "Nhà Sơ Chế",
    roleBg: "bg-amber-100",
    roleText: "text-amber-800",
  },
  {
    value: "ROASTER_ROLE",
    label: "Nhà Rang Xay",
    roleBg: "bg-coffee-100",
    roleText: "text-coffee-800",
  },
  {
    value: "EXPORTER_ROLE",
    label: "Nhà Xuất Khẩu",
    roleBg: "bg-blue-100",
    roleText: "text-blue-800",
  },
  {
    value: "RETAILER_ROLE",
    label: "Nhà Bán Lẻ",
    roleBg: "bg-purple-100",
    roleText: "text-purple-800",
  },
  {
    value: "ADMIN_ROLE",
    label: "Quản Trị Viên",
    roleBg: "bg-red-100",
    roleText: "text-red-800",
  },
];

const WORKSPACES = [
  { value: "farm", label: "Nông trại Cầu Đất (WS-1001)" },
  { value: "coop", label: "HTX Cầu Đất (WS-7742)" },
  { value: "processor", label: "Nhà sơ chế Đà Lạt (WS-2201)" },
  { value: "roaster", label: "The Roastery (WS-8812)" },
  { value: "exporter", label: "Global Export Coffee (WS-9901)" },
  { value: "retailer", label: "Retail Store Japan (WS-5508)" },
  { value: "admin", label: "System Admin Workspace (WS-0001)" },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PERMISSIONS = [
  {
    id: "p1",
    address: "0x12...34ab",
    shortAddress: "0x1",
    name: "Nguyễn Văn A",
    workspace: "Nông trại Cầu Đất (WS-1001)",
    workspaceKey: "farm",
    role: "Nông Dân",
    roleValue: "FARMER_ROLE",
    roleBg: "bg-forest-100",
    roleText: "text-forest-800",
    status: "Active",
    statusBg: "bg-green-50",
    statusText: "text-green-700",
    statusBorder: "border-green-200",
    statusDot: "bg-green-500",
    grantedDate: "12/05/2026",
    avatarBg: "from-forest-200 to-forest-400",
    avatarText: "text-forest-800",
  },
  {
    id: "p2",
    address: "0x8f...2e9a",
    shortAddress: "0x8",
    name: "Trần Thị B",
    workspace: "HTX Cầu Đất (WS-7742)",
    workspaceKey: "coop",
    role: "Hợp Tác Xã",
    roleValue: "COOPERATIVE_ROLE",
    roleBg: "bg-emerald-100",
    roleText: "text-emerald-800",
    status: "Active",
    statusBg: "bg-green-50",
    statusText: "text-green-700",
    statusBorder: "border-green-200",
    statusDot: "bg-green-500",
    grantedDate: "13/05/2026",
    avatarBg: "from-emerald-200 to-emerald-400",
    avatarText: "text-emerald-800",
  },
  {
    id: "p3",
    address: "0x91...55ef",
    shortAddress: "0x9",
    name: "Lê Văn C",
    workspace: "Nhà sơ chế Đà Lạt (WS-2201)",
    workspaceKey: "processor",
    role: "Nhà Sơ Chế",
    roleValue: "PROCESSOR_ROLE",
    roleBg: "bg-amber-100",
    roleText: "text-amber-800",
    status: "Pending",
    statusBg: "bg-amber-50",
    statusText: "text-amber-700",
    statusBorder: "border-amber-200",
    statusDot: "bg-amber-500",
    grantedDate: "Hôm nay",
    avatarBg: "from-amber-200 to-amber-400",
    avatarText: "text-amber-800",
  },
  {
    id: "p4",
    address: "0x3a...7d4f",
    shortAddress: "0x3",
    name: "Phạm Thị D",
    workspace: "The Roastery (WS-8812)",
    workspaceKey: "roaster",
    role: "Nhà Rang Xay",
    roleValue: "ROASTER_ROLE",
    roleBg: "bg-coffee-100",
    roleText: "text-coffee-800",
    status: "Active",
    statusBg: "bg-green-50",
    statusText: "text-green-700",
    statusBorder: "border-green-200",
    statusDot: "bg-green-500",
    grantedDate: "05/05/2026",
    avatarBg: "from-coffee-200 to-coffee-400",
    avatarText: "text-coffee-800",
  },
  {
    id: "p5",
    address: "0xc4...9b1c",
    shortAddress: "0xc",
    name: "Hoàng Văn E",
    workspace: "Global Export Coffee (WS-9901)",
    workspaceKey: "exporter",
    role: "Nhà Xuất Khẩu",
    roleValue: "EXPORTER_ROLE",
    roleBg: "bg-blue-100",
    roleText: "text-blue-800",
    status: "Active",
    statusBg: "bg-green-50",
    statusText: "text-green-700",
    statusBorder: "border-green-200",
    statusDot: "bg-green-500",
    grantedDate: "01/05/2026",
    avatarBg: "from-blue-200 to-blue-400",
    avatarText: "text-blue-800",
  },
  {
    id: "p6",
    address: "0x77...11aa",
    shortAddress: "0x7",
    name: "Retail Partner JP",
    workspace: "Retail Store Japan (WS-5508)",
    workspaceKey: "retailer",
    role: "Nhà Bán Lẻ",
    roleValue: "RETAILER_ROLE",
    roleBg: "bg-purple-100",
    roleText: "text-purple-800",
    status: "Revoked",
    statusBg: "bg-red-50",
    statusText: "text-red-700",
    statusBorder: "border-red-200",
    statusDot: "bg-red-500",
    grantedDate: "20/04/2026",
    avatarBg: "from-purple-200 to-purple-400",
    avatarText: "text-purple-800",
  },
  {
    id: "p7",
    address: "0xf3...99aa",
    shortAddress: "0xf",
    name: "System Admin",
    workspace: "System Admin Workspace (WS-0001)",
    workspaceKey: "admin",
    role: "Quản Trị Viên",
    roleValue: "ADMIN_ROLE",
    roleBg: "bg-red-100",
    roleText: "text-red-800",
    status: "Active",
    statusBg: "bg-green-50",
    statusText: "text-green-700",
    statusBorder: "border-green-200",
    statusDot: "bg-green-500",
    grantedDate: "01/01/2026",
    avatarBg: "from-red-200 to-red-400",
    avatarText: "text-red-800",
  },
];

const MOCK_AUDIT = [
  {
    id: "a1",
    time: "2026-05-08 14:32:10",
    txHash: "0x8f9c...2e9a",
    actor: "0x12...34ab (Admin)",
    actionTag: "ROLE_GRANT",
    actionDesc: "Cấp quyền Nông Dân cho 0x3a...7d4f",
    actionBg: "bg-blue-50",
    actionText: "text-blue-700",
    actionBorder: "border-blue-100",
    status: "Success",
    statusClass: "text-green-600",
    statusIcon: "fa-solid fa-circle-check",
    rowBg: "",
  },
  {
    id: "a2",
    time: "2026-05-08 11:15:42",
    txHash: "0xa1b2...c3d4",
    actor: "0x44...55ef (Farmer)",
    actionTag: "LOT_UPDATE",
    actionDesc: "Cập nhật lô LOT-2026-05A",
    actionBg: "bg-coffee-100",
    actionText: "text-coffee-800",
    actionBorder: "border-coffee-200",
    status: "Success",
    statusClass: "text-green-600",
    statusIcon: "fa-solid fa-circle-check",
    rowBg: "",
  },
  {
    id: "a3",
    time: "2026-05-08 10:05:11",
    txHash: "0x99ff...ee22",
    actor: "0x88...99aa (Roaster)",
    actionTag: "LOT_TRANSFER",
    actionDesc: "Chuyển quyền sở hữu LOT-2026-04B",
    actionBg: "bg-purple-50",
    actionText: "text-purple-700",
    actionBorder: "border-purple-100",
    status: "Pending",
    statusClass: "text-amber-600",
    statusIcon: "fa-solid fa-circle-notch fa-spin",
    rowBg: "bg-amber-50/20",
  },
  {
    id: "a4",
    time: "2026-05-07 16:45:00",
    txHash: "0xdd44...11bb",
    actor: "0x12...34ab (Admin)",
    actionTag: "ROLE_REVOKE",
    actionDesc: "Thu hồi quyền Nhà Xuất Khẩu 0xc4...9b1c",
    actionBg: "bg-red-50",
    actionText: "text-red-700",
    actionBorder: "border-red-100",
    status: "Failed",
    statusClass: "text-red-600",
    statusIcon: "fa-solid fa-circle-xmark",
    rowBg: "bg-red-50/20",
  },
  {
    id: "a5",
    time: "2026-05-07 09:20:15",
    txHash: "0x55aa...66cc",
    actor: "0x44...55ef (Farmer)",
    actionTag: "LOT_CREATE",
    actionDesc: "Tạo mới lô LOT-2026-05A",
    actionBg: "bg-green-50",
    actionText: "text-green-700",
    actionBorder: "border-green-100",
    status: "Success",
    statusClass: "text-green-600",
    statusIcon: "fa-solid fa-circle-check",
    rowBg: "",
  },
];

const AdminControl = () => {
  const [activeTab, setActiveTab] = useState("permissions");
  const [searchWallet, setSearchWallet] = useState("");
  const [filterWorkspace, setFilterWorkspace] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditEvent, setAuditEvent] = useState("");
  const [auditStatus, setAuditStatus] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const filteredPermissions = MOCK_PERMISSIONS.filter((perm) => {
    const keyword = searchWallet.toLowerCase();

    const matchWallet =
      !searchWallet ||
      perm.address.toLowerCase().includes(keyword) ||
      perm.name.toLowerCase().includes(keyword) ||
      perm.role.toLowerCase().includes(keyword) ||
      perm.workspace.toLowerCase().includes(keyword);

    const matchWorkspace =
      !filterWorkspace || perm.workspaceKey === filterWorkspace;

    const matchRole =
      !filterRole || perm.roleValue === filterRole;

    return matchWallet && matchWorkspace && matchRole;
  });

  const handleToggleAccount = async (userId, currentStatus) => {
    const action = currentStatus === "Active" ? "deactivate" : "activate";
    try {
      await axiosInstance.post(`/admin/users/${userId}/${action}`);
      alert(`Đã ${action === "activate" ? "kích hoạt" : "khóa"} tài khoản thành công.`);
    } catch {
      alert("Lỗi khi thực hiện thao tác. Vui lòng thử lại.");
    }
  };

  const handleGrantOnChain = async (walletAddress, roleValue) => {
    try {
      await axiosInstance.post("/admin/blockchain/grant-role", {
        walletAddress,
        role: roleValue,
        chainId: 31337,
      });

      alert(`Đã gửi yêu cầu cấp quyền on-chain cho ${walletAddress}`);
    } catch {
      alert("Lỗi khi gửi giao dịch on-chain. Vui lòng kiểm tra kết nối ví.");
    }
  };

  const handleApprove = async (perm) => {
    try {
      await axiosInstance.patch(`/admin/permissions/${perm.id}/approve`);
      await handleGrantOnChain(perm.address, perm.roleValue);
    } catch {
      alert("Lỗi phê duyệt. Vui lòng thử lại.");
    }
  };

  const handleReject = async (permId) => {
    try {
      await axiosInstance.patch(`/admin/permissions/${permId}/reject`);
      alert("Đã từ chối yêu cầu.");
    } catch {
      alert("Lỗi từ chối. Vui lòng thử lại.");
    }
  };

  const handleRevoke = async (permId) => {
    if (!window.confirm("Bạn có chắc muốn thu hồi quyền này?")) return;

    try {
      await axiosInstance.delete(`/admin/permissions/${permId}`);
      alert("Đã thu hồi quyền thành công.");
    } catch {
      alert("Lỗi thu hồi quyền. Vui lòng thử lại.");
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
                    <h2 className="font-bold text-forest-900 text-lg leading-tight">
                      Quản Trị Hệ Thống
                    </h2>
                    <p className="text-xs text-forest-600 mt-1">
                      Vai trò: System Admin
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                    <span className="text-sm text-forest-700">Trạng thái mạng</span>
                    <span className="text-sm font-semibold text-forest-900 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-forest-500"></span>
                      Online
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                    <span className="text-sm text-forest-700">Tổng Workspaces</span>
                    <span className="text-sm font-semibold text-forest-900">
                      {WORKSPACES.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-forest-700">Ví Admin</span>
                    <span className="text-xs font-semibold text-forest-700 bg-forest-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-500"></span>
                      Đã kết nối
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="glass-panel p-4 rounded-[2rem] border border-coffee-200 shadow-sm bg-white/90">
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-xl text-forest-700 hover:bg-coffee-50 hover:text-forest-900 font-medium transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center text-coffee-600">
                      <i className="fa-solid fa-chart-pie"></i>
                    </div>
                    Tổng Quan
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-xl text-forest-700 hover:bg-coffee-50 hover:text-forest-900 font-medium transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center text-coffee-600">
                      <i className="fa-solid fa-boxes-stacked"></i>
                    </div>
                    Quản Lý Lô Hàng
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-xl bg-forest-50 text-forest-900 font-semibold transition-colors"
                  >
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
                <h1 className="text-2xl font-serif font-bold text-forest-900">
                  Quản Trị Hệ Thống
                </h1>
                <p className="text-sm text-forest-600 mt-1">
                  Quản lý quyền truy cập và theo dõi nhật ký hoạt động trên blockchain.
                </p>
              </div>

              <div className="bg-coffee-50 p-1 rounded-xl border border-coffee-200 inline-flex">
                <button
                  onClick={() => setActiveTab("permissions")}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "permissions" ? "tab-active shadow-sm" : "tab-inactive"
                  }`}
                >
                  <i className="fa-solid fa-user-shield mr-2"></i>
                  Phân Quyền
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === "audit" ? "tab-active shadow-sm" : "tab-inactive"
                  }`}
                >
                  <i className="fa-solid fa-list-check mr-2"></i>
                  Nhật Ký
                </button>
              </div>
            </div>

            {activeTab === "permissions" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Tổng ví đã cấp quyền",
                      value: MOCK_PERMISSIONS.length,
                      sub: "Đang dùng dữ liệu mock",
                      subColor: "text-forest-500",
                      icon: "fa-solid fa-wallet",
                      iconBg: "bg-forest-50",
                      iconColor: "text-forest-600",
                    },
                    {
                      label: "Tổng Workspaces",
                      value: WORKSPACES.length,
                      icon: "fa-solid fa-layer-group",
                      iconBg: "bg-coffee-50",
                      iconColor: "text-coffee-600",
                    },
                    {
                      label: "Tổng Vai Trò",
                      value: ROLES.length,
                      icon: "fa-solid fa-users-gear",
                      iconBg: "bg-blue-50",
                      iconColor: "text-blue-600",
                    },
                    {
                      label: "Yêu cầu chờ xử lý",
                      value: MOCK_PERMISSIONS.filter((p) => p.status === "Pending").length,
                      sub: "Cần duyệt",
                      subColor: "text-amber-600 font-medium",
                      icon: "fa-solid fa-bell",
                      iconBg: "bg-amber-50",
                      iconColor: "text-amber-600",
                    },
                  ].map((kpi, i) => (
                    <div
                      key={i}
                      className="dashboard-card p-5 flex flex-col justify-between h-32"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-forest-700">
                          {kpi.label}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-lg ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center`}
                        >
                          <i className={kpi.icon}></i>
                        </div>
                      </div>

                      <div>
                        <span className="text-2xl font-bold text-forest-900">
                          {kpi.value}
                        </span>
                        {kpi.sub && (
                          <span className={`text-xs ml-2 ${kpi.subColor}`}>
                            {kpi.sub}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 p-4 rounded-2xl border border-coffee-200 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-forest-400"></i>
                      <input
                        type="text"
                        value={searchWallet}
                        onChange={(e) => setSearchWallet(e.target.value)}
                        placeholder="Tìm ví, tên, role..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent text-sm text-forest-900 placeholder-forest-400"
                      />
                    </div>

                    <select
                      value={filterWorkspace}
                      onChange={(e) => setFilterWorkspace(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-coffee-200 bg-white text-sm text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-500"
                    >
                      <option value="">Tất cả Workspace</option>
                      {WORKSPACES.map((ws) => (
                        <option key={ws.value} value={ws.value}>
                          {ws.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-coffee-200 bg-white text-sm text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-500"
                    >
                      <option value="">Tất cả Vai trò</option>
                      {ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-forest-800 text-white font-semibold hover:bg-forest-900 transition-all text-sm flex items-center justify-center gap-2 shadow-sm">
                    <i className="fa-solid fa-plus"></i>
                    Cấp quyền mới
                  </button>
                </div>

                <div className="dashboard-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-coffee-50/80 border-b border-coffee-200 text-xs uppercase tracking-wider text-forest-700 font-semibold">
                          <th className="p-4 w-12">
                            <input type="checkbox" className="custom-checkbox" />
                          </th>
                          <th className="p-4">Địa chỉ Ví / Tên</th>
                          <th className="p-4">Workspace</th>
                          <th className="p-4">Vai trò</th>
                          <th className="p-4">Trạng thái</th>
                          <th className="p-4">Ngày cấp</th>
                          <th className="p-4 text-right">Hành động</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-coffee-100 text-sm">
                        {filteredPermissions.length > 0 ? (
                          filteredPermissions.map((perm) => (
                            <tr
                              key={perm.id}
                              className={`hover:bg-coffee-50/50 transition-colors group ${
                                perm.status === "Revoked" ? "bg-red-50/30" : ""
                              }`}
                            >
                              <td className="p-4">
                                <input type="checkbox" className="custom-checkbox" />
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${perm.avatarBg} flex items-center justify-center ${perm.avatarText} font-bold text-xs shadow-sm`}
                                  >
                                    {perm.shortAddress}
                                  </div>

                                  <div>
                                    <div className="font-mono font-medium text-forest-900">
                                      {perm.address}
                                    </div>
                                    <div className="text-xs text-forest-500">
                                      {perm.name}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-4 text-forest-700">{perm.workspace}</td>

                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${perm.roleBg} ${perm.roleText}`}
                                >
                                  {perm.role}
                                </span>
                              </td>

                              <td className="p-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${perm.statusBg} ${perm.statusText} border ${perm.statusBorder}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${perm.statusDot}`}
                                  ></span>
                                  {perm.status}
                                </span>
                              </td>

                              <td className="p-4 text-forest-600">{perm.grantedDate}</td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    className="p-1.5 text-forest-500 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors"
                                    title="Lịch sử thay đổi"
                                    onClick={() => setShowHistoryModal(true)}
                                  >
                                    <i className="fa-solid fa-clock-rotate-left"></i>
                                  </button>

                                  {perm.status === "Pending" ? (
                                    <>
                                      <button
                                        onClick={() => handleApprove(perm)}
                                        className="px-3 py-1 rounded-lg text-xs font-medium text-white bg-forest-600 hover:bg-forest-700 transition-colors"
                                      >
                                        Duyệt
                                      </button>

                                      <button
                                        onClick={() => handleReject(perm.id)}
                                        className="px-3 py-1 rounded-lg text-xs font-medium text-forest-700 bg-coffee-100 hover:bg-coffee-200 transition-colors"
                                      >
                                        Từ chối
                                      </button>
                                    </>
                                  ) : perm.status === "Revoked" ? (
                                    <button
                                      onClick={() =>
                                        handleGrantOnChain(perm.address, perm.roleValue)
                                      }
                                      className="px-3 py-1 rounded-lg text-xs font-medium text-forest-700 bg-forest-50 hover:bg-forest-100 border border-forest-200 transition-colors"
                                    >
                                      Cấp lại
                                    </button>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleToggleAccount(perm.id, perm.status)
                                        }
                                        className="p-1.5 text-forest-500 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors"
                                        title="Khóa / kích hoạt"
                                      >
                                        <i className="fa-solid fa-user-lock"></i>
                                      </button>

                                      <button
                                        onClick={() => handleRevoke(perm.id)}
                                        className="px-3 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                      >
                                        Thu hồi
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="7"
                              className="p-8 text-center text-forest-500"
                            >
                              Không tìm thấy quyền phù hợp.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-coffee-100 bg-white/50 flex items-center justify-between">
                    <span className="text-sm text-forest-600">
                      Hiển thị {filteredPermissions.length} trên tổng số{" "}
                      {MOCK_PERMISSIONS.length}
                    </span>

                    <div className="flex gap-1">
                      <button className="px-3 py-1 rounded-lg border border-coffee-200 text-forest-400 cursor-not-allowed bg-white text-sm">
                        Trước
                      </button>
                      <button className="px-3 py-1 rounded-lg border border-forest-500 bg-forest-50 text-forest-800 font-medium text-sm">
                        1
                      </button>
                      <button className="px-3 py-1 rounded-lg border border-coffee-200 hover:bg-coffee-50 text-forest-700 text-sm transition-colors">
                        Tiếp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-6">
                <div className="glass-panel p-5 rounded-[1rem] border border-coffee-200 bg-white/90">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-forest-700 mb-1.5 uppercase tracking-wide">
                        Tìm kiếm TxHash
                      </label>

                      <div className="relative">
                        <i className="fa-solid fa-hashtag absolute left-3 top-1/2 transform -translate-y-1/2 text-forest-400"></i>
                        <input
                          type="text"
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          placeholder="0x..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 font-mono text-sm text-forest-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest-700 mb-1.5 uppercase tracking-wide">
                        Loại sự kiện
                      </label>

                      <select
                        value={auditEvent}
                        onChange={(e) => setAuditEvent(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 bg-white text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
                      >
                        <option value="">Tất cả sự kiện</option>
                        <option value="lot_create">Tạo lô hàng</option>
                        <option value="lot_update">Cập nhật lô</option>
                        <option value="role_grant">Cấp quyền</option>
                        <option value="role_revoke">Thu hồi quyền</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-forest-700 mb-1.5 uppercase tracking-wide">
                        Trạng thái
                      </label>

                      <select
                        value={auditStatus}
                        onChange={(e) => setAuditStatus(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 bg-white text-sm text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="success">Thành công</option>
                        <option value="pending">Đang chờ</option>
                        <option value="failed">Thất bại</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-coffee-100 flex justify-between items-center">
                    <div className="text-sm text-forest-600">
                      Đang hiển thị{" "}
                      <span className="font-semibold text-forest-900">
                        {MOCK_AUDIT.length}
                      </span>{" "}
                      bản ghi gần nhất
                    </div>

                    <button className="px-4 py-2 rounded-lg bg-coffee-100 text-forest-800 font-semibold hover:bg-coffee-200 transition-all text-sm flex items-center gap-2 border border-coffee-300">
                      <i className="fa-solid fa-file-csv"></i>
                      Xuất CSV
                    </button>
                  </div>
                </div>

                <div className="dashboard-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-forest-900 text-white text-xs uppercase tracking-wider font-semibold">
                          <th className="p-4 rounded-tl-lg">Thời gian</th>
                          <th className="p-4">TxHash</th>
                          <th className="p-4">Actor</th>
                          <th className="p-4">Hành động</th>
                          <th className="p-4">Trạng thái</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-coffee-200 text-sm font-mono bg-white">
                        {MOCK_AUDIT.map((log) => (
                          <tr
                            key={log.id}
                            className={`hover:bg-forest-50 transition-colors ${log.rowBg}`}
                          >
                            <td className="p-4 text-forest-600 text-xs">
                              {log.time}
                            </td>

                            <td className="p-4">
                              <button
                                onClick={() => handleCopy(log.txHash)}
                                className="text-forest-700 hover:text-forest-900 font-semibold flex items-center gap-1.5 group"
                              >
                                {log.txHash}
                                <i className="fa-regular fa-copy opacity-0 group-hover:opacity-100 transition-opacity text-xs"></i>
                              </button>
                            </td>

                            <td className="p-4 text-forest-800">{log.actor}</td>

                            <td className="p-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded ${log.actionBg} ${log.actionText} border ${log.actionBorder} text-xs font-sans font-medium`}
                              >
                                {log.actionTag}
                              </span>
                              <span className="text-xs text-forest-500 ml-2 font-sans block mt-1">
                                {log.actionDesc}
                              </span>
                            </td>

                            <td className="p-4">
                              <div
                                className={`flex items-center gap-1.5 ${log.statusClass} font-sans font-medium text-xs`}
                              >
                                <i className={log.statusIcon}></i>
                                {log.status}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-coffee-100 bg-forest-50/50 flex items-center justify-between font-sans">
                    <span className="text-sm text-forest-600">
                      Hiển thị 1-{MOCK_AUDIT.length} trên tổng số {MOCK_AUDIT.length} bản ghi
                    </span>

                    <div className="flex gap-1">
                      <button className="px-3 py-1 rounded-lg border border-coffee-200 text-forest-400 cursor-not-allowed bg-white text-sm">
                        Trước
                      </button>
                      <button className="px-3 py-1 rounded-lg border border-forest-500 bg-forest-50 text-forest-800 font-medium text-sm">
                        1
                      </button>
                      <button className="px-3 py-1 rounded-lg border border-coffee-200 text-forest-400 cursor-not-allowed bg-white text-sm">
                        Tiếp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            onClick={() => setShowHistoryModal(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-coffee-200 overflow-hidden m-4 transform transition-all">
            <div className="p-6 border-b border-coffee-100 flex justify-between items-center bg-forest-50/50">
              <div>
                <h3 className="font-serif text-xl font-bold text-forest-900">
                  Lịch sử quyền
                </h3>
                <p className="text-sm text-forest-600 mt-1">
                  Theo dõi thay đổi phân quyền của ví người dùng
                </p>
              </div>

              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-coffee-200 flex items-center justify-center text-forest-500 hover:text-forest-900 hover:bg-coffee-50 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="relative border-l-2 border-coffee-200 ml-3 space-y-8">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-forest-500 border-2 border-white shadow-sm"></div>
                  <div className="text-xs text-forest-500 font-medium mb-1">
                    12/05/2026, 14:32:10
                  </div>
                  <div className="bg-forest-50 border border-forest-100 rounded-xl p-3">
                    <div className="font-semibold text-forest-900 text-sm">
                      Cấp quyền Nông Dân
                    </div>
                    <div className="text-xs text-forest-600 mt-1">
                      Thực hiện bởi: Admin
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-forest-400 bg-white px-2 py-1 rounded inline-block border border-coffee-100">
                      Tx: 0x8f9c...2e9a
                    </div>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
                  <div className="text-xs text-forest-500 font-medium mb-1">
                    10/05/2026, 09:15:00
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <div className="font-semibold text-amber-900 text-sm">
                      Tạm khóa quyền
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      Lý do: Cập nhật hồ sơ workspace
                    </div>
                  </div>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-coffee-300 border-2 border-white shadow-sm"></div>
                  <div className="text-xs text-forest-500 font-medium mb-1">
                    01/01/2026, 10:00:00
                  </div>
                  <div className="bg-coffee-50 border border-coffee-100 rounded-xl p-3">
                    <div className="font-semibold text-forest-900 text-sm">
                      Tạo yêu cầu tham gia
                    </div>
                    <div className="text-xs text-forest-600 mt-1">
                      Workspace: HTX Cầu Đất
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-coffee-100 bg-white flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 rounded-xl bg-forest-50 text-forest-800 font-semibold hover:bg-forest-100 transition-all text-sm border border-forest-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminControl;