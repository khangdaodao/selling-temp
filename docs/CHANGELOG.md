# Nhật ký Thay đổi (`docs/CHANGELOG.md`) — `forma/`

Ghi nhận những thay đổi thực tế đã hoàn tất và được kiểm chứng sau mỗi phase.

---

## [0.8.3] — 2026-11-28 — Phase 2.3: Supabase Private Storage `.zip` + Catalog & Coupon Prisma APIs

### Đã thêm mới & Nâng cấp (Added & Changed)
- **Supabase Private Bucket `product-bundles` ([private-bucket.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/storage/private-bucket.ts), [seed.ts](file:///c:/BusinessWeb/Selling_tem/prisma/seed.ts)):**
  - Khởi tạo bucket kín (`public: false`, giới hạn `50 MB`, chỉ nhận `.zip`), nạp sẵn `samples/forma-sample-bundle.zip` làm `zipObjectKey` mặc định cho 18 sản phẩm gốc mà không ghi đè file upload thật khi re-seed.
- **Catalog, Coupons & Authorized Asset APIs ([product-mapper.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/catalog/product-mapper.ts), `/api/products/*`, `/api/coupons*`, `/api/admin/storage/upload-url`):**
  - Chuyển toàn bộ SSR ([page.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/page.tsx), [products/[slug]/page.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/products/[slug]/page.tsx), [preview/[slug]/page.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/preview/[slug]/page.tsx)) và repositories ([api-product.repository.ts](file:///c:/BusinessWeb/Selling_tem/src/services/repositories/api-product.repository.ts), [api-coupon.repository.ts](file:///c:/BusinessWeb/Selling_tem/src/services/repositories/api-coupon.repository.ts)) sang đọc/ghi trực tiếp trên PostgreSQL.
  - Ẩn `ProductCodeFile.content` khỏi mọi response/HTML công khai; chỉ cấp mã nguồn qua `/api/products/[id]/code` và **Signed Download URL (60s)** qua `/api/products/[id]/download` khi server xác nhận `role === 'admin'` hoặc PostgreSQL `UserEntitlement`.
  - Hỗ trợ Admin upload file `.zip` thật từ [admin-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/admin/components/admin-view.tsx) thẳng lên `product-bundles` (`products/<slug>/latest.zip`) thông qua Signed Upload token, đồng thời gỡ bỏ `mock-product.repository.ts` & `mock-coupon.repository.ts`.

---

## [0.8.2] — 2026-11-25 — Phase 2.2: Supabase Auth (`@supabase/ssr`), Đồng bộ PostgreSQL & Server RBAC

### Đã thêm mới & Nâng cấp (Added & Changed)
- **Middleware & Server RBAC Auth Layer ([middleware.ts](file:///c:/BusinessWeb/Selling_tem/src/middleware.ts), [server-auth.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/auth/server-auth.ts), [auth-utils.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/auth/auth-utils.ts)):**
  - Thiết lập Next.js Edge Middleware làm mới cookie `HttpOnly` qua `@supabase/ssr` và chuyển hướng khách chưa đăng nhập ở `/admin` về `/login?next=/admin`.
  - Tạo `getServerAuthSession()`, `requireAuthenticatedUser()` và `requireAdminUser()` xác thực phiên qua `supabase.auth.getUser()` và đối chiếu trực tiếp vai trò `role` từ bảng `public.users` trên PostgreSQL (tuyệt đối không dùng `user_metadata` để phân quyền).
- **Route Handlers Auth & Admin ([callback/route.ts](file:///c:/BusinessWeb/Selling_tem/src/app/auth/callback/route.ts), [session/route.ts](file:///c:/BusinessWeb/Selling_tem/src/app/api/auth/session/route.ts), [customers/route.ts](file:///c:/BusinessWeb/Selling_tem/src/app/api/admin/customers/route.ts)):**
  - Triển khai `/auth/callback` (PKCE code exchange + OTP verification) tự đồng bộ user mới vào `public.users` với `role = customer`.
  - Triển khai `/api/auth/session` (`GET` session thật & `PATCH` cập nhật tên hiển thị lên Postgres) và `/api/admin/customers` (`401`/`403` RBAC).
- **Loại bỏ Demo Auth & Cập nhật UI ([supabase-auth.repository.ts](file:///c:/BusinessWeb/Selling_tem/src/services/repositories/supabase-auth.repository.ts), [login-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/auth/components/login-view.tsx), [admin/page.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/admin/page.tsx)):**
  - Xóa bỏ toàn bộ `Preset Demo Accounts` (`mock-auth.repository.ts`, `accounts.seed.ts`) và các nút đăng nhập demo 1 chạm khỏi `/login`, `/account`, `/checkout`, `/admin`.
  - Khóa `/admin` ngay trong Server Component [admin/page.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/admin/page.tsx) (redirect `/login?next=/admin` với khách, trả [admin-forbidden-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/admin/components/admin-forbidden-view.tsx) `403` với tài khoản `customer`).

---

## [0.8.1] — 2026-11-25 — Phase 2.1: Thiết lập Supabase PostgreSQL, Prisma ORM, RLS & Seed dữ liệu thật

### Đã thêm mới & Thiết lập (Added)
- **Cài đặt dependencies nền tảng Backend ([package.json](file:///c:/BusinessWeb/Selling_tem/package.json)):**
  - `@prisma/client` (`^6.19.3`), `prisma` (`^6.19.3`), `@supabase/supabase-js` (`^2.119.2`), `@supabase/ssr` (`^0.12.7`), `zod` (`^4.6.7`), `tsx` (`^4.23.15`) cùng bộ script `db:generate`, `db:push`, `db:seed`, `db:studio`.
- **Biến môi trường & Database Clients:**
  - Tạo [.env.example](file:///c:/BusinessWeb/Selling_tem/.env.example) và [env.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/env.ts) kiểm tra biến môi trường bằng Zod, chặn tuyệt đối `getServerEnv()` chạy ở trình duyệt.
  - Tạo [prisma.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/prisma.ts) singleton và bộ 3 Supabase clients ([client.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/supabase/client.ts), [server.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/supabase/server.ts), [admin.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/supabase/admin.ts)).
- **Schema PostgreSQL, Bảo mật RLS & Seed dữ liệu ([schema.prisma](file:///c:/BusinessWeb/Selling_tem/prisma/schema.prisma), [rls.sql](file:///c:/BusinessWeb/Selling_tem/prisma/rls.sql), [seed.ts](file:///c:/BusinessWeb/Selling_tem/prisma/seed.ts)):**
  - Thiết kế 7 bảng `snake_case` (`users`, `products`, `product_code_files`, `coupons`, `orders`, `order_items`, `user_entitlements`) trên Supabase PostgreSQL (`selling-temp`), giữ nguyên giá số nguyên `Int`, `zip_object_key` tương đối và index toàn bộ khóa ngoại.
  - Đẩy schema qua `prisma db push`, bật RLS & thu hồi quyền PostgREST Data API từ `anon`/`authenticated` (kèm thu hồi quyền thực thi RPC `rls_auto_enable`), và seed thành công **18 sản phẩm, 54 file code mẫu & 3 coupons**.

---

## [0.8.0-docs] — 2026-11-25 — Phase 2.0: Chốt kiến trúc Supabase Hybrid & Song cổng thanh toán PayOS + Stripe

### Đã cập nhật (Documentation & Architecture Plan)
- **Chốt `ADR-008` trong [DECISIONS.md](file:///c:/BusinessWeb/Selling_tem/docs/DECISIONS.md):** Chọn hướng **Supabase Hybrid** (`Supabase PostgreSQL` + `Prisma ORM` + `Supabase Auth` `@supabase/ssr` + `Supabase Private Storage` theo `zipObjectKey` tương đối) kết hợp **Next.js Server Routes** để sẵn sàng chuyển sang hạ tầng tự chủ về sau mà không bị khóa chặt.
- **Đồng bộ quy chuẩn & lộ trình Phase 2 ([AGENTS.md](file:///c:/BusinessWeb/Selling_tem/AGENTS.md), [ARCHITECTURE.md](file:///c:/BusinessWeb/Selling_tem/docs/ARCHITECTURE.md), [PROGRESS.md](file:///c:/BusinessWeb/Selling_tem/docs/PROGRESS.md)):**
  - Chốt Phase 2.1 → 2.5 theo đúng nguyên tắc mỗi lượt một sub-phase, bật RLS trên schema `public`, không dùng `user_metadata` cho phân quyền Admin và kết hợp cả hai cổng thanh toán **PayOS (VND)** + **Stripe (USD)** ở Phase 2.4.
  - Cập nhật trạng thái hoàn tất Phase 1 đến mốc `0.7.12` trong [PROGRESS.md](file:///c:/BusinessWeb/Selling_tem/docs/PROGRESS.md).

---

## [0.7.12] — 2026-11-25 — UI Polish: Chuyển nút Đăng xuất sang bên phải nút `Explore Library`

### Đã tinh chỉnh (Changed)
- **Điều chỉnh vị trí nút Đăng xuất trên thanh điều hướng ([navbar.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/navbar.tsx)):**
  - Tách nút Đăng xuất (`LogOut`) ra khỏi pill hồ sơ tài khoản khi đã đăng nhập và đặt thành nút riêng đồng bộ chiều cao `h-8` ngay bên phải nút `Explore Library` (`Khám phá Library`).

---

## [0.7.11] — 2026-11-25 — UI Scoped Fix: Chỉ hiển thị `Footer` ở Trang chủ (`/`)

### Đã sửa (Fixed)
- **Giới hạn hiển thị `Footer` duy nhất tại Homepage (`/`) trong [footer.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/footer.tsx):**
  - Chuyển điều kiện ẩn từ `pathname.startsWith('/library')` sang `pathname !== '/'` để toàn bộ các trang còn lại (`/library`, `/login`, `/about`, `/support`, `/products/*`, `/preview/*`, `/checkout`, `/account`, `/admin`, `404`) đều không hiển thị `Footer`.
- **Giữ nền lưới liền mạch cho `/about` & `/support` trong [secondary-views.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/secondary-views.tsx):**
  - Thêm `min-h-[calc(100vh-65px)]` cho `.forma-grid-bg` để chiều cao nền lưới phủ kín màn hình khi không còn `Footer` bên dưới.

---

## [0.7.10] — 2026-11-25 — UI Polish: Tinh giản thêm Library (bỏ `Framework`, techstack dưới card & dòng đếm sản phẩm)

### Đã lược bỏ (Removed / Simplified)
- **Tinh giản Sidebar & tiêu đề trong [library-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/library-view.tsx):**
  - Xóa hoàn toàn mục lọc `FRAMEWORK` ở Sidebar trái.
  - Xóa dòng đếm `"Đang hiển thị ... / ... sản phẩm"` bên cạnh tiêu đề lưới phải, giữ tiêu đề gọn gàng cùng dropdown `Sắp xếp`.
- **Tinh giản đáy Card trong [catalog-product-card.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/catalog-product-card.tsx):**
  - Xóa nhãn techstack (`react` / `nextjs`...) cạnh giá tiền, chỉ giữ lại giá tiền bên trái và nút `Preview ↗` bên phải.

---

## [0.7.9] — 2026-11-24 — UI Polish: Bố cục Library tràn viền sát mép, bỏ tab `Tất cả` & thiết kế lại Card Library

### Đã tinh chỉnh (Changed)
- **Tái cấu trúc không gian Library tràn viền trong [library-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/library-view.tsx) & [library-skeleton.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/library-skeleton.tsx):**
  - Giữ nguyên thanh `Navbar` và `Footer` toàn site; chuyển toàn bộ phần dưới (`Sub-header`, `Left Sidebar`, `Right Grid`) sang bố cục `w-full` sát mép màn hình (loại bỏ `max-w-7xl`).
  - Xóa bỏ tab `Tất cả` (`All`), chỉ giữ lại 2 tab **Components (`11`)** và **Templates (`7`)**, đồng thời căn giữa ô tìm kiếm `⌘K` trong thanh sub-header trên tablet/desktop.
  - Ẩn `Footer` riêng trên tuyến `/library` trong [footer.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/footer.tsx) để không gian Library trải dài sạch hết màn hình mà vẫn giữ nguyên `Footer` trên mọi trang khác.
  - Đưa `Sidebar` sát mép trái có vạch ngăn dọc (`border-r`), khóa khung desktop ở `calc(100vh - 65px)` để `Sub-header` và `Sidebar` cố định khi cuộn lưới sản phẩm bên phải, đồng thời bổ sung thanh cuộn riêng mỏng gọn (`.forma-scrollbar` trong [globals.css](file:///c:/BusinessWeb/Selling_tem/src/app/globals.css)) cho Sidebar; dùng pill count badge bo tròn và bỏ hộp Promo ở đáy Sidebar.
  - Gọn lại hàng tiêu đề bên phải với tiêu đề + bộ đếm bên trái và `Clear filters` + dropdown `Sắp xếp` trên cùng 1 dòng.
- **Thiết kế lại Card Library ([catalog-product-card.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/catalog-product-card.tsx), [product-card-visual.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/product-card-visual.tsx)):**
  - Header tối phía trên gồm Tên sản phẩm + Category phụ chú bên trái và cụm 2 nút hover/focus (Tim Wishlist + Giỏ hàng/Nhận Free) ở góc trên phải; khung preview mở rộng sát viền thẻ (`flush`) ở giữa (giữ card tương tác không lồng thẻ `<a>`); đáy card hiển thị giá tiền + framework trái và nút `Preview ↗` bên phải.
- **Cập nhật hợp đồng lọc & đếm ([types.ts](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/types.ts), [catalog-utils.ts](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/catalog-utils.ts)):**
  - Chuyển `CatalogTab` sang `'component' | 'template'` (mặc định `'component'`), bổ sung `countProductsByTier()` và giữ nguyên tab đang chọn khi bấm `Xóa bộ lọc`.

---

## [0.7.8] — 2026-11-23 — QA & Audit: Sửa lồng thẻ `<Link>` cho card tương tác, tự đóng Mobile Drawer khi đổi route & đồng bộ tài liệu

### Đã sửa lỗi & Đồng bộ (Fixed)
- **Tách thẻ `<Link>` khỏi khung preview `interactive-card` trong [homepage-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/homepage-view.tsx):**
  - Ngăn lỗi lồng thẻ `<button>` bên trong `<a>` (`<Link>`) nếu một sản phẩm dạng `interactive-card` được đưa vào danh sách nổi bật trên trang chủ, trong khi các card thumbnail tĩnh vẫn bấm trực tiếp vào ảnh để sang trang chi tiết.
- **Tự động đóng menu Mobile khi điều hướng trong [navbar.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/navbar.tsx):**
  - Bổ sung `useEffect` lắng nghe `pathname` để tự đóng `mobileMenuOpen` cả khi người dùng dùng nút Back/Forward của trình duyệt.
- **Đồng bộ tài liệu ([README.md](file:///c:/BusinessWeb/Selling_tem/README.md), [PROGRESS.md](file:///c:/BusinessWeb/Selling_tem/docs/PROGRESS.md), [PROJECT_STRUCTURE.md](file:///c:/BusinessWeb/Selling_tem/docs/PROJECT_STRUCTURE.md), [AGENTS.md](file:///c:/BusinessWeb/Selling_tem/AGENTS.md)):**
  - Cập nhật các tham chiếu cũ của `DemoModeBar` sang `HeaderSwitchers` (`Coins` + `Globe`) và mô tả mới của `Homepage` / `Footer`.

---

## [0.7.7] — 2026-11-23 — UI Polish: Refactor `Footer` với Newsletter row & Motion entrance

### Đã tinh chỉnh (Changed)
- **Refactor toàn bộ [footer.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/footer.tsx):**
  - Chuyển thể concept Footer mới sang hệ `forma/` trên nền `#050505` và container `max-w-7xl`: giữ cụm Newsletter phía trên (tiêu đề trái, input email viền `0px` + icon `Mail` và nút trắng vuông `0px` `Subscribe →` kèm trạng thái phản hồi `Subscribed!` / `Đã đăng ký!` 3 giây ở chế độ Demo Phase 1).
  - Bổ sung đường ngăn ngang, lưới giữa 12 cột (`forma/` wordmark + tagline bên trái 5 cột; 3 cột link route thật `/library`, `/about`, `/support`, `/account`, `/admin` bên phải 7 cột) và thanh copyright + ranh giới Demo Phase 1 ở đáy.
  - Chuyển đổi sang `motion/react` (`useInView`, `useReducedMotion`) và dọn sạch timer khi unmount.
- **Mở rộng từ điển song ngữ ([types.ts](file:///c:/BusinessWeb/Selling_tem/src/i18n/types.ts), [vi.ts](file:///c:/BusinessWeb/Selling_tem/src/i18n/dictionaries/vi.ts), [en.ts](file:///c:/BusinessWeb/Selling_tem/src/i18n/dictionaries/en.ts)):**
  - Thêm nhóm khóa `footer.newsletter` cho cả tiếng Việt và tiếng Anh.

---

## [0.7.6] — 2026-11-23 — UI Polish: Thu gọn `Tech Stack` & thay Prisma bằng JavaScript

### Đã tinh chỉnh (Changed)
- **Thu gọn [home-tech-stack-strip.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/home-tech-stack-strip.tsx):**
  - Giảm chiều cao tổng thể xuống tương đồng với `Metrics` strip (`py-8 md:py-10`, tiêu đề `text-2xl sm:text-3xl`, nút pill `mt-4 px-5 py-2`, hàng marquee `mt-6`, ô icon gọn `h-12 w-12 sm:h-14 sm:w-14`).
  - Xóa logo `Prisma` khỏi danh sách `TECH_STACK_ITEMS` và thay thế bằng icon vector **JavaScript (`#F7DF1E`)**.

---

## [0.7.5] — 2026-11-23 — UI Polish: Thêm phần `Tech Stack` 1 hàng chạy ngang giữa `Our Products` và `Footer`

### Đã thêm mới (Added)
- **Tạo [home-tech-stack-strip.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/home-tech-stack-strip.tsx) & tích hợp vào [homepage-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/homepage-view.tsx):**
  - Thêm section nền trắng (`bg-white`) giữa `Our Products` và `Footer` gồm tiêu đề căn giữa song ngữ VI/EN, nút pill đen trỏ về `/library` và **duy nhất 1 hàng icon Tech Stack chạy ngang vô tận** (`Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Figma`, `Motion`, `GitHub`, `Vercel`, `Prisma`, `MySQL`, `Stripe`, `VS Code`).
  - Dùng SVG vector nội bộ sắc nét, tự tạm dừng khi hover (`group-hover:[animation-play-state:paused]`), làm mờ 2 mép trái/phải mượt mắt và tôn trọng `prefers-reduced-motion`.
  - Bổ sung `@keyframes forma-marquee` trong [globals.css](file:///c:/BusinessWeb/Selling_tem/src/app/globals.css) và khóa i18n `techStackTitle`, `techStackCta` trong `src/i18n/`.

---

## [0.7.4] — 2026-11-23 — UI Polish: Hover Scale & Quick Actions cho Card `Our Products`

### Đã chỉnh sửa (Changed)
- **Tách `HomeProductCard` và bổ sung tương tác hover trong [homepage-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/homepage-view.tsx):**
  - Thêm hiệu ứng phóng nhẹ khi hover card (`hover:scale-[1.02] hover:z-10 hover:shadow-card`) kèm `motion-reduce:hover:scale-100`.
  - Bổ sung cụm 2 nút góc trên bên phải (**Tim / Wishlist** dùng `useWishlistStore` và **Thêm vào Giỏ hàng / Nhận Free / Đã sở hữu** dùng `useCartStore` & `useAuthStore`) tự ẩn khi đứng yên trên desktop và hiện mượt khi hover hoặc keyboard `focus-within`, đồng thời chừa `pr-16` trên tiêu đề để không bao giờ che chữ.

---

## [0.7.3] — 2026-11-23 — UI Polish: Tái cấu trúc Product Card phần `Our Products`

### Đã chỉnh sửa (Changed)
- **Tối giản mục `Our Products` trong [homepage-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/homepage-view.tsx):**
  - Xóa bỏ hoàn toàn dòng phụ `"Selected from 18 Components & Templates in the Library"` ở hàng `FEATURED RELEASES`.
  - Đảo bố cục thẻ sản phẩm trên Homepage: đưa **Tên sản phẩm + mô tả ngắn** lên phần đầu thẻ (phía trên khung thumbnail), thay dòng tech stack ở chân thẻ bằng **Giá tiền** (`VND`/`USD` hoặc `Miễn phí`/`Free`), và bỏ nút `Chi tiết` chỉ giữ lại nút **`Preview ↗`**.

---

## [0.7.2] — 2026-11-23 — UI Polish: Thay Audience Strip thành Metrics 3 cột

### Đã thay thế (Changed)
- **Tạo [home-metrics-strip.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/home-metrics-strip.tsx) & gắn vào [homepage-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/catalog/components/homepage-view.tsx):**
  - Thay thế dải Audience Strip giữa khối Hero và mục `Our Products` bằng khối `Metrics` 3 cột nền trắng (`bg-white`), giữ nguyên số liệu/nội dung tiếng Anh (`95%`, `1.9M+`, `10K+`), hiệu ứng spring count-up `Counter`, pill toggle chuyển động và cụm avatar từ `randomuser.me`.
  - Chuẩn hóa import sang `motion/react`, khoảng âm Tailwind v3 (`-ml-[18px]`), tôn trọng `prefers-reduced-motion` và giữ nguyên mọi phần còn lại của trang chủ.

---

## [0.7.1] — 2026-11-23 — UI Polish: Gọn Header & Custom Icon Switchers

### Đã tinh chỉnh (Changed / Removed)
- **Xóa thanh `DemoModeBar` trên cùng:** Gỡ bỏ `<DemoModeBar />` khỏi [layout.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/layout.tsx) và xóa file `src/components/layout/demo-mode-bar.tsx` để phần đầu trang thoáng gọn (chức năng Reset dữ liệu demo vẫn giữ nguyên trong `/account`, `/admin` và `error.tsx`).
- **Custom Icon Switchers ngay bên trái Giỏ hàng ([header-switchers.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/header-switchers.tsx), [navbar.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/navbar.tsx)):**
  - Chuyển nút đổi Tiền tệ (`Coins` — `VND ₫` / `USD $`) và Ngôn ngữ (`Globe` — `Tiếng Việt` / `English`) thành 2 nút icon tròn đặt ngay bên trái nút Giỏ hàng trên cả Desktop, Tablet và Mobile.
  - Thiết kế đồng bộ Dark Minimalism + Cyan Accent: trạng thái mở sáng viền/nền `#00D8FF` (`shadow-cyanGlow`), mở popover kính tối (`#0c0c0f/95` + `backdrop-blur-xl`) với dấu tick xanh cyan ở lựa chọn hiện tại, hỗ trợ đóng bằng phím `Escape` hoặc click ra ngoài.

---

## [0.7.0] — 2026-11-21 — Phase 1.7: QA + Handoff

### Đã thêm mới & Cải thiện (Added / Fixed / Audited)
- **Fix Token Cyan Alpha Toàn cục ([globals.css](file:///c:/BusinessWeb/Selling_tem/src/app/globals.css), [tailwind.config.ts](file:///c:/BusinessWeb/Selling_tem/tailwind.config.ts)):**
  - Chuyển `accent.cyan` sang cú pháp RGB có hỗ trợ `<alpha-value>` (`--accent-cyan-rgb: 0 216 255`), khắc phục 38 chỗ dùng `bg-accent-cyan/*` và `border-accent-cyan/*` (Badge, CatalogProductCard, sparkline bars của `Kinetic Metric Card`, Checkout, Login).
- **Dọn dẹp Dependencies (`package.json`):** Gỡ 3 gói Radix chưa sử dụng (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, giảm 39 packages trong `node_modules`).
- **Accessibility, Reduced Motion & i18n Resilience:**
  - Thêm `@media (prefers-reduced-motion: reduce)` trong `globals.css` và bọc `HomepageView` trong `<MotionConfig reducedMotion="user">`.
  - Thêm liên kết bàn phím `Skip to main content` trên [layout.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/layout.tsx), bổ sung `autoComplete="off"` trên form quản trị, đồng bộ `document.documentElement.lang` và fallback chuỗi rỗng trong `pickLocalizedText`.
- **Guard Sản phẩm Draft/Đã xóa:** Cập nhật `ProductDetailView` và `FullscreenPreviewView` tự chuyển sang trạng thái Not Found / Hidden khi sản phẩm chuyển `Draft` hoặc bị xóa khỏi `localStorage`.
- **Trang phụ & Error/404 Boundaries:** Tạo [about/page.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/about/page.tsx), [support/page.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/support/page.tsx), [not-found.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/not-found.tsx), [error.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/error.tsx), [secondary-views.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/secondary-views.tsx) và gỡ toàn bộ placeholder `#coming-soon` khỏi `Navbar` & `Footer`.
- **Bàn giao Tài liệu Phase 1:** Cập nhật đồng bộ [README.md](file:///c:/BusinessWeb/Selling_tem/README.md), [PRODUCT.md](file:///c:/BusinessWeb/Selling_tem/docs/PRODUCT.md), [PROGRESS.md](file:///c:/BusinessWeb/Selling_tem/docs/PROGRESS.md) (Known Limitations, Phase 2 Backlog, Demo Runbook) và [PROJECT_STRUCTURE.md](file:///c:/BusinessWeb/Selling_tem/docs/PROJECT_STRUCTURE.md).

---

## [0.6.0] — 2026-11-21 — Phase 1.6: Admin Dashboard

### Đã thêm mới & Cập nhật (Added / Changed)
- **Admin Dashboard (`/admin` — `src/app/admin/page.tsx` & `src/features/admin/components/admin-view.tsx`):**
  - Xây dựng cổng Mock Admin Role Gate (có nút 1 chạm chuyển sang `admin@forma.demo`, cảnh báo rõ ràng chỉ là mô phỏng UI không phải bảo mật thật).
  - Giao diện Sidebar 7 mục responsive (`Overview`, `Products`, `Orders`, `Customers`, `Coupons`, `Analytics`, `Settings & Reset`), hỗ trợ deep link qua `?tab=`.
  - **Products CRUD & Publish Sync:** Tìm kiếm, lọc (`All`/`Published`/`Draft`), tạo/sửa/xóa sản phẩm (metadata, `thumbnailVariant`, `frameworks`, giá số nguyên VND/USD, `previewMode`, `previewComponentKey` an toàn từ registry) và bật tắt `Published` ⇄ `Draft` đồng bộ trực tiếp vào `localStorage` để `/library` ẩn bản `Draft`.
  - **Upload Source ZIP an toàn (Metadata Only):** `<input type="file" accept=".zip">` chỉ lấy `file.name` và `file.size` lưu vào `zipMetadata`, không đọc nhị phân hay lưu file lớn vào `localStorage`.
  - **Coupons CRUD & Analytics Mock:** Tạo/cập nhật/bật-tắt/xóa mã giảm giá (`code`, `%`, hạn dùng, mô tả song ngữ), danh sách đơn hàng/khách hàng mô phỏng, mục `Analytics` gắn nhãn `MOCK ANALYTICS` với biểu đồ doanh thu minh họa + phân bổ danh mục trực tiếp, và `Reset All Demo Data`.
- **Điều hướng, i18n & Responsive Polish:**
  - Mở rộng từ điển song ngữ `vi`/`en` với đầy đủ section `admin` và nối link `/admin` tại [footer.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/footer.tsx) + badge `Admin` trên [navbar.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/navbar.tsx).
  - Tinh chỉnh responsive Navbar tại `768px` (ẩn tên dài của session trên Tablet để không chật chội), dùng solid cyan + pixel bar height trên biểu đồ `Analytics`, và bổ sung `id`/`name` cho toàn bộ form controls.

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
