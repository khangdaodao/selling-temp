# Nhật ký Thay đổi (`docs/CHANGELOG.md`) — `forma/`

Ghi nhận những thay đổi thực tế đã hoàn tất và được kiểm chứng sau mỗi phase.

---

## [0.5.0] — 2026-11-21 — Phase 1.5: Mock Auth + Customer Account + Code Viewer

### Đã thêm mới & Cập nhật (Added / Changed)
- **Minimal Customer Account (`/account` — `src/features/account/`):**
  - Tạo `src/app/account/page.tsx` và `AccountView` với Auth Gate khi chưa đăng nhập, hồ sơ Mock Profile (không lưu mật khẩu), thống kê nhanh và 4 tab ngang (`My Library`, `Orders`, `Wishlist`, `Settings`).
  - Hỗ trợ chỉnh sửa tên/email Mock Profile qua `IAuthRepository.updateDemoProfile`, đăng xuất (`Sign out`) và nút `Reset All Demo Data`.
- **Lazy-Loaded Read-Only Monaco Source Viewer (`monaco-code-viewer.tsx`):**
  - Cài đặt `@monaco-editor/react` (`^4.7.0`) và nạp lười bằng `next/dynamic(..., { ssr: false })`.
  - Hỗ trợ cây thư mục file, thanh tìm kiếm trong code kèm nhảy tới dòng khớp, syntax highlighting, nút `Copy code`, `Fullscreen` và khóa chỉ đọc (`readOnly: true`, `domReadOnly: true`).
  - Tích hợp trực tiếp vào `My Library` trên `/account` và tab `Source Code` của sản phẩm đã sở hữu trên `/products/[slug]`.
- **Tài nguyên tải mẫu & Điều hướng:**
  - Tạo gói ZIP mẫu an toàn `public/demo-assets/forma-sample-bundle.zip` phục vụ nút tải ZIP mới nhất.
  - Cập nhật `Navbar` và `Footer` trỏ link sang `/account`.

---

## [0.4.0] — 2026-11-21 — Phase 1.4: Cart + Checkout + Coupons + Mock Auth

### Đã thêm mới & Cập nhật (Added / Changed)
- **Mock Auth (`/login` & `useAuthStore`):**
  - Tạo `src/app/login/page.tsx`, `LoginView` và `useAuthStore` bám sát ảnh thiết kế gốc số 3 (chế độ Login / Register / Forgot Password mô phỏng, Google UI Demo, 2 tài khoản Demo chọn sẵn, điều hướng an toàn quay lại `?next=`).
- **Cart Store & Slide-over Cart Drawer (`src/features/cart/`):**
  - Tạo `useCartStore` lưu bền vững qua `StorageAdapter` (`forma:v1:cart`), chống thêm trùng sản phẩm đã có trong giỏ hoặc đã sở hữu, và `CartDrawer` trượt từ cạnh phải.
- **One-Page Checkout (`/checkout` — `src/features/checkout/`):**
  - Tạo `src/app/checkout/page.tsx` và `CheckoutView` yêu cầu đăng nhập Mock Auth trước khi thanh toán (hỗ trợ quay lại `/checkout` sau khi login).
  - Tích hợp kiểm tra mã giảm giá (`FORMA20`, `WELCOME10`, `EXPIRED50`, báo lỗi mã không tồn tại), tính toán tổng tiền số nguyên VND/USD, mô phỏng trạng thái thanh toán `Success` / `Failure`, và lưu lịch sử đơn hàng + quyền sở hữu vào `localStorage`.
- **Nối mạch Quyền sở hữu & App Shell:**
  - Cập nhật `AppHydration`, `Navbar` (nút mở Cart Drawer kèm bộ đếm và hiển thị tài khoản Demo đang đăng nhập), `CatalogProductCard`, `ProductDetailView` và `FullscreenPreviewView` để hỗ trợ `Get Free`, chặn mua trùng sản phẩm đã sở hữu và mở khóa tab `Source Code` mô phỏng UI.

---

## [0.3.0] — 2026-11-21 — Phase 1.3: Product Detail + Smart Hybrid Preview

### Đã thêm mới & Cập nhật (Added / Changed)
- **Controlled React Preview Registry (`src/features/preview/`):**
  - Tạo `interactive-demos.tsx` với 4 demo component tương tác thật (`SignalButtonDemo`, `PrismSwitchDemo`, `KineticMetricDemo`, `VoicesTestimonialsDemo`).
  - Tạo `section-demos.tsx` cho các component/template phức tạp (`Halo`, `Pulse`, `Nexus`, `Priceless`, `Monolith`, `Vector Navbar`, `Baseline Footer`, `Metric`, `Atelier`, `Mono Folio`, `Kestrel Docs`).
  - Tạo `preview-registry.tsx` sử dụng `next/dynamic` để lazy-load theo từng demo, tự chuyển sang sandboxed iframe hoặc màn hình **Mock Fallback** khi `previewComponentKey === null`.
- **Static Template Previews độc lập (`public/demo-previews/`):**
  - Tạo `orbit/index.html` và `northbound/index.html` hỗ trợ query `?theme=dark|light`, chuyển tab/filter tương tác nội bộ và responsive CSS breakpoints thực tế bên trong `<iframe sandbox="allow-scripts" loading="lazy">`.
- **Fullscreen Live Preview (`/preview/[slug]`):**
  - Tạo `src/app/preview/[slug]/page.tsx` và `FullscreenPreviewView` với Viewport Presets (`Desktop`, `Tablet 768px`, `Mobile 375px`), nút chuyển `Dark`/`Light`, nút `Refresh` làm mới trạng thái demo/iframe, nút `View Details` và CTA.
