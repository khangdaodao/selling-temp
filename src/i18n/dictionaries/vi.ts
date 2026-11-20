/**
 * Vietnamese (vi) UI dictionary for forma/.
 * Copy follows the tone and structure of the Vietnamese reference screens (Homepage & Library).
 *
 * Related: src/i18n/types.ts, src/i18n/dictionaries/en.ts
 */

import type { TranslationDictionary } from '../types';

export const viDictionary: TranslationDictionary = {
  meta: {
    title: 'forma/ — UI Components & Website Templates chuẩn thiết kế tối giản',
    description:
      'Kho UI Components và Website Templates cho Next.js, React và Tailwind CSS với chiến lược Demo-first.',
    libraryTitle: 'Library — forma/',
    libraryDescription:
      'Khám phá toàn bộ UI Components và Website Templates tương tác trực tiếp của forma/.',
  },
  demoBar: {
    badge: 'CHẾ ĐỘ DEMO • PHASE 1',
    notice: 'Dữ liệu giả lập qua localStorage — Chưa kết nối backend/thanh toán thực.',
    resetButton: 'Đặt lại dữ liệu demo',
    resetDone: 'Đã khôi phục dữ liệu mẫu!',
    currencyLabel: 'Tiền tệ',
    localeLabel: 'Ngôn ngữ',
  },
  nav: {
    home: 'Trang chủ',
    library: 'Library',
    about: 'Về chúng tôi',
    support: 'Hỗ trợ',
    signIn: 'Đăng nhập',
    exploreLibrary: 'Khám phá Library',
    menuOpen: 'Mở menu điều hướng',
    menuClose: 'Đóng menu điều hướng',
    comingSoonNote: 'Trang này sẽ mở khóa ở các phase tiếp theo.',
  },
  footer: {
    tagline:
      'Kho UI Components và Website Templates theo chuẩn thiết kế tối giản, tối ưu trải nghiệm tương tác trước khi mua.',
    columns: {
      productsTitle: 'Sản phẩm',
      productsLinks: {
        library: 'Toàn bộ Library',
        components: 'UI Components',
        templates: 'Website Templates',
        freebies: 'Mẫu miễn phí',
      },
      companyTitle: 'Hệ thống',
      companyLinks: {
        about: 'Về chúng tôi',
        support: 'Hỗ trợ & FAQ',
        account: 'Tài khoản (Demo)',
        admin: 'Admin (Demo)',
      },
      legalTitle: 'Chính sách',
      legalLinks: {
        license: 'Bản quyền sử dụng',
        updates: 'Cập nhật trọn đời',
        privacy: 'Ranh giới Demo Mode',
      },
    },
    copyright: '© 2026 forma/. Đã đăng ký bản quyền.',
    demoNote: 'Bản dựng Demo Phase 1 (Frontend-only)',
  },
  home: {
    headlineLine1: 'Website ấn tượng.',
    headlineLine2: 'Bắt đầu từ những',
    headlineAccent: 'thiết kế tốt.',
    subheadline:
      'Bộ sưu tập UI Components và Website Templates tối giản cho Next.js & React. Trải nghiệm tương tác trực tiếp trước khi sở hữu.',
    primaryCta: 'Khám phá Library',
    secondaryCta: 'Xem bản mẫu',
    trustLifetime: 'Cập nhật trọn đời',
    trustSupport: 'Hỗ trợ tận tình',
    liveBadgeTitle: 'Tương tác trực tiếp',
    liveBadgeSubtitle: 'Thử nghiệm ngay trên từng sản phẩm',
    audienceLabel: 'DÀNH CHO NHỮNG NGƯỜI XÂY DỰNG SẢN PHẨM',
    audiences: [
      'Independent designers',
      'Freelancers',
      'Startups',
      'Creative agencies',
    ],
    showcaseTitle: 'Sản phẩm của chúng tôi',
    showcaseCta: 'Xem tất cả sản phẩm',
    showcaseEyebrow: 'NỔI BẬT NHẤT',
    showcaseSubnote: 'Chọn lọc từ 18 Components & Templates trong Library',
    viewInLibrary: 'Xem trong Library',
  },
  library: {
    tabAll: 'Tất cả',
    tabComponents: 'Components',
    tabTemplates: 'Templates',
    searchPlaceholder: 'Tìm kiếm component, template hoặc tag...',
    searchClear: 'Xóa từ khóa tìm kiếm',
    sortLabel: 'Sắp xếp',
    sortOptions: {
      newest: 'Mới nhất',
      priceAsc: 'Giá: Thấp → Cao',
      priceDesc: 'Giá: Cao → Thấp',
      nameAsc: 'Tên: A → Z',
    },
    sidebar: {
      categoriesHeading: 'DANH MỤC',
      allCategories: 'Tất cả danh mục',
      categories: {
        hero: 'Hero',
        navbar: 'Navbar',
        pricing: 'Pricing',
        cards: 'Cards',
        footer: 'Footer',
        dashboard: 'Dashboard',
        saas: 'SaaS',
        portfolio: 'Portfolio',
        ecommerce: 'E-commerce',
      },
      tierHeading: 'MỨC GIÁ',
      tierAll: 'Tất cả sản phẩm',
      tierFree: 'Miễn phí',
      tierPaid: 'Trả phí',
      frameworkHeading: 'FRAMEWORK',
      frameworkAll: 'Tất cả framework',
      promoTitle: 'Sẵn sàng nâng tầm thiết kế của bạn?',
      promoBody: 'Khám phá ngay các UI Components và Website Templates miễn phí chất lượng cao.',
      promoCta: 'Xem mẫu miễn phí',
    },
    eyebrow: 'THƯ VIỆN FORMA/',
    headline: 'Khởi đầu đẹp cho mọi ý tưởng.',
    showingPrefix: 'Đang hiển thị',
    showingSuffix: 'sản phẩm',
    clearFilters: 'Xóa bộ lọc',
    mobileFilterButton: 'Bộ lọc & Danh mục',
    mobileFilterHide: 'Ẩn bộ lọc',
    loadingLabel: 'Đang tải danh sách sản phẩm từ repository...',
    emptyTitle: 'Không tìm thấy sản phẩm phù hợp',
    emptyBody: 'Thử đổi từ khóa tìm kiếm, chọn danh mục khác hoặc đặt lại bộ lọc hiện tại.',
    emptyResetCta: 'Xóa toàn bộ bộ lọc',
    freeLabel: 'Miễn phí',
    componentLabel: 'Component',
    templateLabel: 'Template',
    interactiveBadge: 'Tương tác trực tiếp',
    placeholderPreviewNote: 'Bản thu gọn • Live Preview ở Phase tiếp theo',
    fallbackBadge: 'Mock Fallback',
    previewPlaceholderHint:
      'Chi tiết sản phẩm & Fullscreen Preview sẽ được mở khóa ở Phase tiếp theo.',
  },
  foundation: {
    freeLabel: 'Miễn phí',
    paidLabel: 'Trả phí',
    componentLabel: 'Component',
    templateLabel: 'Template',
  },
};
