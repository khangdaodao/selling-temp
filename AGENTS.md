# AGENTS.md — Quy tắc Kỹ thuật & Kiến trúc cho `forma/`

Đọc file này cùng với `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_STRUCTURE.md` và `docs/PROGRESS.md` trước khi bắt đầu mỗi phiên coding.

---

## 0. Nguyên tắc Tuyệt đối Khi Chỉnh sửa (Strict Edit Discipline)

- **Sửa đúng phần được yêu cầu (Scoped Edits Only):** Chủ dự án yêu cầu sửa phần nào thì CHỈ sửa đúng phần đó; TUYỆT ĐỐI không tự ý sửa đổi, thay đổi hành vi hay xóa các phần/tính năng không liên quan ("không sửa lung tung").
- **Chuẩn hóa & Có cấu trúc (Standardized & Structured):** Mọi chỉnh sửa phải tuân theo cấu trúc Feature-First, TypeScript strict, đặt tên thống nhất và tách component/helper gọn gàng thay vì chắp vá ad-hoc.
- **Ghi chú rõ ràng để đọc hiểu (Readable Comments):** Luôn giữ và bổ sung header comment, TSDoc và chú thích lý do rõ ràng, mạch lạc để chủ dự án đọc code hay theo dõi toàn bộ dự án đều hiểu ngay.
- **Bảo toàn bố cục giao diện (Layout Integrity):** TUYỆT ĐỐI không chèn bậy thành phần gây xô lệch, mất cân đối hoặc làm hư layout trên cả 3 kích thước `1440px`, `768px` và `375px`.

---

## 1. Phạm vi Phase & Ranh giới Tuyệt đối

- **Phạm vi hiện tại:** **Phase 1 (Frontend Demo-First)**.
- **Nghiêm cấm thực hiện trong Phase 1** (trừ khi chủ dự án yêu cầu trực tiếp):
  - KHÔNG cài đặt Prisma, tạo schema MySQL, kết nối database hay viết backend API thật.
  - KHÔNG triển khai Google OAuth thật, mã hóa/hash mật khẩu, tích hợp SDK thanh toán thật hay lưu trữ/chạy file ZIP người dùng upload.
  - KHÔNG nhúng mã nguồn thương mại trả phí thật vào file seed phía client; chỉ dùng các đoạn code mẫu an toàn.
  - KHÔNG lưu mật khẩu, secret key hay thông tin thẻ thanh toán vào `localStorage`.
- **Quy tắc mỗi lượt một Sub-phase:** Chỉ triển khai ĐÚNG MỘT sub-phase trong mỗi lượt. Chờ chủ dự án duyệt mới chuyển sang bước tiếp theo.

---

## 2. Quy tắc Kiến trúc & Tổ chức Thư mục

- **Tổ chức theo Feature-First:**
  - `src/app/`: Chỉ chứa routes, layouts, metadata và entrypoints mỏng của Next.js App Router.
  - `src/features/*`: Các domain nghiệp vụ độc lập (`catalog`, `preview`, `product-detail`, `cart`, `checkout`, `auth`, `wishlist`, `account`, `admin`).
  - `src/components/ui/`: Các UI primitives tái sử dụng tùy biến từ `shadcn/ui`.
  - `src/components/layout/`: Khung giao diện toàn cục (`Navbar`, `HeaderSwitchers`, `Footer`, `SecondaryViews`).
  - `src/services/`: Repository interfaces (`IProductRepository`, `IAuthRepository`, `IOrderRepository`, `ICouponRepository`) và mock implementations cho Phase 1.
  - `src/mocks/`: Dữ liệu gốc (`products.seed.ts`, `accounts.seed.ts`, `coupons.seed.ts`). Tuyệt đối không hardcode mảng sản phẩm giả trực tiếp trong UI component.
  - `src/lib/`: Công cụ hạ tầng dùng chung (`storage/storage-adapter.ts`, `format/currency.ts`, `utils.ts`).
  - `src/i18n/`: Từ điển song ngữ `vi` / `en` và Zustand store quản lý ngôn ngữ/tiền tệ.
  - `src/types/`: Chỉ đặt các TypeScript contracts dùng chung xuyên nhiều feature (`domain.ts`).
- **Cấm gọi trực tiếp `localStorage` trong Component:** React component KHÔNG ĐƯỢC gọi `window.localStorage` trực tiếp. Mọi đọc/ghi phải đi qua `src/lib/storage/storage-adapter.ts` thông qua repository hoặc Zustand store.
- **Tính tiền bằng số nguyên (Integer Money Math):** Mọi phép tính giá VND, USD và giảm giá PHẢI dùng số nguyên trong `src/lib/format/currency.ts`, tránh sai số dấu phẩy động.

---

## 3. Chất lượng Code & Quy tắc Comment Bắt buộc

- **TypeScript Strict:** Bật `strict: true` và `noUncheckedIndexedAccess: true`. Cấm dùng `any` (`@typescript-eslint/no-explicit-any` là lỗi).
- **Header Comment đầu file (Bắt buộc):** Mọi file source mới tạo hoặc chỉnh sửa (`.ts`, `.tsx`, `.mjs`, `.js`, `.css`) PHẢI có block comment ở đầu file tóm tắt:
  1. Trách nhiệm duy nhất của file.
  2. Các module liên quan.
  3. Ranh giới mock Phase 1 / lưu ý bảo mật (nếu liên quan).
- **TSDoc / JSDoc:** Các hàm export, custom hooks, interface công khai và logic nghiệp vụ quan trọng phải có TSDoc ghi rõ đầu vào, đầu ra, bất biến (invariants) và edge cases.
- **Đánh dấu Phase 2 trung thực:** Dùng `// TODO(Phase 2): <việc cụ thể>` cho các điểm nối backend/database và đồng bộ toàn bộ sang `docs/PROGRESS.md`.
- **Không comment thừa:** Tránh các dòng vô nghĩa kiểu `// gán state` hay `// trả kết quả`. Luôn cập nhật comment khi sửa logic.
- **Ưu tiên thiết kế gốc:** 3 màn hình cốt lõi (`Homepage`, `Library`, `Login`) phải bám sát ảnh thiết kế Dark Minimalism + Cyan Accent đã duyệt, không tự ý đổi bố cục.

---

## 4. Quy trình Làm việc & Nghiệm thu Phiên Coding

### Trước khi code
1. Đọc lại `AGENTS.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/PROJECT_STRUCTURE.md`, `docs/PROGRESS.md`.
2. Trình bày ngắn checklist phase, danh sách file dự kiến và các câu hỏi cần chốt trước khi sửa code.

### Sau khi code
1. Chạy `npm run typecheck`, `npm run lint` và `npm run build` — sửa sạch toàn bộ lỗi trong phạm vi phase.
2. Kiểm tra hiển thị responsive trên 3 kích thước `1440px` (Desktop), `768px` (Tablet) và `375px` (Mobile): không tràn ngang, keyboard focus hoạt động tốt, console sạch lỗi.
3. Cập nhật `docs/PROGRESS.md` (chỉ đánh dấu Done khi đã kiểm thử thật), `docs/PROJECT_STRUCTURE.md`, `docs/CHANGELOG.md`, và `docs/DECISIONS.md` nếu có quyết định kiến trúc mới.
4. Báo cáo đúng 6 mục bắt buộc: `(1) What changed`, `(2) Test evidence`, `(3) Learning notes`, `(4) Remaining risks`, `(5) Updated documentation`, `(6) Next phase checklist`.
