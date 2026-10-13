# Product Management System (PMS) - Frontend

Hệ thống Quản lý Sản phẩm (Product Management System) được phát triển bằng Angular với kiến trúc giao diện chuẩn **Business UI/UX** chuyên nghiệp, màu sắc trung tính, phản hồi nhanh và khả năng mở rộng module linh hoạt.

---

## 1. Cấu trúc Layout (Architecture Layout)

Ứng dụng tuân thủ bố cục kinh điển cho các ứng dụng doanh nghiệp:

```html
<div class="app-container">
  <header class="app-header">
    <h1>Product Management System</h1>
  </header>

  <main class="app-body">
    <router-outlet></router-outlet>
  </main>

  <footer class="app-footer">
    <p>&copy; 2026 Product Management System</p>
  </footer>
</div>
```

### Nguyên tắc UI/UX Layout:
- **Header (`.app-header`)**: Cố định trên cùng (`position: fixed; top: 0;`), không bị cuộn theo nội dung, độ cao ổn định và ưu tiên hiển thị nhận diện thương hiệu `Product Management System`.
- **Body (`.app-body`)**: Dàn trải toàn màn hình (`flex: 1; width: 100%; box-sizing: border-box;`), không căn giữa dạng container hẹp, khoảng cách đệm trên (`margin-top: 70px`) chống tràn và chống bị Header che khuất.
- **Footer (`.app-footer`)**: Tọa lạc dưới cùng (`min-height: 100vh` trên container flexbox), co giãn theo nội dung, đường viền phân cách trang nhã, không che lấp dữ liệu bảng.
- **Responsive Design**: Tự động thích ứng trên PC, Laptop, Tablet và Thiết bị di động (Mobile).

---

## 2. Chuẩn SCSS / CSS Business

Định nghĩa CSS/SCSS chuẩn hóa dành cho hệ thống:

```scss
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #1a2a3a;
  color: #fff;
  padding: 1rem;
  z-index: 1000;
  box-sizing: border-box;
}

.app-body {
  flex: 1;
  margin-top: 70px;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.app-footer {
  background-color: #f5f5f5;
  text-align: center;
  padding: 0.5rem;
  color: #666;
  border-top: 1px solid #e0e0e0;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.2rem;
  }
  .app-body {
    padding: 0.5rem;
  }
}
```

---

## 3. Định hướng UI/UX Business & Trải nghiệm Người dùng

1. **Bảng màu trung tính (Neutral Palette)**:
   - Header & Primary Action: `#1a2a3a` (Deep Navy Business)
   - Nền trang (Background): `#f8f9fa`
   - Bề mặt card & bảng (Surface): `#ffffff`
   - Viền phân cách (Borders): `#dee2e6` / `#ced4da`
   - Chữ & Nội dung (Typography): `#212529` (Chính), `#6c757d` (Phụ)
2. **Typography rõ ràng**:
   - Sử dụng font hệ thống (`-apple-system`, `Segoe UI`, `Roboto`), trọng số `font-weight: 500-700` tạo sự rành mạch giữa các cấp thông tin.
3. **Phản hồi thao tác tức thì**:
   - Sử dụng Angular Signals cho tìm kiếm, lọc danh mục, cập nhật trạng thái đơn hàng, giỏ hàng trong thời gian thực (0 latency).
4. **Không biểu tượng AI / Yếu tố ngoài lề**: Tập trung 100% vào nghiệp vụ thương mại và quản trị dữ liệu.

---

## 4. Khả năng Mở rộng Module (Modular Architecture)

Hệ thống được thiết kế theo cấu trúc Feature-based, sẵn sàng mở rộng các module:

| Tuyến đường (Route) | Module chức năng | Mô tả nghiệp vụ |
| :--- | :--- | :--- |
| `/products` | **Quản lý Sản phẩm** | Thống kê KPI, danh sách sản phẩm, bộ lọc, tìm kiếm, CRUD nhanh |
| `/cart` | **Giỏ hàng** | Quản lý mặt hàng đã chọn, điều chỉnh số lượng, tạm tính, thuế VAT |
| `/orders` | **Quản lý Đơn hàng** | Theo dõi đơn đặt hàng, trạng thái thanh toán và vận chuyển |
| `/users` | **Quản trị Người dùng** | Phân quyền tài khoản (Admin, Manager, Staff), trạng thái bảo mật |
| `/statistics` | **Báo cáo Thống kê** | Tổng hợp doanh thu, cơ cấu danh mục, sản phẩm bán chạy nhất |

### Cách bổ sung thêm Module mới:
1. Tạo component trong thư mục `src/app/features/<module-name>/`.
2. Khai báo route trong [src/app/app.routes.ts](file:///D:/JavaTraining/hethongquanlysanpham/product-management-fe/src/app/app.routes.ts).
3. Bổ sung link vào thanh điều hướng [src/app/shared/module-nav/module-nav.component.ts](file:///D:/JavaTraining/hethongquanlysanpham/product-management-fe/src/app/shared/module-nav/module-nav.component.ts).

---

## 5. Hướng dẫn Khởi chạy Dự án

### Cài đặt thư viện:
```bash
npm install
```

### Chạy máy chủ phát triển (Development Server):
```bash
npm start
# hoặc
ng serve
```
Truy cập tại: `http://localhost:4200/`

### Chạy kiểm thử tự động (Unit Tests):
```bash
npm test
# hoặc
npx ng test --watch=false
```

### Biên dịch ứng dụng cho Production:
```bash
npm run build
```
Kết quả build được lưu tại thư mục `dist/product-management-fe`.
