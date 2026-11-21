# Đặc tả Sản phẩm (`docs/PRODUCT.md`) — `forma/`

## 1. Thương hiệu & Mô hình Kinh doanh

- **Tên thương hiệu:** `forma/` (chữ `forma` màu trắng đi kèm dấu `/` màu cyan `#00D8FF`).
- **Mô hình cửa hàng:** **Personal Store** — Chỉ duy nhất Admin tạo và quản lý sản phẩm. Không có seller marketplace, không có đăng ký người bán bên thứ ba hay chia doanh thu.
- **Chiến lược cốt lõi:** **Demo-first** — Khách hàng được xem và tương tác trực tiếp với UI Components và Website Templates trước khi đăng nhập, nhận mẫu miễn phí hoặc mua bản trả phí.
- **Chính sách cập nhật & bàn giao:** **Lifetime updates** (cập nhật trọn đời) và **chỉ giữ một bản ZIP mới nhất** (không cần lưu lịch sử nhiều phiên bản).

---

## 2. Thị trường, Đa ngôn ngữ (`i18n`) & Tiền tệ Song song

- **Thị trường:** Lập trình viên, designer và agency tại Việt Nam lẫn quốc tế.
- **Ngôn ngữ:** Song ngữ Tiếng Việt (`vi`) và Tiếng Anh (`en`).
  - Lần đầu truy cập trên trình duyệt, tự động nhận diện theo `navigator.language` (`vi*` → `vi`, còn lại → `en`).
  - Người dùng có thể đổi thủ công bất kỳ lúc nào; lựa chọn được lưu vào `localStorage`.
- **Hiển thị giá:** Sử dụng bảng giá demo cố định bằng **số nguyên** cho từng sản phẩm ở cả hai đơn vị **VND** (ví dụ: `490.000đ`) và **USD** (ví dụ: `$19`).
  - Không quy đổi chéo theo tỷ giá thực; mỗi sản phẩm khai báo rõ `priceVnd` và `priceUsd`.
  - Sản phẩm miễn phí có `priceVnd = 0` và `priceUsd = 0` (hiển thị `Miễn phí` / `Free`).

---

## 3. Nhóm Người dùng (Personas)

1. **Khách tham quan (Visitor):** Xem showcase ở Homepage, tìm kiếm/lọc trong Library (`Components` / `Templates`), thử tương tác micro-demo và fullscreen responsive preview, đọc tài liệu trước khi đăng nhập.
2. **Khách hàng đã đăng nhập Demo (Customer):** Nhận sản phẩm miễn phí (`Get Free`), thêm sản phẩm trả phí vào Cart Drawer, nhập mã giảm giá mẫu (`FORMA20`), chạy thanh toán mô phỏng, mở khóa sản phẩm trong **My Library**, xem mã nguồn mẫu ở **Monaco Viewer** (chế độ read-only) và tải file ZIP mẫu.
3. **Chủ cửa hàng (Admin):** Quản lý danh mục sản phẩm (`Draft` / `Published`, thông tin metadata file ZIP), theo dõi đơn hàng mô phỏng, danh sách khách hàng, mã giảm giá và số liệu thống kê (gắn nhãn **Mock**) qua Admin Sidebar Dashboard.

---

## 4. Lộ trình 7 Sub-phases của Phase 1

| Chặng | Phạm vi tính năng | Trạng thái / Mục tiêu |
| :--- | :--- | :--- |
| **Phase 1.1** | App Shell, Design Tokens, Typed Repositories, StorageAdapter, i18n, Seed 18 sản phẩm & 8 tài liệu Markdown | Đã xong (Done) |
| **Phase 1.2** | Homepage (`/` bám sát ảnh 1) + Library (`/library` bám sát ảnh 2), tìm kiếm/lọc/sắp xếp & card tương tác | Đã xong (Done) |
| **Phase 1.3** | Product Detail (`/products/[slug]`), Fullscreen Live Preview (`/preview/[slug]`), Controlled Registry, Static Iframe (`Orbit`, `Northbound`) & Wishlist | Đã xong (Done) |
| **Phase 1.4** | Mock Auth (`/login` bám sát ảnh 3), Cart Drawer chống trùng, One-Page Checkout (`/checkout`), Mock Coupons & Simulated Payment | Đã xong (Done) |
| **Phase 1.5** | Customer Dashboard (`/account`: `My Library`, `Orders`, `Wishlist`, `Settings`), Lazy Read-Only Monaco Viewer & Sample ZIP | Đã xong (Done) |
| **Phase 1.6** | Admin Dashboard (`/admin`: Overview, Products CRUD, Draft/Published, Metadata-only `.zip`, Orders, Customers, Coupons, Mock Analytics, Reset) | Đã xong (Done) |
| **Phase 1.7** | QA + Handoff (`/about`, `/support`, `404`/`error.tsx`, Audit UI/Tokens/Accessibility/Reduced Motion, Prune Deps & Đồng bộ Docs Bàn giao) | Đã xong (Done) |

---

## 5. Ngoài phạm vi Phase 1 (Chuyển sang Phase 2)

- Lưu trữ database thật (MySQL + Prisma) và server API / Server Actions.
- Xác thực mật khẩu thật, cookie phiên server hay Google OAuth thật.
- Cổng thanh toán thật (Stripe, PayOS, VNPay, MoMo...) và xử lý webhook.
- Kiểm tra quyền sở hữu phía server và cấp link tải ZIP riêng tư (S3/R2 signed URLs).
- Build/chạy code từ file ZIP do người dùng upload (nếu có trong tương lai phải cô lập trong `iframe sandbox` ở origin riêng biệt).

---

## 6. Tiêu chí Nghiệm thu Tổng thể Phase 1

- Không lỗi runtime, không lỗi SSR hydration khi đọc/ghi `localStorage`.
- Các lệnh `npm run typecheck`, `npm run lint`, và `npm run build` luôn đạt exit code `0`.
- Bố cục sạch đẹp ở `1440px`, `768px` và `375px`, không tràn ngang (`overflow-x`).
- Mọi ranh giới mô phỏng đều được ghi nhãn trung thực trên UI và trong comment code.
