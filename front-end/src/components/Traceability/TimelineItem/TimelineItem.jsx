import "./TimelineItem.css";

/**
 * TimelineItem - Nút khối đồ họa trục thời gian
 *
 * Props:
 * @param {object}  item         - Dữ liệu một giai đoạn truy xuất
 * @param {string}  item.id
 * @param {string}  item.stage   - Tên giai đoạn (vd: "Thu Hoạch & Phân Loại")
 * @param {string}  item.unit    - Đơn vị thực hiện
 * @param {string}  item.date    - Ngày ghi nhận (vd: "15/10/2025")
 * @param {string}  item.time    - Giờ ghi nhận (vd: "08:30 AM")
 * @param {string}  item.icon    - FontAwesome class icon (vd: "fa-solid fa-leaf")
 * @param {object}  item.avatar  - { src, alt } hoặc null (dùng icon thay thế)
 * @param {string}  item.avatarIcon - FA icon class nếu không có ảnh
 * @param {string}  item.avatarBg  - Tailwind bg class cho avatar icon
 * @param {array}   item.details - [{label, value}] hiển thị trong info box
 * @param {array}   item.attachments - [{icon, iconColor, name}]
 * @param {string}  item.txHash  - Mã băm blockchain (vd: "0x8f2a...9c41")
 * @param {string}  item.etherscanUrl - URL Etherscan
 * @param {boolean} item.isLast  - true nếu là node cuối cùng (ẩn connector line)
 */
const TimelineItem = ({ item }) => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className={`timeline-item relative z-10 mb-12 flex gap-6 md:gap-8 group${item.isLast ? " last" : ""}`}>
      {/* Node Icon */}
      <div className="w-12 h-12 rounded-full bg-forest-900 border-4 border-white shadow-sm flex items-center justify-center flex-shrink-0 relative z-10 timeline-node">
        <i className={`${item.icon} text-white text-sm`}></i>
      </div>

      {/* Node Content Card */}
      <div className="flex-1 bg-white rounded-[1rem] border border-coffee-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-5 transition-all hover:shadow-md hover:border-coffee-300">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {item.avatar ? (
              <img
                src={item.avatar.src}
                className="w-10 h-10 rounded-full border border-coffee-200"
                alt={item.avatar.alt || "Avatar"}
              />
            ) : (
              <div className={`w-10 h-10 rounded-full ${item.avatarBg || "bg-coffee-100"} flex items-center justify-center border border-coffee-200`}>
                <i className={`${item.avatarIcon || "fa-solid fa-user"} text-coffee-600 text-sm`}></i>
              </div>
            )}
            <div>
              <h3 className="font-bold text-forest-900 text-base">{item.stage}</h3>
              <p className="text-xs text-forest-600">{item.unit}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium text-forest-900">{item.date}</p>
            <p className="text-xs text-forest-500">{item.time}</p>
          </div>
        </div>

        {/* Details Box */}
        {item.details && item.details.length > 0 && (
          <div className="bg-coffee-50 rounded-lg p-4 mb-4 border border-coffee-100">
            {item.transportFrom ? (
              /* Transport layout: From → To */
              <div className="flex items-center gap-4 text-sm">
                <div className="flex-1">
                  <span className="text-forest-500 block text-xs">Từ</span>
                  <span className="font-medium text-forest-900">{item.transportFrom}</span>
                </div>
                <i className="fa-solid fa-arrow-right text-coffee-300"></i>
                <div className="flex-1">
                  <span className="text-forest-500 block text-xs">Đến</span>
                  <span className="font-medium text-forest-900">{item.transportTo}</span>
                </div>
              </div>
            ) : (
              /* Grid layout */
              <div className={`grid grid-cols-2 gap-4 text-sm`}>
                {item.details.map((d, idx) => (
                  <div key={idx}>
                    <span className="text-forest-500 block text-xs">{d.label}</span>
                    <span className="font-medium text-forest-900">{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attachments */}
        {item.attachments && item.attachments.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {item.attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-coffee-200 rounded-lg text-xs hover:bg-coffee-50 cursor-pointer transition-colors"
              >
                <i className={`${att.icon} ${att.iconColor}`}></i>
                <span className="text-forest-700 font-medium">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Blockchain Meta */}
        <div className="pt-4 border-t border-coffee-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-forest-50 px-3 py-1.5 rounded-lg border border-forest-100">
            <i className="fa-brands fa-ethereum text-forest-600 text-xs"></i>
            <span className="text-xs font-mono text-forest-800">{item.txHash}</span>
            <button
              className="text-forest-500 hover:text-forest-900 ml-1"
              onClick={() => handleCopy(item.txHash)}
              title="Sao chép mã băm"
            >
              <i className="fa-regular fa-copy"></i>
            </button>
          </div>
          
            href={item.etherscanUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-forest-600 hover:text-forest-900 flex items-center gap-1"
          >
            Xem trên Explorer <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;