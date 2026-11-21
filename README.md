# forma/ — Cửa hàng UI Components & Website Templates (Demo-First)

> **Trạng thái hiện tại:** **Hoàn tất Phase 1 (1.1 → 1.7 QA & Handoff)** • **Chế độ:** Frontend Demo-First (`localStorage` giả lập)  
> ⚠️ **Cảnh báo Bàn giao:** Đây là bản **Frontend Demo-First Prototype**, **CHƯA phải sản phẩm Production-ready** (chưa kết nối MySQL, chưa có Auth/OAuth thật, chưa có Server RBAC, Private S3/R2 Storage hay Cổng thanh toán thật).

`forma/` là một **Personal Store** (cửa hàng cá nhân, chỉ Admin nội bộ xuất bản sản phẩm) chuyên cung cấp **UI Components** và **Website Templates** theo phong cách Dark Minimalism + Cyan Accent (`#00D8FF`), xây dựng bằng Next.js 15 App Router, React 19, TypeScript strict và Tailwind CSS. Khách hàng có thể tương tác trực tiếp với bản demo trước khi đăng nhập, nhận mẫu miễn phí hoặc thanh toán mô phỏng.

---

## Bắt đầu nhanh (Quick Start)

### Yêu cầu môi trường
- Node.js `>= 20` (đã kiểm thử trên `v24.22.0`)
- npm `>= 10` (đã kiểm thử trên `11.19.1`)

### Cài đặt & Các lệnh Scripts

```bash
npm install
npm run dev         # Chạy Next.js dev server tại http://localhost:3000
npm run typecheck   # Kiểm tra TypeScript strict (tsc --noEmit)
npm run lint        # Kiểm tra ESLint theo chuẩn Next.js + TypeScript
npm run build       # Build bản production App Router
npm run start       # Chạy bản production vừa build (mặc định :3000)
```

### Biến môi trường (Environment Variables)
Phase 1 chạy 100% trên trình duyệt bằng dữ liệu mẫu cố định (`src/mocks/*.seed.ts`) và `localStorage` có quản lý phiên bản (`forma:v1:*`). **Không cần `.env` bí mật hay database trong Phase 1.**

> **Ghi chú Phase 2:** Biến môi trường kết nối database (`DATABASE_URL` cho MySQL + Prisma), khóa bí mật của Auth Provider, Object Storage (S3/R2) và Payment Gateway sẽ được cấu hình ở Phase 2.

---

## Bản đồ Tuyến đường (App Router Routes)

| Route | Mô tả chức năng |
| :--- | :--- |
| `/` | Trang chủ Dark Minimalism, Hero interactive showcase (`Orbit` + `Northbound`) và lưới 6 sản phẩm nổi bật |
| `/library` | Kho 18 sản phẩm (`11 Components` + `7 Templates`), lọc danh mục/framework/giá, tab, tìm kiếm `⌘K` & card tương tác |
| `/products/[slug]` | Chi tiết sản phẩm, Live Demo inline/stage, Wishlist, `Get Free`/`Add to Cart` và Monaco Source Viewer (khi đã sở hữu) |
| `/preview/[slug]` | Fullscreen Live Preview với preset `Desktop`/`Tablet`/`Mobile`, `Dark`/`Light`, `Refresh` & iframe sandbox (`Orbit`, `Northbound`) |
| `/login` | Mock Auth (`Customer Demo` / `Admin Demo`), form Login/Register/Forgot Password mô phỏng & Google UI Demo |
| `/checkout` | One-Page Checkout yêu cầu Mock Auth, áp dụng coupon (`FORMA20`, `WELCOME10`, `EXPIRED50`), mô phỏng `Success`/`Failure` |
| `/account` | Customer Dashboard (`My Library`, `Orders`, `Wishlist`, `Settings` + Lazy Read-Only Monaco Code Viewer & tải `forma-sample-bundle.zip`) |
| `/admin` | Admin Dashboard Sidebar 7 mục (`Overview`, `Products CRUD` + `Draft`/`Published` + Metadata-only `.zip`, `Orders`, `Customers`, `Coupons`, `Analytics Mock`, `Settings Reset`) |
| `/about`, `/support` | Giới thiệu kiến trúc Personal Store, câu hỏi thường gặp (FAQ) và hướng dẫn sử dụng bản Demo |
| `not-found` / `error` | Trang 404 tùy chỉnh và Error Boundary kèm nút khôi phục `Reset Demo Data` |

---

## Hướng dẫn Developer Chạy & Kiểm thử Demo (Demo Runbook)

1. Khởi chạy server: `npm install && npm run build && npm run start` (hoặc `npm run dev`), sau đó mở `http://localhost:3000`.
2. Đổi ngôn ngữ (`VI` / `EN`) và tiền tệ (`VND` / `USD`) bất kỳ lúc nào trên thanh **Demo Mode Bar** đầu trang.
3. Mở `/library` → tìm kiếm (`⌘K`), thử tương tác trực tiếp card (`Signal Button`, `Prism Switch`, `Kinetic Metric Card`, `Voices`), bấm vào **Orbit** → **Live Preview** (`/preview/orbit`) để thử viewport Mobile/Tablet và iframe sandbox.
4. Thêm sản phẩm trả phí vào **Cart** → bấm **Checkout** (`/checkout`) → hệ thống chặn ở Auth Gate → chuyển sang `/login` chọn tài khoản **Customer Demo** (`customer@forma.demo`) → quay lại Checkout → nhập mã **`FORMA20`** (giảm 20%) hoặc thử mã lỗi **`EXPIRED50`** → bấm **Mô phỏng Thanh toán Thành công**.
5. Vào `/account` tab **My Library** → bấm **Xem Mã nguồn (Monaco)** để xem cây thư mục, tìm từ khóa trong code, copy code; bấm **Tải gói ZIP mới nhất** để tải `/demo-assets/forma-sample-bundle.zip`.
6. Vào `/admin` → bấm chuyển nhanh sang **Admin Demo** (`admin@forma.demo`) → thử chuyển **Orbit** sang `Draft` (kiểm tra `/library` còn 17 sản phẩm và `/products/orbit` tự ẩn) → thử tạo sản phẩm/coupon mới rồi nhấn `F5` kiểm chứng dữ liệu giữ nguyên trong `localStorage`.
7. Khi cần đưa ứng dụng về trạng thái sạch ban đầu, bấm **Đặt lại dữ liệu demo** (`Reset demo data`) trên thanh đầu trang hoặc trong `/admin` → `Settings & Reset`.

---

## Hệ thống Tài liệu Dự án

| File | Mục đích |
| :--- | :--- |
| [AGENTS.md](./AGENTS.md) | Quy tắc bắt buộc cho AI agent & người phát triển (ranh giới Phase 1, comment, bảo mật, nghiệm thu) |
| [docs/PRODUCT.md](./docs/PRODUCT.md) | Yêu cầu sản phẩm, personas, i18n, quy tắc giá song tệ số nguyên VND/USD |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Kiến trúc phân lớp, Zustand stores, Repository contracts, StorageAdapter, Preview Isolation & Authorization Boundaries |
| [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) | Cây thư mục thực tế của toàn bộ dự án |
| [docs/PROGRESS.md](./docs/PROGRESS.md) | Báo cáo nghiệm thu Phase 1.1 → 1.7, **Known Limitations**, **Phase 2 Backlog** và **Developer Demo Runbook** |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Các quyết định kiến trúc (ADR-001 đến ADR-007) |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Lịch sử các thay đổi đã hoàn thành (`0.1.0` đến `0.7.0`) |
