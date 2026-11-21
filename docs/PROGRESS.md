# Nhật ký Tiến độ Dự án (`docs/PROGRESS.md`) — `forma/`

**Cập nhật lần cuối:** 2026-11-21  
**Cột mốc hiện tại:** Phase 1.5 — Mock Auth + Customer Account + Code Viewer (**Hoàn thành** — chờ chủ dự án duyệt để sang Phase 1.6)

---

## Tổng quan Trạng thái các Phase

| Phase | Nội dung chính | Trạng thái |
| :--- | :--- | :--- |
| **Phase 1.1** | Khởi tạo nền tảng, Design Tokens, 8 file tài liệu, StorageAdapter, i18n, Typed Repositories, 18 sản phẩm mẫu, App Shell | **Done (Đã xong)** |
| **Phase 1.2** | Homepage (`/`), Library (`/library`), lọc/tìm kiếm/sắp xếp, tab Components/Templates, card tương tác mẫu & responsive | **Done (Đã xong)** |
| **Phase 1.3** | Product Detail (`/products/[slug]`), Fullscreen Preview (`/preview/[slug]`), Controlled React Preview Registry, Static Iframe Previews (`Orbit`, `Northbound`), Mock Fallback & Wishlist | **Done (Đã xong)** |
| **Phase 1.4** | Mock Auth (`/login`), Get Free claim flow, Cart Drawer trượt phải, One-Page Checkout (`/checkout`), Mock Coupons & Simulated Payment | **Done (Đã xong)** |
| **Phase 1.5** | Customer Dashboard (`/account`: `My Library`, `Orders`, `Wishlist`, `Settings`), Mock Profile editing, Lazy Read-Only Monaco Viewer & Sample ZIP | **Done (Đã xong)** |
| **Phase 1.6** | Admin Dashboard (`/admin`), Các trang phụ (`About`, `Support/FAQ`, `404`), Kiểm thử tổng thể | **Next (Tiếp theo)** |
| **Phase 2** | Backend API, MySQL + Prisma, Auth Provider tương thích MySQL, Private Storage, Payment Gateway | **Blocked (Chờ hoàn tất Phase 1)** |

---

## Checklist Nghiệm thu Phase 1.5 (2026-11-21)

- [x] **Cài đặt `@monaco-editor/react` (`^4.7.0`) & ghi nhận `ADR-006` trong `docs/DECISIONS.md`.**
- [x] **Tạo file ZIP mẫu hợp lệ `public/demo-assets/forma-sample-bundle.zip` (647 bytes)** phục vụ nút tải ZIP trong `My Library`.
- [x] **Bổ sung `updateDemoProfile` vào `IAuthRepository` / `MockAuthRepository` / `useAuthStore`:** Cho phép cập nhật tên hiển thị & email của phiên demo trong `localStorage` (tuyệt đối không lưu mật khẩu) và giữ nguyên tên đăng ký khi tạo tài khoản Demo.
- [x] **Xây dựng Lazy-Loaded Read-Only Monaco Source Viewer (`src/features/account/components/monaco-code-viewer.tsx`):**
  - Lazy-load bằng `next/dynamic(..., { ssr: false })` để không làm nặng SSR/route chính (`/account` chỉ `4.63 kB`).
  - Có File Tree, thanh tìm kiếm trong code kèm số lượng khớp & jump-to-line, syntax highlighting, nút `Copy code`, `Fullscreen` modal (`Escape` để thoát), chế độ chỉ đọc (`readOnly: true`, `domReadOnly: true`) và ghi nhãn `Demo Source Fixture`.
- [x] **Xây dựng Minimal Customer Account Dashboard (`/account` — `src/features/account/components/account-view.tsx`):**
  - Cổng Auth Gate khi chưa đăng nhập (`/login?next=/account` hoặc đăng nhập nhanh Khách hàng Demo).
  - 4 tab ngang: `My Library` (hiển thị sản phẩm đã mua / nhận miễn phí, mở `MonacoCodeViewer`, tải ZIP mẫu), `Orders` (lịch sử đơn hàng), `Wishlist` (quản lý danh sách lưu), `Settings` (sửa Mock Profile, đổi ngôn ngữ/tiền tệ, `Sign out`, `Reset All Demo Data`).
