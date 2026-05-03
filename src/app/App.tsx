import { FormEvent, ReactNode, useEffect, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  Film,
  Globe2,
  Hotel,
  Landmark,
  Languages,
  LockKeyhole,
  MapPin,
  Menu,
  Plane,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TicketCheck,
  Trash2,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';

type Language = 'vi' | 'en';
type Currency = 'VND' | 'USD';
type Role = 'traveler' | 'partner' | 'admin';
type ServiceType = 'cinema' | 'hotel' | 'homestay' | 'attraction' | 'event' | 'local_tour' | 'restaurant' | 'transport' | 'stay' | 'movie' | 'stays';
type PaymentMethod = 'wallet' | 'card' | 'qr';

type User = { id: string; name: string; email: string; role: Role };
type Service = {
  _id: string;
  type: ServiceType;
  providerBrand?: string;
  title: string;
  province?: string;
  district?: string;
  location: string;
  priceVnd: number;
  priceUsd?: number;
  rating: number;
  reviewCount: number;
  availability: number;
  duration: string;
  coverImage: string;
  gallery: string[];
  description: string;
  detail?: string;
  highlights: string[];
  cancellationPolicy?: string;
  tags?: string[];
  sustainabilityScore?: number;
  isFeatured?: boolean;
};
type CartItem = { service: Service; quantity: number; guests: number; date: string };
type Booking = {
  _id: string;
  bookingCode: string;
  items: Array<{
    serviceId: string;
    titleSnapshot: string;
    locationSnapshot: string;
    priceVndSnapshot: number;
    quantity: number;
    guests: number;
    date: string;
  }>;
  totalVnd: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  status?: string;
  transactionHash: string;
  createdAt: string;
};
type Refund = {
  _id: string;
  bookingId?: Booking;
  amount: number;
  currency: 'VND' | 'USD';
  reason: string;
  status: string;
  refundHash: string;
  decisionReason?: string;
  createdAt: string;
};
type Wallet = {
  vndBalance: number;
  pendingBalance: number;
  rewardPoints: number;
  membershipTier: string;
};
type PaymentSource = {
  _id: string;
  type: string;
  providerName: string;
  maskedNumber: string;
  currency: string;
  isPrimary: boolean;
};
type WalletTransaction = {
  _id: string;
  type: string;
  amount: number;
  currency: 'VND' | 'USD' | 'USDT';
  status: string;
  description: string;
  transactionHash: string;
  referenceCode: string;
  createdAt: string;
  bookingId?: { bookingCode?: string };
  paymentSourceId?: PaymentSource;
};

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 800%22%3E%3Crect width=%221200%22 height=%22800%22 fill=%22%23071015%22/%3E%3Cpath d=%22M0 610c170-90 320-130 455-88 170 53 265 6 405-42 128-44 220 13 340 91v229H0z%22 fill=%22%23fb923c%22 opacity=%22.28%22/%3E%3Ctext x=%2280%22 y=%22400%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2272%22 font-weight=%22700%22%3ETravChain%3C/text%3E%3C/svg%3E';
const USD_RATE = 24500;
const TOKEN_KEY = 'travchain_token';
const USER_KEY = 'travchain_user';
const CART_KEY = 'travchain_cart';

const text = {
  vi: {
    explore: 'Khám phá',
    services: 'Dịch vụ',
    bookings: 'Đặt chỗ',
    passport: 'Hộ chiếu',
    wallet: 'Ví',
    profile: 'Hồ sơ',
    signIn: 'Đăng nhập',
    logout: 'Đăng xuất',
    heroTitle: 'All Travel One Tap',
    heroBody: 'Đặt khách sạn, homestay, vé xem phim, vé tham quan, sự kiện và tour địa phương tại Việt Nam trong một ứng dụng.',
    destination: 'Bạn muốn đi đâu?',
    date: 'Ngày đi',
    guests: 'Khách',
    search: 'Tìm kiếm',
    featuredDestinations: 'Điểm đến nổi bật',
    featuredServices: 'Dịch vụ đề xuất',
    categoryAccess: 'Chọn nhanh dịch vụ',
    addCart: 'Thêm vào giỏ',
    bookNow: 'Đặt ngay',
    detail: 'Chi tiết',
    checkout: 'Thanh toán',
    empty: 'Chưa có dữ liệu phù hợp.',
    loginRequired: 'Vui lòng đăng nhập để tiếp tục.',
    cartEmpty: 'Giỏ hàng đang trống.',
    passportTitle: 'Hộ chiếu du lịch',
    partnerCta: 'Bạn là đối tác du lịch?',
    partnerBody: 'Đăng dịch vụ, quản lý tồn kho, theo dõi doanh thu và đối soát từ một console riêng.',
    qrReceipt: 'Biên nhận QR',
    transparentHash: 'Mã hash minh bạch',
    partnerVerified: 'Đối tác xác thực',
    localDiscovery: 'Khám phá địa phương',
    howTitle: 'TravChain hoạt động thế nào',
    testimonials: 'Đánh giá từ người dùng',
    paymentMethod: 'Phương thức thanh toán',
    choosePayment: 'Chọn phương thức thanh toán và xác nhận đặt chỗ',
    confirmBooking: 'Xác nhận đặt chỗ',
    processing: 'Đang xử lý...',
    domesticQr: 'QR nội địa',
    internationalCard: 'Thẻ quốc tế',
    travchainWallet: 'Ví TravChain',
    securityNote: 'Giao dịch được ghi nhận bằng mã hash mô phỏng blockchain.',
    orderSummary: 'Tóm tắt đơn hàng',
    subtotal: 'Tạm tính',
    serviceFee: 'Phí dịch vụ',
    total: 'Tổng cộng',
    bookingSuccess: 'Đặt chỗ thành công',
    viewReceipt: 'Xem biên nhận',
    viewMyBookings: 'Xem đặt chỗ của tôi',
    open: 'Mở',
    reviews: 'Đánh giá',
    noReviews: 'Chưa có đánh giá.',
    from: 'Từ',
    slotsAvailable: 'chỗ còn lại',
    viewCart: 'Xem giỏ hàng',
    bookingDetail: 'Chi tiết đặt chỗ',
    receiptHash: 'Biên nhận, dịch vụ và mã hash giao dịch',
    receiptHistory: 'Biên nhận QR, trạng thái thanh toán và mã hash',
    passportSubtitle: 'Dấu chuyến đi, biên nhận QR, điểm thưởng, hạng thành viên và mã hash',
    cartReview: 'Kiểm tra dịch vụ đã chọn trước khi thanh toán',
    serviceDetail: 'Chi tiết dịch vụ',
    notFound: 'Không tìm thấy',
    walletPinRequired: 'Cần nhập mã PIN ví.',
    checkoutFailed: 'Thanh toán không thành công',
    bookingCode: 'Mã đặt chỗ',
    amount: 'Số tiền',
    status: 'Trạng thái',
    transactionId: 'Mã giao dịch',
    transactionHash: 'Mã hash giao dịch',
    createdDate: 'Ngày tạo',
    qrReceiptTitle: 'Biên nhận QR',
    publicReceipt: 'Biên nhận công khai tạo từ mã đặt chỗ',
    membership: 'Thành viên',
    points: 'điểm',
    accountInfo: 'Thông tin tài khoản và vai trò',
    walletSubtitle: 'Tín dụng du lịch, thanh toán đặt chỗ, hoàn tiền, điểm thưởng và mã hash DApp',
    travelCredits: 'Tín dụng du lịch',
    rewardPoints: 'Điểm thưởng',
    membershipTier: 'Hạng thành viên',
    refundPending: 'Hoàn tiền chờ xử lý',
    topUpCredits: 'Nạp tín dụng du lịch',
    walletPinUpdated: 'Đã cập nhật mã PIN ví.',
    addPaymentSourceFirst: 'Hãy thêm nguồn thanh toán trước.',
    depositAmount: 'Số tiền nạp VND',
    updatePin: 'Cập nhật PIN',
    noPaymentSources: 'Chưa có nguồn thanh toán. Hãy thêm qua API hoặc dữ liệu seed.',
    dappBadge: 'Nền tảng đặt dịch vụ du lịch DApp',
    exploreServices: 'Khám phá dịch vụ',
    partnerAccess: 'Cổng đối tác',
    all: 'Tất cả',
    verifiedBooking: 'Đặt chỗ xác thực',
    avgRating: 'Điểm trung bình',
    totalReviews: 'lượt đánh giá',
    cancelBooking: 'Hủy đặt chỗ',
    cancellationPolicy: 'Chính sách hủy',
    freeCancel: 'Miễn phí hủy trước 24 giờ',
    halfRefund: 'Hoàn 50% trong vòng 24 giờ',
    noRefund: 'Không hoàn tiền sau khi dịch vụ bắt đầu',
    cancelReason: 'Lý do hủy',
    refundStatus: 'Trạng thái hoàn tiền',
    receiptButton: 'Biên nhận QR',
    reviewButton: 'Viết đánh giá',
    refundRequests: 'Yêu cầu hoàn tiền',
    cancellationRate: 'Tỷ lệ hủy',
    refundThisMonth: 'Hoàn tiền tháng này',
    approve: 'Duyệt',
    reject: 'Từ chối',
    processRefund: 'Xử lý hoàn tiền',
    pendingRefunds: 'Hoàn tiền đang chờ',
    refundHash: 'Mã hash hoàn tiền',
  },
  en: {
    explore: 'Explore',
    services: 'Services',
    bookings: 'Bookings',
    passport: 'Passport',
    wallet: 'Wallet',
    profile: 'Profile',
    signIn: 'Sign in',
    logout: 'Log out',
    heroTitle: 'All Travel One Tap',
    heroBody: 'Book stays, cinema tickets, attraction passes, events, and local tours in Vietnam from one app.',
    destination: 'Where do you want to go?',
    date: 'Date',
    guests: 'Guests',
    search: 'Search',
    featuredDestinations: 'Featured destinations',
    featuredServices: 'Featured services',
    categoryAccess: 'Quick service access',
    addCart: 'Add to cart',
    bookNow: 'Book now',
    detail: 'Details',
    checkout: 'Checkout',
    empty: 'No matching data.',
    loginRequired: 'Please sign in to continue.',
    cartEmpty: 'Your cart is empty.',
    passportTitle: 'Travel Passport',
    partnerCta: 'Are you a travel partner?',
    partnerBody: 'Publish services, manage inventory, track revenue, and reconcile from a dedicated console.',
    qrReceipt: 'QR receipt',
    transparentHash: 'Transparent hash',
    partnerVerified: 'Partner verified',
    localDiscovery: 'Local discovery',
    howTitle: 'How TravChain works',
    testimonials: 'Traveler reviews',
    paymentMethod: 'Payment method',
    choosePayment: 'Choose payment method and confirm booking',
    confirmBooking: 'Confirm booking',
    processing: 'Processing...',
    domesticQr: 'Domestic QR',
    internationalCard: 'International card',
    travchainWallet: 'TravChain Wallet',
    securityNote: 'The transaction is recorded with a simulated blockchain hash.',
    orderSummary: 'Order summary',
    subtotal: 'Subtotal',
    serviceFee: 'Service fee',
    total: 'Total',
    bookingSuccess: 'Booking confirmed',
    viewReceipt: 'View receipt',
    viewMyBookings: 'View my bookings',
    open: 'Open',
    reviews: 'Reviews',
    noReviews: 'No reviews yet.',
    from: 'From',
    slotsAvailable: 'slots available',
    viewCart: 'View cart',
    bookingDetail: 'Booking detail',
    receiptHash: 'Receipt, service snapshots, and transaction hash',
    receiptHistory: 'QR receipts, payment status, and hash records',
    passportSubtitle: 'Trip stamps, QR receipts, reward points, membership tier, and hash records',
    cartReview: 'Review selected services before payment',
    serviceDetail: 'Service detail',
    notFound: 'Not found',
    walletPinRequired: 'Wallet PIN is required.',
    checkoutFailed: 'Checkout failed',
    bookingCode: 'Booking code',
    amount: 'Amount',
    status: 'Status',
    transactionId: 'Transaction ID',
    transactionHash: 'Transaction hash',
    createdDate: 'Created date',
    qrReceiptTitle: 'QR Receipt',
    publicReceipt: 'Public receipt generated from booking code',
    membership: 'Membership',
    points: 'points',
    accountInfo: 'Account and role information',
    walletSubtitle: 'Travel credits, booking payments, refunds, reward points, and DApp-ready hash records',
    travelCredits: 'Travel credits',
    rewardPoints: 'Reward points',
    membershipTier: 'Membership tier',
    refundPending: 'Refund pending',
    topUpCredits: 'Top up travel credits',
    walletPinUpdated: 'Wallet PIN updated.',
    addPaymentSourceFirst: 'Add a payment source first.',
    depositAmount: 'Deposit amount VND',
    updatePin: 'Update PIN',
    noPaymentSources: 'No payment sources yet. Add one through the API or seed data.',
    dappBadge: 'DApp travel booking platform',
    exploreServices: 'Explore services',
    partnerAccess: 'Partner access',
    all: 'All',
    verifiedBooking: 'Verified booking',
    avgRating: 'Average rating',
    totalReviews: 'reviews',
    cancelBooking: 'Cancel booking',
    cancellationPolicy: 'Cancellation policy',
    freeCancel: 'Free cancellation before 24h',
    halfRefund: '50% refund within 24h',
    noRefund: 'No refund after service started',
    cancelReason: 'Cancellation reason',
    refundStatus: 'Refund status',
    receiptButton: 'QR receipt',
    reviewButton: 'Write review',
    refundRequests: 'Refund requests',
    cancellationRate: 'Cancellation rate',
    refundThisMonth: 'Refund this month',
    approve: 'Approve',
    reject: 'Reject',
    processRefund: 'Process refund',
    pendingRefunds: 'Pending refunds',
    refundHash: 'Refund hash',
  },
};

const serviceRoutes = [
  { to: '/services/cinema', type: 'cinema', labelVi: 'Vé xem phim', labelEn: 'Cinema', icon: Film },
  { to: '/services/stays', type: 'stays', labelVi: 'Khách sạn & Homestay', labelEn: 'Stays', icon: Hotel },
  { to: '/services/attractions', type: 'attraction', labelVi: 'Vé tham quan', labelEn: 'Attractions', icon: Landmark },
  { to: '/services/events', type: 'event', labelVi: 'Sự kiện & lễ hội', labelEn: 'Events', icon: Sparkles },
  { to: '/services/tours', type: 'local_tour', labelVi: 'Tour địa phương', labelEn: 'Local tours', icon: MapPin },
];

const cinemaBrands = ['CGV Cinemas', 'Lotte Cinema', 'Galaxy Cinema', 'Beta Cinemas', 'Cinestar'];
const stayProvinces = ['Da Nang', 'Hoi An', 'Hue', 'Da Lat', 'Nha Trang', 'Phu Quoc', 'Ha Noi', 'Ho Chi Minh'];
const attractionNames = ['Ba Na Hills', 'Ngu Hanh Son', 'Hoi An Ancient Town', 'Hue Imperial City', 'Trang An', 'Fansipan', 'Phong Nha', 'VinWonders'];
const eventKinds = ['Festival', 'Concert', 'Local event', 'Workshop', 'Cultural show'];
const tourKinds = ['Lo Lo Chai', 'Quynh Son', 'Bay Mau Coconut Forest', 'Food tour', 'Craft village', 'Community tour'];

function App() {
  return (
    <BrowserRouter>
      <TravChainApp />
    </BrowserRouter>
  );
}

function TravChainApp() {
  const [language, setLanguage] = useState<Language>('vi');
  const [currency, setCurrency] = useState<Currency>('VND');
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState<User | null>(() => readJson(USER_KEY, null));
  const [cart, setCart] = useState<CartItem[]>(() => readJson(CART_KEY, []));
  const [toast, setToast] = useState('');

  useEffect(() => localStorage.setItem(TOKEN_KEY, token), [token]);
  useEffect(() => localStorage.setItem(USER_KEY, JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);
  useEffect(() => {
    if (!token) return;
    api('/api/auth/me', { token })
      .then((response) => setUser(response.data || response.user))
      .catch(() => {
        setToken('');
        setUser(null);
      });
  }, [token]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const ctx = { language, currency, token, user, cart, setCart, setToast };

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#071126]">
      <Routes>
        <Route element={<CustomerLayout language={language} setLanguage={setLanguage} currency={currency} setCurrency={setCurrency} user={user} setUser={setUser} setToken={setToken} cartCount={cart.length} />}>
          <Route path="/" element={<LandingPage {...ctx} />} />
          <Route path="/login" element={<LoginPage language={language} setToken={setToken} setUser={setUser} />} />
          <Route path="/explore" element={<ExplorePage {...ctx} />} />
          <Route path="/services" element={<ServicesPage {...ctx} />} />
          <Route path="/services/cinema" element={<CinemaPage {...ctx} />} />
          <Route path="/services/stays" element={<StaysPage {...ctx} />} />
          <Route path="/services/attractions" element={<CategoryPage {...ctx} type="attraction" titleVi="Vé tham quan" titleEn="Attractions" presets={attractionNames} />} />
          <Route path="/services/events" element={<CategoryPage {...ctx} type="event" titleVi="Sự kiện & lễ hội" titleEn="Events & festivals" presets={eventKinds} />} />
          <Route path="/services/tours" element={<CategoryPage {...ctx} type="local_tour" titleVi="Tour địa phương" titleEn="Local tours" presets={tourKinds} />} />
          <Route path="/service/:id" element={<ServiceDetailPage {...ctx} />} />
          <Route path="/receipt/:bookingCode" element={<ReceiptPage language={language} currency={currency} />} />
          <Route element={<RequireRole user={user} token={token} roles={['traveler', 'admin']} />}>
            <Route path="/cart" element={<CartPage {...ctx} />} />
            <Route path="/checkout" element={<CheckoutPage {...ctx} />} />
            <Route path="/bookings" element={<BookingsPage {...ctx} />} />
            <Route path="/bookings/:id" element={<BookingDetailPage {...ctx} />} />
            <Route path="/passport" element={<PassportPage {...ctx} />} />
            <Route path="/wallet" element={<WalletPage {...ctx} />} />
            <Route path="/profile" element={<ProfilePage {...ctx} setUser={setUser} setToken={setToken} />} />
          </Route>
        </Route>
        <Route element={<RequireRole user={user} token={token} roles={['partner']} />}>
          <Route element={<PartnerLayout user={user} setUser={setUser} setToken={setToken} />}>
            <Route path="/partner/dashboard" element={<PartnerDashboardPage token={token} />} />
            <Route path="/partner/onboarding" element={<PartnerOnboardingPage />} />
            <Route path="/partner/services" element={<PartnerServicesPage token={token} />} />
            <Route path="/partner/services/:id" element={<PartnerServiceDetailPage token={token} />} />
            <Route path="/partner/services/:id/calendar" element={<PartnerCalendarPage />} />
            <Route path="/partner/services/:id/analytics" element={<PartnerAnalyticsPage token={token} />} />
            <Route path="/partner/bookings" element={<PartnerBookingsPage token={token} />} />
            <Route path="/partner/revenue" element={<PartnerRevenuePage token={token} />} />
            <Route path="/partner/wallet" element={<PartnerWalletPage token={token} />} />
            <Route path="/partner/payout" element={<PartnerPayoutPage token={token} setToast={setToast} />} />
            <Route path="/partner/reconciliation" element={<PartnerReconciliationPage token={token} />} />
            <Route path="/partner/refunds" element={<PartnerRefundsPage token={token} setToast={setToast} />} />
            <Route path="/partner/notifications" element={<NotificationsPage token={token} />} />
          </Route>
        </Route>
        <Route element={<RequireRole user={user} token={token} roles={['admin']} />}>
          <Route element={<AdminLayout user={user} setUser={setUser} setToken={setToken} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage token={token} />} />
            <Route path="/admin/users" element={<AdminUsersPage token={token} />} />
            <Route path="/admin/partners" element={<AdminPartnersPage token={token} />} />
            <Route path="/admin/services" element={<AdminServicesPage token={token} setToast={setToast} />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage token={token} />} />
            <Route path="/admin/revenue" element={<AdminRevenuePage token={token} />} />
            <Route path="/admin/refunds" element={<AdminRefundsPage token={token} setToast={setToast} />} />
            <Route path="/admin/logs" element={<AdminLogsPage token={token} />} />
          </Route>
        </Route>
      </Routes>
      {toast && <div className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl md:bottom-5 md:right-5 md:left-auto">{toast}</div>}
    </div>
  );
}

function CustomerLayout({ language, setLanguage, currency, setCurrency, user, setUser, setToken, cartCount }: {
  language: Language;
  setLanguage: (value: Language) => void;
  currency: Currency;
  setCurrency: (value: Currency) => void;
  user: User | null;
  setUser: (value: User | null) => void;
  setToken: (value: string) => void;
  cartCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const t = text[language];
  const nav = [
    ['/', t.explore],
    ['/services', t.services],
    ['/bookings', t.bookings],
    ['/passport', t.passport],
    ['/wallet', t.wallet],
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-orange-500 text-sm font-black text-white">TC</span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-black">TravChain</span>
              <span className="block truncate text-xs font-bold text-slate-500">All Travel One Tap</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map(([to, label]) => <NavItem key={to} to={to} label={label} />)}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="relative hidden rounded-full border border-orange-100 bg-orange-50 px-3 py-2 text-sm font-black text-orange-700 hover:bg-orange-100 sm:flex">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[11px] text-white">{cartCount}</span>}
            </Link>
            <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="hidden rounded-full border border-slate-200 px-3 py-2 text-sm font-black hover:bg-slate-50 sm:flex">
              <Languages className="mr-2 h-4 w-4" />{language.toUpperCase()}
            </button>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} className="hidden rounded-full border border-slate-200 px-3 py-2 text-sm font-black outline-none sm:block">
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
            {user ? (
              <UserMenu user={user} language={language} setUser={setUser} setToken={setToken} />
            ) : (
              <Link to="/login" className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white sm:block">{t.signIn}</Link>
            )}
            <button onClick={() => setMenuOpen(true)} className="rounded-xl border border-slate-200 p-2 lg:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="pb-20 lg:pb-0">
        <Outlet />
      </main>

      <MobileBottomNav language={language} />
      {menuOpen && <MobileDrawer language={language} setLanguage={setLanguage} currency={currency} setCurrency={setCurrency} close={() => setMenuOpen(false)} user={user} setUser={setUser} setToken={setToken} />}
      {authOpen && <AuthModal language={language} setToken={setToken} setUser={setUser} close={() => setAuthOpen(false)} />}
    </>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return <NavLink end={to === '/'} to={to} className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-black ${isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</NavLink>;
}

function UserMenu({ user, language, setUser, setToken }: { user: User; language: Language; setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const items: Record<Role, Array<[string, string]>> = {
    traveler: [
      ['/profile', text[language].profile],
      ['/bookings', language === 'vi' ? 'Đặt chỗ của tôi' : 'My Bookings'],
      ['/wallet', text[language].wallet],
      ['/passport', text[language].passportTitle],
    ],
    partner: [
      ['/partner/dashboard', 'Partner Dashboard'],
      ['/partner/services', 'Services'],
      ['/partner/bookings', 'Bookings'],
      ['/partner/wallet', 'Wallet'],
    ],
    admin: [
      ['/admin/dashboard', 'Admin Dashboard'],
      ['/admin/users', 'Users'],
      ['/admin/services', 'Services'],
      ['/admin/revenue', 'Revenue'],
    ],
  };

  function logout() {
    setUser(null);
    setToken('');
    setOpen(false);
  }

  return (
    <div className="relative hidden sm:block">
      <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-sm font-black text-white">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-500 text-xs">{user.name.slice(0, 1).toUpperCase()}</span>
        <span className="max-w-32 truncate">{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-slate-200">
          <div className="px-3 py-3">
            <p className="truncate font-black">{user.name}</p>
            <p className="truncate text-xs font-bold text-slate-500">{user.email} · {user.role}</p>
          </div>
          {items[user.role].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
              {label}
            </Link>
          ))}
          <button onClick={logout} className="mt-1 w-full rounded-2xl px-3 py-2 text-left text-sm font-black text-red-600 hover:bg-red-50">{text[language].logout}</button>
        </div>
      )}
    </div>
  );
}

function MobileBottomNav({ language }: { language: Language }) {
  const t = text[language];
  const items = [
    ['/', t.explore, Search],
    ['/services', t.services, TicketCheck],
    ['/bookings', t.bookings, ShoppingBag],
    ['/passport', t.passport, QrCode],
    ['/wallet', t.wallet, WalletCards],
  ] as const;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map(([to, label, Icon]) => (
          <NavLink end={to === '/'} key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-black ${isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-500'}`}>
            <Icon className="h-4 w-4" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function MobileDrawer({ language, setLanguage, currency, setCurrency, close, user, setUser, setToken }: {
  language: Language;
  setLanguage: (value: Language) => void;
  currency: Currency;
  setCurrency: (value: Currency) => void;
  close: () => void;
  user: User | null;
  setUser: (value: User | null) => void;
  setToken: (value: string) => void;
}) {
  const t = text[language];
  const roleLinks: Record<Role, Array<[string, string]>> = {
    traveler: [['/profile', t.profile], ['/bookings', language === 'vi' ? 'Đặt chỗ của tôi' : 'My Bookings'], ['/wallet', t.wallet], ['/passport', t.passportTitle]],
    partner: [['/partner/dashboard', 'Partner Dashboard'], ['/partner/services', 'Services'], ['/partner/bookings', 'Bookings'], ['/partner/wallet', 'Wallet']],
    admin: [['/admin/dashboard', 'Admin Dashboard'], ['/admin/users', 'Users'], ['/admin/services', 'Services'], ['/admin/revenue', 'Revenue']],
  };
  const links = user ? roleLinks[user.role] : [['/', t.explore], ['/services', t.services], ['/passport', t.passportTitle], ['/wallet', t.wallet]];
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm">
      <aside className="ml-auto h-full w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black">TravChain</p>
            <p className="text-xs font-bold text-slate-500">All Travel One Tap</p>
          </div>
          <button onClick={close} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 grid gap-2">
          {links.map(([to, label]) => <Link onClick={close} key={to} to={to} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black">{label}</Link>)}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black">{language.toUpperCase()}</button>
          <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black">
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </div>
        {!user ? (
          <Link onClick={close} to="/login" className="mt-4 block w-full rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white">{t.signIn}</Link>
        ) : (
          <button onClick={() => { setUser(null); setToken(''); close(); }} className="mt-4 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">{t.logout}</button>
        )}
      </aside>
    </div>
  );
}

function LandingPage(props: AppContext) {
  const { language } = props;
  const t = text[language];
  const { data: featured } = useServices('/api/services?limit=8');
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  return (
    <>
      <section className="relative overflow-hidden bg-[#050A1F] text-white">
        <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,10,31,0.82),rgba(5,10,31,0.58),rgba(255,90,0,0.28))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(255,186,92,0.26),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-black text-amber-100 backdrop-blur"><Sparkles className="h-4 w-4" />{t.dappBadge}</p>
            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">{t.heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/82">{t.heroBody}</p>
          </div>
          <SearchBar language={language} />
          <TrustBadges language={language} />
          <div className="mt-5 flex flex-wrap gap-2">
            {serviceRoutes.map((item) => <QuickChip key={item.to} to={item.to} label={language === 'vi' ? item.labelVi : item.labelEn} />)}
          </div>
        </div>
      </section>
      <div className="bg-[#F8F4EC]">
      <Section title={t.categoryAccess} subtitle={language === 'vi' ? 'Rạp phim, lưu trú, tham quan, sự kiện và tour địa phương' : 'Cinema, stays, attractions, events, local tours'}>
        <CategoryGrid language={language} />
      </Section>
      <HowItWorks language={language} />
      <Section title={t.featuredDestinations} subtitle={language === 'vi' ? 'Các điểm đến Việt Nam với gợi ý địa phương và tín hiệu du lịch bền vững' : 'Vietnam routes with local discovery and sustainable tourism signals'}>
        <DestinationGrid language={language} />
      </Section>
      <Section title={t.featuredServices} subtitle={language === 'vi' ? 'Tồn kho xác thực, biên nhận QR và dấu hộ chiếu du lịch' : 'Verified inventory, QR receipt, Travel Passport stamps'}>
        <ServiceGrid services={featured.slice(0, 8)} {...props} />
      </Section>
      <Testimonials language={language} />
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <InfoPanel
          title={t.passportTitle}
          body={language === 'vi'
            ? 'Dấu chuyến đi, biên nhận QR, điểm thưởng, hạng thành viên và mã hash trong một hồ sơ du lịch.'
            : 'Trip stamps, QR receipts, reward points, membership tier, and simulated hash records in one travel identity.'}
          to="/passport"
          language={language}
        />
        <PartnerCtaPanel user={props.user} language={language} title={t.partnerCta} body={t.partnerBody} openTravelerModal={() => setPartnerModalOpen(true)} />
      </section>
      </div>
      {partnerModalOpen && <TravelerPartnerModal language={language} close={() => setPartnerModalOpen(false)} />}
    </>
  );
}

function SearchBar({ language }: { language: Language }) {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [guests, setGuests] = useState(2);
  const navigate = useNavigate();
  const t = text[language];
  return (
    <form onSubmit={(event) => { event.preventDefault(); navigate(`/services?destination=${encodeURIComponent(destination)}&date=${date}&guests=${guests}`); }} className="mt-9 grid overflow-hidden rounded-[1.75rem] border border-white/40 bg-white/95 p-2 text-slate-950 shadow-2xl shadow-slate-950/18 backdrop-blur sm:grid-cols-[1fr_170px_130px_140px]">
      <label className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-4 py-4 sm:border-b-0 sm:border-r">
        <Search className="h-5 w-5 shrink-0 text-orange-500" />
        <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={t.destination} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" />
      </label>
      <label className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:border-b-0 sm:border-r">
        <CalendarDays className="h-5 w-5 text-orange-500" />
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-w-0 bg-transparent text-sm font-bold outline-none" />
      </label>
      <label className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 sm:border-b-0 sm:border-r">
        <UserRound className="h-5 w-5 text-orange-500" />
        <input type="number" min={1} value={guests} onChange={(event) => setGuests(Number(event.target.value))} className="min-w-0 bg-transparent text-sm font-bold outline-none" />
      </label>
      <button className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600">{t.search}<ChevronRight className="h-4 w-4" /></button>
    </form>
  );
}

function TrustBadges({ language }: { language: Language }) {
  const t = text[language];
  const badges = [
    [QrCode, t.qrReceipt],
    [ShieldCheck, t.transparentHash],
    [Star, t.partnerVerified],
    [MapPin, t.localDiscovery],
  ] as const;
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map(([Icon, label]) => (
        <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/18 bg-white/14 px-4 py-3 text-sm font-black text-white/88 backdrop-blur">
          <Icon className="h-5 w-5 text-amber-200" />
          {label}
        </div>
      ))}
    </div>
  );
}

function CategoryGrid({ language }: { language: Language }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {serviceRoutes.map(({ to, labelVi, labelEn, icon: Icon }) => (
        <Link key={to} to={to} className="group rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-sm shadow-orange-100/40 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600"><Icon className="h-6 w-6" /></span>
          <p className="mt-4 font-black">{language === 'vi' ? labelVi : labelEn}</p>
          <p className="mt-2 text-sm font-medium text-slate-500">{language === 'vi' ? 'Kho dịch vụ được tuyển chọn' : 'Browse curated inventory'}</p>
        </Link>
      ))}
    </div>
  );
}

function HowItWorks({ language }: { language: Language }) {
  const steps = language === 'vi'
    ? [
        [Search, 'Tìm kiếm', 'Nhập điểm đến, ngày đi và số khách.'],
        [TicketCheck, 'Chọn dịch vụ', 'So sánh tồn kho, giá, đánh giá và chính sách.'],
        [CreditCard, 'Thanh toán', 'Chọn ví TravChain, thẻ quốc tế hoặc QR nội địa.'],
        [QrCode, 'Nhận QR', 'Biên nhận chứa mã đặt chỗ, số tiền và hash.'],
        [Sparkles, 'Lưu dấu hộ chiếu', 'Hành trình được lưu vào Hộ chiếu du lịch.'],
      ]
    : [
        [Search, 'Search', 'Enter destination, date, and guest count.'],
        [TicketCheck, 'Choose service', 'Compare inventory, price, reviews, and policy.'],
        [CreditCard, 'Pay', 'Use TravChain Wallet, card, or domestic QR.'],
        [QrCode, 'QR receipt', 'Receipt includes booking code, amount, and hash.'],
        [Sparkles, 'Passport stamp', 'The trip is saved into Travel Passport.'],
      ];
  return (
    <Section title={text[language].howTitle} subtitle={language === 'vi' ? 'Một luồng đặt dịch vụ rõ ràng, có hash và lịch sử chuyến đi.' : 'A clear booking flow with hash receipt and trip history.'}>
      <div className="relative grid gap-4 md:grid-cols-5">
        <div className="absolute left-8 right-8 top-9 hidden h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent md:block" />
        {steps.map(([Icon, title, body], index) => (
          <div key={title as string} className="relative rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(255,90,0,0.12)]">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#050A1F] text-white shadow-lg shadow-slate-950/15"><Icon className="h-5 w-5" /></span>
            <p className="mt-4 font-black text-[#071126]">{index + 1}. {title as string}</p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">{body as string}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Testimonials({ language }: { language: Language }) {
  const state = usePublic<any[]>('/api/reviews/featured', []);
  const fallback = language === 'vi'
    ? [
        { userId: { name: 'Minh Anh' }, rating: 5, serviceBooked: 'Ba Na Hills Day Pass', createdAt: new Date().toISOString(), comment: 'Đặt vé tham quan và nhận QR rất nhanh, không phải đổi qua nhiều ứng dụng.' },
        { userId: { name: 'Kenji' }, rating: 5, serviceBooked: 'Hoi An Lantern Festival', createdAt: new Date().toISOString(), comment: 'Biên nhận có hash giúp tôi dễ kiểm tra lại lịch sử thanh toán.' },
        { userId: { name: 'Linh' }, rating: 4, serviceBooked: 'Lo Lo Chai Village Tour', createdAt: new Date().toISOString(), comment: 'Các tour địa phương được trình bày rõ và dễ thêm vào giỏ.' },
      ]
    : [
        { userId: { name: 'Minh Anh' }, rating: 5, serviceBooked: 'Ba Na Hills Day Pass', createdAt: new Date().toISOString(), comment: 'Attraction booking and QR receipt were fast without switching apps.' },
        { userId: { name: 'Kenji' }, rating: 5, serviceBooked: 'Hoi An Lantern Festival', createdAt: new Date().toISOString(), comment: 'The hash receipt makes payment history easy to verify.' },
        { userId: { name: 'Linh' }, rating: 4, serviceBooked: 'Lo Lo Chai Village Tour', createdAt: new Date().toISOString(), comment: 'Local tours are clear and easy to add to cart.' },
      ];
  const reviews = state.data.length ? state.data : fallback;
  const average = reviews.length ? reviews.reduce((sum: number, item: any) => sum + Number(item.rating || 0), 0) / reviews.length : 0;
  return (
    <Section title={text[language].testimonials} subtitle={language === 'vi' ? 'Tín hiệu niềm tin cho trải nghiệm du lịch số.' : 'Trust signals for a digital travel experience.'}>
      <div className="mb-5 flex flex-col gap-3 rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-3xl font-black text-[#071126]">{average.toFixed(1)}/5</p>
          <p className="mt-1 text-sm font-bold text-[#667085]">{text[language].avgRating}</p>
        </div>
        <div className="flex items-center gap-2 text-[#FF5A00]"><Stars value={Math.round(average)} /></div>
        <p className="text-sm font-black text-[#667085]">{reviews.length} {text[language].totalReviews}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.slice(0, 3).map((review: any) => {
          const name = review.userId?.name || 'TravChain Traveler';
          return (
          <article key={`${name}-${review.comment}`} className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)] transition duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#050A1F] font-black text-white">{name.slice(0, 1)}</span>
              <div>
                <p className="font-black text-[#071126]">{name}</p>
                <p className="text-xs font-bold text-[#667085]">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[#FF5A00]"><Stars value={review.rating} /></div>
            <p className="mt-3 text-sm font-black text-[#071126]">{review.serviceBooked || review.serviceId?.title || 'TravChain service'}</p>
            <p className="mt-2 leading-7 text-[#667085]">{review.comment}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#FF5A00]"><ShieldCheck className="h-3.5 w-3.5" />{text[language].verifiedBooking}</span>
          </article>
        );})}
      </div>
    </Section>
  );
}

function Stars({ value }: { value: number }) {
  return <>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < value ? 'fill-current' : 'text-slate-200'}`} />)}</>;
}

function ExplorePage(props: AppContext) {
  return (
    <Section title={props.language === 'vi' ? 'Khám phá điểm đến' : 'Explore destinations'} subtitle={props.language === 'vi' ? 'Khám phá địa phương trước cho hành trình tại Việt Nam' : 'Local-first discovery for Vietnam travel'}>
      <DestinationGrid language={props.language} />
    </Section>
  );
}

function ServicesPage(props: AppContext) {
  const [params] = useSearchParams();
  const destination = params.get('destination') || '';
  const { data, loading, error } = useServices(`/api/services?limit=50${destination ? `&destination=${encodeURIComponent(destination)}` : ''}`);
  return <CatalogLayout title={props.language === 'vi' ? 'Tất cả dịch vụ' : 'All services'} subtitle={props.language === 'vi' ? 'Tìm kiếm kho dịch vụ du lịch có thể đặt ngay' : 'Searchable booking inventory'} services={data} loading={loading} error={error} {...props} />;
}

function CinemaPage(props: AppContext) {
  const [brand, setBrand] = useState('');
  const [province, setProvince] = useState('');
  const qs = `/api/services?type=cinema&limit=50${brand ? `&providerBrand=${encodeURIComponent(brand)}` : ''}${province ? `&province=${encodeURIComponent(province)}` : ''}`;
  const { data, loading, error } = useServices(qs);
  return (
    <CatalogLayout title={props.language === 'vi' ? 'Vé xem phim' : 'Cinema tickets'} subtitle={props.language === 'vi' ? 'Chọn thương hiệu rạp, chi nhánh thành phố và gói vé/suất chiếu' : 'Choose a cinema brand, city branch, then ticket bundle/showtime'} services={data} loading={loading} error={error} {...props}>
      <FilterPanel>
        <ChipGroup language={props.language} label={props.language === 'vi' ? 'Thương hiệu rạp' : 'Cinema brand'} values={cinemaBrands} selected={brand} setSelected={setBrand} />
        <ChipGroup language={props.language} label={props.language === 'vi' ? 'Thành phố' : 'City'} values={['Da Nang', 'Ha Noi', 'Ho Chi Minh']} selected={province} setSelected={setProvince} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function StaysPage(props: AppContext) {
  const [province, setProvince] = useState('');
  const [stayType, setStayType] = useState('');
  const type = stayType || 'stays';
  const { data, loading, error } = useServices(`/api/services?type=${type}&limit=50${province ? `&province=${encodeURIComponent(province)}` : ''}`);
  return (
    <CatalogLayout title={props.language === 'vi' ? 'Khách sạn & Homestay' : 'Hotels & homestays'} subtitle={props.language === 'vi' ? 'Lọc theo tỉnh, loại lưu trú, đánh giá và số khách phù hợp' : 'Filter by province, stay type, rating and guest fit'} services={data} loading={loading} error={error} {...props}>
      <FilterPanel>
        <ChipGroup language={props.language} label={props.language === 'vi' ? 'Tỉnh/thành' : 'Province'} values={stayProvinces} selected={province} setSelected={setProvince} />
        <ChipGroup language={props.language} label={props.language === 'vi' ? 'Loại' : 'Type'} values={['hotel', 'homestay']} selected={stayType} setSelected={setStayType} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function CategoryPage(props: AppContext & { type: ServiceType; titleVi: string; titleEn: string; presets: string[] }) {
  const [province, setProvince] = useState('');
  const { data, loading, error } = useServices(`/api/services?type=${props.type}&limit=50${province ? `&province=${encodeURIComponent(province)}` : ''}`);
  return (
    <CatalogLayout title={props.language === 'vi' ? props.titleVi : props.titleEn} subtitle={props.language === 'vi' ? 'Chọn điểm đến, ngày sử dụng, khoảng giá và nhà cung cấp' : 'Choose a destination, date, price band, and provider'} services={data} loading={loading} error={error} {...props}>
      <FilterPanel>
        <ChipGroup language={props.language} label={props.language === 'vi' ? 'Phổ biến' : 'Popular'} values={props.presets} selected="" setSelected={() => undefined} />
        <ChipGroup language={props.language} label={props.language === 'vi' ? 'Tỉnh/thành' : 'Province'} values={stayProvinces} selected={province} setSelected={setProvince} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function CatalogLayout({ title, subtitle, services, loading, error, children, ...props }: AppContext & { title: string; subtitle: string; services: Service[]; loading: boolean; error: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">TravChain</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">{subtitle}</p>
        </div>
        <Link to="/cart" className="w-fit rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{text[props.language].viewCart}</Link>
      </div>
      {children}
      {loading ? <SkeletonGrid /> : error ? <StateBox text={error} /> : <ServiceGrid services={services} {...props} />}
    </section>
  );
}

function ServiceGrid({ services, language, currency, cart, setCart, setToast }: AppContext & { services: Service[] }) {
  if (!services.length) return <StateBox text={text[language].empty} />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {services.map((service) => <ServiceCard key={service._id} service={service} language={language} currency={currency} cart={cart} setCart={setCart} setToast={setToast} />)}
    </div>
  );
}

function ServiceCard({ service, language, currency, cart, setCart, setToast }: Pick<AppContext, 'language' | 'currency' | 'cart' | 'setCart' | 'setToast'> & { service: Service }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/service/${service._id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-slate-100">
          <img src={service.coverImage || FALLBACK_IMAGE} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">{service.providerBrand || service.type}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{service.province}</span>
        </div>
        <Link to={`/service/${service._id}`} className="line-clamp-2 text-lg font-black hover:text-orange-600">{service.title}</Link>
        <p className="mt-2 flex items-center gap-1 text-sm font-bold text-slate-500"><MapPin className="h-4 w-4 text-orange-500" />{service.location}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm font-black"><Star className="mr-1 inline h-4 w-4 fill-orange-400 text-orange-400" />{service.rating} <span className="text-slate-400">({service.reviewCount})</span></p>
          <p className="font-black">{money(service.priceVnd, currency)}</p>
        </div>
        <button onClick={() => addCart(service, cart, setCart, setToast, language)} className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-orange-600">{text[language].addCart}</button>
      </div>
    </article>
  );
}

function ServiceDetailPage(props: AppContext) {
  const { id } = useParams();
  const { data: service, loading, error } = useService(id || '');
  const reviews = useReviews(id || '');
  const t = text[props.language];
  if (loading) return <Section title={t.serviceDetail} subtitle=""><SkeletonGrid /></Section>;
  if (error || !service) return <Section title={t.serviceDetail} subtitle=""><StateBox text={error || t.notFound} /></Section>;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            <img src={service.coverImage} className="aspect-[16/10] w-full rounded-3xl object-cover sm:col-span-2 sm:row-span-2 sm:h-full" />
            {(service.gallery || []).slice(1, 3).map((image) => <img key={image} src={image} className="aspect-[16/10] w-full rounded-3xl object-cover" />)}
          </div>
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">{service.providerBrand}</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">{service.title}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
              <span><Star className="mr-1 inline h-4 w-4 fill-orange-400 text-orange-400" />{service.rating} ({service.reviewCount})</span>
              <span><MapPin className="mr-1 inline h-4 w-4 text-orange-500" />{service.location}</span>
              <span><CalendarDays className="mr-1 inline h-4 w-4 text-orange-500" />{service.duration}</span>
            </div>
            <p className="mt-6 leading-8 text-slate-700">{service.detail || service.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(service.highlights || []).map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700"><ShieldCheck className="mr-2 inline h-4 w-4 text-orange-500" />{item}</div>)}
            </div>
          </div>
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-black">{t.reviews}</h2>
            <div className="mt-4 grid gap-3">
              {reviews.map((review: any) => <div key={review._id} className="rounded-2xl bg-slate-50 p-4"><p className="font-black">{review.rating}/5</p><p className="mt-1 text-sm text-slate-600">{review.comment}</p></div>)}
              {!reviews.length && <p className="text-sm font-bold text-slate-500">{t.noReviews}</p>}
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-24">
          <p className="text-sm font-bold text-slate-500">{t.from}</p>
          <p className="mt-1 text-3xl font-black">{money(service.priceVnd, props.currency)}</p>
          <p className="mt-3 text-sm font-bold text-slate-500">{service.availability} {t.slotsAvailable}</p>
          <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm font-bold text-orange-800">{service.cancellationPolicy}</p>
          <button onClick={() => addCart(service, props.cart, props.setCart, props.setToast, props.language)} className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600">{text[props.language].addCart}</button>
          <Link to="/checkout" onClick={() => addCart(service, props.cart, props.setCart, props.setToast, props.language)} className="mt-3 block rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white">{text[props.language].bookNow}</Link>
        </aside>
      </div>
    </section>
  );
}

function CartPage(props: AppContext) {
  const total = cartTotal(props.cart);
  return (
    <Section title={text[props.language].checkout} subtitle={text[props.language].cartReview}>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-3">
          {props.cart.map((item) => <CartRow key={`${item.service._id}-${item.date}`} item={item} {...props} />)}
          {!props.cart.length && <StateBox text={text[props.language].cartEmpty} />}
        </div>
        <CheckoutSummary total={total} currency={props.currency} language={props.language} />
      </div>
    </Section>
  );
}

function CartRow({ item, cart, setCart, currency, language }: AppContext & { item: CartItem }) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row">
      <img src={item.service.coverImage} className="aspect-[4/3] w-full rounded-2xl object-cover sm:w-40" />
      <div className="min-w-0 flex-1">
        <p className="font-black">{item.service.title}</p>
        <p className="mt-1 text-sm font-bold text-slate-500">{item.date} · {item.guests} {language === 'vi' ? 'khách' : 'guests'} · {item.quantity}x</p>
        <p className="mt-3 font-black">{money(item.service.priceVnd * item.quantity, currency)}</p>
      </div>
      <button onClick={() => setCart(cart.filter((target) => target !== item))} className="h-fit rounded-2xl border border-slate-200 p-3 text-orange-600"><Trash2 className="h-5 w-5" /></button>
    </article>
  );
}

function CheckoutPage(props: AppContext) {
  const [method, setMethod] = useState<PaymentMethod>('wallet');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any | null>(null);
  const t = text[props.language];
  const total = cartTotal(props.cart);
  const fee = Math.round(total * 0.01);
  const grandTotal = total + fee;

  async function confirm() {
    if (!props.user || !props.token) return props.setToast(text[props.language].loginRequired);
    if (!props.cart.length) return props.setToast(text[props.language].cartEmpty);
    if (method === 'wallet' && !pin) return props.setToast(t.walletPinRequired);
    setBusy(true);
    setError('');
    try {
      const body = {
        items: props.cart.map((item) => ({ serviceId: item.service._id, quantity: item.quantity, guests: item.guests, date: item.date })),
        displayCurrency: props.currency,
      };
      const response = method === 'wallet'
        ? await api('/api/wallet/pay-booking', { method: 'POST', token: props.token, body: { ...body, pin } })
        : await api('/api/bookings', { method: 'POST', token: props.token, body: { ...body, paymentMethod: method } });
      const booking = response.data?.booking || response.data;
      const qrPayload = response.data?.qrPayload || `TRAVCHAIN|bookingCode=${booking.bookingCode}|amount=${booking.totalVnd}|method=${booking.paymentMethod}|hash=${booking.transactionHash}`;
      props.setCart([]);
      setSuccess({ ...booking, qrPayload });
      props.setToast(`${t.bookingSuccess}: ${booking.bookingCode}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.checkoutFailed;
      setError(message);
      props.setToast(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title={t.checkout} subtitle={t.choosePayment}>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black">{t.paymentMethod}</h2>
          <div className="mt-4 grid gap-3">
            {[
              ['wallet', t.travchainWallet, props.language === 'vi' ? 'Thanh toán bằng số dư ví và mã PIN.' : 'Pay with wallet balance and PIN.', WalletCards],
              ['card', t.internationalCard, props.language === 'vi' ? 'Xác nhận bằng bản ghi thanh toán mô phỏng.' : 'Confirm with a simulated card payment record.', CreditCard],
              ['qr', t.domesticQr, props.language === 'vi' ? 'Tạo đặt chỗ và biên nhận QR nội địa.' : 'Create booking and domestic QR receipt.', QrCode],
            ].map(([value, label, description, Icon]: any) => (
              <button key={value} onClick={() => setMethod(value)} className={`flex items-start justify-between rounded-2xl border p-4 text-left transition ${method === value ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-sm' : 'border-slate-200 hover:border-orange-200'}`}>
                <span className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 text-orange-500" />
                  <span>
                    <span className="block font-black">{label}</span>
                    <span className="mt-1 block text-sm font-medium text-slate-500">{description}</span>
                  </span>
                </span>
                {method === value && <ShieldCheck className="h-5 w-5" />}
              </button>
            ))}
          </div>
          {method === 'wallet' && <input value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder={props.language === 'vi' ? 'Mã PIN ví' : 'Wallet PIN'} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500" />}
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">{t.securityNote}</p>
          {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
        </div>
        <div className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/15">
          <p className="text-xl font-black">{t.orderSummary}</p>
          <div className="mt-4 space-y-3">
            {props.cart.map((item) => (
              <div key={`${item.service._id}-${item.date}`} className="rounded-2xl bg-white/8 p-3">
                <p className="font-black">{item.service.title}</p>
                <p className="mt-1 text-xs font-bold text-white/55">{item.date} · {item.guests} {props.language === 'vi' ? 'khách' : 'guests'} · {item.quantity}x</p>
                <p className="mt-2 text-sm font-black">{money(item.service.priceVnd * item.quantity, props.currency)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm font-bold">
            <div className="flex justify-between"><span className="text-white/55">{t.subtotal}</span><span>{money(total, props.currency)}</span></div>
            <div className="flex justify-between"><span className="text-white/55">{t.serviceFee}</span><span>{money(fee, props.currency)}</span></div>
            <div className="flex justify-between text-lg font-black"><span>{t.total}</span><span>{money(grandTotal, props.currency)}</span></div>
          </div>
          <button disabled={busy} onClick={confirm} className="mt-6 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25 disabled:opacity-60">{busy ? t.processing : t.confirmBooking}</button>
        </div>
      </div>
      {success && <BookingSuccessModal booking={success} currency={props.currency} language={props.language} close={() => setSuccess(null)} />}
    </Section>
  );
}

function BookingSuccessModal({ booking, currency, language, close }: { booking: any; currency: Currency; language: Language; close: () => void }) {
  const t = text[language];
  const qrPayload = booking.qrPayload || `TRAVCHAIN|bookingCode=${booking.bookingCode}|amount=${booking.totalVnd}|method=${booking.paymentMethod}|hash=${booking.transactionHash}`;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">TravChain</p>
            <h2 className="mt-1 text-3xl font-black">{t.bookingSuccess}</h2>
          </div>
          <button onClick={close} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-[180px_1fr]">
          <QrMock value={qrPayload} />
          <div className="min-w-0 rounded-3xl bg-slate-50 p-4">
            <Detail label={t.bookingCode} value={booking.bookingCode} />
            <Detail label={t.paymentMethod} value={booking.paymentMethod === 'qr' ? t.domesticQr : booking.paymentMethod === 'card' ? t.internationalCard : t.travchainWallet} />
            <Detail label={t.total} value={money(booking.totalVnd, currency)} />
            <Detail label={t.transactionHash} value={booking.transactionHash} />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to={`/receipt/${booking.bookingCode}`} onClick={close} className="flex-1 rounded-2xl bg-orange-500 px-5 py-3 text-center text-sm font-black text-white hover:bg-orange-600">{t.viewReceipt}</Link>
          <Link to="/bookings" onClick={close} className="flex-1 rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white">{t.viewMyBookings}</Link>
        </div>
      </div>
    </div>
  );
}

function BookingsPage(props: AppContext) {
  const { data, loading, error } = useAuthed<Booking[]>('/api/bookings/my', props.token, []);
  return (
    <Section title={text[props.language].bookings} subtitle={text[props.language].receiptHistory}>
      {loading ? <SkeletonGrid /> : error ? <StateBox text={error} /> : (
        <div className="grid gap-4">
          {data.map((booking) => <BookingCard key={booking._id} booking={booking} currency={props.currency} />)}
          {!data.length && <StateBox text={text[props.language].empty} />}
        </div>
      )}
    </Section>
  );
}

function BookingCard({ booking, currency }: { booking: Booking; currency: Currency }) {
  return (
    <Link to={`/bookings/${booking._id}`} className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_auto]">
      <div>
        <p className="text-sm font-black text-orange-600">{booking.bookingCode}</p>
        <h3 className="mt-1 text-xl font-black">{booking.items?.[0]?.titleSnapshot || 'TravChain booking'}</h3>
        <p className="mt-2 text-sm font-bold text-slate-500">{new Date(booking.createdAt).toLocaleString()}</p>
      </div>
      <div className="md:text-right">
        <p className="text-xl font-black">{money(booking.totalVnd, currency)}</p>
        <p className="mt-1 text-xs font-black uppercase text-slate-400">{booking.paymentMethod} · {booking.paymentStatus}</p>
      </div>
    </Link>
  );
}

function BookingDetailPage(props: AppContext) {
  const { id } = useParams();
  const { data, loading, error } = useAuthed<Booking | null>(`/api/bookings/${id}`, props.token, null);
  const refunds = useAuthed<Refund[]>('/api/refunds/my', props.token, []);
  const [busy, setBusy] = useState(false);
  const t = text[props.language];
  const refund = refunds.data.find((item) => item.bookingId?._id === data?._id || String(item.bookingId) === data?._id);
  async function cancelBooking() {
    if (!data) return;
    const reason = window.prompt(t.cancelReason, props.language === 'vi' ? 'Thay đổi kế hoạch' : 'Change of plans') || 'Traveler cancellation';
    setBusy(true);
    try {
      const response = await api(`/api/bookings/${data._id}/cancel`, { method: 'PATCH', token: props.token, body: { reason } });
      props.setToast(`${t.refundStatus}: ${response.data?.refund?.status || 'requested'}`);
      window.location.reload();
    } catch (err) {
      props.setToast(err instanceof Error ? err.message : t.checkoutFailed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Section title={t.bookingDetail} subtitle={t.receiptHash}>
      {loading ? <SkeletonGrid /> : error || !data ? <StateBox text={error || t.notFound} /> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
            <p className="text-sm font-black text-[#FF5A00]">{data.bookingCode}</p>
            <h2 className="mt-2 text-2xl font-black">{data.items?.[0]?.titleSnapshot || 'TravChain booking'}</h2>
            <div className="mt-5 grid gap-3">
              {data.items.map((item) => (
                <div key={`${item.serviceId}-${item.date}`} className="rounded-2xl bg-[#F8F4EC] p-4">
                  <p className="font-black">{item.titleSnapshot}</p>
                  <p className="mt-1 text-sm font-bold text-[#667085]">{item.locationSnapshot} · {item.date} · {item.guests} {props.language === 'vi' ? 'khách' : 'guests'}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Detail label={t.paymentMethod} value={data.paymentMethod === 'qr' ? t.domesticQr : data.paymentMethod === 'card' ? t.internationalCard : t.travchainWallet} />
              <Detail label={t.status} value={`${data.status || 'confirmed'} · ${data.paymentStatus}`} />
              <Detail label={t.total} value={money(data.totalVnd, props.currency)} />
              <Detail label={t.transactionHash} value={data.transactionHash} mono />
            </div>
          </div>
          <aside className="h-fit rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
            <p className="text-xl font-black">{t.cancellationPolicy}</p>
            <ul className="mt-4 space-y-3 text-sm font-bold text-[#667085]">
              <li>{t.freeCancel}</li>
              <li>{t.halfRefund}</li>
              <li>{t.noRefund}</li>
            </ul>
            {refund && <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-bold text-[#FF5A00]"><p>{t.refundStatus}: {refund.status}</p><p className="mt-1 break-all">{t.refundHash}: {refund.refundHash}</p></div>}
            <Link to={`/receipt/${data.bookingCode}`} className="mt-5 block rounded-2xl bg-[#050A1F] px-5 py-3 text-center text-sm font-black text-white">{t.receiptButton}</Link>
            {data.status === 'completed' && <button className="mt-3 w-full rounded-2xl border border-orange-200 px-5 py-3 text-sm font-black text-[#FF5A00]">{t.reviewButton}</button>}
            {(!data.status || ['confirmed', 'pending'].includes(data.status)) && <button disabled={busy} onClick={cancelBooking} className="mt-3 w-full rounded-2xl bg-[#FF5A00] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{t.cancelBooking}</button>}
          </aside>
        </div>
      )}
    </Section>
  );
}

function PassportPage(props: AppContext) {
  const stamps = useAuthed<any[]>('/api/passport/stamps', props.token, []);
  const membership = useAuthed<any>('/api/membership', props.token, null);
  return (
    <Section title={text[props.language].passportTitle} subtitle={text[props.language].passportSubtitle}>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-white/50">{text[props.language].membership}</p>
          <p className="mt-2 text-3xl font-black">{membership.data?.tier || 'Explorer'}</p>
          <p className="mt-1 text-sm font-bold text-orange-200">{membership.data?.points || 0} {text[props.language].points}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stamps.data.map((stamp: any) => <div key={stamp._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="font-black">{stamp.titleSnapshot}</p><p className="mt-1 text-sm font-bold text-slate-500">{stamp.locationSnapshot}</p><code className="mt-3 block break-all rounded-2xl bg-slate-50 p-3 text-xs">{stamp.stampHash}</code></div>)}
          {!stamps.data.length && <StateBox text={text[props.language].empty} />}
        </div>
      </div>
    </Section>
  );
}

function WalletPage(props: AppContext) {
  const [tab, setTab] = useState<'overview' | 'sources' | 'transactions' | 'refunds' | 'security'>('overview');
  const wallet = useAuthed<Wallet | null>('/api/wallet', props.token, null);
  const sources = useAuthed<PaymentSource[]>('/api/payment-sources', props.token, []);
  const transactions = useAuthed<WalletTransaction[]>('/api/wallet/transactions', props.token, []);
  const refunds = useAuthed<Refund[]>('/api/refunds/my', props.token, []);
  const [selected, setSelected] = useState<WalletTransaction | null>(null);
  const [pin, setPin] = useState('');

  async function setWalletPin(event: FormEvent) {
    event.preventDefault();
    await api('/api/wallet/set-pin', { method: 'POST', token: props.token, body: { pin } });
    setPin('');
    props.setToast(text[props.language].walletPinUpdated);
  }

  async function deposit() {
    const source = sources.data.find((item) => item.isPrimary) || sources.data[0];
    if (!source) return props.setToast(text[props.language].addPaymentSourceFirst);
    const amount = Number(window.prompt(text[props.language].depositAmount, '1000000'));
    if (!amount) return;
    await api('/api/wallet/deposit', { method: 'POST', token: props.token, body: { amount, currency: 'VND', paymentSourceId: source._id } });
    window.location.reload();
  }

  if (!props.token) return <Section title={text[props.language].travchainWallet} subtitle={props.language === 'vi' ? 'Ví đặt dịch vụ du lịch' : 'Travel booking wallet'}><StateBox text={text[props.language].loginRequired} /></Section>;
  const tabs = [
    ['overview', props.language === 'vi' ? 'Tổng quan' : 'Overview'],
    ['sources', props.language === 'vi' ? 'Nguồn thanh toán' : 'Payment Sources'],
    ['transactions', props.language === 'vi' ? 'Giao dịch' : 'Transactions'],
    ['refunds', props.language === 'vi' ? 'Hoàn tiền' : 'Refunds'],
    ['security', props.language === 'vi' ? 'Bảo mật' : 'Security'],
  ] as const;
  return (
    <Section title={text[props.language].travchainWallet} subtitle={text[props.language].walletSubtitle}>
      <div className="mb-5 flex flex-wrap gap-2">{tabs.map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`rounded-full px-4 py-2 text-sm font-black ${tab === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{label}</button>)}</div>
      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric label="TravChain Balance" value={money(wallet.data?.vndBalance || 0, 'VND')} />
            <Metric label="USD reference" value={`~$${Math.round((wallet.data?.vndBalance || 0) / USD_RATE).toLocaleString('en-US')}`} />
            <Metric label={text[props.language].refundPending} value={money(wallet.data?.pendingBalance || 0, 'VND')} />
            <Metric label={text[props.language].travelCredits} value={money(wallet.data?.vndBalance || 0, props.currency)} />
            <Metric label={text[props.language].rewardPoints} value={(wallet.data?.rewardPoints || 0).toLocaleString('en-US')} />
            <Metric label={text[props.language].membershipTier} value={wallet.data?.membershipTier || 'Explorer'} />
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="font-black">DApp ready</p>
            <p className="mt-2 text-sm font-medium leading-6 text-white/62">Customer UI hides crypto balance in MVP. Booking receipts still keep simulated blockchain hash records for future on-chain support.</p>
            <button onClick={deposit} className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black">{text[props.language].topUpCredits}</button>
          </div>
        </div>
      )}
      {tab === 'sources' && <SourceList sources={sources.data} language={props.language} />}
      {tab === 'transactions' && <TransactionList transactions={transactions.data} setSelected={setSelected} />}
      {tab === 'refunds' && <RefundList refunds={refunds.data} language={props.language} currency={props.currency} />}
      {tab === 'security' && <form onSubmit={setWalletPin} className="max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="font-black">Wallet PIN</p><input value={pin} onChange={(event) => setPin(event.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="1234" /><button className="mt-3 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{text[props.language].updatePin}</button></form>}
      {selected && <TransactionModal transaction={selected} language={props.language} close={() => setSelected(null)} />}
    </Section>
  );
}

function SourceList({ sources, language }: { sources: PaymentSource[]; language: Language }) {
  if (!sources.length) return <StateBox text={text[language].noPaymentSources} />;
  return <div className="grid gap-3 md:grid-cols-2">{sources.map((source) => <div key={source._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="font-black">{source.providerName}</p><p className="mt-1 text-sm font-bold text-slate-500">{source.maskedNumber} · {source.currency}</p>{source.isPrimary && <span className="mt-3 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">Primary</span>}</div>)}</div>;
}

function TransactionList({ transactions, setSelected }: { transactions: WalletTransaction[]; setSelected: (value: WalletTransaction) => void }) {
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? transactions : transactions.filter((item) => item.type === filter);
  const filters = ['all', 'booking_payment', 'deposit', 'refund', 'reward', 'fee', 'withdraw'];
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-black ${filter === item ? 'bg-orange-500 text-white' : 'bg-white ring-1 ring-slate-200'}`}>{item}</button>)}</div>
      <div className="grid gap-3">{visible.map((tx) => <button key={tx._id} onClick={() => setSelected(tx)} className="grid gap-2 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 sm:grid-cols-[1fr_auto]"><div><p className="font-black">{tx.description || tx.type}</p><p className="mt-1 text-xs font-black uppercase text-slate-400">{tx.type} · {tx.status}</p></div><p className="font-black">{walletAmount(tx.amount, tx.currency)}</p></button>)}</div>
    </div>
  );
}

function TransactionModal({ transaction, language, close }: { transaction: WalletTransaction; language: Language; close: () => void }) {
  const t = text[language];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">Transaction</p><h2 className="mt-1 text-2xl font-black">{transaction.referenceCode}</h2></div><button onClick={close} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button></div>
        <div className="mt-5 grid gap-3">
          <Detail label={t.transactionId} value={transaction._id} />
          <Detail label={t.bookingCode} value={transaction.bookingId?.bookingCode || '-'} />
          <Detail label={t.amount} value={walletAmount(transaction.amount, transaction.currency)} />
          <Detail label={t.status} value={transaction.status} />
          <Detail label={t.paymentMethod} value={transaction.paymentSourceId?.providerName || t.travchainWallet} />
          <Detail label={t.createdDate} value={new Date(transaction.createdAt).toLocaleString()} />
          <Detail label={t.transactionHash} value={transaction.transactionHash} mono />
        </div>
      </section>
    </div>
  );
}

function RefundList({ refunds, language, currency }: { refunds: Refund[]; language: Language; currency: Currency }) {
  const t = text[language];
  if (!refunds.length) return <StateBox text={language === 'vi' ? 'Chưa có yêu cầu hoàn tiền.' : 'No refund requests yet.'} />;
  return (
    <div className="grid gap-3">
      {refunds.map((refund) => (
        <div key={refund._id} className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-black">{refund.bookingId?.bookingCode || t.refundRequests}</p>
              <p className="mt-1 text-sm font-bold text-[#667085]">{refund.reason}</p>
            </div>
            <p className="font-black text-[#FF5A00]">{money(refund.amount, currency)}</p>
          </div>
          <div className="mt-3 grid gap-2 text-sm font-bold text-[#667085] sm:grid-cols-2">
            <p>{t.refundStatus}: {refund.status}</p>
            <p className="break-all">{t.refundHash}: {refund.refundHash}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReceiptPage({ language, currency }: { language: Language; currency: Currency }) {
  const { bookingCode } = useParams();
  const { data, loading, error } = usePublic<any>(`/api/bookings/receipt/${bookingCode}`, null);
  return (
    <Section title={text[language].qrReceiptTitle} subtitle={text[language].publicReceipt}>
      {loading ? <SkeletonGrid /> : error || !data ? <StateBox text={error || text[language].notFound} /> : (
        <div className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1fr_260px]">
          <div className="grid gap-3">
            <Detail label={text[language].bookingCode} value={data.bookingCode} />
            <Detail label={text[language].amount} value={money(data.totalVnd, currency)} />
            <Detail label={text[language].paymentMethod} value={data.paymentMethod === 'qr' ? text[language].domesticQr : data.paymentMethod === 'card' ? text[language].internationalCard : text[language].travchainWallet} />
            <Detail label={text[language].status} value={data.paymentStatus} />
            <Detail label={text[language].transactionHash} value={data.transactionHash} mono />
            <div className="rounded-2xl bg-slate-50 p-4">{data.items.map((item: any) => <p key={item.titleSnapshot} className="text-sm font-bold">{item.titleSnapshot} · {item.date}</p>)}</div>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5 text-white"><QrMock value={data.qrPayload || data.bookingCode} /><p className="mt-4 break-all text-center text-xs font-bold text-white/50">{data.qrPayload}</p></div>
        </div>
      )}
    </Section>
  );
}

function ProfilePage({ language, user, setUser, setToken }: AppContext & { setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  return (
    <Section title={text[language].profile} subtitle={text[language].accountInfo}>
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {user ? <><p className="text-2xl font-black">{user.name}</p><p className="mt-1 font-bold text-slate-500">{user.email} · {user.role}</p><button onClick={() => { setUser(null); setToken(''); }} className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{text[language].logout}</button></> : <StateBox text={text[language].loginRequired} />}
      </div>
    </Section>
  );
}

function AuthModal({ language, setToken, setUser, close }: { language: Language; setToken: (value: string) => void; setUser: (value: User) => void; close: () => void }) {
  const [form, setForm] = useState({ email: 'demo@travchain.vn', password: '123456' });
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const response = await api('/api/auth/login', { method: 'POST', body: form });
      setToken(response.token);
      setUser(response.user);
      close();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login failed');
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h2 className="text-2xl font-black">{text[language].signIn}</h2><button type="button" onClick={close}><X className="h-5 w-5" /></button></div>
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="Email" />
        <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="Password" />
        {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Continue</button>
      </form>
    </div>
  );
}

function LoginPage({ language, setToken, setUser }: { language: Language; setToken: (value: string) => void; setUser: (value: User) => void }) {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role') === 'partner' ? 'partner' : 'traveler';
  const [mode, setMode] = useState<'traveler' | 'partner'>(requestedRole);
  const [form, setForm] = useState({ email: 'demo@travchain.vn', password: '123456' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setMode(requestedRole);
  }, [requestedRole]);

  useEffect(() => {
    setForm({
      email: mode === 'partner' ? 'partner@travchain.vn' : 'demo@travchain.vn',
      password: '123456',
    });
  }, [mode]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const login = await api('/api/auth/login', { method: 'POST', body: form });
      setToken(login.token);
      const me = await api('/api/auth/me', { token: login.token });
      const nextUser = me.user || me.data || login.user;
      setUser(nextUser);
      if (nextUser.role === 'partner') navigate('/partner/dashboard');
      else if (nextUser.role === 'admin') navigate('/admin/dashboard');
      else navigate('/explore');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login failed');
    }
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white lg:min-h-[560px]">
        <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="relative flex h-full flex-col justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">TravChain DApp</p>
            <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight">All Travel One Tap</h1>
            <p className="mt-5 max-w-xl text-lg font-medium leading-8 text-white/70">
              {language === 'vi' ? 'Một tài khoản, đúng layout theo vai trò: khách hàng, đối tác hoặc admin.' : 'One account, routed into the right workspace: traveler, partner, or admin.'}
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Info label="Traveler" value="/explore" />
            <Info label="Partner" value="/partner/dashboard" />
            <Info label="Admin" value="/admin/dashboard" />
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="h-fit rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-3xl font-black">{language === 'vi' ? 'Đăng nhập' : 'Sign in'}</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{language === 'vi' ? 'Chọn loại tài khoản để đi vào đúng trải nghiệm.' : 'Choose account type to enter the right product layout.'}</p>
        <div className="mt-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          {(['traveler', 'partner'] as const).map((value) => (
            <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-xl px-4 py-3 text-sm font-black ${mode === value ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>
              {value === 'traveler' ? 'Khách hàng' : 'Đối tác'}
            </button>
          ))}
        </div>
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-orange-500" />
        <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-orange-500" />
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
          Admin demo: admin@travchain.vn / 123456
        </div>
        {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600">Continue</button>
      </form>
    </section>
  );
}

type AppContext = {
  language: Language;
  currency: Currency;
  token: string;
  user: User | null;
  cart: CartItem[];
  setCart: (value: CartItem[]) => void;
  setToast: (value: string) => void;
};

function addCart(service: Service, cart: CartItem[], setCart: (value: CartItem[]) => void, setToast: (value: string) => void, language: Language) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = cart.find((item) => item.service._id === service._id && item.date === today);
  if (existing) setCart(cart.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item));
  else setCart([...cart, { service, quantity: 1, guests: 2, date: today }]);
  setToast(`${service.title} ${language === 'vi' ? 'đã được thêm vào giỏ.' : 'added to cart.'}`);
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8"><div className="mb-5"><h1 className="text-3xl font-black tracking-tight text-[#071126] sm:text-4xl">{title}</h1>{subtitle && <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#667085]">{subtitle}</p>}</div>{children}</section>;
}

function FilterPanel({ children }: { children: ReactNode }) {
  return <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">{children}</div>;
}

function ChipGroup({ label, values, selected, setSelected, language = 'en' }: { label: string; values: string[]; selected: string; setSelected: (value: string) => void; language?: Language }) {
  return <div className="mb-3 last:mb-0"><p className="mb-2 text-xs font-black uppercase tracking-[.14em] text-slate-400">{label}</p><div className="flex flex-wrap gap-2"><button onClick={() => setSelected('')} className={`rounded-full px-3 py-2 text-xs font-black ${!selected ? 'bg-[#050A1F] text-white' : 'bg-[#F7F2E8] text-[#667085]'}`}>{text[language].all}</button>{values.map((value) => <button key={value} onClick={() => setSelected(value)} className={`rounded-full px-3 py-2 text-xs font-black transition ${selected === value ? 'bg-[#FF5A00] text-white' : 'bg-[#F7F2E8] text-[#667085] hover:bg-orange-50 hover:text-[#FF5A00]'}`}>{value}</button>)}</div></div>;
}

function QuickChip({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white/85 backdrop-blur hover:bg-white/20">{label}</Link>;
}

function DestinationGrid({ language }: { language: Language }) {
  const places = ['Da Nang', 'Hoi An', 'Hue', 'Ha Noi', 'Ho Chi Minh', 'Ninh Binh', 'Sa Pa', 'Ha Giang', 'Phong Nha', 'Da Lat', 'Phu Quoc', 'Nha Trang'];
  const images = [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80',
  ];
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{places.map((place, index) => <Link key={place} to={`/services?destination=${encodeURIComponent(place)}`} className="group relative min-h-44 overflow-hidden rounded-[24px] bg-[#050A1F] p-5 text-white shadow-[0_18px_45px_rgba(7,17,38,0.12)] transition duration-300 hover:-translate-y-1"><img src={images[index]} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-75" /><div className="absolute inset-0 bg-gradient-to-t from-[#050A1F]/80 via-[#050A1F]/30 to-transparent" /><div className="relative flex h-full min-h-36 flex-col justify-between"><p className="text-xl font-black">{place}</p><p className="text-sm font-bold text-white/78">{text[language].exploreServices}</p></div></Link>)}</div>;
}

function InfoPanel({ title, body, to, language = 'en' }: { title: string; body: string; to: string; language?: Language }) {
  return <Link to={to} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"><p className="text-2xl font-black">{title}</p><p className="mt-3 leading-7 text-slate-600">{body}</p><span className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">{text[language].open} <ChevronRight className="h-4 w-4" /></span></Link>;
}

function PartnerCtaPanel({ user, language, title, body, openTravelerModal }: { user: User | null; language: Language; title: string; body: string; openTravelerModal: () => void }) {
  if (!user) {
    return <InfoPanel title={title} body={body} to="/login?role=partner" language={language} />;
  }
  if (user.role === 'partner') {
    return <InfoPanel title={title} body={body} to="/partner/dashboard" language={language} />;
  }
  if (user.role === 'admin') {
    return <InfoPanel
      title={language === 'vi' ? 'Bảng điều khiển quản trị' : 'Admin Control'}
      body={language === 'vi' ? 'Bạn đang đăng nhập bằng tài khoản quản trị. Mở bảng điều khiển để quản lý đối tác và dịch vụ.' : 'You are signed in as admin. Open the control panel to manage partners and services.'}
      to="/admin/dashboard"
      language={language}
    />;
  }
  return (
    <button onClick={openTravelerModal} className="rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
      <p className="text-2xl font-black">{title}</p>
      <p className="mt-3 leading-7 text-slate-600">{body}</p>
      <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">{text[language].partnerAccess} <ChevronRight className="h-4 w-4" /></span>
    </button>
  );
}

function TravelerPartnerModal({ language, close }: { language: Language; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-600">{text[language].partnerAccess}</p>
            <h2 className="mt-2 text-2xl font-black">{language === 'vi' ? 'Bạn đang dùng tài khoản khách hàng' : 'Traveler account in use'}</h2>
          </div>
          <button onClick={close} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
          {language === 'vi' ? 'Tài khoản hiện tại là khách hàng. Để vào Cổng đối tác, hãy đăng xuất rồi đăng nhập hoặc đăng ký bằng tài khoản đối tác.' : 'The current account is a traveler account. To open Partner Center, log out and sign in or register with a partner account.'}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link to="/profile" onClick={close} className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white">{language === 'vi' ? 'Mở hồ sơ' : 'Go to profile'}</Link>
          <Link to="/login?role=partner" onClick={close} className="rounded-2xl bg-orange-500 px-4 py-3 text-center text-sm font-black text-white">{language === 'vi' ? 'Đăng nhập đối tác' : 'Partner login'}</Link>
        </div>
      </section>
    </div>
  );
}

function CheckoutSummary({ total, currency, language }: { total: number; currency: Currency; language: Language }) {
  return <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-white/50">{text[language].total}</p><p className="mt-2 text-3xl font-black">{money(total, currency)}</p><Link to="/checkout" className="mt-6 block rounded-2xl bg-orange-500 px-5 py-3 text-center text-sm font-black text-white">{text[language].checkout}</Link></aside>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-black uppercase tracking-[.14em] text-white/45">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[.12em] text-slate-400">{label}</p><p className={`mt-1 break-all font-bold ${mono ? 'font-mono text-xs' : ''}`}>{value}</p></div>;
}

function StateBox({ text }: { text: string }) {
  return <div className="rounded-3xl bg-white p-8 text-center font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">{text}</div>;
}

function SkeletonGrid() {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-3xl bg-slate-200" />)}</div>;
}

function QrMock({ value }: { value: string }) {
  const cells = Array.from({ length: 64 }, (_, index) => (value.charCodeAt(index % value.length) + index * 7) % 3 !== 0);
  return <div className="grid grid-cols-8 gap-1">{cells.map((active, index) => <span key={index} className={`aspect-square rounded ${active ? 'bg-white' : 'bg-white/15'}`} />)}</div>;
}

function RequireRole({ user, token, roles }: { user: User | null; token: string; roles: Role[] }) {
  if (!token || !user) return <Navigate to={roles.includes('partner') ? '/login?role=partner' : '/login?role=traveler'} replace />;
  if (!roles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'partner' ? '/partner/dashboard' : '/explore'} replace />;
  return <Outlet />;
}

function WorkspaceLayout({ title, nav, user, setUser, setToken }: { title: string; nav: Array<[string, string]>; user: User | null; setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:p-6">
          <Link to="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500 text-sm font-black text-white">TC</span><span><span className="block font-black">TravChain</span><span className="block text-xs font-bold text-slate-500">{title}</span></span></Link>
          <Link to="/explore" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black lg:hidden">App</Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-4">
          {nav.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `block shrink-0 rounded-2xl px-4 py-3 text-sm font-black ${isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</NavLink>)}
        </nav>
        <div className="hidden p-4 lg:block">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="font-black">{user?.name}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{user?.role}</p>
            <button onClick={() => { setUser(null); setToken(''); }} className="mt-4 w-full rounded-2xl bg-white px-4 py-2 text-xs font-black ring-1 ring-slate-200">Logout</button>
          </div>
        </div>
      </aside>
      <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </section>
    </main>
  );
}

function PartnerLayout({ user, setUser, setToken }: { user: User | null; setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  const nav: Array<[string, string]> = [
    ['/partner/dashboard', 'Dashboard'],
    ['/partner/onboarding', 'Onboarding'],
    ['/partner/services', 'Services'],
    ['/partner/bookings', 'Bookings'],
    ['/partner/revenue', 'Revenue'],
    ['/partner/wallet', 'Wallet'],
    ['/partner/payout', 'Payout'],
    ['/partner/reconciliation', 'Reconciliation'],
    ['/partner/refunds', 'Refunds'],
    ['/partner/notifications', 'Notifications'],
  ];
  return <WorkspaceLayout title="Partner Center" nav={nav} user={user} setUser={setUser} setToken={setToken} />;
}

function AdminLayout({ user, setUser, setToken }: { user: User | null; setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  const nav: Array<[string, string]> = [
    ['/admin/dashboard', 'Dashboard'],
    ['/admin/users', 'Users'],
    ['/admin/partners', 'Partners'],
    ['/admin/services', 'Services'],
    ['/admin/bookings', 'Bookings'],
    ['/admin/revenue', 'Revenue'],
    ['/admin/refunds', 'Refunds'],
    ['/admin/logs', 'Audit logs'],
  ];
  return <WorkspaceLayout title="Admin Control" nav={nav} user={user} setUser={setUser} setToken={setToken} />;
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-6"><p className="text-sm font-black uppercase tracking-[.18em] text-orange-600">TravChain</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">{subtitle}</p></div>;
}

function PartnerDashboardPage({ token }: { token: string }) {
  const dashboard = useAuthed<any>('/api/partner/dashboard', token, null);
  const wallet = useAuthed<any>('/api/partner/wallet', token, null);
  const data = dashboard.data || {};
  return <><PageHeader title="Partner Dashboard" subtitle="Bookings, revenue, inventory, payout and low-stock signals." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Today bookings" value={String(data.orders || 0)} /><Metric label="Monthly revenue" value={money(data.revenue || 0, 'VND')} /><Metric label="Pending payout" value={money(wallet.data?.pendingBalance || 0, 'VND')} /><Metric label="Available balance" value={money(wallet.data?.availableBalance || 0, 'VND')} /><Metric label="Total services" value={String(data.servicesCount || 0)} /><Metric label="Inventory" value={String(data.inventory || 0)} /><Metric label="Refund requests" value={String(data.refundRequests || 0)} /><Metric label="Cancellation rate" value={`${data.cancellationRate || 0}%`} /><Metric label="Refund amount this month" value={money(data.refundAmountThisMonth || 0, 'VND')} /><Metric label="Low inventory alert" value={data.inventory < 30 ? 'Review' : 'Healthy'} /></div></>;
}

function PartnerServicesPage({ token }: { token: string }) {
  const state = useAuthed<Service[]>('/api/partner/services', token, []);
  return <><PageHeader title="Service Management" subtitle="Create, edit, delete, and manage inventory. New services require admin approval before publish." /><div className="mb-4 flex flex-wrap gap-2"><Link to="/partner/onboarding" className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white">Create service</Link></div><DataTable rows={state.data} columns={['title', 'type', 'province', 'availability', 'status']} linkPrefix="/partner/services" /></>;
}

function PartnerServiceDetailPage({ token }: { token: string }) {
  const { id } = useParams();
  const service = useService(id || '');
  return <><PageHeader title="Service Detail" subtitle="Partner view for editing service metadata and status." />{service.data ? <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-2xl font-black">{service.data.title}</h2><p className="mt-2 text-slate-600">{service.data.description}</p><div className="mt-5 flex flex-wrap gap-2"><Link to={`/partner/services/${id}/calendar`} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Calendar</Link><Link to={`/partner/services/${id}/analytics`} className="rounded-2xl bg-white px-4 py-3 text-sm font-black ring-1 ring-slate-200">Analytics</Link></div></div> : <StateBox text={service.error || 'Loading service...'} />}</>;
}

function PartnerCalendarPage() {
  const days = Array.from({ length: 14 }, (_, index) => new Date(Date.now() + index * 86400000).toISOString().slice(0, 10));
  return <><PageHeader title="Calendar Inventory" subtitle="MVP editor for inventory per day, price override, holiday and weekend rules." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{days.map((day, index) => <div key={day} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><p className="font-black">{day}</p><p className="mt-2 text-sm font-bold text-slate-500">Inventory: {20 + index}</p><p className="text-sm font-bold text-slate-500">Rule: {index % 6 === 0 ? 'Weekend pricing' : 'Standard'}</p></div>)}</div></>;
}

function PartnerAnalyticsPage({ token }: { token: string }) {
  const services = useAuthed<Service[]>('/api/partner/services', token, []);
  const { id } = useParams();
  const service = services.data.find((item) => item._id === id);
  const bookings = Math.max(1, Math.round((service?.reviewCount || 12) / 4));
  return <><PageHeader title="Service Analytics" subtitle="Views, clicks, bookings, conversion rate and rating." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label="Views" value={String((service?.reviewCount || 24) * 17)} /><Metric label="Clicks" value={String((service?.reviewCount || 24) * 5)} /><Metric label="Bookings" value={String(bookings)} /><Metric label="Conversion" value={`${Math.round(bookings / ((service?.reviewCount || 24) * 5) * 100)}%`} /><Metric label="Rating" value={String(service?.rating || 4.7)} /></div></>;
}

function PartnerBookingsPage({ token }: { token: string }) {
  const state = useAuthed<Booking[]>('/api/partner/bookings', token, []);
  return <><PageHeader title="Booking Management" subtitle="Filter by today, week, month, date range and status." /><FilterPanel><ChipGroup label="Status" values={['pending', 'confirmed', 'completed', 'cancelled', 'refunded']} selected="" setSelected={() => undefined} /></FilterPanel><DataTable rows={state.data} columns={['bookingCode', 'totalVnd', 'paymentStatus', 'reconciliationStatus', 'createdAt']} /></>;
}

function PartnerRefundsPage({ token, setToast }: { token: string; setToast: (value: string) => void }) {
  const state = useAuthed<Refund[]>('/api/partner/refunds', token, []);
  async function decide(id: string, action: 'approve' | 'reject') {
    try {
      const reason = window.prompt('Reason', action === 'approve' ? 'Eligible cancellation' : 'Policy not eligible') || '';
      await api(`/api/partner/refunds/${id}/${action}`, { method: 'PATCH', token, body: { reason } });
      setToast(`Refund ${action}d.`);
      window.location.reload();
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Refund update failed');
    }
  }
  return (
    <>
      <PageHeader title="Refund Management" subtitle="Approve or reject traveler cancellation and refund requests." />
      <div className="grid gap-3">
        {state.data.map((refund) => (
          <div key={refund._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-black">{refund.bookingId?.bookingCode || refund._id}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{refund.reason} · {refund.status}</p>
                <code className="mt-3 block break-all rounded-2xl bg-slate-50 p-3 text-xs">{refund.refundHash}</code>
              </div>
              <p className="font-black">{money(refund.amount, 'VND')}</p>
            </div>
            {refund.status === 'requested' && <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => decide(refund._id, 'approve')} className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white">Approve</button><button onClick={() => decide(refund._id, 'reject')} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white">Reject</button></div>}
          </div>
        ))}
        {!state.data.length && <StateBox text="No refund requests." />}
      </div>
    </>
  );
}

function PartnerRevenuePage({ token }: { token: string }) {
  const state = useAuthed<any>('/api/partner/revenue', token, {});
  return <><PageHeader title="Revenue" subtitle="Gross revenue, platform fee, and net revenue." /><div className="grid gap-4 sm:grid-cols-3"><Metric label="Gross revenue" value={money(state.data?.grossVnd || 0, 'VND')} /><Metric label="Platform fee" value={money(state.data?.feeVnd || 0, 'VND')} /><Metric label="Net revenue" value={money(state.data?.netVnd || 0, 'VND')} /></div></>;
}

function PartnerWalletPage({ token }: { token: string }) {
  const wallet = useAuthed<any>('/api/partner/wallet', token, null);
  const commission = useAuthed<any>('/api/partner/commission-breakdown', token, null);
  return <><PageHeader title="Partner Wallet" subtitle="Overview, transactions, payout history, request payout, and commission breakdown." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label="Gross revenue" value={money(commission.data?.grossVnd || 0, 'VND')} /><Metric label="Platform fee %" value={`${Math.round((commission.data?.platformFeeRate || 0.08) * 100)}%`} /><Metric label="Net revenue" value={money(commission.data?.netVnd || 0, 'VND')} /><Metric label="Pending payout" value={money(wallet.data?.pendingBalance || 0, 'VND')} /><Metric label="Paid payout" value={money(wallet.data?.availableBalance || 0, 'VND')} /></div></>;
}

function PartnerPayoutPage({ token, setToast }: { token: string; setToast: (value: string) => void }) {
  async function requestPayout() {
    try { await api('/api/partner/payout-request', { method: 'POST', token }); setToast('Payout request submitted.'); } catch (error) { setToast(error instanceof Error ? error.message : 'Payout failed'); }
  }
  return <><PageHeader title="Request Payout" subtitle="Move available balance into payout processing." /><button onClick={requestPayout} className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Request payout</button></>;
}

function PartnerReconciliationPage({ token }: { token: string }) {
  const state = useAuthed<any[]>('/api/partner/reconciliation', token, []);
  return <><PageHeader title="Reconciliation" subtitle="Pending, ready and paid settlement records." /><DataTable rows={state.data} columns={['grossVnd', 'platformFeeVnd', 'netVnd', 'status', 'createdAt']} /></>;
}

function PartnerOnboardingPage() {
  return <><PageHeader title="Partner Onboarding" subtitle="Business profile, bank account, service category and approval workflow." /><form className="grid max-w-3xl gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><input className="rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="businessName" /><input className="rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="logo URL" /><input className="rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="province" /><input className="rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="contactPhone" /><input className="rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="bankAccount" /><input className="rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder="serviceCategory" /><button type="button" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">Submit approval</button></form></>;
}

function NotificationsPage({ token }: { token: string }) {
  const state = useAuthed<any[]>('/api/notifications', token, []);
  return <><PageHeader title="Notifications" subtitle="Booking, payout and reconciliation updates." /><DataTable rows={state.data} columns={['title', 'message', 'type', 'readStatus', 'createdAt']} /></>;
}

function AdminDashboardPage({ token }: { token: string }) {
  const state = useAuthed<any>('/api/admin/dashboard', token, {});
  return <><PageHeader title="Admin Dashboard" subtitle="Platform bookings, users, partners, services and revenue." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label="Users" value={String(state.data?.users || 0)} /><Metric label="Partners" value={String(state.data?.partners || 0)} /><Metric label="Bookings" value={String(state.data?.bookings || 0)} /><Metric label="Services" value={String(state.data?.services || 0)} /><Metric label="Revenue" value={money(state.data?.platformRevenueVnd || 0, 'VND')} /></div></>;
}

function AdminUsersPage({ token }: { token: string }) {
  const state = useAuthed<any[]>('/api/admin/users', token, []);
  return <><PageHeader title="Users" subtitle="Lock or unlock traveler accounts." /><DataTable rows={state.data} columns={['name', 'email', 'role', 'status', 'createdAt']} /></>;
}

function AdminPartnersPage({ token }: { token: string }) {
  const state = useAuthed<any[]>('/api/admin/partners', token, []);
  return <><PageHeader title="Partners" subtitle="Supplier accounts and lock status." /><DataTable rows={state.data} columns={['name', 'email', 'companyName', 'status', 'createdAt']} /></>;
}

function AdminServicesPage({ token, setToast }: { token: string; setToast: (value: string) => void }) {
  const state = useAuthed<Service[]>('/api/admin/services', token, []);
  async function update(id: string, action: 'approve' | 'reject') {
    try { await api(`/api/admin/services/${id}/${action}`, { method: 'PATCH', token }); setToast(`Service ${action}d.`); } catch (error) { setToast(error instanceof Error ? error.message : 'Action failed'); }
  }
  return <><PageHeader title="Service Approval" subtitle="Approve or reject partner services before publish." /><div className="grid gap-3">{state.data.map((service) => <div key={service._id} className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_auto]"><div><p className="font-black">{service.title}</p><p className="text-sm font-bold text-slate-500">{service.type} · {service.province}</p></div><div className="flex gap-2"><button onClick={() => update(service._id, 'approve')} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">Approve</button><button onClick={() => update(service._id, 'reject')} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white">Reject</button></div></div>)}</div></>;
}

function AdminBookingsPage({ token }: { token: string }) {
  const state = useAuthed<Booking[]>('/api/admin/bookings', token, []);
  return <><PageHeader title="Bookings" subtitle="All platform bookings and payment statuses." /><DataTable rows={state.data} columns={['bookingCode', 'totalVnd', 'paymentMethod', 'paymentStatus', 'createdAt']} /></>;
}

function AdminRevenuePage({ token }: { token: string }) {
  const state = useAuthed<any>('/api/admin/platform-revenue', token, {});
  return <><PageHeader title="Platform Revenue" subtitle="Gross booking value, commission and partner net revenue." /><div className="grid gap-4 sm:grid-cols-3"><Metric label="Gross" value={money(state.data?.grossVnd || 0, 'VND')} /><Metric label="Platform fee" value={money(state.data?.platformFeeVnd || 0, 'VND')} /><Metric label="Partner net" value={money(state.data?.partnerNetVnd || 0, 'VND')} /></div></>;
}

function AdminRefundsPage({ token, setToast }: { token: string; setToast: (value: string) => void }) {
  const state = useAuthed<Refund[]>('/api/admin/refunds', token, []);
  async function process(id: string, action: 'process' | 'reject') {
    try {
      await api(`/api/admin/refunds/${id}/${action}`, { method: 'PATCH', token, body: { reason: 'Admin decision' } });
      setToast(action === 'process' ? 'Refund processed.' : 'Refund rejected.');
      window.location.reload();
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Refund action failed');
    }
  }
  return (
    <>
      <PageHeader title="Refund Oversight" subtitle="View all refunds, process manual refund, and inspect refund hashes." />
      <div className="grid gap-3">
        {state.data.map((refund) => (
          <div key={refund._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="font-black">{refund.bookingId?.bookingCode || refund._id}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{refund.status} · {refund.reason}</p>
                <code className="mt-3 block break-all rounded-2xl bg-slate-50 p-3 text-xs">{refund.refundHash}</code>
              </div>
              <p className="font-black">{money(refund.amount, 'VND')}</p>
            </div>
            {refund.status !== 'processed' && <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => process(refund._id, 'process')} className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white">Process refund</button><button onClick={() => process(refund._id, 'reject')} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white">Reject</button></div>}
          </div>
        ))}
        {!state.data.length && <StateBox text="No refund requests." />}
      </div>
    </>
  );
}

function AdminLogsPage({ token }: { token: string }) {
  const state = useAuthed<any[]>('/api/admin/logs', token, []);
  return <><PageHeader title="Audit Logs" subtitle="Admin approval, lock, and wallet adjustment trail." /><DataTable rows={state.data} columns={['action', 'targetType', 'targetId', 'createdAt']} /></>;
}

function DataTable({ rows, columns, linkPrefix }: { rows: any[]; columns: string[]; linkPrefix?: string }) {
  if (!rows.length) return <StateBox text="No data yet." />;
  return <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-black uppercase tracking-[.12em] text-slate-400"><tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row._id || row.id || JSON.stringify(row).slice(0, 20)} className="font-bold text-slate-700">{columns.map((column, index) => <td key={column} className="max-w-xs truncate px-4 py-3">{index === 0 && linkPrefix && row._id ? <Link className="text-orange-600" to={`${linkPrefix}/${row._id}`}>{formatCell(row[column])}</Link> : formatCell(row[column])}</td>)}</tr>)}</tbody></table></div></div>;
}

function formatCell(value: unknown) {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number') return value > 10000 ? money(value, 'VND') : String(value);
  if (typeof value === 'string' && value.includes('T')) return new Date(value).toLocaleDateString();
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 64);
  return String(value);
}

function useServices(path: string) {
  return usePublic<Service[]>(path, []);
}

function useService(id: string) {
  return usePublic<Service | null>(id ? `/api/services/${id}` : '', null);
}

function useReviews(id: string) {
  const state = usePublic<any[]>(id ? `/api/services/${id}/reviews` : '', []);
  return state.data;
}

function usePublic<T>(path: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState('');
  useEffect(() => {
    if (!path) return;
    let active = true;
    setLoading(true);
    api(path).then((response) => active && setData(response.data ?? response)).catch((caught) => active && setError(caught instanceof Error ? caught.message : 'Request failed')).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [path]);
  return { data, loading, error };
}

function useAuthed<T>(path: string, token: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(Boolean(path && token));
  const [error, setError] = useState('');
  useEffect(() => {
    if (!path || !token) return;
    let active = true;
    setLoading(true);
    api(path, { token }).then((response) => active && setData(response.data ?? response)).catch((caught) => active && setError(caught instanceof Error ? caught.message : 'Request failed')).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [path, token]);
  return { data, loading, error };
}

async function api(path: string, options: { method?: string; token?: string; body?: unknown } = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Request failed: ${response.status}`);
  return payload;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function money(value: number, currency: Currency) {
  if (currency === 'USD') return `$${Math.round(value / USD_RATE).toLocaleString('en-US')}`;
  return `${value.toLocaleString('vi-VN')} đ`;
}

function walletAmount(value: number, currency: 'VND' | 'USD' | 'USDT') {
  if (currency === 'VND') return money(value, 'VND');
  if (currency === 'USD') return `$${value.toLocaleString('en-US')}`;
  return `${value.toLocaleString('en-US')} USDT`;
}

function cartTotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.service.priceVnd * item.quantity, 0);
}

export default App;
