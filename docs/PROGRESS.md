# Nhật ký Tiến độ Dự án (`docs/PROGRESS.md`) — `forma/`

**Cập nhật lần cuối:** 2026-11-21  
**Cột mốc hiện tại:** Phase 1.3 — Product Detail + Smart Hybrid Preview (**Hoàn thành** — chờ chủ dự án duyệt để sang Phase 1.4)

---

## Tổng quan Trạng thái các Phase

| Phase | Nội dung chính | Trạng thái |
| :--- | :--- | :--- |
| **Phase 1.1** | Khởi tạo nền tảng, Design Tokens, 8 file tài liệu, StorageAdapter, i18n, Typed Repositories, 18 sản phẩm mẫu, App Shell | **Done (Đã xong)** |
| **Phase 1.2** | Homepage (`/`), Library (`/library`), lọc/tìm kiếm/sắp xếp, tab Components/Templates, card tương tác mẫu & responsive | **Done (Đã xong)** |
| **Phase 1.3** | Product Detail (`/products/[slug]`), Fullscreen Preview (`/preview/[slug]`), Controlled React Preview Registry, Static Iframe Previews (`Orbit`, `Northbound`), Mock Fallback & Wishlist | **Done (Đã xong)** |
| **Phase 1.4** | Mock Auth (`/login`), Get Free claim flow, Cart Drawer trượt phải, One-Page Checkout (`/checkout`), Mock Coupons & Simulated Payment | **Next (Tiếp theo)** |
| **Phase 1.5** | Customer Dashboard (`/account`), Lazy Read-Only Monaco Viewer, Tải ZIP mẫu | **To Do** |
| **Phase 1.6** | Admin Dashboard (`/admin`), Các trang phụ (`About`, `Support/FAQ`, `404`), Kiểm thử tổng thể | **To Do** |
| **Phase 2** | Backend API, MySQL + Prisma, Auth Provider tương thích MySQL, Private Storage, Payment Gateway | **Blocked (Chờ hoàn tất Phase 1)** |

---

## Checklist Nghiệm thu Phase 1.3 (2026-11-21)

- [x] **Xây dựng Controlled React Preview Registry (`src/features/preview/`):**
  - `src/features/preview/registry/interactive-demos.tsx`: 4 demo component tương tác thật (`SignalButtonDemo`, `PrismSwitchDemo`, `KineticMetricDemo`, `VoicesTestimonialsDemo`).
  - `src/features/preview/registry/section-demos.tsx`: Các demo tương tác cho section & template phức tạp (`Halo`, `Pulse`, `Nexus`, `Priceless`, `Monolith`, `Vector Navbar`, `Baseline Footer`, `Metric`, `Atelier`, `Mono Folio`, `Kestrel Docs`).
  - `src/features/preview/registry/preview-registry.tsx`: Lazy-loading qua `next/dynamic`, hỗ trợ chuyển đổi sang static iframe hoặc trạng thái Mock Fallback trung thực khi `previewComponentKey === null`.
- [x] **Xây dựng 2 bản Static Website Template độc lập chạy trong `<iframe sandbox="allow-scripts">`:**
  - `public/demo-previews/orbit/index.html` & `public/demo-previews/northbound/index.html` (hỗ trợ `?theme=dark|light`, media queries responsive và không bật `allow-same-origin`).
- [x] **Xây dựng trang Fullscreen Live Preview (`/preview/[slug]`):** Có Viewport Presets (`Desktop`, `Tablet 768px`, `Mobile 375px`), nút chuyển `Dark`/`Light` (khi sản phẩm hỗ trợ), nút `Refresh` reset trạng thái, link `View Details` và nút CTA.
- [x] **Xây dựng trang Product Detail (`/products/[slug]`) & Wishlist (`useWishlistStore`):**
  - Hiển thị live inline demo cho component đơn giản, thumbnail stage + nút mở Fullscreen Preview cho section/template, thông số kỹ thuật, Wishlist lưu qua `StorageAdapter`, 3 tabs `Overview` / `Documentation` / `Source Code` (trạng thái khóa mã nguồn mô phỏng UI kèm thông báo ranh giới bảo mật Phase 1).
