/**
 * Strongly typed dictionary contract for bilingual (vi / en) UI copy in forma/.
 * Guarantees parity between Vietnamese and English translation files at compile time.
 *
 * Related: src/i18n/dictionaries/vi.ts, src/i18n/dictionaries/en.ts, src/i18n/use-i18n-store.ts
 */

import type { ProductCategory } from '@/types/domain';

export interface TranslationDictionary {
  meta: {
    title: string;
    description: string;
    libraryTitle: string;
    libraryDescription: string;
  };
  demoBar: {
    badge: string;
    notice: string;
    resetButton: string;
    resetDone: string;
    currencyLabel: string;
    localeLabel: string;
  };
  nav: {
    home: string;
    library: string;
    about: string;
    support: string;
    signIn: string;
    exploreLibrary: string;
    menuOpen: string;
    menuClose: string;
    comingSoonNote: string;
  };
  footer: {
    tagline: string;
    columns: {
      productsTitle: string;
      productsLinks: {
        library: string;
        components: string;
        templates: string;
        freebies: string;
      };
      companyTitle: string;
      companyLinks: {
        about: string;
        support: string;
        account: string;
        admin: string;
      };
      legalTitle: string;
      legalLinks: {
        license: string;
        updates: string;
        privacy: string;
      };
    };
    copyright: string;
    demoNote: string;
  };
  home: {
    headlineLine1: string;
    headlineLine2: string;
    headlineAccent: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    trustLifetime: string;
    trustSupport: string;
    liveBadgeTitle: string;
    liveBadgeSubtitle: string;
    audienceLabel: string;
    audiences: readonly [string, string, string, string];
    showcaseTitle: string;
    showcaseCta: string;
    showcaseEyebrow: string;
    showcaseSubnote: string;
    viewInLibrary: string;
  };
  library: {
    tabAll: string;
    tabComponents: string;
    tabTemplates: string;
    searchPlaceholder: string;
    searchClear: string;
    sortLabel: string;
    sortOptions: {
      newest: string;
      priceAsc: string;
      priceDesc: string;
      nameAsc: string;
    };
    sidebar: {
      categoriesHeading: string;
      allCategories: string;
      categories: Record<ProductCategory, string>;
      tierHeading: string;
      tierAll: string;
      tierFree: string;
      tierPaid: string;
      frameworkHeading: string;
      frameworkAll: string;
      promoTitle: string;
      promoBody: string;
      promoCta: string;
    };
    eyebrow: string;
    headline: string;
    showingPrefix: string;
    showingSuffix: string;
    clearFilters: string;
    mobileFilterButton: string;
    mobileFilterHide: string;
    loadingLabel: string;
    emptyTitle: string;
    emptyBody: string;
    emptyResetCta: string;
    freeLabel: string;
    componentLabel: string;
    templateLabel: string;
    interactiveBadge: string;
    placeholderPreviewNote: string;
    fallbackBadge: string;
    previewPlaceholderHint: string;
    viewDetailsLabel: string;
    openPreviewLabel: string;
  };
  productDetail: {
    backToLibrary: string;
    openFullscreenPreview: string;
    liveInteractiveHint: string;
    thumbnailPreviewHint: string;
    fallbackPreviewHint: string;
    buyNowCta: string;
    getFreeCta: string;
    checkoutDeferredNotice: string;
    wishlistAdd: string;
    wishlistSaved: string;
    specs: {
      framework: string;
      category: string;
      previewMode: string;
      themeSupport: string;
      themeBoth: string;
      themeDarkOnly: string;
      latestZip: string;
      lifetimePolicy: string;
      lifetimeValue: string;
    };
    tabs: {
      overview: string;
      documentation: string;
      sourceCode: string;
    };
    overviewTagsHeading: string;
    overviewFilesHeading: string;
    docsInstallHeading: string;
    docsNotesHeading: string;
    lockedCode: {
      badge: string;
      title: string;
      description: string;
      disclaimerTitle: string;
      disclaimerBody: string;
      filesHeading: string;
    };
    notFoundTitle: string;
    notFoundBody: string;
  };
  preview: {
    backToDetails: string;
    backToLibrary: string;
    viewDetails: string;
    viewportLabel: string;
    viewportDesktop: string;
    viewportTablet: string;
    viewportMobile: string;
    themeDark: string;
    themeLight: string;
    themeFixedDark: string;
    refreshDemo: string;
    refreshedNotice: string;
    modeReactRegistry: string;
    modeStaticIframe: string;
    modeMockFallback: string;
    loadingPreview: string;
    fallbackTitle: string;
    fallbackBody: string;
    fallbackBackCta: string;
    notFoundTitle: string;
    notFoundBody: string;
  };
  auth: {
    backLabel: string;
    eyebrow: string;
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    forgotTitle: string;
    forgotSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    forgotLink: string;
    submitLogin: string;
    submitRegister: string;
    submitForgot: string;
    forgotSentNotice: string;
    orDivider: string;
    googleDemoCta: string;
    presetHeading: string;
    presetCustomerRole: string;
    presetAdminRole: string;
    switchToRegister: string;
    switchToLogin: string;
    returnToCheckoutBanner: string;
    demoBoundaryNotice: string;
    signedInAs: string;
    signOut: string;
  };
  cart: {
    title: string;
    demoBadge: string;
    emptyTitle: string;
    emptyBody: string;
    emptyBrowseCta: string;
    removeItem: string;
    subtotalLabel: string;
    discountLabel: string;
    totalLabel: string;
    proceedCheckout: string;
    continueBrowsing: string;
    addToCart: string;
    inCartViewDrawer: string;
    alreadyOwnedCta: string;
    ownedBadge: string;
    inCartBadge: string;
    alreadyInCartNotice: string;
    alreadyOwnedNotice: string;
    freeClaimedSuccess: string;
    unlockNotice: string;
  };
  checkout: {
    backToLibrary: string;
    eyebrow: string;
    title: string;
    demoWarning: string;
    authRequiredTitle: string;
    authRequiredBody: string;
    authRequiredCta: string;
    quickDemoCustomerCta: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    ownedPrunedNotice: string;
    orderItemsHeading: string;
    couponHeading: string;
    couponPlaceholder: string;
    couponApply: string;
    couponRemove: string;
    couponHintsLabel: string;
    couponApplied: string;
    couponErrors: {
      empty: string;
      not_found: string;
      inactive: string;
      expired: string;
    };
    paymentHeading: string;
    paymentSuccessLabel: string;
    paymentSuccessDesc: string;
    paymentFailureLabel: string;
    paymentFailureDesc: string;
    placeOrderCta: string;
    failureBannerTitle: string;
    failureBannerBody: string;
    successTitle: string;
    successSubtitle: string;
    orderIdLabel: string;
    unlockedHeading: string;
    viewUnlockedProduct: string;
    recentOrdersHeading: string;
    statusPaid: string;
    statusFailed: string;
    statusFreeClaimed: string;
  };
  account: {
    eyebrow: string;
    title: string;
    subtitle: string;
    demoProfileBadge: string;
    authGateTitle: string;
    authGateBody: string;
    authGateLoginCta: string;
    authGateCustomerCta: string;
    tabs: {
      myLibrary: string;
      orders: string;
      wishlist: string;
      settings: string;
    };
    statsOwned: string;
    statsOrders: string;
    statsWishlist: string;
    emptyLibraryTitle: string;
    emptyLibraryBody: string;
    emptyLibraryCta: string;
    viewSourceCta: string;
    hideSourceCta: string;
    downloadZipCta: string;
    zipUnavailableLabel: string;
    latestZipOnlyNote: string;
    emptyOrdersTitle: string;
    emptyOrdersBody: string;
    emptyWishlistTitle: string;
    emptyWishlistBody: string;
    removeWishlistCta: string;
    settingsProfileHeading: string;
    settingsProfileSub: string;
    settingsNameLabel: string;
    settingsEmailLabel: string;
    settingsSaveCta: string;
    settingsSavedNotice: string;
    settingsDangerHeading: string;
    settingsDangerBody: string;
    settingsResetCta: string;
  };
  codeViewer: {
    title: string;
    readOnlyBadge: string;
    demoFixtureBadge: string;
    searchPlaceholder: string;
    matchesLabel: string;
    noMatches: string;
    filesHeading: string;
    copyCta: string;
    copiedCta: string;
    fullscreenEnter: string;
    fullscreenExit: string;
    loadingEditor: string;
    securityNote: string;
  };
  foundation: {
    freeLabel: string;
    paidLabel: string;
    componentLabel: string;
    templateLabel: string;
  };
}
