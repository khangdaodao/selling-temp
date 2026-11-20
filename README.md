# forma/ — Cửa hàng UI Components & Website Templates (Demo-First)

> **Trạng thái hiện tại:** Phase 1.1 (`Foundation + Documentation`) • **Chế độ:** Frontend Demo-First (`localStorage` giả lập; chưa kết nối backend, cổng thanh toán hay OAuth thật).

`forma/` là một **Personal Store** (cửa hàng cá nhân, chỉ Admin đăng sản phẩm) chuyên bán **UI Components** và **Website Templates** theo phong cách Dark Minimalism, xây dựng bằng Next.js App Router, React và Tailwind CSS. Khách hàng có thể tương tác trực tiếp với bản demo trước khi quyết định mua hoặc nhận bản miễn phí.

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
npm run start       # Chạy bản production vừa build
```

### Biến môi trường (Environment Variables)
Phase 1 chạy 100% trên trình duyệt bằng dữ liệu mẫu cố định (`src/mocks/*.seed.ts`) và bộ nhớ trình duyệt `localStorage` có quản lý phiên bản (`forma:v1:*`). **Chưa cần `.env` bí mật hay kết nối database trong Phase 1.**

> **Ghi chú Phase 2:** Thông tin kết nối database (`DATABASE_URL` cho MySQL + Prisma), khóa bảo mật của auth provider, object storage riêng tư và khóa cổng thanh toán sẽ chỉ được thêm khi bước sang Phase 2.

---

## Ranh giới Demo (Cần nắm rõ trước khi đánh giá)

1. **Mock Auth (Đăng nhập giả lập):** Phase 1 dùng các tài khoản demo chọn sẵn (`customer@forma.demo`, `admin@forma.demo`), form đăng nhập/đăng ký mô phỏng và nút Google UI demo. Hệ thống không lưu mật khẩu, không xác minh mật khẩu thật và không chạy luồng OAuth thật.
2. **Checkout mô phỏng:** Kiểm tra mã giảm giá (`FORMA20`, `WELCOME10`) và trạng thái thanh toán (`success` / `failure`) chạy cục bộ với `localStorage`.
3. **Khóa Source Code chỉ ở mức UI:** Việc ẩn/khóa tab mã nguồn khi chưa sở hữu chỉ nhằm minh họa luồng UX. Mã nguồn thương mại trả phí thật không bao giờ được nhúng vào client seed công khai; Phase 1 chỉ dùng các đoạn code mẫu đã làm sạch.
4. **Metadata file ZIP trong Admin:** Khi Admin chọn file ZIP để upload, hệ thống chỉ đọc metadata (tên file và dung lượng bytes) ở mức demo/memory, tuyệt đối không nhét file nhị phân (binary) vào `localStorage`.
5. **Đặt lại dữ liệu (Reset Demo Data):** Dùng nút **"Đặt lại dữ liệu demo"** (`Reset demo data`) trên thanh Demo Mode bar ở đầu trang bất kỳ lúc nào để xóa sạch các key `forma:v1:*` và khôi phục dữ liệu ban đầu.

---

## Điều hướng Hệ thống Tài liệu

| File | Mục đích |
| :--- | :--- |
| [AGENTS.md](./AGENTS.md) | Quy tắc bắt buộc cho AI agent & người phát triển (ranh giới Phase 1, quy tắc comment, bảo mật, quy trình nghiệm thu) |
| [docs/PRODUCT.md](./docs/PRODUCT.md) | Yêu cầu sản phẩm, nhóm người dùng (personas), i18n, quy tắc giá song tệ VND/USD, tiêu chí nghiệm thu |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Kiến trúc phân lớp, Zustand stores, Repository contracts, StorageAdapter, SSR hydration và lộ trình lên Phase 2 |
| [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) | Cây thư mục thực tế của dự án và trách nhiệm từng file/folder |
| [docs/PROGRESS.md](./docs/PROGRESS.md) | Bảng tiến độ, checklist đã verify thực tế và danh sách `TODO(Phase 2)` |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Các quyết định kiến trúc (ADR): vấn đề, phương án chọn, lý do và đánh đổi |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Lịch sử các thay đổi đã hoàn thành theo từng phase |