- **Product Detail (`/products/[slug]`) & Wishlist (`src/features/wishlist/`):**
  - Tạo `src/app/products/[slug]/page.tsx`, `ProductDetailView` và `useWishlistStore` lưu qua `StorageAdapter`.
  - Hỗ trợ live interactive stage ngay trên trang chi tiết cho component đơn giản, 3 tabs `Overview` / `Documentation` / `Source Code`, cùng trạng thái khóa mã nguồn mô phỏng UI và cảnh báo bảo mật Phase 1.
- **Kết nối Catalog:** Cập nhật `CatalogProductCard`, `HomepageView` và `ProductCardVisual` nối thẳng sang `/products/[slug]`, `/preview/[slug]` và tái sử dụng shared interactive demos.

---

## [0.2.0] — 2026-11-20 — Phase 1.2: Homepage + Library

### Đã thêm mới & Cập nhật (Added / Changed)
- **Homepage (`/`):**
  - Chuyển `src/app/page.tsx` thành Server Component truyền danh sách 6 sản phẩm nổi bật cho `HomepageView` (`src/features/catalog/components/homepage-view.tsx`).
  - Xây dựng Hero 2 cột kèm `HomeHeroShowcase` (2 card chồng `Orbit` + `Northbound` và badge `Tương tác trực tiếp`), thanh 4 nhóm khách hàng mục tiêu và lưới 3x2 `"Sản phẩm của chúng tôi"`.
- **Library (`/library`):**
  - Tạo route `src/app/library/page.tsx` bọc `LibraryView` trong React `<Suspense fallback={<LibrarySkeleton />}>`.
  - Hỗ trợ đầy đủ Tabs (`Tất cả`, `Components`, `Templates`), tìm kiếm phím tắt `⌘K`/`Ctrl+K`, sắp xếp (`Mới nhất`, `Giá thấp → cao`, `Giá cao → thấp`, `Tên A → Z`), bộ lọc sidebar (Danh mục, Miễn phí/Trả phí, Framework), Loading Skeleton và Empty State kèm nút reset bộ lọc.
- **Card Visuals & Interactive Placeholders:**
  - Tạo `ProductCardVisual` và `CatalogProductCard` tái hiện đúng artwork cho các sản phẩm flagship (`Orbit`, `Northbound`, `Metric`, `Halo`, `Pulse`, `Nexus`, `Priceless`, `Voices`, `Monolith`).
  - Cài đặt placeholder tương tác trực tiếp ngay trên card cho các component đơn giản (`Signal Button`, `Prism Switch`, `Kinetic Metric Card`, `Voices`) và hiển thị trạng thái `Mock Fallback · No Live Registry` cho `Beacon AI Console`.
- **App Shell & i18n:** Cập nhật `Navbar` (dùng `usePathname()`, thêm quick switcher trên menu mobile), `Footer` trỏ sang `/library`, và mở rộng từ điển song ngữ `vi`/`en` cho toàn bộ Homepage và Library.

---

## [0.1.0] — 2026-11-20 — Phase 1.1: Foundation + Documentation

### Đã thêm mới (Added)
- **Cấu hình & Công cụ Dự án:** Khởi tạo Next.js 15 App Router, React 19, TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`), Tailwind CSS v3, ESLint flat config, `motion`, `zustand`, `lucide-react` và Radix primitives.
- **Hệ thống Giao diện (Design System) & App Shell:**
  - Định nghĩa biến màu Dark Minimalism + Cyan Accent (`#00D8FF`) trong `src/app/globals.css` và `tailwind.config.ts` bám sát 3 màn hình gốc (Homepage, Library, Login).
  - Tạo primitives `Button` và `Badge` tùy biến (`src/components/ui/`).
  - Xây dựng `DemoModeBar`, `Navbar` (kèm mobile drawer), `Footer`, `AppHydration`, Root Layout (`src/app/layout.tsx`) và favicon SVG (`src/app/icon.svg`).
- **Hạ tầng Storage, Tiền tệ & Đa ngôn ngữ (`i18n`):**
  - Tạo `StorageAdapter` tập trung (`forma:v1:*`) an toàn cho SSR, tự fallback khi JSON hỏng và hỗ trợ nút `resetAllDemoData()`.
  - Tạo bộ định dạng tiền tệ và tính giảm giá hoàn toàn bằng số nguyên cho VND và USD (`src/lib/format/currency.ts`).
  - Tạo bộ từ điển song ngữ `vi` / `en` và Zustand store tự nhận diện ngôn ngữ trình duyệt sau mount (`src/i18n/`).
- **Domain Contracts, Dữ liệu Mẫu & Repositories:**
  - Định nghĩa shared domain models (`src/types/domain.ts`) và các hợp đồng repository (`IProductRepository`, `IAuthRepository`, `IOrderRepository`, `ICouponRepository`).
  - Seed **18 sản phẩm** (11 UI Components + 7 Website Templates, gồm 7 Free và 11 Paid), **2 tài khoản demo chọn sẵn**, và **3 mã giảm giá thử nghiệm** trong `src/mocks/`.
  - Cài đặt các mock repository lưu trữ qua `localStorage` tại `src/services/repositories/`.
- **Trang kiểm chứng Nền tảng:** Tạo `src/app/page.tsx` kết nối trực tiếp `MockProductRepository`, hiển thị thống kê catalog, 6 thẻ mẫu, bộ chuyển đổi ngôn ngữ/tiền tệ và cảnh báo ranh giới Phase 1.
- **Hệ thống 8 Tài liệu Markdown:** Tạo và đồng bộ đầy đủ `README.md`, `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_STRUCTURE.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md` và `docs/CHANGELOG.md` bằng tiếng Việt rõ ràng.
