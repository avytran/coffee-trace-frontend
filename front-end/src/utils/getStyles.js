export const getRoleStyles = (role) => {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return { bg: "bg-blue-100", text: "text-blue-800", label: "Quản Trị Viên" };
      
    case "FARMER":
      return { bg: "bg-emerald-100", text: "text-emerald-800", label: "Nông Hộ / Nông Dân" };
      
    case "COOPERATIVE":
      return { bg: "bg-amber-100", text: "text-amber-800", label: "Hợp Tác Xã" };
      
    case "PROCESSOR":
      return { bg: "bg-orange-100", text: "text-orange-800", label: "Nhà Máy Chế Biến" };
      
    case "EXPORTER":
      return { bg: "bg-purple-100", text: "text-purple-800", label: "Đơn Vị Xuất Khẩu" };
      
    case "RECEIVER":
      return { bg: "bg-indigo-100", text: "text-indigo-800", label: "Bên Nhập Khẩu" };
      
    case "ANONYMOUS":
      return { bg: "bg-gray-100", text: "text-gray-500", label: "Khách Vãng Lai" };
      
    default:
      return { bg: "bg-rose-100", text: "text-rose-800", label: role || "Chưa Xác Định" };
  }
};

export const getStatusStyles = (status) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
    case "SUCCESS":
      return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", icon: "fa-solid fa-circle-check", textClass: "text-green-600" };
    case "PENDING":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", icon: "fa-solid fa-circle-notch fa-spin", textClass: "text-amber-600" };
    case "REVOKED":
    case "FAILED":
      return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", icon: "fa-solid fa-circle-xmark", textClass: "text-red-600" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-500", icon: "fa-solid fa-circle", textClass: "text-gray-600" };
  }
};

export const getActionStyles = (tag) => {
  if (tag?.includes("GRANT")) return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" };
  if (tag?.includes("REVOKE")) return { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" };
  if (tag?.includes("UPDATE")) return { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" };
  return { bg: "bg-green-50", text: "text-green-700", border: "border-green-100" };
};