- [x] **Nối link từ card Homepage & Library sang `/products/[slug]` và `/preview/[slug]`, tái sử dụng interactive demos không trùng lặp logic.**
- [x] **Kiểm tra header comments trên tất cả file mới/sửa.**
- [x] **Chạy `npm run typecheck`, `npm run lint`, và `npm run build` sau lần sửa cuối (đạt exit code `0`; `/preview/[slug]` `2.56 kB`, `/products/[slug]` `3.85 kB`).**
- [x] **Kiểm thử trực tiếp trên Chrome (`npm run start` tại `http://localhost:3000`) cho toàn bộ 7 kịch bản Phase 1.3:**
  - **Console & Network:** 0 React hydration warnings, 0 runtime errors, 0 404s trên tất cả các route.
  - **Điều hướng từ Library:** Bấm `Orbit` → `/products/orbit`; bấm icon `Maximize2` trên `Signal Button` → `/preview/signal-button`.
  - **4+ React Registry Demos tương tác thật + Refresh:** Đã verify click/hover trên `/preview/signal-button` (`Idle` → `Signal Verified`, `Interactions: 1`, Refresh về `0`), `/preview/prism-toggle` (`$45` / `$57` / `$95` / `$190` / `$150`, Light/Dark, Refresh về 3 seats), `/preview/kinetic-card` (`7D` `$12,480` / `30D` `$48,920` / `90D` `$142,300`, hover thanh #5 hiện `Period #5: 82% relative peak`), `/preview/voices` (upvote `18` → `19`, chọn card active, Light/Dark), và `/preview/priceless` (Monthly/Annual, `Selected (Team)`).
  - **Static Iframe Isolation (`/preview/orbit` & `/preview/northbound`):** Đã tương tác đổi tab `ARR` (`$296,160`) và bấm `Simulate Ping` bên trong iframe; đổi Viewport Presets `Desktop` (`Inner width: 1190px`) → `Tablet (768px)` (`Inner width: 728px`) → `Mobile (375px)` (`Inner width: 338px`); đổi `Light`/`Dark` và `Refresh` hoạt động chuẩn; lọc `Brand`/`Digital` bên trong `northbound`.
  - **Mock Fallback & Not Found:** `/products/beacon-alpha` & `/preview/beacon-alpha` hiện đúng màn hình `Mock Fallback`; `/products/does-not-exist` hiện giao diện `Product Not Found`.
  - **Product Detail & Wishlist:** `/products/signal-button` chạy demo trực tiếp ngay trên trang; `/products/orbit` lưu Wishlist (`Saved in Wishlist`) bền vững qua reload; tab `Source Code` hiện trạng thái khóa mô phỏng UI + cảnh báo bảo mật Phase 1.
  - **Responsive (`1440x900`, `768x1024`, `375x812`):** Không tràn ngang ở cả 3 kích thước trên `/products/orbit` và `/preview/orbit` (xác nhận trực quan qua `fullPage` screenshots do `evaluate_script` bị chặn). *Ghi chú thẩm mỹ nhỏ:* ở `375x812` trên `/products/orbit`, nhãn `template-fullscreen` xuống 2 dòng cạnh nút `Mở Fullscreen Live Preview` nhưng vẫn nằm gọn trong khung.

---

## Theo dõi các điểm `// TODO` trong Code

- `src/components/layout/navbar.tsx`: `// TODO(Phase 1.3): Point Login, About, and Support links to dedicated routes once created.` (tiếp tục cho Phase 1.4+ khi tạo `/login`, `/about`, `/support`).
- `src/components/layout/footer.tsx`: `// TODO(Phase 1.3): Update Account, Admin, About, and Support links as routes are implemented.`
- `src/features/wishlist/use-wishlist-store.ts`: `// TODO(Phase 2): Synchronize wishlist items with MySQL user wishlist table on the server.`
- `src/lib/format/currency.ts`: `// TODO(Phase 2): Replace or augment with server-validated payment currency rules and minor-unit amounts required by the selected payment gateway.`
- `src/mocks/accounts.seed.ts`: `// TODO(Phase 2): Replace with database-backed User records and real session verification.`
- `src/mocks/coupons.seed.ts`: `// TODO(Phase 2): Validate and calculate coupon discounts strictly on the server inside a database transaction before creating a payment intent.`
- `src/mocks/products.seed.ts`: `// TODO(Phase 2): Replace seed fixtures with MySQL + Prisma queries and private object storage ZIP URLs.`
- `src/services/repositories/interfaces.ts`: `// TODO(Phase 2): Implement Prisma repositories backed by MySQL, server-side role checks, MySQL-compatible auth provider, server-side coupon validation, and signed private download URLs.`
- `src/services/index.ts`: `// TODO(Phase 2): Bind interfaces to server-side MySQL + Prisma implementations.`

---

## Checklist Phase Tiếp theo — Phase 1.4 (Mock Auth + Cart Drawer + One-Page Checkout)

- [ ] Xây dựng **Mock Auth (`/login`)** bám sát ảnh thiết kế gốc số 3: Form Login / Register / Forgot Password, chọn nhanh Demo Accounts (`Customer Demo`, `Admin Demo`), nút Google UI Demo; luồng **Get Free** yêu cầu đăng nhập mock trước khi nhận vào `My Library`.
- [ ] Xây dựng **Cart Store & Slide-over Cart Drawer**: thêm/xóa sản phẩm, tránh trùng lặp, tính subtotal & discount bằng số nguyên VND/USD.
- [ ] Xây dựng **One-Page Checkout (`/checkout`)**: bắt buộc đăng nhập mock, kiểm tra mã giảm giá (`FORMA20`, `WELCOME10`, `EXPIRED50`), chọn trạng thái thanh toán mô phỏng (`Success` / `Failure`), lưu đơn hàng vào `localStorage` và mở khóa sản phẩm trong `My Library`.
- [ ] Cập nhật link `Đăng nhập` trên `Navbar`, chạy `typecheck`, `lint`, `build`, kiểm thử trình duyệt ở `1440px` / `768px` / `375px` và đồng bộ docs.
