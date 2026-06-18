const ROLE_NAME_MAP = {
  ADMIN: 'Ban Quản Trị',
  FARMER: 'Nông Dân',
  COOPERATIVE: 'Hợp Tác Xã',
  PROCESSOR: 'Đơn Vị Sơ Chế',
  EXPORTER: 'Đơn Vị Xuất Khẩu',
  RECEIVER: 'Nhà Nhập Khẩu',
  ANONYMOUS: 'Khách Vãng Lai'
};

export const getRoleName = (role) => {
  if (!role) return ROLE_NAME_MAP.ANONYMOUS;
  
  const upperRole = role.toUpperCase();
  return ROLE_NAME_MAP[upperRole] || role;
};