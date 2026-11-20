# Nhật ký Tiến độ Dự án (`docs/PROGRESS.md`) — `forma/`

**Cập nhật lần cuối:** 2026-11-20  
**Cột mốc hiện tại:** Phase 1.2 — Homepage + Library (**Hoàn thành** — chờ chủ dự án duyệt để sang Phase 1.3)

---

## Tổng quan Trạng thái các Phase

| Phase | Nội dung chính | Trạng thái |
| :--- | :--- | :--- |
| **Phase 1.1** | Khởi tạo nền tảng, Design Tokens, 8 file tài liệu, StorageAdapter, i18n, Typed Repositories, 18 sản phẩm mẫu, App Shell | **Done (Đã xong)** |
| **Phase 1.2** | Homepage (`/`), Library (`/library`), lọc/tìm kiếm/sắp xếp, tab Components/Templates, card tương tác mẫu & responsive | **Done (Đã xong)** |
| **Phase 1.3** | Smart Hybrid Preview Registry + Fullscreen Live Preview, Product Detail (`/products/[slug]`), Mock Auth (`/login`), Wishlist | **Next (Tiếp theo)** |
| **Phase 1.4** | Cart Drawer trượt phải, One-Page Checkout (`/checkout`), Mock Coupons & Simulated Payment | **To Do** |
| **Phase 1.5** | Customer Dashboard (`/account`), Lazy Read-Only Monaco Viewer, Tải ZIP mẫu | **To Do** |
| **Phase 1.6** | Admin Dashboard (`/admin`), Các trang phụ (`About`, `Support/FAQ`, `404`), Kiểm thử tổng thể | **To Do** |
| **Phase 2** | Backend API, MySQL + Prisma, Auth Provider tương thích MySQL, Private Storage, Payment Gateway | **Blocked (Chờ hoàn tất Phase 1)** |

---

## Checklist Nghiệm thu Phase 1.2 (2026-11-20)

- [x] **Dựng Homepage (`/`) bám sát ảnh thiết kế gốc số 1:**
  - Hero 2 cột (trái tiêu đề + 2 CTA trỏ sang `/library` và `/library?tab=template` + 2 cam kết; phải showcase 2 card chồng `orbit` + `northbound` kèm badge nổi `Tương tác trực tiếp` không che chữ).
  - Thanh đối tượng khách hàng (`Independent designers`, `Freelancers`, `Startups`, `Creative agencies`).
  - Mục `"Sản phẩm của chúng tôi"` hiển thị lưới 3x2 gồm 6 sản phẩm nổi bật từ `productRepository` (`Orbit`, `Northbound`, `Metric`, `Halo`, `Pulse`, `Nexus`).
- [x] **Dựng Library (`/library`) bám sát ảnh thiết kế gốc số 2:**
  - Thanh công cụ trên gồm Tabs `Tất cả (18)` / `Components (11)` / `Templates (7)`, ô tìm kiếm hỗ trợ phím tắt `⌘K`/`Ctrl+K` + nút xóa từ khóa, dropdown sắp xếp (`Mới nhất`, `Giá thấp → cao`, `Giá cao → thấp`, `Tên A → Z`).
  - Sidebar trái có lọc Danh mục (kèm bộ đếm động theo tab), Mức giá (`Tất cả` / `Miễn phí` / `Trả phí`), Framework (`Next.js` / `React` / `Tailwind CSS`), hộp promo chuyển nhanh sang mẫu miễn phí, và nút mở/đóng bộ lọc gọn trên mobile.
  - Có Loading skeleton (`LibrarySkeleton`) và Empty State kèm nút `"Xóa toàn bộ bộ lọc"`.
- [x] **Tương tác trực tiếp trên card đơn giản & placeholder hợp lệ:**
  - `Signal Button`, `Prism Switch`, `Kinetic Metric Card`, `Voices` tương tác trực tiếp ngay trên card.
  - `Beacon AI Console` hiển thị nhãn `Mock Fallback · No Live Registry`.
  - Nút mở rộng ở góc card bật thông báo inline trung thực rằng Chi tiết & Fullscreen Preview mở ở phase tiếp theo (không tạo route ngoài Phase 1.2).
