# Nhật ký Tiến độ & Bàn giao (`docs/PROGRESS.md`) — `forma/`

**Cập nhật lần cuối:** 2026-11-25  
**Cột mốc hiện tại:** **Phase 2.1 — Thiết lập Supabase PostgreSQL, Prisma Schema, RLS & Seed dữ liệu thật** *(Phase 1 UI vẫn vận hành song song qua `localStorage` cho tới khi nối Auth & Repository ở Phase 2.2 → 2.4)*

> ⚠️ **Tuyên bố Trạng thái (Non-Production Disclaimer):**  
> Giao diện hiện tại của **`forma/` vẫn đang vận hành ở chế độ Phase 1 Frontend Demo-First** qua `localStorage` và dữ liệu seed. **Sản phẩm CHƯA phải bản Production-ready** cho đến khi triển khai xong các chặng **Phase 2.1 → 2.5 (Supabase PostgreSQL + Prisma ORM, Supabase Auth, Private Storage, Server RBAC, PayOS & Stripe Webhooks)**.

---

## 1. Tổng quan Trạng thái Nghiệm thu Phase 1 (1.1 → 1.7)

| Sub-phase | Phạm vi đã triển khai & Kiểm chứng | Trạng thái |
| :--- | :--- | :--- |
| **Phase 1.1** | Nền tảng Next.js 15 App Router, TypeScript strict (`noUncheckedIndexedAccess`), Design Tokens Dark Minimalism + Cyan (`#00D8FF`), `StorageAdapter` (`forma:v1:*`), định dạng tiền số nguyên VND/USD, i18n `vi`/`en`, Typed Repository Contracts, Seed 18 sản phẩm / 2 tài khoản / 3 coupons, App Shell & 8 tài liệu Markdown | **Done (Đã xong)** |
| **Phase 1.2** | Homepage (`/` bám sát ảnh thiết kế #1) + Library (`/library` bám sát ảnh thiết kế #2), lọc theo Category/Tier/Framework, tìm kiếm `⌘K`, sắp xếp, Empty/Loading state & responsive 3 viewport | **Done (Đã xong)** |
| **Phase 1.3** | Product Detail (`/products/[slug]`), Fullscreen Preview (`/preview/[slug]`), Controlled React Preview Registry (`next/dynamic`), 2 static HTML templates sandboxed (`Orbit`, `Northbound`), Mock Fallback UI & Wishlist | **Done (Đã xong)** |
| **Phase 1.4** | Mock Auth (`/login` bám sát ảnh thiết kế #3), `Get Free` claim flow, Cart Drawer trượt phải chống mua trùng, One-Page Checkout (`/checkout`), kiểm tra coupon (`FORMA20`, `WELCOME10`, `EXPIRED50`) & mô phỏng thanh toán `Success`/`Failure` | **Done (Đã xong)** |
| **Phase 1.5** | Customer Dashboard (`/account`: `My Library`, `Orders`, `Wishlist`, `Settings` sửa Mock Profile không mật khẩu), Lazy-loaded Read-Only Monaco Code Viewer (Tree, Search, Copy, Fullscreen) & tải gói ZIP mẫu (`forma-sample-bundle.zip`) | **Done (Đã xong)** |
| **Phase 1.6** | Admin Dashboard (`/admin`: Mock Role Gate, Sidebar 7 mục, Products CRUD + `Draft`/`Published` sync + Metadata-only `.zip`, Orders, Customers, Coupons CRUD, Mock Analytics, Settings `Reset All Demo Data`) | **Done (Đã xong)** |
| **Phase 1.7** | **QA + Handoff & UI Polish (`0.7.0` → `0.7.12`):** Gỡ 3 package Radix thừa (`39` sub-packages), sửa token `accent-cyan-rgb` alpha, bổ sung `prefers-reduced-motion` + `<MotionConfig reducedMotion="user">`, thay `DemoModeBar` bằng `HeaderSwitchers` (`Coins` + `Globe`) & chuyển nút Đăng xuất sang phải `Explore Library` trên `Navbar`, thêm dải `Metrics`, tái cấu trúc card `Our Products` (hover scale + Wishlist/Cart), thêm `TechStackMarquee` (có `JavaScript`, bỏ `Prisma`), refactor `Footer` Newsletter và chỉ hiển thị ở Trang chủ `/`, tái cấu trúc `/library` tràn viền (2 tab `Components`/`Templates`, Search `⌘K` căn giữa, Sidebar cố định có thanh cuộn riêng `.forma-scrollbar`, Card sát mép), dựng `/about`, `/support`, `not-found.tsx`, `error.tsx` & QA 12/12 routes | **Done (Đã xong)** |

---

## 1B. Lộ trình Triển khai Phase 2 (Supabase Hybrid + PayOS & Stripe)

| Sub-phase | Phạm vi công việc dự kiến | Trạng thái |
| :--- | :--- | :--- |
| **Phase 2.0** | Chốt quyết định kiến trúc **Supabase Hybrid (`ADR-008`)**, đồng bộ [AGENTS.md](file:///c:/BusinessWeb/Selling_tem/AGENTS.md), [ARCHITECTURE.md](file:///c:/BusinessWeb/Selling_tem/docs/ARCHITECTURE.md), [DECISIONS.md](file:///c:/BusinessWeb/Selling_tem/docs/DECISIONS.md), [PROGRESS.md](file:///c:/BusinessWeb/Selling_tem/docs/PROGRESS.md) & [CHANGELOG.md](file:///c:/BusinessWeb/Selling_tem/docs/CHANGELOG.md) | **Done (Đã xong)** |
| **Phase 2.1** | Thiết lập dự án Supabase (`selling-temp`), cài `@prisma/client`, `prisma` (`^6.19.3`), `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `tsx`; tạo `.env.example`, `src/lib/env.ts`, `src/lib/prisma.ts`, `src/lib/supabase/{client,server,admin}.ts`, `prisma/schema.prisma` (7 bảng Postgres `snake_case`), `prisma/rls.sql` (bật RLS + khóa PostgREST cho toàn bộ schema `public`), đẩy schema & seed thành công (`18` sản phẩm, `54` code files, `3` coupons) | **Done (Đã xong)** |
| **Phase 2.2** | Triển khai **Supabase Auth** (`@supabase/ssr` Email/Password + Google OAuth), đồng bộ bảng `User` qua Prisma, gỡ `Preset Demo Accounts` & khóa Server RBAC cho `/admin` | **Pending** |
| **Phase 2.3** | Thiết lập **Supabase Private Bucket** lưu `.zip` (`zipObjectKey` tương đối), Admin CRUD + Upload thật, Customer tải `.zip` qua Signed URL 60s & nạp source code Monaco từ Postgres | **Pending** |
| **Phase 2.4** | Tích hợp song song **PayOS (VND / VietQR)** & **Stripe (USD)** với Server-Side Pricing, kiểm tra Coupon trong transaction & Webhook xác thực chữ ký mở khóa `UserEntitlement` | **Pending** |
| **Phase 2.5** | Nối Newsletter API thật, thay Mock Analytics bằng query bảng `Order`, audit Supabase Advisors/RLS, CSP headers, rate limiting & kiểm thử E2E Production | **Pending** |

---

## 2. Bằng chứng Kiểm chứng Nghiệm thu Phase 1.7 & UI Polish (2026-11-23)

### Kiểm tra Tĩnh & Cấu trúc Codebase
- **Quét Dependency thừa:** Đã gỡ `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-tabs` không dùng trong `src/` khỏi [package.json](file:///c:/BusinessWeb/Selling_tem/package.json) (giữ lại `@radix-ui/react-slot` đang dùng cho [button.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/ui/button.tsx)).
- **Audit Header Comment (`/**`) & Strict TS:** 100% file trong `src/` và root config (`next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`) đều có header comment đầu file; **0** sử dụng `any`; **0** gọi trực tiếp `window.localStorage` ngoài [storage-adapter.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/storage/storage-adapter.ts).
- **`npm run typecheck` (`tsc --noEmit`):** Exit code `0` (sau lần sửa code cuối).
- **`npm run lint` (`next lint`):** `✔ No ESLint warnings or errors`.
- **`npm run build` (`next build`):** Thành công `12/12` routes (10 static + 2 dynamic):
  - `/` (`9.38 kB`), `/_not-found` (`123 B`), `/about` (`166 B`), `/account` (`5.26 kB`), `/admin` (`12.2 kB`), `/checkout` (`5.39 kB`), `/icon.svg` (`0 B`), `/library` (`6.13 kB`), `/login` (`3.12 kB`), `/preview/[slug]` (`6.59 kB`), `/products/[slug]` (`5.65 kB`), `/support` (`167 B`).

### Kiểm thử Trực tiếp End-to-End trên Chrome (`http://localhost:3005`)
- **Console trình duyệt:** `<no console messages found>` (`0` lỗi runtime, `0` lỗi React hydration, `0` warnings xuyên suốt tất cả các luồng).
- **UI & Design Tokens:** Xác nhận bảng màu cyan alpha (`bg-accent-cyan/10`, `bg-accent-cyan/15`, `border-accent-cyan/30`, sparkline `Kinetic Metric Card`) và trang `404`, `/about`, `/support` hiển thị sắc nét, active nav indicator hoạt động đúng.
- **Locale Fallback & Currency:** Kiểm thử 4 tổ hợp `VI+VND`, `VI+USD`, `EN+VND`, `EN+USD` (`Orbit`: `$39` ⇄ `890.000đ`, `Pulse`: `Free` ⇄ `Miễn phí`); đồng bộ `<html lang>` sau mount và fallback ngôn ngữ an toàn khi thiếu chuỗi.
- **Search, Filter, Empty State & Preview:** `/library` lọc `"Signal"` (`1 / 18 items`), `"zzzz-nonexistent"` hiện Empty State + Reset về `18 / 18`; `/preview/orbit` chạy `<iframe sandbox="allow-scripts">` độc lập với chuyển đổi `Desktop` / `Mobile (375px)` và `Dark` / `Light`.
- **Auth → Cart → Coupon → Purchase → Code Viewer → ZIP Download:** Thêm `Orbit` vào giỏ → `/checkout` yêu cầu Mock Auth → đăng nhập `Customer Demo` quay lại `/checkout` → kiểm tra coupon lỗi `INVALID`, `EXPIRED50`, coupon hợp lệ `FORMA20` (`$39` → `-$8` → `$31`) → thanh toán mô phỏng thành công → mở `/account` (`My Library`: `1 OWNED`, mở read-only `MonacoCodeViewer`, tìm `"tokens"`, copy code, link tải `/demo-assets/forma-sample-bundle.zip`).
- **Admin Draft Guard & Reset:** Đặt `Orbit` sang `Draft` trong `/admin` → mở trực tiếp `/products/orbit` hiển thị màn hình `"Product Not Found"` ẩn sản phẩm nháp; bấm `Reset All Demo Data` khôi phục sạch về `Guest`, `18` sản phẩm (`18 Published • 0 Drafts`), `0` orders, `0` cart items.
- **Responsive (`1440×900`, `768×1024`, `375×812`):** Xác nhận trực quan trên toàn bộ ảnh chụp đầy trang (`fullPage: true`) cho `/`, `/library`, `/about`, `/admin` không xảy ra tràn ngang (`overflow-x`).

---

## 3. Danh sách Giới hạn Hiện tại (Known Limitations — Phase 1)

1. **Lưu trữ chỉ nằm trên Trình duyệt (`localStorage`):** Dữ liệu giỏ hàng, wishlist, đơn hàng mô phỏng, sản phẩm Admin sửa/thêm và coupon chỉ tồn tại trên 1 trình duyệt, chịu giới hạn ~5MB và người dùng có thể tự sửa qua DevTools.
2. **Không có Bảo mật & Phân quyền Thật:** Mock Auth ([mock-auth.repository.ts](file:///c:/BusinessWeb/Selling_tem/src/services/repositories/mock-auth.repository.ts)), nút khóa Source Code ([product-detail-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/product-detail/components/product-detail-view.tsx)) và Role Gate của `/admin` ([admin-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/admin/components/admin-view.tsx)) đều chỉ mô phỏng giao diện phía client.
3. **Không lưu/chạy File ZIP thật:** Chọn file `.zip` ở Admin chỉ trích xuất `file.name`, `sizeBytes`, `updatedAt` làm metadata; nút tải ZIP cho khách trỏ về gói mẫu tĩnh `/demo-assets/forma-sample-bundle.zip`.
4. **Thanh toán & Analytics là Giả lập:** Không kết nối Stripe/VNPay/PayOS; số liệu doanh thu 6 tháng và phễu chuyển đổi trên tab `Analytics` của `/admin` là số liệu minh họa cứng.
5. **Mã nguồn trong Monaco Viewer là Sample Fixture:** Bộ `codeBundle` trong `src/mocks/products.seed.ts` là snippet mẫu tối giản an toàn, không chứa full mã nguồn thương mại thật.
6. **Ghi chú hiển thị nhỏ (Non-blocking):**
   - Trên `/` ở `1440×900` và `768×1024`, hai card showcase chồng lớp (`orbit` & `northbound`) được cố ý xếp đè nhẹ một góc để giữ đúng bố cục ảnh thiết kế gốc (trên mobile `375px` tự động tách 2 dòng không đè nhau).
   - Trên `/library` ở độ rộng `768px`, chữ placeholder tìm kiếm tự cắt dấu `...` sát huy hiệu phím tắt `⌘K`.

---

## 4. Phase 2 Backlog (Lộ trình Triển khai Backend Supabase Hybrid & Production)

Khi triển khai **Phase 2.1 → 2.5**, thực hiện theo đúng thứ tự ưu tiên bảo mật dưới đây (tận dụng bộ interface đã tách sẵn trong [interfaces.ts](file:///c:/BusinessWeb/Selling_tem/src/services/repositories/interfaces.ts) và thiết kế `ADR-008`):

1. **Supabase PostgreSQL + Prisma Schema & RLS (`Phase 2.1`):**
   - Thiết kế bảng `User`, `Product`, `ProductCodeFile`, `Coupon`, `Order`, `OrderItem`, `UserEntitlement` trong `prisma/schema.prisma` (provider `postgresql`).
   - Bật **RLS** trên toàn bộ bảng ở schema `public` (không để `anon`/`authenticated` tự đọc/ghi tùy tiện qua PostgREST Data API).
   - Bảo toàn tiền tệ **số nguyên** (`priceVnd: Int`, `priceUsd: Int`) và tạo `PrismaProductRepository`, `ServerOrderRepository`, `ServerCouponRepository` cắm vào [src/services/index.ts](file:///c:/BusinessWeb/Selling_tem/src/services/index.ts).
2. **Supabase Auth (`@supabase/ssr`) & Session Verification (`Phase 2.2`):**
   - Dùng **Supabase Auth** (Email/Password + Google OAuth thật) qua `@supabase/ssr` với cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
   - Đồng bộ `auth.users` ↔ bảng `User` của Prisma (lưu `email` unique + `role`). Tuyệt đối không dùng `user_metadata` cho phân quyền.
   - Xóa bỏ hoàn toàn nút đăng nhập nhanh `Preset Demo Accounts` (`customer@forma.demo`, `admin@forma.demo`) khỏi bản Production.
3. **Server Authorization Boundaries (RBAC — `Phase 2.2`):**
   - Bảo vệ `/admin` bằng Next.js Middleware + kiểm tra phiên từ server (`getUser()`) trước khi render HTML.
   - Bắt buộc mọi Server Action / Route Handler (`POST/PATCH/DELETE` sản phẩm, bật `Published`/`Draft`, CRUD coupon) xác thực `user.role === 'ADMIN'` ngay trên server đối chiếu Postgres, trả `401`/`403` nếu không đủ quyền.
4. **Supabase Private Storage & Asset Protection (`Phase 2.3`):**
   - Tạo **Private Bucket** trên Supabase Storage; lưu đường dẫn tương đối vào `zipObjectKey` (không lưu cứng domain URL Supabase để sẵn sàng chuyển sang Cloudflare R2/S3 về sau).
   - Admin upload file `.zip` qua **Signed Upload URL** do server cấp sau khi kiểm tra quyền `ADMIN` (chỉ nhận `application/zip`, giới hạn dung lượng).
   - Khách hàng tải `.zip` qua API kiểm tra `UserEntitlement` trong Postgres và cấp **Short-lived Signed Download URL (~60 giây)**; API đọc code cho Monaco Viewer cũng chỉ trả dữ liệu sau khi xác nhận `UserEntitlement`.
5. **Song cổng Thanh toán `PayOS` (VND) + `Stripe` (USD) & Server-Side Pricing (`Phase 2.4`):**
   - Tích hợp **cả hai**: **PayOS** (VietQR / chuyển khoản VND) và **Stripe** (thẻ quốc tế USD).
   - Tuyệt đối không tin giỏ hàng hay phần trăm giảm giá từ trình duyệt: Next.js Server tự đọc `priceVnd`/`priceUsd` từ Postgres, kiểm tra hạn & lượt dùng `Coupon` trong database transaction rồi mới tạo phiên thanh toán; mở khóa `UserEntitlement` chỉ khi nhận và xác thực chữ ký **Webhook** hợp lệ từ PayOS hoặc Stripe.
6. **Production Security Hardening & Polish (`Phase 2.5`):**
   - Bổ sung Content-Security-Policy (CSP), rate limiting trên `/api/auth`, `/api/coupons/validate`, `/api/checkout`, audit log thao tác Admin, nối API thật cho Newsletter ở `Footer` & Analytics thật từ bảng `Order`, và chạy Supabase Advisors kiểm tra RLS. Nếu mở preview cho code upload động trong tương lai, bắt buộc phục vụ từ **origin/domain cô lập riêng** ngoài domain chính.

---

## 5. Hướng dẫn Developer Chạy & Test Demo Nhanh

```bash
# 1. Cài đặt dependencies & build bản tối ưu
npm install
npm run typecheck && npm run lint && npm run build

# 2. Chạy server local (mặc định http://localhost:3000)
npm run start
```

- **Tài khoản mẫu trong `/login`:** `customer@forma.demo` (Customer) và `admin@forma.demo` (Admin — bấm 1 chạm trên `/login` hoặc Role Gate ở `/admin`).
- **Mã giảm giá mẫu trong `/checkout`:** `FORMA20` (giảm 20%, active), `WELCOME10` (giảm 10%, active), `EXPIRED50` (tắt/hết hạn — dùng test báo lỗi).
- **Khôi phục dữ liệu sạch:** Vào `/account` → tab `Settings` hoặc `/admin` → `Settings & Reset` và bấm nút **Đặt lại dữ liệu demo**.

---

## 6. Danh mục `// TODO(Phase 2)` Đồng bộ trong Source Code

- [navbar.tsx](file:///c:/BusinessWeb/Selling_tem/src/components/layout/navbar.tsx): `// TODO(Phase 2): Replace mock role badge checks with server-verified session data.`
- [admin-view.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/admin/components/admin-view.tsx) & [admin/page.tsx](file:///c:/BusinessWeb/Selling_tem/src/app/admin/page.tsx): `// TODO(Phase 2): Protect /admin routes and all catalog/coupon mutations with Next.js server-side session verification, RBAC middleware, MySQL + Prisma, and signed S3/R2 asset uploads.`
- [use-auth-store.ts](file:///c:/BusinessWeb/Selling_tem/src/features/auth/use-auth-store.ts): `// TODO(Phase 2): Replace with server-verified session cookies and MySQL entitlement queries.`
- [use-cart-store.ts](file:///c:/BusinessWeb/Selling_tem/src/features/cart/use-cart-store.ts): `// TODO(Phase 2): Synchronize cart with server session and ignore client-submitted prices.`
- [use-wishlist-store.ts](file:///c:/BusinessWeb/Selling_tem/src/features/wishlist/use-wishlist-store.ts): `// TODO(Phase 2): Synchronize wishlist items with MySQL user wishlist table on the server.`
- [currency.ts](file:///c:/BusinessWeb/Selling_tem/src/lib/format/currency.ts): `// TODO(Phase 2): Replace or augment with server-validated payment currency rules and minor-unit amounts required by the selected payment gateway.`
- [accounts.seed.ts](file:///c:/BusinessWeb/Selling_tem/src/mocks/accounts.seed.ts): `// TODO(Phase 2): Replace with database-backed User records and real session verification.`
- [coupons.seed.ts](file:///c:/BusinessWeb/Selling_tem/src/mocks/coupons.seed.ts): `// TODO(Phase 2): Validate and calculate coupon discounts strictly on the server inside a database transaction before creating a payment intent.`
- [products.seed.ts](file:///c:/BusinessWeb/Selling_tem/src/mocks/products.seed.ts): `// TODO(Phase 2): Replace seed fixtures with MySQL + Prisma queries and private object storage ZIP URLs.`
- [interfaces.ts](file:///c:/BusinessWeb/Selling_tem/src/services/repositories/interfaces.ts) & [src/services/index.ts](file:///c:/BusinessWeb/Selling_tem/src/services/index.ts): `// TODO(Phase 2): Bind interfaces to server-side MySQL + Prisma implementations with Server RBAC and signed private download URLs.`
