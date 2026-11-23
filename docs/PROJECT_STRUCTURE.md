# Cấu trúc Thư mục Dự án (`docs/PROJECT_STRUCTURE.md`) — `forma/`

Tài liệu này phản ánh **đúng cây thư mục thực tế** hiện có trong `c:\BusinessWeb\Selling_tem`. Các thư mục tương lai sẽ chỉ được tạo khi bước vào sub-phase cần dùng tới chúng.

## Cây Thư mục Hiện tại (Phase 1.7 — Hoàn chỉnh Phase 1)

```text
forma/
├── AGENTS.md                                      # Quy tắc kỹ thuật, bảo mật và quy trình làm việc của agent
├── README.md                                      # Hướng dẫn cài đặt, scripts, cảnh báo Demo Mode, mục lục docs
├── eslint.config.mjs                              # Cấu hình ESLint flat config (Next.js + TypeScript strict)
├── next.config.ts                                 # Cấu hình Next.js (bật reactStrictMode)
├── package.json                                   # Danh sách thư viện và npm scripts (kèm @monaco-editor/react)
├── postcss.config.mjs                             # Pipeline PostCSS cho Tailwind CSS v3
├── tailwind.config.ts                             # Design tokens Dark Minimalism & Cyan Accent
├── tsconfig.json                                  # Cấu hình TypeScript strict + path alias @/*
├── public/
│   ├── demo-assets/
│   │   └── forma-sample-bundle.zip                # Gói ZIP mẫu an toàn dùng cho tính năng tải demo ở My Library
│   └── demo-previews/
│       ├── northbound/
│       │   └── index.html                         # Static HTML editorial template preview (chạy trong iframe sandbox)
│       └── orbit/
│           └── index.html                         # Static HTML SaaS template preview (chạy trong iframe sandbox)
├── docs/
│   ├── ARCHITECTURE.md                            # Kiến trúc phân lớp, SSR Hydration, Preview Isolation, Phase 2 authority
│   ├── CHANGELOG.md                               # Nhật ký thay đổi theo từng phase
│   ├── DECISIONS.md                               # Các quyết định kiến trúc (ADR-001 đến ADR-007)
│   ├── PRODUCT.md                                 # Yêu cầu sản phẩm, personas, i18n, chính sách giá
│   ├── PROGRESS.md                                # Tiến độ công việc thật & danh sách TODO(Phase 2)
│   └── PROJECT_STRUCTURE.md                       # File này
└── src/
    ├── app/
    │   ├── globals.css                            # CSS custom properties (tokens + RGB cyan alpha + reduced-motion)
    │   ├── icon.svg                               # Biểu tượng SVG thương hiệu `forma/` cho tab trình duyệt
    │   ├── layout.tsx                             # Root server layout, Skip link, AppHydration, CartDrawer, Navbar, Footer
    │   ├── not-found.tsx                          # Trang 404 Not Found tối giản có nút quay lại Library/Home
    │   ├── error.tsx                              # Client Error Boundary kèm retry & khôi phục Reset Demo Data
    │   ├── page.tsx                               # Server Component entrypoint cho Homepage (`/`)
    │   ├── about/
    │   │   └── page.tsx                           # Server Component entrypoint cho trang Giới thiệu (`/about`)
    │   ├── account/
    │   │   └── page.tsx                           # Server Component entrypoint cho Customer Account (`/account`)
    │   ├── admin/
    │   │   └── page.tsx                           # Server Component entrypoint cho Admin Dashboard (`/admin`)
    │   ├── checkout/
    │   │   └── page.tsx                           # Server Component entrypoint cho `/checkout` (kèm Suspense boundary)
    │   ├── library/
    │   │   └── page.tsx                           # Server Component entrypoint cho `/library` (kèm Suspense boundary)
    │   ├── login/
    │   │   └── page.tsx                           # Server Component entrypoint cho `/login` (kèm Suspense boundary)
    │   ├── preview/
    │   │   └── [slug]/
    │   │       └── page.tsx                       # Server Component entrypoint cho Fullscreen Live Preview (`/preview/[slug]`)
    │   ├── products/
    │   │   └── [slug]/
    │   │       └── page.tsx                       # Server Component entrypoint cho Product Detail (`/products/[slug]`)
    │   └── support/
    │       └── page.tsx                           # Server Component entrypoint cho Hỗ trợ & FAQ (`/support`)
    ├── components/
    │   ├── layout/
    │   │   ├── footer.tsx                         # Footer tối giản gồm hàng đăng ký Newsletter, lưới 12 cột (brand + 3 cột route thật) & thanh bản quyền/ranh giới Demo
    │   │   ├── header-switchers.tsx               # 2 nút icon tròn Tiền tệ (Coins) & Ngôn ngữ (Globe) kèm popover menu Dark-Cyan
    │   │   ├── navbar.tsx                         # Thanh điều hướng sticky, Icon Switchers, Cart trigger, `/account`, `/admin`, `/about`, `/support`
    │   │   └── secondary-views.tsx                # Giao diện song ngữ cho `/about`, `/support` và `not-found`
    │   ├── providers/
    │   │   └── app-hydration.tsx                  # Đồng bộ locale, currency, wishlist, cart và auth session sau mount
    │   └── ui/
    │       ├── badge.tsx                          # Primitive Badge tùy biến
    │       └── button.tsx                         # Primitive Button tùy biến (trắng, cyan, viền tối)
    ├── features/
    │   ├── account/
    │   │   └── components/
    │   │       ├── account-view.tsx               # Minimal Customer Account (My Library, Orders, Wishlist, Settings)
    │   │       └── monaco-code-viewer.tsx         # Lazy-loaded Read-only Monaco Viewer (Tree, Search, Copy, Fullscreen)
    │   ├── admin/
    │   │   └── components/
    │   │       └── admin-view.tsx                 # Sidebar Admin 7 mục (CRUD, Draft/Published, Metadata ZIP, Coupons, Analytics Mock)
    │   ├── auth/
    │   │   ├── use-auth-store.ts                  # Zustand store quản lý mock session, profile, orders & ownedProductIds
    │   │   └── components/
    │   │       └── login-view.tsx                 # Màn hình Login/Register/Forgot Password, Google UI Demo, Preset Accounts
    │   ├── cart/
    │   │   ├── use-cart-store.ts                  # Zustand store giỏ hàng chống trùng lặp & lưu qua StorageAdapter
    │   │   └── components/
    │   │       └── cart-drawer.tsx                # Ngăn kéo giỏ hàng trượt phải
    │   ├── catalog/
    │   │   ├── catalog-utils.ts                   # Hàm lọc, tìm kiếm, sắp xếp và đếm danh mục thuần khiết
    │   │   ├── types.ts                           # Kiểu dữ liệu bộ lọc CatalogFilterState, CatalogTab, CatalogSortOption
    │   │   └── components/
    │   │       ├── catalog-product-card.tsx       # Thẻ sản phẩm Library nối Product Detail, Preview, Wishlist & Cart
    │   │       ├── home-hero-showcase.tsx         # Khối showcase 2 card chồng (Orbit + Northbound) ở Hero Homepage
    │   │       ├── home-metrics-strip.tsx         # Dải Metrics 3 cột nền trắng với Counter & Toggle theo mẫu chủ dự án
    │   │       ├── home-tech-stack-strip.tsx      # Dải Tech Stack 1 hàng chạy ngang nền trắng giữa Our Products & Footer
    │   │       ├── homepage-view.tsx              # Toàn bộ giao diện Homepage
    │   │       ├── library-skeleton.tsx           # Skeleton loading state cho Suspense và lúc tải dữ liệu repository
    │   │       ├── library-view.tsx               # Toàn bộ trang Library (Tabs, Search ⌘K, Sort, Sidebar Filter, Empty State)
    │   │       └── product-card-visual.tsx        # Artwork thu nhỏ & gọi shared interactive demos từ Preview Registry
    │   ├── checkout/
    │   │   └── components/
    │   │       └── checkout-view.tsx              # One-Page Checkout, Mock Auth gate, Coupon check, Simulated Payment & Orders
    │   ├── preview/
    │   │   ├── types.ts                           # PreviewViewport, PreviewTheme, PreviewRegistryEntry contracts
    │   │   ├── components/
    │   │   │   └── fullscreen-preview-view.tsx    # Thanh công cụ viewport presets, Dark/Light demo, Refresh, Details & Cart CTA
    │   │   └── registry/
    │   │       ├── interactive-demos.tsx          # 4 React demo tương tác thật (Signal Button, Prism Switch, Kinetic Card, Voices)
    │   │       ├── preview-registry.tsx           # Registry tập trung lazy-load qua next/dynamic, iframe sandbox & fallback
    │   │       └── section-demos.tsx              # Các demo tương tác cho section & template phức tạp
    │   ├── product-detail/
    │   │   └── components/
    │   │       └── product-detail-view.tsx        # Chi tiết sản phẩm, Add to Cart/Get Free, Owned check & Monaco Viewer
    │   └── wishlist/
    │       └── use-wishlist-store.ts              # Zustand store quản lý danh sách yêu thích qua StorageAdapter
    ├── i18n/
    │   ├── dictionaries/
    │   │   ├── en.ts                              # Từ điển giao diện tiếng Anh
    │   │   └── vi.ts                              # Từ điển giao diện tiếng Việt
    │   ├── types.ts                               # Interface đảm bảo hai bộ từ điển vi/en luôn khớp khóa
    │   └── use-i18n-store.ts                      # Zustand store quản lý ngôn ngữ, tiền tệ & detect browser
    ├── lib/
    │   ├── format/
    │   │   └── currency.ts                        # Định dạng giá số nguyên VND/USD và tính giảm giá số nguyên
    │   ├── storage/
    │   │   ├── storage-adapter.ts                 # Wrapper localStorage có version, SSR-safe, fallback & reset
    │   │   └── storage-keys.ts                    # Danh sách tập trung các key `forma:v1:*`
    │   └── utils.ts                               # Hàm `cn()` gộp class Tailwind
    ├── mocks/
    │   ├── accounts.seed.ts                       # 2 tài khoản demo chọn sẵn (Customer & Admin)
    │   ├── coupons.seed.ts                        # 3 mã giảm giá mẫu (FORMA20, WELCOME10, EXPIRED50)
    │   └── products.seed.ts                       # 18 sản phẩm mẫu (11 UI Components + 7 Website Templates)
    ├── services/
    │   ├── index.ts                               # Export các repository instances dùng chung cho toàn app
    │   └── repositories/
    │       ├── interfaces.ts                      # Hợp đồng IProductRepository, IAuthRepository, IOrderRepository, ICouponRepository
    │       ├── mock-auth.repository.ts
    │       ├── mock-coupon.repository.ts
    │       ├── mock-order.repository.ts
    │       └── mock-product.repository.ts
    └── types/
        └── domain.ts                              # Domain models dùng chung (Product, Order, Coupon, DemoUser...)
```

---

## Trạng thái Feature Modules Phase 1

Toàn bộ các feature và route cho cửa hàng cá nhân (`catalog`, `preview`, `product-detail`, `wishlist`, `cart`, `checkout`, `auth`, `account`, `admin`, kèm `/about`, `/support`, `not-found.tsx` và `error.tsx`) đã được triển khai, rà soát QA và bàn giao hoàn chỉnh qua Phase 1.7 để chuẩn bị cho Phase 2 Backend.
