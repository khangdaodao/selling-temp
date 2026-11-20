# Cấu trúc Thư mục Dự án (`docs/PROJECT_STRUCTURE.md`) — `forma/`

Tài liệu này phản ánh **đúng cây thư mục thực tế** hiện có trong `c:\BusinessWeb\Selling_tem`. Các thư mục tương lai sẽ chỉ được tạo khi bước vào sub-phase cần dùng tới chúng.

## Cây Thư mục Hiện tại (Phase 1.3)

```text
forma/
├── AGENTS.md                                      # Quy tắc kỹ thuật, bảo mật và quy trình làm việc của agent
├── README.md                                      # Hướng dẫn cài đặt, scripts, cảnh báo Demo Mode, mục lục docs
├── eslint.config.mjs                              # Cấu hình ESLint flat config (Next.js + TypeScript strict)
├── next.config.ts                                 # Cấu hình Next.js (bật reactStrictMode)
├── package.json                                   # Danh sách thư viện và npm scripts
├── postcss.config.mjs                             # Pipeline PostCSS cho Tailwind CSS v3
├── tailwind.config.ts                             # Design tokens Dark Minimalism & Cyan Accent
├── tsconfig.json                                  # Cấu hình TypeScript strict + path alias @/*
├── public/
│   └── demo-previews/
│       ├── northbound/
│       │   └── index.html                         # Static HTML editorial template preview (chạy trong iframe sandbox)
│       └── orbit/
│           └── index.html                         # Static HTML SaaS template preview (chạy trong iframe sandbox)
├── docs/
│   ├── ARCHITECTURE.md                            # Kiến trúc phân lớp, Preview Registry, Iframe Sandbox, Phase 2 plan
│   ├── CHANGELOG.md                               # Nhật ký thay đổi theo từng phase
│   ├── DECISIONS.md                               # Các quyết định kiến trúc (ADRs)
│   ├── PRODUCT.md                                 # Yêu cầu sản phẩm, personas, i18n, chính sách giá
│   ├── PROGRESS.md                                # Tiến độ công việc thật & danh sách TODO(Phase 2)
│   └── PROJECT_STRUCTURE.md                       # File này
└── src/
    ├── app/
    │   ├── globals.css                            # CSS custom properties (tokens) & bảng màu shadcn/ui
    │   ├── icon.svg                               # Biểu tượng SVG thương hiệu `forma/` cho tab trình duyệt
    │   ├── layout.tsx                             # Root server layout, Google Fonts, DemoModeBar, Navbar, Footer
    │   ├── page.tsx                               # Server Component entrypoint cho Homepage (`/`)
    │   ├── library/
    │   │   └── page.tsx                           # Server Component entrypoint cho `/library` (kèm Suspense boundary)
    │   ├── preview/
    │   │   └── [slug]/
    │   │       └── page.tsx                       # Server Component entrypoint cho Fullscreen Live Preview (`/preview/[slug]`)
    │   └── products/
    │       └── [slug]/
    │           └── page.tsx                       # Server Component entrypoint cho Product Detail (`/products/[slug]`)
    ├── components/
    │   ├── layout/
    │   │   ├── demo-mode-bar.tsx                  # Thanh thông báo Demo Mode, đổi VI/EN, VND/USD và nút Reset
    │   │   ├── footer.tsx                         # Footer 4 cột tối giản
    │   │   └── navbar.tsx                         # Thanh điều hướng sticky (active underline qua usePathname) + menu mobile
    │   ├── providers/
    │   │   └── app-hydration.tsx                  # Đồng bộ locale, currency và wishlist từ StorageAdapter sau mount
    │   └── ui/
    │       ├── badge.tsx                          # Primitive Badge tùy biến
    │       └── button.tsx                         # Primitive Button tùy biến (trắng, cyan, viền tối)
    ├── features/
    │   ├── catalog/
    │   │   ├── catalog-utils.ts                   # Hàm lọc, tìm kiếm, sắp xếp và đếm danh mục thuần khiết
    │   │   ├── types.ts                           # Kiểu dữ liệu bộ lọc CatalogFilterState, CatalogTab, CatalogSortOption
    │   │   └── components/
    │   │       ├── catalog-product-card.tsx       # Thẻ sản phẩm Library nối sang Product Detail, Preview & Wishlist
    │   │       ├── home-hero-showcase.tsx         # Khối showcase 2 card chồng (Orbit + Northbound) ở Hero Homepage
    │   │       ├── homepage-view.tsx              # Toàn bộ giao diện Homepage
    │   │       ├── library-skeleton.tsx           # Skeleton loading state cho Suspense và lúc tải dữ liệu repository
    │   │       ├── library-view.tsx               # Toàn bộ trang Library (Tabs, Search ⌘K, Sort, Sidebar Filter, Empty State)
    │   │       └── product-card-visual.tsx        # Artwork thu nhỏ & gọi shared interactive demos từ Preview Registry
    │   ├── preview/
    │   │   ├── types.ts                           # PreviewViewport, PreviewTheme, PreviewRegistryEntry contracts
    │   │   ├── components/
    │   │   │   └── fullscreen-preview-view.tsx    # Thanh công cụ viewport presets, Dark/Light demo, Refresh & View Details
    │   │   └── registry/
    │   │       ├── interactive-demos.tsx          # 4 React demo tương tác thật (Signal Button, Prism Switch, Kinetic Card, Voices)
    │   │       ├── preview-registry.tsx           # Registry tập trung lazy-load qua next/dynamic, iframe sandbox & fallback
    │   │       └── section-demos.tsx              # Các demo tương tác cho section & template phức tạp
    │   ├── product-detail/
    │   │   └── components/
    │   │       └── product-detail-view.tsx        # Chi tiết sản phẩm, live stage, specs, Wishlist, 3 tabs & Locked Source UI
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

## Các Thư mục Feature Dự kiến (Sẽ tạo ở Phase 1.4 – 1.6)

- `src/features/auth/` — Form Login/Register/Forgot Password, chọn tài khoản Demo (Phase 1.4)
- `src/features/cart/` — Giỏ hàng & Cart Drawer trượt phải (Phase 1.4)
- `src/features/checkout/` — Thanh toán một trang & kiểm tra coupon mô phỏng (Phase 1.4)
- `src/features/account/` — Trang tài khoản khách hàng & Monaco code viewer lazy-load (Phase 1.5)
- `src/features/admin/` — Admin Sidebar Dashboard, CRUD, đọc metadata ZIP, mock analytics (Phase 1.6)
- `public/demo-assets/` — File ZIP mẫu tĩnh an toàn cho tính năng tải xuống demo (Phase 1.5)