- [x] **Tích hợp `MonacoCodeViewer` vào tab `Source Code` trên `/products/[slug]` khi sản phẩm đã sở hữu và nối link `/account` từ `Navbar` & `Footer`.**
- [x] **Chạy `npm run typecheck`, `npm run lint`, và `npm run build` sau lần sửa cuối (exit code `0`; `/account` `4.63 kB`, 9/9 static pages + 2 dynamic routes).**
- [x] **Kiểm thử trực tiếp trên Chrome (`npm run start` tại `http://localhost:3000`):**
  - **Console & Network:** `<no console messages found>` sau lần chỉnh sửa cuối (0 lỗi JS, 0 lỗi hydration, 0 404, 0 cảnh báo DevTools `autocomplete`). Monaco worker files (`0.55.1` từ CDN) nạp `200 OK`.
  - **Register & Mock Profile:** Đăng ký `"Test Register"` hiển thị đúng `TR` / `Test Register`; cập nhật tên trên tab `Settings` (`Alex Demo`) lưu bền vững vào `localStorage` qua reload.
  - **My Library, Monaco Viewer & ZIP Download:** Đã test nhận miễn phí `Pulse` (`Get Free`) và mua `Orbit` (`Checkout`), mở `MonacoCodeViewer`, chuyển cây thư mục (`components/orbit.tsx` → `styles/orbit.tokens.css` → `README.md`), tìm `"forma"` + nhảy tới dòng `L4`, `Copy code` → `Copied ✓`, `Fullscreen` mở/đóng, và tải `forma-sample-bundle.zip`.
  - **Orders, Wishlist, Logout & Reset Demo Data:** Kiểm thử đầy đủ các tab, đăng xuất quay về Auth Gate, và Reset toàn bộ dữ liệu demo về trạng thái sạch (`0 OWNED`, `0 ORDERS`, `0 WISHLIST`).
  - **Responsive (`1440x900`, `768x1024`, `375x812`):** Không tràn ngang trên `/account` (kể cả khi mở `MonacoCodeViewer`).

---

## Theo dõi các điểm `// TODO` trong Code

- `src/components/layout/navbar.tsx`: `// TODO(Phase 1.6): Point About and Support links to dedicated routes once created.`
- `src/components/layout/footer.tsx`: `// TODO(Phase 1.3): Update Account, Admin, About, and Support links as routes are implemented.` (Admin, About, Support sẽ hoàn tất ở Phase 1.6).
- `src/features/auth/use-auth-store.ts`: `// TODO(Phase 2): Replace with server-verified session cookies and MySQL entitlement queries.`
- `src/features/cart/use-cart-store.ts`: `// TODO(Phase 2): Synchronize cart with server session and ignore client-submitted prices.`
- `src/features/wishlist/use-wishlist-store.ts`: `// TODO(Phase 2): Synchronize wishlist items with MySQL user wishlist table on the server.`
- `src/lib/format/currency.ts`: `// TODO(Phase 2): Replace or augment with server-validated payment currency rules and minor-unit amounts required by the selected payment gateway.`
- `src/mocks/accounts.seed.ts`: `// TODO(Phase 2): Replace with database-backed User records and real session verification.`
- `src/mocks/coupons.seed.ts`: `// TODO(Phase 2): Validate and calculate coupon discounts strictly on the server inside a database transaction before creating a payment intent.`
- `src/mocks/products.seed.ts`: `// TODO(Phase 2): Replace seed fixtures with MySQL + Prisma queries and private object storage ZIP URLs.`
- `src/services/repositories/interfaces.ts`: `// TODO(Phase 2): Implement Prisma repositories backed by MySQL, server-side role checks, MySQL-compatible auth provider, server-side coupon validation, and signed private download URLs.`
- `src/services/index.ts`: `// TODO(Phase 2): Bind interfaces to server-side MySQL + Prisma implementations.`

---

## Checklist Phase Tiếp theo — Phase 1.6 (Admin Dashboard + Secondary Pages + Final QA)

- [ ] Xây dựng **Admin Dashboard (`/admin`)** kiểu Sidebar: `Overview`, `Products CRUD` (`Draft`/`Published`, chọn file ZIP chỉ đọc metadata tên/dung lượng không nhét binary vào `localStorage`), `Orders`, `Customers`, `Coupons`, `Analytics` (gắn nhãn Mock rõ ràng) và `Settings` (`Reset Demo Data`).
- [ ] Xây dựng các trang phụ: **About (`/about`)**, **Support/FAQ (`/support`)**, và **Error / 404 (`not-found.tsx` / `error.tsx`)**.
- [ ] Cập nhật toàn bộ link còn lại trên `Navbar` & `Footer` (`/admin`, `/about`, `/support`), kiểm thử tổng thể `1440px` / `768px` / `375px`, bàn phím/A11y, `typecheck`, `lint`, `build`, và hoàn thiện docs kết thúc Phase 1.