- [x] **Cập nhật Header (`Navbar`) & `Footer`:** Đổi đường dẫn sang `/library`, đánh dấu active underline bằng `usePathname()`, bổ sung nút chuyển nhanh `VI/EN` & `VND/USD` trong menu mobile.
- [x] **Chạy `npm run typecheck`, `npm run lint`, và `npm run build` sau lần sửa cuối (đạt exit code `0`, `/` `42.5 kB`, `/library` `5.26 kB`, 6/6 static pages).**
- [x] **Kiểm thử trên Chrome (`npm run start` tại `http://localhost:3000`) trên 3 viewport (`1440x900`, `768x1024`, `375x812`):**
  - 0 lỗi console, 0 lỗi hydration, 0 lỗi 404, 0 cảnh báo DevTools về form attribute.
  - Không tràn ngang ở cả 3 kích thước (xác nhận qua full-page inspection vì môi trường chặn `evaluate_script`).
  - Đã verify toàn bộ luồng: chuyển tab, lọc danh mục/framework/giá, tìm kiếm khớp và tìm kiếm rỗng (Empty State -> Reset), sắp xếp giá/tên, chuyển `VI`/`EN` và `VND`/`USD`, tương tác các card micro-demo.

### Điểm tinh chỉnh nhỏ đã ghi nhận (không chặn nghiệm thu)
- Trên `1440px`/`768px`, dòng phụ ngắn trong badge nổi `Live interactive` (`Test micro-demos befor...`) bị cắt dấu `...` nhẹ; trong pill `Mock Fallback · No Live Registry` ở grid 3 cột `1440px`, chữ `Registry` tự xuống dòng gọn trong pill.

---

## Theo dõi các điểm `// TODO` trong Code

- `src/components/layout/navbar.tsx`: `// TODO(Phase 1.3): Point Login, About, and Support links to dedicated routes once created.`
- `src/components/layout/footer.tsx`: `// TODO(Phase 1.3): Update Account, Admin, About, and Support links as routes are implemented.`
- `src/lib/format/currency.ts`: `// TODO(Phase 2): Replace or augment with server-validated payment currency rules and minor-unit amounts required by the selected payment gateway.`
- `src/mocks/accounts.seed.ts`: `// TODO(Phase 2): Replace with database-backed User records and real session verification.`
- `src/mocks/coupons.seed.ts`: `// TODO(Phase 2): Validate and calculate coupon discounts strictly on the server inside a database transaction before creating a payment intent.`
- `src/mocks/products.seed.ts`: `// TODO(Phase 2): Replace seed fixtures with MySQL + Prisma queries and private object storage ZIP URLs.`
- `src/services/repositories/interfaces.ts`: `// TODO(Phase 2): Implement Prisma repositories backed by MySQL, server-side role checks, MySQL-compatible auth provider, server-side coupon validation, and signed private download URLs.`
- `src/services/index.ts`: `// TODO(Phase 2): Bind interfaces to server-side MySQL + Prisma implementations.`

---

## Checklist Phase Tiếp theo — Phase 1.3 (Smart Hybrid Preview, Product Detail, Mock Auth & Wishlist)

- [ ] Xây dựng **Smart Hybrid Preview Registry (`src/features/preview/`)** + **Fullscreen Live Preview** (`/preview/[slug]` hoặc modal toàn màn hình) có bộ chuyển `Desktop / Tablet / Mobile`, `Dark / Light` demo toggle, `Refresh`, `View Details`, CTA mua hàng.
- [ ] Xây dựng **Product Detail (`/products/[slug]`)**: tên, giá VND/USD, framework, tags, mô tả, thư viện hình ảnh/preview, nút Wishlist, tabs `Overview` / `Documentation` / `Source Code` (hiển thị trạng thái khóa nguồn mô phỏng UI khi chưa sở hữu, ghi rõ không phải bảo mật thật).
- [ ] Xây dựng **Mock Auth (`/login`)** bám sát ảnh thiết kế gốc số 3: Form Login / Register / Forgot Password, nút chọn nhanh Demo Accounts (`Customer Demo`, `Admin Demo`), nút Google UI Demo; luồng **Get Free** (bắt buộc mock sign-in để nhận sản phẩm miễn phí vào My Library).
- [ ] Xây dựng **Wishlist** (`src/features/wishlist/`) đồng bộ với `StorageAdapter` và gắn nút tim trên Library card & Product Detail.
- [ ] Cập nhật link trên `Navbar` & `Footer`, kiểm thử `typecheck`, `lint`, `build`, `1440px` / `768px` / `375px` và đồng bộ toàn bộ `docs/*.md`.
