# Các Quyết định Kiến trúc (`docs/DECISIONS.md`) — `forma/`

---

## ADR-001: Dùng Zustand + StorageAdapter tập trung cho Global State

- **Trạng thái:** Đã duyệt (Phase 1.1)
- **Bối cảnh:** Trạng thái dùng chung như Cart Drawer, Wishlist, Auth Session, Ngôn ngữ/Tiền tệ và dữ liệu Admin CRUD cần chia sẻ xuyên suốt nhiều route trong Next.js App Router.
- **Quyết định:** Dùng **Zustand** (`^5.0.3`) cho các store nghiệp vụ toàn cục, kết hợp với một lớp `StorageAdapter` duy nhất (`src/lib/storage/storage-adapter.ts`). React Context chỉ dùng cục bộ bên trong các UI primitive (như Dialog/Select của Radix).
- **Lý do:**
  - Selector của Zustand giúp chỉ re-render đúng component đọc phần dữ liệu thay đổi, tránh re-render toàn cây như React Context.
  - Ngăn chặn tình trạng component tự ý gọi `window.localStorage` rải rác nhiều nơi.
  - Bọc envelope có version (`forma:v1:*`) giúp tránh lỗi SSR hydration và tự khôi phục khi JSON trong trình duyệt bị hỏng.
- **Đánh đổi:** Thêm 1 thư viện nhỏ (~1.2kB), nhưng đổi lại code gọn hơn và tách bạch state khỏi UI rõ ràng.

---

## ADR-002: Repository Interface Pattern để nâng cấp êm từ Phase 1 lên Phase 2

- **Trạng thái:** Đã duyệt (Phase 1.1)
- **Bối cảnh:** Phase 1 lưu dữ liệu bằng `localStorage` + seed fixtures, trong khi Phase 2 sẽ chuyển sang Next.js Server Actions / Route Handlers kết nối MySQL + Prisma.
- **Quyết định:** Định nghĩa sẵn các async interfaces (`IProductRepository`, `IAuthRepository`, `IOrderRepository`, `ICouponRepository`) trong `src/services/repositories/interfaces.ts` và export instance dùng chung tại `src/services/index.ts`.
- **Lý do:** Toàn bộ UI và Zustand store chỉ gọi hàm qua interface hợp đồng mà không biết dữ liệu đến từ đâu. Khi lên Phase 2, chỉ cần thay lớp implementation bằng Prisma/MySQL mà không phải sửa lại hàng loạt component UI.
- **Đánh đổi:** Viết thêm một lớp interface ở Phase 1.1, nhưng tiết kiệm rất nhiều công sức khi ghép backend ở Phase 2.

---

## ADR-003: Giá song tệ cố định bằng số nguyên (`priceVnd` & `priceUsd`)

- **Trạng thái:** Đã duyệt (Phase 1.1)
- **Bối cảnh:** `forma/` phục vụ cả khách hàng Việt Nam (`VND`) và quốc tế (`USD`). Nếu quy đổi VND ↔ USD bằng tỷ giá số thực (float) sẽ dễ phát sinh số lẻ khó coi hoặc sai số làm tròn, đồng thời dễ gây hiểu nhầm đây là tỷ giá thanh toán thực.
- **Quyết định:** Lưu riêng 2 mức giá số nguyên cố định (`priceVnd`, `priceUsd`) trên mỗi `Product` và tính toán giảm giá hoàn toàn bằng phép toán số nguyên (`src/lib/format/currency.ts`).
- **Lý do:** Tránh lỗi số thực dấu phẩy động của JavaScript (ví dụ `0.1 + 0.2`) và đúng với yêu cầu dùng bảng giá demo có sẵn.
- **Đánh đổi:** Admin cần nhập cả giá VND và giá USD khi tạo sản phẩm trả phí (phù hợp yêu cầu thực tế).

---

## ADR-004: Controlled React Preview Registry (Không chạy file ZIP người dùng upload)

