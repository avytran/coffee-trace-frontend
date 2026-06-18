export const parseWeb3Error = (err, fallbackCallback = null) => {
  if (
    err.code === "ACTION_REJECTED" || 
    err.code === 4001 || 
    err.message?.includes("user rejected action")
  ) {
    return {
      isOpen: true,
      title: "Giao Dịch Bị Hủy",
      message: "Bạn đã từ chối yêu cầu ký xác nhận và thanh toán Gas trên ví MetaMask. Vui lòng thử lại nếu muốn tiếp tục.",
      type: "error",
      callback: fallbackCallback
    };
  }

  if (err.response?.status === 500 || err.message?.includes("Network Error")) {
    return {
      isOpen: true,
      title: "Lỗi Hệ Thống (500)",
      message: err.response?.data?.message || "Máy chủ backend gặp sự cố đột xuất hoặc không phản hồi dữ liệu đồng bộ. Vui lòng liên hệ bộ phận kỹ thuật.",
      type: "error",
      callback: fallbackCallback
    };
  }

  return {
    isOpen: true,
    title: "Thực Thi Thất Bại",
    message: err.response?.data?.message || err.message || "Đã xảy ra lỗi không xác định trong quá trình xử lý dữ liệu.",
    type: "error",
    callback: fallbackCallback
  };
};