# Nhật ký Thay đổi (`docs/CHANGELOG.md`) — `forma/`

Ghi nhận những thay đổi thực tế đã hoàn tất và được kiểm chứng sau mỗi phase.

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