- **Trạng thái:** Đã duyệt (Phase 1.1)
- **Bối cảnh:** Chiến lược Demo-first cho phép khách trải nghiệm trực tiếp UI Component và Template, đồng thời Admin có giao diện chọn file ZIP.
- **Quyết định:** Chỉ hiển thị bản demo chạy thật thông qua danh sách ánh xạ kiểm soát (`previewComponentKey`) tới các React demo được cài sẵn (triển khai ở Phase 1.2). Sản phẩm có `previewComponentKey: null` sẽ hiện khung Mock Fallback ghi nhãn rõ ràng.
- **Lý do:** Việc tự động giải nén và chạy mã nguồn từ file ZIP không tin cậy ngay trong domain chính của ứng dụng tạo ra rủi ro bảo mật cực lớn (XSS, đánh cắp `localStorage`/cookie).
- **Đánh đổi:** Không phải mọi sản phẩm thêm mới đều có preview chạy thật tức thì; điều này được giải quyết minh bạch bằng giao diện Mock Fallback.

---

## ADR-005: Next.js 15 App Router + Tailwind CSS v3 + shadcn/ui + Motion

- **Trạng thái:** Đã duyệt (Phase 1.1)
- **Bối cảnh:** Cần hệ thống type an toàn, UI bám sát thiết kế Dark Minimalism + Cyan Accent, component hỗ trợ accessibility (keyboard/focus) và animation có chủ đích.
- **Quyết định:** Chọn Next.js `15.5.x`, React `19`, TypeScript strict (`noUncheckedIndexedAccess`), Tailwind CSS `3.4.x`, Radix/shadcn primitives, `lucide-react` và `motion` (`12.x`).
- **Lý do:** Tailwind v3 tương thích rất mượt với biến CSS HSL của `shadcn/ui`, còn `motion` giúp xử lý các animation phức tạp có kiểm soát mà không làm rối code UI.

---

## ADR-006: Dùng `@monaco-editor/react` với Lazy Loading (`ssr: false`) cho Trình xem Code

