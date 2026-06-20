# 💻 CoffeeTrace Frontend - React Application (RobusTrace)

CoffeeTrace Frontend là ứng dụng phi tập trung (dApp) giao diện người dùng nằm trong hệ thống quản lý chuỗi cung ứng và truy xuất nguồn gốc dòng đời hạt cà phê Robusta Đắk Lắk. Được xây dựng trên nền tảng React, ứng dụng cung cấp giao diện trực quan, tương tác trực tiếp với mạng lưới Blockchain Ethereum (Sepolia Testnet) thông qua thư viện Ethers.js và ví MetaMask.

Hệ thống áp dụng cơ chế kiểm soát truy cập dựa trên vai trò mã hóa (Role-Based Access Control - RBAC) kết hợp lưu trữ kép (Hybrid Storage: On-chain + Off-chain PostgreSQL & IPFS) để vừa đảm bảo tính minh bạch, bất biến của dữ liệu chuỗi cung ứng, vừa tối ưu hóa tốc độ trải nghiệm và chi phí Gas cho người dùng.

---

## 📋 Danh sách Chức năng Chi tiết

### 🔐 Chức năng Theo Vai trò (RBAC)
Hệ thống tự động nhận diện địa chỉ ví công khai của người dùng sau khi kết nối để điều hướng đến không gian làm việc tương ứng:

* **Ban Quản trị (Admin):** Giao diện quản trị tối cao, cho phép phê duyệt, cấp phát hoặc thu hồi quyền truy cập (`FARMER`, `COOPERATIVE`, `PROCESSOR`, `EXPORTER`, `RECEIVER`) cho từng địa chỉ ví trong chuỗi cung ứng.
* **Nông dân (Farmer):** Khởi tạo các mẻ/lô cà phê Robusta mới thô (`INITIAL`), cập nhật nhật ký canh tác, bón phân, tọa độ GPS vùng trồng và thông tin sản lượng thu hoạch (`HARVESTED`).
* **Hợp tác xã (Cooperative):** Tiếp nhận lô hàng vật lý, kiểm định chỉ số hóa lý (độ ẩm, tỷ lệ hạt đen/vỡ). Phê duyệt chuyển trạng thái (`PROCESSED`) kèm hồ sơ sơ chế thô hoặc Từ chối (`REJECTED`) vĩnh viễn nếu lô hàng không đạt chuẩn để chống gian lận.
* **Nhà chế biến (Processor):** Ghi nhận nhật ký kỹ thuật công đoạn chế biến sâu, cấu hình nhiệt độ rang xay thành phẩm (`PROCESSED` -> `ASSESSED`).
* **Đơn vị xuất khẩu (Exporter):** Khai báo thông tin logistics vận tải quốc tế, kiểm dịch thực vật và đính kèm hồ sơ thông quan chứng từ lên mạng phân tán (`EXPORTED`).
* **Đối tác nhận hàng (Receiver):** Kiểm kho thực tế tại điểm đích, xác nhận nghiệm thu nhập kho và đóng vĩnh viễn vòng đời luân chuyển sở hữu của lô hàng (`COMPLETED`/`RECEIVED`).

### 🌐 Cổng tra cứu đại chúng (Public Portal)
Dành cho người tiêu dùng cuối và khách vãng lai (`ANONYMOUS`):
* **Không cần ví Web3/Tài khoản:** Người dùng truy cập tự do, nhanh chóng mà không cần cài đặt MetaMask.
* **Quét mã QR / Nhập mã truy xuất:** Truy vấn dữ liệu trực tiếp từ cơ sở dữ liệu PostgreSQL (tối ưu hóa CQRS cho thời gian phản hồi cực nhanh).
* **Đồ thị dòng thời gian hành trình (Timeline):** Trình bày giao diện chuỗi hành trình trực quan từ nông trường đến tách cà phê thành phẩm, hiển thị chi tiết các thông số kỹ thuật, liên kết mã băm (Transaction Hash) đối soát on-chain độc lập và xem file chứng nhận gốc lưu tại mạng IPFS.

---

## 🛠 Cài đặt và Triển khai

### 1. Khởi tạo môi trường
Di chuyển vào thư mục frontend và cài đặt các gói phụ thuộc:
```bash
cd front-end
npm install
```

2. Cấu hình biến môi trường (.env)
Tạo file .env tại thư mục gốc của frontend dựa trên file mẫu cấu hình kết nối .env.example

3. Khởi chạy ứng dụng trong môi trường phát triển (Local)
```bash
npm run dev
```

## Nhóm sinh viên thực hiện
Nhóm E:
1.  Nguyễn Mạc Gia Huy	    MSSV: 31231025016
2.	Nguyễn Nguyên Khuyến 	MSSV: 31231026626
3.	Nguyễn Thị Thiên Nhi	MSSV: 31231023551
4.	Lê Vũ Uyên Phương	    MSSV: 31231025809
5.	Trần Anh Vy			    MSSV: 31231020502
