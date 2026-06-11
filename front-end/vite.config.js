import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,       // Đổi hẳn sang cổng 3000
    strictPort: true, // Nếu cổng 3000 bận thì báo lỗi chứ không tự động nhảy lên cổng khác
    host: '127.0.0.1' // Ép Vite dùng IPv4 thay vì IPv6 (::1) để tránh lỗi EACCES quyền local
  }
});