- **Trạng thái:** Đã duyệt (Phase 1.5)
- **Bối cảnh:** Trang Customer Account (`My Library`) và tab `Source Code` trên trang chi tiết sản phẩm cần trình xem mã nguồn có cây thư mục, tìm kiếm trong code, đánh số dòng, syntax highlighting chuẩn IDE, chế độ chỉ đọc (`readOnly: true`) và hỗ trợ Fullscreen.
- **Quyết định:** Cài đặt `@monaco-editor/react` (`^4.7.0`) và nạp lười bằng `next/dynamic(..., { ssr: false })` trong [monaco-code-viewer.tsx](file:///c:/BusinessWeb/Selling_tem/src/features/account/components/monaco-code-viewer.tsx).
- **Lý do:**
  - Monaco Editor phụ thuộc các API của trình duyệt (`window`, Web Workers) nên bắt buộc phải dùng `ssr: false` khi chạy trên Next.js App Router.
  - Nạp lười bằng `next/dynamic` giúp tách Monaco khỏi bundle ban đầu của `/account` (route `/account` giữ gọn ở mức `4.63 kB`) và chỉ tải worker khi người dùng bấm `Xem Mã nguồn`.
  - Hỗ trợ sẵn `readOnly: true`, `domReadOnly: true`, và tự nạp language worker cho TypeScript/CSS/Markdown.
- **Đánh đổi:** Thêm 1 package UI editor và tải worker từ CDN khi người dùng mở khung xem code; hoàn toàn chấp nhận được vì không ảnh hưởng tới tốc độ tải của các trang công khai (`/` và `/library`).

---

## ADR-007: Admin Dashboard Mock, Upload ZIP Metadata-Only & Ranh giới Ủy quyền Production

- **Trạng thái:** Đã duyệt (Phase 1.6)
- **Bối cảnh:** Cửa hàng cá nhân `forma/` cần khu vực `/admin` cho phép chủ cửa hàng quản lý sản phẩm (`Draft`/`Published`), coupon, xem đơn hàng và thử thao tác chọn file nguồn `.zip` trong môi trường Phase 1 Frontend-only.
- **Quyết định:**
  - Dùng lại `MockProductRepository` và `MockCouponRepository` qua `StorageAdapter` (`forma:v1:*`) để toàn bộ thay đổi ở `/admin` phản ánh tức thì sang `/library` và `/checkout`, đồng thời phục hồi sạch qua `Reset All Demo Data`.
  - Khi chọn file `.zip` trên form sản phẩm ở Admin, chỉ trích xuất `file.name`, `file.size`, `updatedAt` lưu vào `zipMetadata`; tuyệt đối không đọc nhị phân bằng `FileReader` hay lưu nội dung ZIP vào `localStorage`.
  - Giới hạn truy cập `/admin` ở Phase 1 bằng **Mock Role Gate** phía UI có cảnh báo minh bạch rằng đây không phải cơ chế bảo mật thật.
- **Lý do:**
  - `localStorage` giới hạn ~5MB và dễ tràn quota hoặc đơ trình duyệt nếu lưu binary archive; đồng thời không được chạy code chưa kiểm duyệt từ file ZIP upload (kế thừa `ADR-004`).
  - Phân tách rõ ranh giới UI gating vs Server RBAC giúp không tạo ảo giác an toàn trước khi triển khai Next.js Middleware + Server Session Verification + MySQL RBAC ở Phase 2.
- **Đánh đổi:** Các thao tác upload ZIP thật lên S3/R2 và bảo vệ route `/admin` thực sự chỉ kích hoạt khi lên Phase 2 backend.

---

## ADR-008: Kiến trúc Backend Phase 2 theo mô hình Supabase Hybrid & Song cổng thanh toán PayOS + Stripe

- **Trạng thái:** Đã duyệt (Phase 2.0 — 2026-11-25)
- **Bối cảnh:** Sau khi hoàn tất Phase 1 Frontend Demo-First (`0.7.12`), chủ dự án cần lộ trình đưa `forma/` lên Production nhanh gọn cho solo developer nhưng vẫn đảm bảo khả năng chuyển sang hạ tầng tự chủ hoàn toàn (dedicated PostgreSQL VPS + Better Auth + Cloudflare R2) khi lượng khách và doanh thu tăng mạnh.
- **Quyết định:**
  1. **Database & ORM:** Dùng **Supabase PostgreSQL** nhưng truy vấn bằng **Prisma ORM** (`prisma/schema.prisma`) thông qua `DATABASE_URL` thay vì gọi `supabase.from(...)` rải rác trong UI; đồng thời bật RLS chặn truy cập trực tiếp ở schema `public`.
  2. **Authentication:** Dùng **Supabase Auth** (`@supabase/ssr`, cookie `HttpOnly`) cho Email/Password & Google OAuth, đồng bộ sang bảng `User` của Prisma để kiểm tra `role` (`CUSTOMER`/`ADMIN`) trên server (không dùng `user_metadata` cho phân quyền) và gỡ bỏ `Preset Demo Accounts`.
  3. **Private Storage:** Dùng **Supabase Storage (Private Bucket)** với `zipObjectKey` tương đối (ví dụ `products/orbit/latest.zip`, không lưu cứng URL domain Supabase trong DB) kết hợp kiểm tra `UserEntitlement` trên server trước khi cấp Signed Download URL (~60 giây).
  4. **Server Logic & Payment (`PayOS` + `Stripe`):** Toàn bộ logic Checkout, kiểm tra Coupon, Admin CRUD và Webhook thanh toán **PayOS (VND / VietQR)** + **Stripe (USD)** được viết bằng TypeScript ngay trong Next.js Server (`src/app/api/*` / Server Actions) và giữ hợp đồng trong [interfaces.ts](file:///c:/BusinessWeb/Selling_tem/src/services/repositories/interfaces.ts).
- **Lý do:**
  - Tận dụng tốc độ triển khai của Supabase Auth & Private Storage ở giai đoạn đầu mà **không bị khóa chặt (vendor lock-in)** ở tầng Database hay logic nghiệp vụ.
  - Khi muốn tách khỏi Supabase về sau, chỉ cần đổi `DATABASE_URL` sang server Postgres riêng (code Prisma giữ nguyên), chép bucket sang Cloudflare R2 (đổi 1 hàm tạo Signed URL) và thay Supabase Auth bằng Better Auth — toàn bộ logic PayOS/Stripe/Checkout/UI giữ nguyên.
- **Đánh đổi:** Bản Supabase Free Tier tự tạm dừng (pause) sau 7 ngày không có traffic nên khi mở bán thương mại thật cần nâng cấp gói trả phí hoặc chuyển sang hạ tầng tự chủ theo lộ trình thiết kế sẵn.
