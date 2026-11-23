# HỒN ÁN – DẤU VẾT CÕI ÂM

Webgame 3D kinh dị tâm lý, điều tra vụ án và giải đố góc nhìn thứ nhất (First-Person POV) lấy cảm hứng từ văn hóa dân gian Việt Nam.

## Tính năng nổi bật
- **Góc nhìn thứ nhất 3D mượt mà**: Điều khiển `WASD`, xoay 360° (Pointer Lock), `Shift` chạy, `C`/`Ctrl` ngồi, `F` đèn pin, `E` tương tác, `Tab` Sổ điều tra, `I` Túi đồ, `ESC` tạm dừng; có va chạm tường/đồ đạc và tiếng bước chân theo bề mặt.
- **Kiểm tra vật chứng 3D xoay 360°**: Phóng to/thu nhỏ, lật mọi mặt và bấm trực tiếp vào các điểm tương tác ẩn trên mô hình 3D để thu thập manh mối.
- **Sổ Điều Tra 5 Tab & Bảng Kết Nối Chỉ Đỏ**: Hồ Sơ Vụ Án, Vật Chứng, Manh Mối, Nghi Can và Bảng Kết Nối kéo thả nối chỉ đỏ suy luận.
- **5 Màn chơi – Giải đố 3 Tầng**:
  1. **Án 01**: Ngôi Nhà Không Có Người Sống
  2. **Án 02**: Miếu Cô Gái Áo Đỏ
  3. **Án 03**: Tiếng Gõ Từ Đáy Giếng
  4. **Án 04**: Ngôi Đình Lúc Nửa Đêm
  5. **Án 05**: Chuyến Đò Sang Cõi Âm
- **Âm thanh 3D Positional Audio & Dynamic Horror + Jumpscare**: Tổng hợp hoàn toàn bằng Web Audio API (tiếng mõ, chuông chùa, gió, bước chân phía sau, hát ru ngũ cung, âm thanh jumpscare & tim đập).
- **Tự động lưu tiến độ** qua `localStorage`.

## Công nghệ sử dụng
- React 18 + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- Tailwind CSS v4 + Framer Motion + Zustand
- Web Audio API (HRTF 3D Audio)

## Cài đặt và chạy cục bộ
```bash
npm install
npm run dev
```
Mở trình duyệt tại `http://localhost:5173`.
