import { FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  CalendarDays,
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Bus,
  Car,
  Maximize2,
  Minimize2,
  type LucideIcon,
  Film,
  Facebook,
  Globe2,
  Heart,
  Hotel,
  Instagram,
  Landmark,
  Languages,
  Linkedin,
  LockKeyhole,
  MapPin,
  Send,
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
  Train,
  Trash2,
  Twitter,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import { warnBrokenVietnamese } from '../utils/encoding';
import { localeText, translate as i18nTranslate, type AppLanguage } from '../utils/i18n';
import adminEn from '../locales/en/admin.json';
import partnerEn from '../locales/en/partner.json';
import adminVi from '../locales/vi/admin.json';
import partnerVi from '../locales/vi/partner.json';

type Language = AppLanguage;
type Currency = 'VND' | 'USD';
type Role = 'traveler' | 'partner' | 'admin';
type ServiceType = 'cinema' | 'hotel' | 'homestay' | 'attraction' | 'event' | 'local_tour' | 'restaurant' | 'transport' | 'flight' | 'trip' | 'stay' | 'movie' | 'stays';
type PaymentMethod = 'wallet' | 'card' | 'qr';

type User = { id: string; name: string; email: string; role: Role };
type Service = {
  _id: string;
  type: ServiceType;
  providerBrand?: string;
  airline?: string;
  flightNumber?: string;
  originAirport?: string;
  destinationAirport?: string;
  departureTime?: string;
  arrivalTime?: string;
  baggage?: string;
  seatClass?: string;
  refundable?: boolean;
  transportType?: string;
  origin?: string;
  routeDestination?: string;
  departureLabel?: string;
  arrivalLabel?: string;
  seats?: number;
  packageDuration?: string;
  packageIncludes?: string[];
  travelerType?: string;
  acceptsInternationalCard?: boolean;
  settlementCurrency?: 'VND' | 'USD';
  title: string;
  province?: string;
  district?: string;
  location: string;
  destination?: string;
  priceVnd: number;
  priceUsd?: number;
  rating: number;
  reviewCount: number;
  availability: number;
  duration: string;
  coverImage: string;
  imageUrl?: string;
  gallery: string[];
  description: string;
  detail?: string;
  highlights: string[];
  cancellationPolicy?: string;
  tags?: string[];
  sustainabilityScore?: number;
  isFeatured?: boolean;
  status?: string;
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
  bankName?: string;
  accountHolder?: string;
  maskedNumber: string;
  last4?: string;
  currency: string;
  isPrimary: boolean;
  status?: string;
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
type AssistantIntent = 'greeting' | 'capability_intro' | 'cinema_showtimes' | 'movie_provider_search' | 'hotel_search' | 'homestay_search' | 'attraction_ticket' | 'local_tour_search' | 'flight_search' | 'bus_search' | 'train_search' | 'airport_transfer' | 'trip_package' | 'event_search' | 'restaurant_search' | 'transport_search' | 'destination_recommendation' | 'itinerary_suggestion' | 'budget_trip' | 'family_trip' | 'couple_trip' | 'weekend_trip' | 'booking_help' | 'booking_status' | 'cancel_booking' | 'refund_help' | 'wallet_help' | 'bank_link_help' | 'payment_method_help' | 'partner_payment_help' | 'passport_help' | 'membership_help' | 'partner_help' | 'fallback';
type AssistantItem = {
  id: string;
  type: ServiceType | 'booking';
  title: string;
  movieTitle?: string;
  providerBrand?: string;
  location: string;
  province: string;
  priceVnd: number;
  rating: number;
  reviewCount?: number;
  inventory: number;
  timeSlots: string[];
  badges?: string[];
  image: string;
  ctaLabel: string;
  ctaUrl: string;
};
type AssistantResponse = {
  intent: AssistantIntent;
  answer: string;
  confidence?: number;
  items: AssistantItem[];
  followUps: string[];
  actions?: Array<{ label: string; value?: string; url?: string }>;
  filters?: Array<{ key: string; label: string; options: string[] }>;
  contextPatch?: Record<string, string>;
  error?: string | null;
  emptyStateType?: string | null;
};
type AssistantMessage = {
  role: 'user' | 'assistant';
  text: string;
  intent?: AssistantIntent;
  items?: AssistantItem[];
  followUps?: string[];
  actions?: Array<{ label: string; value?: string; url?: string }>;
  filters?: Array<{ key: string; label: string; options: string[] }>;
  error?: boolean;
};

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 800%22%3E%3Crect width=%221200%22 height=%22800%22 fill=%22%23071015%22/%3E%3Cpath d=%22M0 610c170-90 320-130 455-88 170 53 265 6 405-42 128-44 220 13 340 91v229H0z%22 fill=%22%23fb923c%22 opacity=%22.28%22/%3E%3Ctext x=%2280%22 y=%22400%22 fill=%22white%22 font-family=%22Arial%22 font-size=%2272%22 font-weight=%22700%22%3ETravChain%3C/text%3E%3C/svg%3E';
const USD_RATE = 24500;
const TOKEN_KEY = 'travchain_token';
const USER_KEY = 'travchain_user';
const CART_KEY = 'travchain_cart';
const LANGUAGE_KEY = 'travchain_language';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  || (typeof window !== 'undefined' && window.location.port === '4173' ? (import.meta.env.VITE_API_PROXY_TARGET as string | undefined) || 'http://127.0.0.1:5050' : '');

const text: Record<Language, Record<string, string>> = {
  vi: {
    ...localeText.vi,
  },
  en: {
    ...localeText.en,
    chatAssistantSubtitle: 'Find bookable services from TravChain data.',
    chatWelcome: 'What would you like to find today?',
    chatPlaceholder: 'Ask about movies, hotels, tours, tickets...',
    assistantEmptyWorkspace: 'Type a question or choose a suggestion so TravChain can find bookable services.',
    assistantNoResults: 'I could not find a matching service. You can change destination, change date, or browse a related category.',
    assistantChangeLocation: 'Change destination',
    assistantViewAllServices: 'View all services',
    assistantTryTomorrow: 'Try tomorrow',
    assistantTonightMovies: 'Movies tonight',
    assistantBeachHotel: 'Hotels near beach',
    assistantWeekendTour: 'Weekend tour',
    assistantRefundHelp: 'Refund help',
    assistantProviderFilter: 'Provider',
    assistantTimeFilter: 'Showtime',
    assistantPriceFilter: 'Price range',
    assistantItineraryPreview: 'Itinerary preview',
    assistantBookingSummary: 'Booking summary',
    assistantMapPreview: 'Relevant area',
    flightQuick: 'Flights',
    transportQuick: 'Transport',
    diningQuick: 'Local dining',
    tripQuick: 'Trip bundles',
  },
};

Object.assign(text.vi, {
  askTravChain: 'H\u1ecfi TravChain',
  chatAssistantTitle: 'TravChain Assistant',
  chatAssistantSubtitle: 'T\u00ecm d\u1ecbch v\u1ee5 c\u00f3 th\u1ec3 \u0111\u1eb7t ngay t\u1eeb d\u1eef li\u1ec7u TravChain.',
  chatWelcome: 'B\u1ea1n mu\u1ed1n t\u00ecm g\u00ec h\u00f4m nay?',
  chatPlaceholder: 'H\u1ecfi v\u1ec1 phim, kh\u00e1ch s\u1ea1n, tour, v\u00e9 tham quan...',
  sendMessage: 'G\u1eedi tin nh\u1eafn',
  chatTyping: '\u0110ang t\u00ecm trong kho TravChain...',
  chatReady: '\u0110ang s\u1eb5n s\u00e0ng',
  chatDataSource: 'D\u1eef li\u1ec7u TravChain',
  minimize: 'Thu nh\u1ecf',
  expand: 'M\u1edf r\u1ed9ng',
  compact: 'Thu g\u1ecdn',
  assistantResults: 'K\u1ebft qu\u1ea3',
  assistantFilters: 'B\u1ed9 l\u1ecdc',
  assistantPreview: 'Xem tr\u01b0\u1edbc k\u1ebft qu\u1ea3',
  assistantEmptyWorkspace: 'Nh\u1eadp c\u00e2u h\u1ecfi ho\u1eb7c ch\u1ecdn m\u1ed9t g\u1ee3i \u00fd \u0111\u1ec3 TravChain t\u00ecm d\u1ecbch v\u1ee5 c\u00f3 th\u1ec3 \u0111\u1eb7t ngay.',
  assistantNoResults: 'M\u00ecnh ch\u01b0a t\u00ecm th\u1ea5y d\u1ecbch v\u1ee5 ph\u00f9 h\u1ee3p. B\u1ea1n c\u00f3 th\u1ec3 \u0111\u1ed5i \u0111\u1ecba \u0111i\u1ec3m, \u0111\u1ed5i ng\u00e0y ho\u1eb7c xem danh m\u1ee5c li\u00ean quan.',
  assistantChangeLocation: '\u0110\u1ed5i \u0111\u1ecba \u0111i\u1ec3m',
  assistantViewAllServices: 'Xem t\u1ea5t c\u1ea3 d\u1ecbch v\u1ee5',
  assistantTryTomorrow: 'Th\u1eed ng\u00e0y mai',
  assistantTonightMovies: 'Xem phim t\u1ed1i nay',
  assistantBeachHotel: 'Kh\u00e1ch s\u1ea1n g\u1ea7n bi\u1ec3n',
  assistantWeekendTour: 'Tour cu\u1ed1i tu\u1ea7n',
  assistantRefundHelp: 'H\u1ed7 tr\u1ee3 ho\u00e0n ti\u1ec1n',
  assistantProviderFilter: 'Nh\u00e0 cung c\u1ea5p',
  assistantTimeFilter: 'Gi\u1edd chi\u1ebfu',
  assistantPriceFilter: 'Kho\u1ea3ng gi\u00e1',
  assistantItineraryPreview: 'Xem tr\u01b0\u1edbc l\u1ecbch tr\u00ecnh',
  assistantBookingSummary: 'T\u00f3m t\u1eaft \u0111\u1eb7t ch\u1ed7',
  assistantMapPreview: 'Khu v\u1ef1c ph\u00f9 h\u1ee3p',
  flightQuick: 'V\u00e9 m\u00e1y bay',
  transportQuick: 'Di chuy\u1ec3n',
  diningQuick: '\u1ea8m th\u1ef1c \u0111\u1ecba ph\u01b0\u01a1ng',
  tripQuick: 'Combo chuy\u1ebfn \u0111i',
  chatError: 'TravChain Assistant \u0111ang g\u1eb7p l\u1ed7i k\u1ebft n\u1ed1i. B\u1ea1n th\u1eed l\u1ea1i sau v\u00e0i gi\u00e2y nh\u00e9.',
  chatRetry: 'Th\u1eed l\u1ea1i',
  chatQuickCinema: 'T\u1ed1i nay \u0110\u00e0 N\u1eb5ng c\u00f3 phim g\u00ec?',
  chatQuickCgv: 'CGV g\u1ea7n t\u00f4i',
  chatQuickHotel: 'Kh\u00e1ch s\u1ea1n g\u1ea7n bi\u1ec3n M\u1ef9 Kh\u00ea',
  chatQuickTour: 'Tour H\u1ed9i An cu\u1ed1i tu\u1ea7n',
  chatQuickAttraction: 'V\u00e9 B\u00e0 N\u00e0 Hills c\u00f2n kh\u00f4ng?',
  chatQuickRefund: 'T\u00f4i mu\u1ed1n h\u1ee7y \u0111\u1eb7t ch\u1ed7',
  slotsAvailable: 'ch\u1ed7 c\u00f2n l\u1ea1i',
  detail: 'Chi ti\u1ebft',
  addCart: 'Th\u00eam v\u00e0o gi\u1ecf',
  bookNow: '\u0110\u1eb7t ngay',
  cinemaTicketsTitle: 'V\u00e9 xem phim',
  close: '\u0110\u00f3ng',
});

function translateText(language: Language, key: string) {
  return text[language][key] || i18nTranslate(language, key);
}

function storedLanguage(): Language {
  return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'vi';
}

const serviceRoutes = [
  { to: '/services/cinema', type: 'cinema', labelKey: 'cinemaQuick', icon: Film },
  { to: '/services/stays', type: 'stays', labelKey: 'staysQuick', icon: Hotel },
  { to: '/services/attractions', type: 'attraction', labelKey: 'attractionsQuick', icon: Landmark },
  { to: '/services/tours', type: 'local_tour', labelKey: 'toursQuick', icon: MapPin },
  { to: '/services/flights', type: 'flight', labelKey: 'flightQuick', icon: Plane },
  { to: '/services/transport', type: 'transport', labelKey: 'transportQuick', icon: Bus },
  { to: '/services/events', type: 'event', labelKey: 'eventsQuick', icon: Sparkles },
  { to: '/services/restaurants', type: 'restaurant', labelKey: 'diningQuick', icon: TicketCheck },
  { to: '/services/trips', type: 'trip', labelKey: 'tripQuick', icon: ShoppingBag },
];

const homeServiceRoutes = [
  { to: '/services/cinema', type: 'cinema', labelKey: 'cinemaQuick', icon: Film },
  { to: '/services/stays', type: 'stays', labelKey: 'staysQuick', icon: Hotel },
  { to: '/services/attractions', type: 'attraction', labelKey: 'attractionsQuick', icon: Landmark },
  { to: '/services/tours', type: 'local_tour', labelKey: 'toursQuick', icon: MapPin },
  { to: '/services/flights', type: 'flight', labelKey: 'flightQuick', icon: Plane },
  { to: '/services/transport', type: 'transport', labelKey: 'transportQuick', icon: Bus },
  { to: '/services/restaurants', type: 'restaurant', labelKey: 'diningQuick', icon: TicketCheck },
  { to: '/services/trips', type: 'trip', labelKey: 'tripQuick', icon: Sparkles },
];

const ecosystemGroups = [
  { id: 'popular', vi: 'Phổ biến', en: 'Popular' },
  { id: 'recommended', vi: 'Gợi ý cho bạn', en: 'Recommended' },
  { id: 'lastMinute', vi: 'Đặt sát giờ', en: 'Last minute' },
  { id: 'partners', vi: 'Đối tác xác thực', en: 'Verified partners' },
];

function serviceTypeLabel(type: ServiceType | string, language: Language) {
  const vi: Record<string, string> = {
    cinema: 'Vé xem phim',
    hotel: 'Khách sạn',
    homestay: 'Homestay',
    stays: 'Khách sạn & Homestay',
    stay: 'Lưu trú',
    attraction: 'Vé tham quan',
    local_tour: 'Tour địa phương',
    flight: 'Vé máy bay',
    transport: 'Xe buýt & Shuttle',
    event: 'Sự kiện & lễ hội',
    restaurant: 'Ẩm thực địa phương',
    trip: 'Combo chuyến đi',
  };
  const en: Record<string, string> = {
    cinema: 'Movie tickets',
    hotel: 'Hotel',
    homestay: 'Homestay',
    stays: 'Hotels & Homestays',
    stay: 'Stay',
    attraction: 'Attraction tickets',
    local_tour: 'Local tours',
    flight: 'Flights',
    transport: 'Bus & Shuttle',
    event: 'Events & festivals',
    restaurant: 'Local dining',
    trip: 'Trip bundle',
  };
  return (language === 'vi' ? vi : en)[type] || String(type);
}

function localizedServiceContent(service: Service, language: Language) {
  const isVi = language === 'vi';
  const typeLabel = serviceTypeLabel(service.type, language);
  const place = cityDisplayName(service.province || service.destination || service.location, language);
  const provider = service.providerBrand || service.airline || 'TravChain';
  const route = [service.origin, service.routeDestination].filter(Boolean).map((item) => cityDisplayName(item, language)).join(' -> ');
  const title = service.title;
  const translatedHighlights = (service.highlights || []).map((item) => translateServiceHighlight(item, language));
  const baseHighlights = translatedHighlights.length ? translatedHighlights : [
    isVi ? 'Tồn kho theo thời gian thực' : 'Live availability',
    isVi ? 'Biên nhận QR' : 'QR receipt',
    isVi ? 'Hash đặt chỗ minh bạch' : 'Transparent booking hash',
    isVi ? 'Đối tác đã xác thực' : 'Verified partner',
  ];

  const description = isVi
    ? `${title} là dịch vụ ${typeLabel.toLowerCase()} đã xác thực tại ${place}, có tồn kho theo thời gian thực, giá minh bạch, biên nhận QR và lịch sử Hash mô phỏng.`
    : `${title} is a verified ${typeLabel.toLowerCase()} in ${place}, with live inventory, transparent pricing, QR receipt, and a simulated hash record.`;

  const detailByType: Record<string, string> = {
    flight: isVi
      ? `${provider} khai thác tuyến ${route || place}. Giá hiển thị bằng VND, kèm thông tin hành lý, hạng ghế, giờ khởi hành và biên nhận QR sau thanh toán.`
      : `${provider} operates the ${route || place} route. The fare is shown in VND, with baggage, seat class, departure time, and QR receipt after checkout.`,
    transport: isVi
      ? `${provider} hỗ trợ tuyến ${route || place} với số ghế còn lại, giờ đón/trả và thanh toán VND. Sau khi đặt, bạn nhận QR để đối soát khi sử dụng dịch vụ.`
      : `${provider} supports the ${route || place} route with live seat inventory, pickup/drop-off time, and VND checkout. After booking, you receive a QR receipt for service validation.`,
    trip: isVi
      ? `Combo bao gồm ${(service.packageIncludes || []).map((item) => translatePackageItem(item, language)).join(', ') || 'lưu trú, di chuyển và trải nghiệm chính'}. Thông tin đặt chỗ, thanh toán và Travel Passport được gom trong một biên nhận.`
      : `The package includes ${(service.packageIncludes || []).map((item) => translatePackageItem(item, language)).join(', ') || 'stay, transport, and key experiences'}. Booking, payment, and Travel Passport records are kept in one receipt.`,
    cinema: isVi
      ? `${provider} hiển thị suất chiếu, số ghế còn lại và giá vé rõ ràng. Bạn có thể thêm vào giỏ, thanh toán và nhận QR để check-in tại rạp.`
      : `${provider} shows showtime availability, remaining seats, and transparent ticket pricing. You can add it to cart, pay, and receive a QR code for cinema check-in.`,
  };

  const detail = detailByType[service.type] || (isVi
    ? `${title} hỗ trợ đầy đủ luồng đặt dịch vụ: xem chi tiết, thêm giỏ hàng, thanh toán, xác nhận QR, cập nhật Travel Passport, đối soát đối tác và lịch sử giao dịch.`
    : `${title} supports the full booking flow: service detail, cart, checkout, QR confirmation, Travel Passport update, partner reconciliation, and transaction history.`);

  const cancellationPolicy = isVi
    ? service.type === 'cinema'
      ? 'Vé xem phim có thể hủy trước khi đối tác xác nhận ghế, tùy chính sách rạp.'
      : service.type === 'trip'
        ? 'Chính sách combo theo nhà cung cấp, điều kiện hoàn/hủy được ghi rõ trong biên nhận.'
        : 'Miễn phí hủy trước 24 giờ khi chính sách đối tác cho phép.'
    : service.type === 'cinema'
      ? 'Cinema tickets can be cancelled before partner seat confirmation, depending on cinema policy.'
      : service.type === 'trip'
        ? 'Package cancellation follows provider policy, with refund conditions shown clearly in the receipt.'
        : 'Free cancellation up to 24 hours before use when partner policy allows.';

  return { title, description, detail, highlights: baseHighlights, cancellationPolicy };
}

function translateServiceHighlight(value: string, language: Language) {
  const key = normalizeCityKey(value);
  const vi: Record<string, string> = {
    'live-availability': 'Tồn kho theo thời gian thực',
    'qr-receipt': 'Biên nhận QR',
    'hash-record': 'Lịch sử Hash',
    'partner-verified': 'Đối tác đã xác thực',
    'vnd-total': 'Tổng tiền VND',
    'optional-international-card': 'Hỗ trợ thẻ quốc tế',
    'seat-inventory': 'Tồn kho ghế',
    'vnd-payment': 'Thanh toán VND',
    'hotel-included': 'Đã gồm khách sạn',
    'transport-included': 'Đã gồm di chuyển',
    'transport-support': 'Hỗ trợ di chuyển',
    'attraction-ticket': 'Vé tham quan',
    'local-tour': 'Tour địa phương',
    'nft-receipt-mock': 'Biên nhận NFT mô phỏng',
  };
  const en: Record<string, string> = {
    'live-availability': 'Live availability',
    'qr-receipt': 'QR receipt',
    'hash-record': 'Hash record',
    'partner-verified': 'Verified partner',
    'vnd-total': 'VND total',
    'optional-international-card': 'Optional international card',
    'seat-inventory': 'Seat inventory',
    'vnd-payment': 'VND payment',
    'hotel-included': 'Hotel included',
    'transport-included': 'Transport included',
    'transport-support': 'Transport support',
    'attraction-ticket': 'Attraction ticket',
    'local-tour': 'Local tour',
    'nft-receipt-mock': 'NFT receipt mock',
  };
  if (key.startsWith('estimated-total')) return language === 'vi' ? value.replace('Estimated total', 'Tổng ước tính') : value;
  if (key.startsWith('itinerary')) return language === 'vi' ? value.replace('Itinerary', 'Lịch trình') : value;
  return (language === 'vi' ? vi : en)[key] || value;
}

function translatePackageItem(value: string, language: Language) {
  const key = normalizeCityKey(value);
  const vi: Record<string, string> = {
    hotel: 'khách sạn',
    transport: 'di chuyển',
    'transport-support': 'hỗ trợ di chuyển',
    attraction: 'tham quan',
    'attraction-ticket': 'vé tham quan',
    'local-tour': 'tour địa phương',
    event: 'sự kiện',
    cinema: 'vé xem phim',
    'travel-passport-stamp': 'dấu Travel Passport',
  };
  const en: Record<string, string> = {
    hotel: 'hotel',
    transport: 'transport',
    'transport-support': 'transport support',
    attraction: 'attraction',
    'attraction-ticket': 'attraction ticket',
    'local-tour': 'local tour',
    event: 'event',
    cinema: 'cinema',
    'travel-passport-stamp': 'Travel Passport stamp',
  };
  return (language === 'vi' ? vi : en)[key] || value;
}

function statusLabel(value: string, language: Language) {
  const vi: Record<string, string> = {
    pending: 'Đang chờ',
    confirmed: 'Đã xác nhận',
    completed: 'Đã hoàn tất',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
    requested: 'Đã gửi yêu cầu',
    processing: 'Đang xử lý',
  };
  const en: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    requested: 'Requested',
    processing: 'Processing',
  };
  return (language === 'vi' ? vi : en)[value] || value;
}

const cinemaBrands = ['CGV Cinemas', 'Lotte Cinema', 'Galaxy Cinema', 'Beta Cinemas', 'Cinestar'];
const stayProvinces = ['Da Nang', 'Hoi An', 'Hue', 'Da Lat', 'Nha Trang', 'Phu Quoc', 'Ha Noi', 'Ho Chi Minh'];
const canonicalCities = [
  { slug: 'da-nang', nameVi: 'Đà Nẵng', nameEn: 'Da Nang', aliases: ['Da Nang', 'Đà Nẵng', 'da-nang', 'danang'] },
  { slug: 'hoi-an', nameVi: 'Hội An', nameEn: 'Hoi An', aliases: ['Hoi An', 'Hội An', 'hoi-an', 'hoian'] },
  { slug: 'hue', nameVi: 'Huế', nameEn: 'Hue', aliases: ['Hue', 'Huế'] },
  { slug: 'ha-noi', nameVi: 'Hà Nội', nameEn: 'Ha Noi', aliases: ['Ha Noi', 'Hà Nội', 'ha-noi', 'hanoi'] },
  { slug: 'tp-hcm', nameVi: 'TP.HCM', nameEn: 'Ho Chi Minh', aliases: ['Ho Chi Minh', 'Ho Chi Minh City', 'TP.HCM', 'tp-hcm', 'Sai Gon', 'Saigon'] },
  { slug: 'ninh-binh', nameVi: 'Ninh Bình', nameEn: 'Ninh Binh', aliases: ['Ninh Binh', 'Ninh Bình', 'ninh-binh'] },
  { slug: 'sa-pa', nameVi: 'Sa Pa', nameEn: 'Sa Pa', aliases: ['Sa Pa', 'Sapa', 'sa-pa'] },
  { slug: 'ha-giang', nameVi: 'Hà Giang', nameEn: 'Ha Giang', aliases: ['Ha Giang', 'Hà Giang', 'ha-giang'] },
  { slug: 'phong-nha', nameVi: 'Phong Nha', nameEn: 'Phong Nha', aliases: ['Phong Nha', 'phong-nha'] },
  { slug: 'da-lat', nameVi: 'Đà Lạt', nameEn: 'Da Lat', aliases: ['Da Lat', 'Đà Lạt', 'da-lat', 'dalat'] },
  { slug: 'phu-quoc', nameVi: 'Phú Quốc', nameEn: 'Phu Quoc', aliases: ['Phu Quoc', 'Phú Quốc', 'phu-quoc'] },
  { slug: 'nha-trang', nameVi: 'Nha Trang', nameEn: 'Nha Trang', aliases: ['Nha Trang', 'nha-trang'] },
];
const attractionNames = ['Ba Na Hills', 'Ngu Hanh Son', 'Hoi An Ancient Town', 'Hue Imperial City', 'Trang An', 'Fansipan', 'Phong Nha', 'VinWonders'];
const eventKinds = ['Festival', 'Concert', 'Local event', 'Workshop', 'Cultural show'];
const tourKinds = ['Lo Lo Chai', 'Quynh Son', 'Bay Mau Coconut Forest', 'Food tour', 'Craft village', 'Community tour'];
const destinationImages = [
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=84',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=84',
];
const destinations = [
  { nameVi: 'Đà Nẵng', nameEn: 'Da Nang', slug: 'da-nang', province: 'Da Nang', heroImage: destinationImages[0], descriptionVi: 'Biển Mỹ Khê, Bà Nà Hills, food tour, cinema night và đưa đón sân bay trong một hành trình.', descriptionEn: 'My Khe beach, Ba Na Hills, food tours, cinema nights, and airport transfers in one trip.', categories: ['stays', 'cinema', 'attractions', 'tours', 'restaurants', 'transport', 'flights'], featuredServices: ['Vé máy bay', 'Đưa đón sân bay', 'Khách sạn', 'Vé tham quan'], mapLabel: 'My Khe - Han River - Ba Na Hills' },
  { nameVi: 'Hội An', nameEn: 'Hoi An', slug: 'hoi-an', province: 'Hoi An', heroImage: destinationImages[1], descriptionVi: 'Phố cổ, đèn lồng, workshop thủ công, tour ẩm thực và homestay địa phương.', descriptionEn: 'Ancient town, lanterns, craft workshops, food tours, and local homestays.', categories: ['stays', 'attractions', 'tours', 'restaurants', 'transport'], featuredServices: ['Homestay', 'Tour địa phương', 'Ẩm thực', 'Vé tham quan'], mapLabel: 'Ancient Town - Lantern streets - Riverside' },
  { nameVi: 'Huế', nameEn: 'Hue', slug: 'hue', province: 'Hue', heroImage: destinationImages[2], descriptionVi: 'Di sản cố đô, ẩm thực cung đình, tàu ven biển và tour văn hóa.', descriptionEn: 'Imperial heritage, local cuisine, coastal rail, and cultural tours.', categories: ['stays', 'attractions', 'tours', 'restaurants', 'transport', 'flights'], featuredServices: ['Tàu hỏa', 'Vé tham quan', 'Tour văn hóa'], mapLabel: 'Imperial City - Perfume River - Phu Bai' },
  { nameVi: 'Hà Nội', nameEn: 'Ha Noi', slug: 'ha-noi', province: 'Ha Noi', heroImage: destinationImages[3], descriptionVi: 'Phố cổ, show văn hóa, vé máy bay, shuttle và khách sạn trung tâm.', descriptionEn: 'Old Quarter, cultural shows, flights, shuttles, and central stays.', categories: ['stays', 'cinema', 'attractions', 'tours', 'restaurants', 'transport', 'flights'], featuredServices: ['Vé máy bay', 'Khách sạn', 'Vé xem phim'], mapLabel: 'Old Quarter - Hoan Kiem - Noi Bai' },
  { nameVi: 'TP.HCM', nameEn: 'Ho Chi Minh City', slug: 'tp-hcm', province: 'Ho Chi Minh', heroImage: destinationImages[4], descriptionVi: 'Đô thị năng động với rạp phim, nhà hàng, sự kiện, khách sạn và sân bay.', descriptionEn: 'A dynamic city with cinemas, dining, events, hotels, and airport access.', categories: ['stays', 'cinema', 'events', 'restaurants', 'transport', 'flights'], featuredServices: ['Sự kiện', 'Nhà hàng', 'Airport transfer'], mapLabel: 'District 1 - Ben Thanh - Tan Son Nhat' },
  { nameVi: 'Ninh Bình', nameEn: 'Ninh Binh', slug: 'ninh-binh', province: 'Ninh Binh', heroImage: destinationImages[5], descriptionVi: 'Tràng An, hang động, tour sinh thái và homestay giữa thiên nhiên.', descriptionEn: 'Trang An, caves, eco tours, and nature homestays.', categories: ['stays', 'attractions', 'tours', 'restaurants', 'transport'], featuredServices: ['Vé tham quan', 'Tour sinh thái', 'Homestay'], mapLabel: 'Trang An - Tam Coc - Hang Mua' },
  { nameVi: 'Sa Pa', nameEn: 'Sa Pa', slug: 'sa-pa', province: 'Sa Pa', heroImage: destinationImages[6], descriptionVi: 'Núi, bản làng, xe giường nằm, tour cộng đồng và ẩm thực Tây Bắc.', descriptionEn: 'Mountains, villages, sleeper buses, community tours, and northern cuisine.', categories: ['stays', 'attractions', 'tours', 'restaurants', 'transport'], featuredServices: ['Xe giường nằm', 'Tour cộng đồng', 'Homestay'], mapLabel: 'Fansipan - Village trails - Town center' },
  { nameVi: 'Hà Giang', nameEn: 'Ha Giang', slug: 'ha-giang', province: 'Ha Giang', heroImage: destinationImages[7], descriptionVi: 'Cung đường cao nguyên đá, làng bản, tour địa phương và shuttle liên tỉnh.', descriptionEn: 'Karst plateau routes, villages, local tours, and intercity shuttles.', categories: ['stays', 'tours', 'restaurants', 'transport'], featuredServices: ['Tour địa phương', 'Shuttle', 'Ẩm thực'], mapLabel: 'Dong Van - Meo Vac - Lo Lo Chai' },
  { nameVi: 'Phong Nha', nameEn: 'Phong Nha', slug: 'phong-nha', province: 'Phong Nha', heroImage: destinationImages[8], descriptionVi: 'Hang động, tour khám phá, homestay xanh và trải nghiệm thiên nhiên.', descriptionEn: 'Caves, adventure tours, green homestays, and nature experiences.', categories: ['stays', 'attractions', 'tours', 'transport'], featuredServices: ['Vé tham quan', 'Tour hang động', 'Homestay'], mapLabel: 'Caves - Son River - National Park' },
  { nameVi: 'Đà Lạt', nameEn: 'Da Lat', slug: 'da-lat', province: 'Da Lat', heroImage: destinationImages[9], descriptionVi: 'Khí hậu mát, cà phê, homestay, tour văn hóa và combo cuối tuần.', descriptionEn: 'Cool weather, coffee, homestays, cultural tours, and weekend bundles.', categories: ['stays', 'tours', 'restaurants', 'transport', 'flights'], featuredServices: ['Homestay', 'Tour địa phương', 'Vé máy bay'], mapLabel: 'Xuan Huong - Coffee hills - Lien Khuong' },
  { nameVi: 'Phú Quốc', nameEn: 'Phu Quoc', slug: 'phu-quoc', province: 'Phu Quoc', heroImage: destinationImages[10], descriptionVi: 'Biển đảo, resort, VinWonders, nhà hàng hải sản và đưa đón sân bay.', descriptionEn: 'Island beaches, resorts, VinWonders, seafood dining, and airport transfers.', categories: ['stays', 'attractions', 'restaurants', 'transport', 'flights'], featuredServices: ['Resort', 'Vé tham quan', 'Airport transfer'], mapLabel: 'Long Beach - VinWonders - Airport' },
  { nameVi: 'Nha Trang', nameEn: 'Nha Trang', slug: 'nha-trang', province: 'Nha Trang', heroImage: destinationImages[11], descriptionVi: 'Biển, đảo, shuttle sân bay, khách sạn và tour ẩm thực.', descriptionEn: 'Beach, islands, airport shuttles, hotels, and dining tours.', categories: ['stays', 'attractions', 'tours', 'restaurants', 'transport', 'flights'], featuredServices: ['Shuttle sân bay', 'Khách sạn', 'Tour đảo'], mapLabel: 'Beachfront - Islands - Cam Ranh' },
];
const destinationPlaces = destinations.map((destination) => destination.nameEn);

function normalizeCityKey(value = '') {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function canonicalCity(value = '') {
  const key = normalizeCityKey(value);
  return canonicalCities.find((city) => city.slug === key || city.aliases.some((alias) => normalizeCityKey(alias) === key));
}

function cityDisplayName(value = '', language: Language = 'en') {
  const city = canonicalCity(value);
  if (city) return language === 'vi' ? city.nameVi : city.nameEn;
  return value;
}

function destinationSlug(place: string) {
  return getDestination(place)?.slug || place.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getDestination(value = '') {
  const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return destinations.find((destination) => destination.slug === normalized || destination.province.toLowerCase().replace(/\s+/g, '-') === normalized || destination.nameEn.toLowerCase().replace(/\s+/g, '-') === normalized || destination.nameVi.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-') === normalized);
}

function destinationFromSlug(slug = '', language: Language = 'en') {
  const city = canonicalCity(slug);
  if (city) return language === 'vi' ? city.nameVi : city.nameEn;
  const destination = getDestination(slug);
  if (destination) return language === 'vi' ? destination.nameVi : destination.nameEn;
  return slug;
}

function destinationProvince(slugOrName = '') {
  return canonicalCity(slugOrName)?.nameEn || getDestination(slugOrName)?.province || slugOrName;
}

const demoServices: Service[] = destinations.flatMap((destination, index) => [
  {
    _id: `demo-stay-${destination.slug}`,
    type: index % 2 ? 'homestay' : 'hotel',
    title: `${destination.nameEn} Verified Stay`,
    providerBrand: 'TravChain Select',
    province: destination.province,
    location: destination.mapLabel,
    destination: destination.province,
    priceVnd: 950000 + index * 50000,
    rating: 4.7,
    reviewCount: 120 + index * 8,
    availability: 12 + index,
    inventory: 12 + index,
    duration: '1 night',
    imageUrl: destination.heroImage,
    coverImage: destination.heroImage,
    gallery: [destination.heroImage],
    description: destination.descriptionEn,
    detail: destination.descriptionEn,
    highlights: ['QR receipt', 'Verified partner', 'Flexible cancellation'],
    cancellationPolicy: 'Free cancellation up to 24 hours before use when partner policy allows.',
    status: 'approved',
  },
  {
    _id: `demo-experience-${destination.slug}`,
    type: destination.categories.includes('cinema') ? 'cinema' : 'local_tour',
    title: destination.categories.includes('cinema') ? `${destination.nameEn} Cinema Night` : `${destination.nameEn} Local Experience`,
    providerBrand: destination.categories.includes('cinema') ? 'CGV' : 'Local Partner',
    province: destination.province,
    location: destination.mapLabel,
    destination: destination.province,
    priceVnd: destination.categories.includes('cinema') ? 120000 : 520000,
    rating: 4.8,
    reviewCount: 96 + index * 6,
    availability: 20 + index,
    inventory: 20 + index,
    duration: destination.categories.includes('cinema') ? '2 hours' : '4 hours',
    imageUrl: destination.heroImage,
    coverImage: destination.heroImage,
    gallery: [destination.heroImage],
    description: destination.descriptionEn,
    detail: destination.descriptionEn,
    highlights: ['Live availability', 'QR receipt', 'Hash record'],
    cancellationPolicy: 'Free cancellation up to 24 hours before use when partner policy allows.',
    status: 'approved',
  },
]);

function roleLabel(role: Role, language: Language) {
  if (role === 'traveler') return text[language].travelerRole;
  if (role === 'partner') return text[language].partnerRole;
  return text[language].adminRole;
}

function BrandLogo({ className = 'h-10 w-10', rounded = 'rounded-2xl' }: { className?: string; rounded?: string }) {
  return (
    <span className={`inline-flex shrink-0 overflow-hidden ${rounded} bg-white shadow-lg shadow-orange-500/20 ring-1 ring-orange-100/70`}>
      <img src="/travchain-logo.svg" alt="TravChain" className={`${className} object-contain`} />
    </span>
  );
}

function App() {
  return (
    <BrowserRouter>
      <TravChainApp />
    </BrowserRouter>
  );
}

function TravChainApp() {
  const [language, setLanguage] = useState<Language>(() => storedLanguage());
  const [currency, setCurrency] = useState<Currency>('VND');
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState<User | null>(() => readJson(USER_KEY, null));
  const [cart, setCart] = useState<CartItem[]>(() => readJson(CART_KEY, []));
  const [toast, setToast] = useState('');

  useEffect(() => localStorage.setItem(TOKEN_KEY, token), [token]);
  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);
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
  useEffect(() => {
    warnBrokenVietnamese('i18n dictionaries', text);
  }, []);

  const ctx = { language, currency, token, user, cart, setCart, setToast };

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#071326]">
      <Routes>
        <Route element={<CustomerLayout language={language} setLanguage={setLanguage} currency={currency} setCurrency={setCurrency} token={token} user={user} setUser={setUser} setToken={setToken} setToast={setToast} cartCount={cart.length} />}>
          <Route path="/" element={<LandingPage {...ctx} />} />
          <Route path="/login" element={<LoginPage language={language} setToken={setToken} setUser={setUser} />} />
          <Route path="/explore" element={<ExplorePage {...ctx} />} />
          <Route path="/destination/:slug" element={<DestinationPage {...ctx} />} />
          <Route path="/services" element={<ServicesPage {...ctx} />} />
          <Route path="/services/cinema" element={<CinemaPage {...ctx} />} />
          <Route path="/services/stays" element={<StaysPage {...ctx} />} />
          <Route path="/services/attractions" element={<CategoryPage {...ctx} type="attraction" titleVi="Vé tham quan" titleEn="Attractions" presets={attractionNames} />} />
          <Route path="/services/events" element={<CategoryPage {...ctx} type="event" titleVi="Sự kiện & lễ hội" titleEn="Events & festivals" presets={eventKinds} />} />
          <Route path="/services/tours" element={<CategoryPage {...ctx} type="local_tour" titleVi="Tour địa phương" titleEn="Local tours" presets={tourKinds} />} />
          <Route path="/services/restaurants" element={<CategoryPage {...ctx} type="restaurant" titleVi="Ẩm thực địa phương" titleEn="Local dining" presets={['Seafood', 'Street food', 'Culture dinner', 'Market tasting']} />} />
          <Route path="/services/flights" element={<FlightsPage {...ctx} />} />
          <Route path="/services/transport" element={<TransportPage {...ctx} />} />
          <Route path="/services/transport/bus" element={<TransportPage {...ctx} transportType="bus" />} />
          <Route path="/services/transport/train" element={<TransportPage {...ctx} transportType="train" />} />
          <Route path="/services/transport/airport-transfer" element={<TransportPage {...ctx} transportType="airport_transfer" />} />
          <Route path="/services/trips" element={<TripsPage {...ctx} />} />
          <Route path="/service/:id" element={<ServiceDetailPage {...ctx} />} />
          <Route path="/receipt/:bookingCode" element={<ReceiptPage language={language} currency={currency} />} />
          <Route path="/pricing" element={<PublicInfoPage language={language} titleKey="footer.links.pricing" />} />
          <Route path="/api-docs" element={<PublicInfoPage language={language} titleKey="footer.links.partnerApi" />} />
          <Route path="/membership" element={<PublicInfoPage language={language} titleKey="footer.links.nftMembership" />} />
          <Route path="/help" element={<PublicInfoPage language={language} titleKey="footer.links.help" />} />
          <Route path="/contact" element={<PublicInfoPage language={language} titleKey="footer.links.contact" />} />
          <Route path="/privacy" element={<PublicInfoPage language={language} titleKey="footer.links.privacy" />} />
          <Route path="/terms" element={<PublicInfoPage language={language} titleKey="footer.links.terms" />} />
          <Route path="/refund-policy" element={<PublicInfoPage language={language} titleKey="footer.links.refundPolicy" />} />
          <Route path="/bookings" element={<BookingsPage {...ctx} />} />
          <Route path="/passport" element={<PassportPage {...ctx} />} />
          <Route path="/wallet" element={<WalletPage {...ctx} />} />
          <Route element={<RequireRole user={user} token={token} roles={['traveler', 'admin']} />}>
            <Route path="/cart" element={<CartPage {...ctx} />} />
            <Route path="/checkout" element={<CheckoutPage {...ctx} />} />
            <Route path="/bookings/:id" element={<BookingDetailPage {...ctx} />} />
            <Route path="/profile" element={<ProfilePage {...ctx} setUser={setUser} setToken={setToken} />} />
            <Route path="/notifications" element={<NotificationsPage token={token} language={language} />} />
          </Route>
        </Route>
        <Route element={<RequireRole user={user} token={token} roles={['partner']} />}>
          <Route element={<PartnerLayout language={language} setLanguage={setLanguage} user={user} setUser={setUser} setToken={setToken} />}>
            <Route path="/partner/dashboard" element={<PartnerDashboardPage token={token} language={language} />} />
            <Route path="/partner/onboarding" element={<PartnerOnboardingPage language={language} />} />
            <Route path="/partner/services" element={<PartnerServicesPage token={token} language={language} />} />
            <Route path="/partner/services/:id" element={<PartnerServiceDetailPage token={token} language={language} />} />
            <Route path="/partner/services/:id/calendar" element={<PartnerCalendarPage language={language} />} />
            <Route path="/partner/services/:id/analytics" element={<PartnerAnalyticsPage token={token} language={language} />} />
            <Route path="/partner/bookings" element={<PartnerBookingsPage token={token} language={language} />} />
            <Route path="/partner/revenue" element={<PartnerRevenuePage token={token} language={language} />} />
            <Route path="/partner/wallet" element={<PartnerWalletPage token={token} language={language} />} />
            <Route path="/partner/payout" element={<PartnerPayoutPage token={token} language={language} setToast={setToast} />} />
            <Route path="/partner/reconciliation" element={<PartnerReconciliationPage token={token} language={language} />} />
            <Route path="/partner/refunds" element={<PartnerRefundsPage token={token} language={language} setToast={setToast} />} />
            <Route path="/partner/notifications" element={<NotificationsPage token={token} language={language} />} />
          </Route>
        </Route>
        <Route element={<RequireRole user={user} token={token} roles={['admin']} />}>
          <Route element={<AdminLayout language={language} setLanguage={setLanguage} user={user} setUser={setUser} setToken={setToken} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage token={token} language={language} />} />
            <Route path="/admin/users" element={<AdminUsersPage token={token} language={language} />} />
            <Route path="/admin/partners" element={<AdminPartnersPage token={token} language={language} />} />
            <Route path="/admin/services" element={<AdminServicesPage token={token} language={language} setToast={setToast} />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage token={token} language={language} />} />
            <Route path="/admin/revenue" element={<AdminRevenuePage token={token} language={language} />} />
            <Route path="/admin/refunds" element={<AdminRefundsPage token={token} language={language} setToast={setToast} />} />
            <Route path="/admin/logs" element={<AdminLogsPage token={token} language={language} />} />
          </Route>
        </Route>
      </Routes>
      {toast && <div className="fixed bottom-[6.5rem] left-4 right-4 z-50 mx-auto max-w-md rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl md:bottom-5 md:right-5 md:left-auto">{toast}</div>}
    </div>
  );
}

function CustomerLayout({ language, setLanguage, currency, setCurrency, token, user, setUser, setToken, setToast, cartCount }: {
  language: Language;
  setLanguage: (value: Language) => void;
  currency: Currency;
  setCurrency: (value: Currency) => void;
  token: string;
  user: User | null;
  setUser: (value: User | null) => void;
  setToken: (value: string) => void;
  setToast: (value: string) => void;
  cartCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();
  const t = text[language];
  const notifications = useAuthed<any[]>('/api/notifications', token, []);
  const unread = notifications.data.filter((item) => !item.readStatus).length;
  const footerInfoPaths = ['/pricing', '/api-docs', '/membership', '/help', '/contact', '/privacy', '/terms', '/refund-policy'];
  const showFooter = location.pathname === '/' ||
    location.pathname === '/explore' ||
    location.pathname === '/services' ||
    location.pathname.startsWith('/destination/') ||
    location.pathname.startsWith('/services/') ||
    location.pathname.startsWith('/receipt/') ||
    footerInfoPaths.includes(location.pathname);
  const nav = [
    ['/', t.explore],
    ['/services', t.services],
    ['/bookings', t.bookings],
    ['/passport', t.passport],
    ['/wallet', t.wallet],
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E8E1D5]/80 bg-[#FFFDF8]/94 shadow-[0_8px_28px_rgba(5,10,31,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <BrandLogo />
            <span className="min-w-0">
              <span className="block truncate text-lg font-extrabold tracking-normal">TravChain</span>
              <span className="block truncate text-xs font-semibold text-[#667085]">All Travel One Tap</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map(([to, label]) => <NavItem key={to} to={to} label={label} />)}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/cart" aria-label={t.cart} className="relative hidden rounded-full border border-[#E8E1D5] bg-[#F7F2E8] px-3 py-2 text-sm font-bold text-[#050A1F] transition hover:border-[#FF5A00]/30 hover:bg-orange-50 hover:text-[#FF5A00] sm:flex">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF5A00] px-1 text-[11px] text-white">{cartCount}</span>}
            </Link>
            {user && <Link to={user.role === 'admin' ? '/admin/logs' : user.role === 'partner' ? '/partner/notifications' : '/notifications'} aria-label={t.notifications} className="relative hidden rounded-full border border-[#E8E1D5] bg-[#F7F2E8] px-3 py-2 text-sm font-bold text-[#050A1F] transition hover:border-[#FF5A00]/30 hover:bg-orange-50 hover:text-[#FF5A00] sm:flex">
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF5A00] px-1 text-[11px] text-white">{unread}</span>}
            </Link>}
            <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="hidden rounded-full border border-[#E8E1D5] bg-[#F7F2E8] px-3 py-2 text-sm font-bold transition hover:border-[#FF5A00]/30 hover:bg-orange-50 hover:text-[#FF5A00] sm:flex">
              <Languages className="mr-2 h-4 w-4" />{language.toUpperCase()}
            </button>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} className="hidden rounded-full border border-[#E8E1D5] bg-[#F7F2E8] px-3 py-2 text-sm font-bold outline-none hover:border-[#FF5A00]/30 sm:block">
              <option value="VND">VND</option>
            </select>
            {user ? (
              <UserMenu user={user} language={language} setUser={setUser} setToken={setToken} />
            ) : (
              <Link to="/login" className="hidden rounded-full bg-[#050A1F] px-4 py-2 text-sm font-black text-white transition hover:bg-[#FF5A00] sm:block">{t.signIn}</Link>
            )}
            <button onClick={() => setMenuOpen(true)} className="rounded-xl border border-[#E8E1D5] bg-[#F7F2E8] p-2 lg:hidden" aria-label={t.menu}>
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="page-transition pb-24 lg:pb-0">
        <Outlet />
      </main>

      {showFooter && <MarketplaceFooter language={language} setToast={setToast} />}
      <MobileBottomNav language={language} />
      <ChatBox language={language} user={user} />
      {menuOpen && <MobileDrawer language={language} setLanguage={setLanguage} currency={currency} setCurrency={setCurrency} close={() => setMenuOpen(false)} user={user} setUser={setUser} setToken={setToken} />}
      {authOpen && <AuthModal language={language} setToken={setToken} setUser={setUser} close={() => setAuthOpen(false)} />}
    </>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return <NavLink end={to === '/'} to={to} className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? 'bg-[#050A1F] text-white shadow-sm shadow-slate-950/15' : 'text-slate-600 hover:bg-orange-50 hover:text-[#FF5A00]'}`}>{label}</NavLink>;
}

function MarketplaceFooter({ language, setToast }: { language: Language; setToast: (value: string) => void }) {
  const [email, setEmail] = useState('');
  const translate = (key: string) => translateText(language, key);
  const columns = [
    {
      title: translate('footer.columns.services'),
      links: [
        ['footer.links.stays', '/services/stays'],
        ['footer.links.attractions', '/services/attractions'],
        ['footer.links.cinema', '/services/cinema'],
        ['footer.links.events', '/services/events'],
        ['footer.links.tours', '/services/tours'],
      ],
    },
    {
      title: translate('footer.columns.business'),
      links: [
        ['footer.links.partnerPortal', '/login?role=partner'],
        ['footer.links.pricing', '/pricing'],
        ['footer.links.partnerApi', '/api-docs'],
        ['footer.links.reconciliation', '/partner/reconciliation'],
      ],
    },
    {
      title: translate('footer.columns.blockchain'),
      links: [
        ['footer.links.transparentTransactions', '/passport'],
        ['footer.links.nftMembership', '/membership'],
        ['footer.links.bookingHash', '/receipt/demo'],
        ['footer.links.smartSuggestions', '/explore'],
      ],
    },
    {
      title: translate('footer.columns.support'),
      links: [
        ['footer.links.help', '/help'],
        ['footer.links.contact', '/contact'],
        ['footer.links.privacy', '/privacy'],
        ['footer.links.terms', '/terms'],
        ['footer.links.refundPolicy', '/refund-policy'],
      ],
    },
  ];
  const socials: Array<[string, string, LucideIcon]> = [
    ['Facebook', '#', Facebook],
    ['Instagram', '#', Instagram],
    ['X', '#', Twitter],
    ['LinkedIn', '#', Linkedin],
  ];

  function submit(event: FormEvent) {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setToast(translate('footer.newsletter.error'));
      return;
    }
    setEmail('');
    setToast(translate('footer.newsletter.success'));
  }

  return (
    <footer className="border-t border-white/10 bg-[#061B1A] bg-[linear-gradient(135deg,#061B1A_0%,#071E2D_52%,#050A1F_100%)] text-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 border-b border-white/10 pb-9 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div className="max-w-xl">
            <Link to="/" className="inline-flex items-center gap-3">
              <BrandLogo className="h-12 w-12" />
              <span>
                <span className="block text-2xl font-black tracking-normal">TravChain</span>
                <span className="block text-sm font-black text-[#A7FFF0]">{translate('footer.brand.tagline')}</span>
              </span>
            </Link>
            <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-[#CBD5E1]">{translate('footer.brand.description')}</p>
          </div>
          <form onSubmit={submit} className="w-full lg:justify-self-end">
            <label className="text-sm font-black text-[#F8FAFC]">{translate('footer.newsletter.title')}</label>
            <div className="mt-3 flex w-full flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={translate('footer.newsletter.placeholder')}
                className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#050A1F]/80 px-4 text-sm font-bold text-white outline-none placeholder:text-[#94A3B8] focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/30"
              />
              <button className="min-h-12 rounded-2xl bg-[#FF5A00] px-5 text-sm font-black text-white shadow-lg shadow-orange-950/25 transition hover:bg-[#e65100] focus:outline-none focus:ring-2 focus:ring-[#FF5A00]/40">{translate('footer.newsletter.submit')}</button>
            </div>
          </form>
        </div>

        <div className="grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#A7FFF0]">{column.title}</h2>
              <div className="mt-4 grid gap-3">
                {column.links.map(([labelKey, to]) => (
                  <Link key={to} to={to} className="w-fit text-sm font-bold leading-6 text-[#CBD5E1] transition hover:text-[#FF5A00]">
                    {translate(labelKey)}
                  </Link>
                ))}
              </div>
            </nav>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-7 text-center sm:flex-row sm:text-left">
          <p className="text-xs font-bold text-[#94A3B8]">Copyright 2026 TravChain</p>
          <div className="flex justify-center gap-3">
            {socials.map(([label, href, Icon]) => (
              <a key={label} href={href} aria-label={label} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-[#CBD5E1] transition hover:border-[#FF5A00]/70 hover:bg-[#FF5A00]/12 hover:text-white">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function UserMenu({ user, language, setUser, setToken }: { user: User; language: Language; setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const items: Record<Role, Array<[string, string]>> = {
    traveler: [
      ['/profile', text[language].profile],
      ['/bookings', text[language].myBookings],
      ['/wallet', text[language].wallet],
      ['/passport', text[language].passportTitle],
    ],
    partner: [
      ['/partner/dashboard', text[language].partnerDashboard],
      ['/partner/services', text[language].services],
      ['/partner/bookings', text[language].bookings],
      ['/partner/wallet', text[language].wallet],
    ],
    admin: [
      ['/admin/dashboard', text[language].adminDashboard],
      ['/admin/users', text[language].users],
      ['/admin/services', text[language].services],
      ['/admin/revenue', text[language].revenue],
    ],
  };

  function logout() {
    setUser(null);
    setToken('');
    setOpen(false);
  }

  return (
    <div className="relative hidden sm:block">
      <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full bg-[#050A1F] px-3 py-2 text-sm font-black text-white transition hover:bg-[#071E2D]">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#FF5A00] text-xs">{user.name.slice(0, 1).toUpperCase()}</span>
        <span className="max-w-32 truncate">{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-slate-200">
          <div className="px-3 py-3">
            <p className="truncate font-black">{user.name}</p>
            <p className="truncate text-xs font-bold text-slate-500">{user.email} / {roleLabel(user.role, language)}</p>
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
    ['/', language === 'vi' ? 'Trang chủ' : 'Home', Search],
    ['/services', t.services, TicketCheck],
    ['/bookings', t.bookings, ShoppingBag],
    ['/passport', t.passport, QrCode],
    ['/profile', language === 'vi' ? 'Tài khoản' : 'Account', UserRound],
  ] as const;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8E2D8] bg-white/95 px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_34px_rgba(7,19,38,0.08)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map(([to, label, Icon]) => {
          const navLabel = to === '/' ? t.explore : to === '/profile' ? t.profile : label;
          return (
            <NavLink end={to === '/'} key={to} to={to} className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold transition ${isActive ? 'bg-[#FFF1E6] text-[#FF6A00]' : 'text-slate-500 active:bg-slate-100'}`}>
              <Icon className="h-5 w-5 shrink-0" />
              <span className="max-w-full truncate leading-none">{navLabel}</span>
            </NavLink>
          );
        })}
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
    traveler: [['/profile', t.profile], ['/bookings', t.myBookings], ['/wallet', t.wallet], ['/passport', t.passportTitle]],
    partner: [['/partner/dashboard', t.partnerDashboard], ['/partner/services', t.services], ['/partner/bookings', t.bookings], ['/partner/wallet', t.wallet]],
    admin: [['/admin/dashboard', t.adminDashboard], ['/admin/users', t.users], ['/admin/services', t.services], ['/admin/revenue', t.revenue]],
  };
  const links = user ? roleLinks[user.role] : [['/', t.explore], ['/services', t.services], ['/passport', t.passportTitle], ['/wallet', t.wallet]];
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 p-3 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black">TravChain</p>
            <p className="text-xs font-bold text-slate-500">All Travel One Tap</p>
          </div>
          <button onClick={close} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 grid gap-2 overflow-y-auto pb-2">
          {links.map(([to, label]) => <Link onClick={close} key={to} to={to} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black">{label}</Link>)}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black">{language.toUpperCase()}</button>
          <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black">
            <option value="VND">VND</option>
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

function ChatBox({ language, user }: { language: Language; user: User | null }) {
  const t = text[language];
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [unread, setUnread] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [memory, setMemory] = useState<Record<string, string>>({});
  const prompts = [
    [t.chatQuickCinema, t.chatQuickCinema, Film],
    [t.chatQuickHotel, t.chatQuickHotel, Hotel],
    [t.chatQuickAttraction, t.chatQuickAttraction, TicketCheck],
    [t.chatQuickAirport, t.chatQuickAirport, Car],
    [t.chatQuickRefund, t.chatQuickRefund, WalletCards],
    [t.chatQuickPassport, t.chatQuickPassport, Sparkles],
  ].map(([label, value, icon]) => ({ label: label as string, value: value as string, icon: icon as LucideIcon }));
  const workspacePrompts = prompts.slice(0, 4);
  const latestResultMessage = [...messages].reverse().find((message) => message.role === 'assistant' && (message.items?.length || message.intent));
  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
  const latestItems = latestResultMessage?.items || [];
  const latestIntent = latestResultMessage?.intent || 'fallback';
  const compactChips = messages.length ? (latestAssistantMessage?.followUps?.length ? latestAssistantMessage.followUps : prompts.map((prompt) => prompt.value)) : [];
  const shellClass = expanded
    ? 'fixed inset-0 z-50 grid place-items-end bg-[#050A1F]/62 p-0 backdrop-blur-sm lg:place-items-center lg:p-6'
    : 'fixed inset-0 z-50 flex items-end bg-[#050A1F]/48 p-3 backdrop-blur-sm lg:pointer-events-none lg:items-end lg:justify-end lg:bg-transparent lg:p-6';
  const panelClass = expanded
    ? 'pointer-events-auto flex h-[100dvh] w-full max-w-full flex-col overflow-hidden rounded-none bg-white text-[#050A1F] shadow-2xl shadow-slate-950/30 animate-chat-in lg:h-[82vh] lg:max-h-[820px] lg:w-[1120px] lg:max-w-[calc(100vw-48px)] lg:rounded-[28px]'
    : 'pointer-events-auto flex h-[85vh] w-full max-w-full flex-col overflow-hidden rounded-t-[24px] bg-white text-[#050A1F] shadow-2xl shadow-slate-950/30 animate-chat-in lg:h-[680px] lg:w-[420px] lg:max-w-[calc(100vw-48px)] lg:rounded-[24px]';

  useEffect(() => {
    if (open) {
      setUnread(false);
      window.setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    }
  }, [open, messages, loading]);

  async function ask(prompt: string) {
    const message = prompt.trim();
    if (!message || loading) return;
    const nextMemory = updateAssistantMemory(memory, message, language);
    setMemory(nextMemory);
    setInput('');
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setLoading(true);
    try {
      const result = await api('/api/assistant/chat', {
        method: 'POST',
        body: {
          message,
          language,
          sessionId: `web-${user?.id || 'guest'}`,
          userId: user?.id,
          history: messages.slice(-6).map((item) => ({ role: item.role, text: item.text })),
          context: {
            currentRoute: location.pathname,
            city: nextMemory.city,
            category: nextMemory.category,
            date: nextMemory.date,
            provider: nextMemory.provider,
            budget: nextMemory.budget,
            lastIntent: nextMemory.lastIntent,
          },
        },
      }) as AssistantResponse;
      if (result.contextPatch) setMemory({ ...nextMemory, ...result.contextPatch });
      setMessages((current) => [...current, {
        role: 'assistant',
        text: result.answer,
        intent: result.intent,
        items: result.items,
        followUps: result.followUps,
        actions: result.actions,
        filters: result.filters,
      }]);
    } catch {
      setMessages((current) => [...current, {
        role: 'assistant',
        text: t.chatError,
        followUps: [t.chatRetry],
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      ask(input);
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setMinimized(false); }}
        className="group fixed bottom-[6.75rem] right-4 z-40 flex items-center gap-3 rounded-full border border-white/20 bg-[#050A1F]/94 px-4 py-3 text-sm font-bold text-white shadow-2xl shadow-orange-500/25 backdrop-blur-xl transition hover:scale-[1.03] hover:bg-[#071E2D] lg:bottom-6 lg:right-6"
        aria-label={t.askTravChain}
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#FF5A00] text-white shadow-lg shadow-orange-950/30">
          <Sparkles className="h-5 w-5" />
          {unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#14B8A6] ring-2 ring-[#050A1F] pulse-dot" />}
        </span>
        <span className="hidden sm:block">{t.askTravChain}</span>
      </button>
      {open && !minimized && (
        <div className={shellClass}>
          <aside className={panelClass}>
            <div className="bg-[#050A1F] p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-xl font-semibold leading-tight"><BrandLogo className="h-8 w-8" rounded="rounded-full" />{t.chatAssistantTitle}</h2>
                  <p className="mt-1 text-sm font-medium text-white/70">{t.chatAssistantSubtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-white/78"><span className="h-2 w-2 rounded-full bg-[#14B8A6]" />{t.chatReady}</span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">Ollama + {t.chatDataSource}</span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/70">24/7</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                        <button onClick={() => setExpanded((value) => !value)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/8 text-white transition hover:bg-white/14" aria-label={expanded ? t.compact : t.expand}>
                    {expanded ? <Minimize2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setMinimized(true)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/8 text-white transition hover:bg-white/14" aria-label={t.minimize}>
                    <span className="h-0.5 w-4 rounded-full bg-white" />
                  </button>
                  <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/8 text-white transition hover:bg-white/14" aria-label={t.close}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <div className={expanded ? 'tc-scroll grid min-h-0 flex-1 gap-4 overflow-y-auto overflow-x-hidden bg-[#F7F2E8] p-4 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] lg:overflow-hidden' : 'min-h-0 flex-1 overflow-hidden bg-[#F7F2E8] p-4'}>
              <div className={expanded ? 'flex h-[62vh] min-h-[420px] min-w-0 flex-col overflow-hidden rounded-[24px] bg-[#FFFDF8] shadow-[0_18px_45px_rgba(7,17,38,0.06)] lg:h-auto lg:min-h-0' : 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'}>
                <div className="tc-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
                  {!messages.length && <AssistantWelcome prompts={prompts.slice(0, 4)} ask={ask} language={language} showCards={!expanded} />}
                  <div className="grid gap-3">
                    {messages.map((message, index) => (
                      <div key={`${message.role}-${index}`} className={`message-fade min-w-0 max-w-[94%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                        {message.role === 'assistant' && <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-[#667085]"><BrandLogo className="h-6 w-6" rounded="rounded-full" />TravChain</div>}
                        <div className={`max-w-full overflow-hidden rounded-[22px] p-3 ${message.role === 'user' ? 'bg-[#050A1F] text-white shadow-lg shadow-slate-950/10' : 'bg-white text-[#050A1F] shadow-sm ring-1 ring-slate-100'}`}>
                          <p className="max-w-full break-words text-sm font-medium leading-6">{message.text}</p>
                          {message.items?.length && !expanded ? <AssistantResultCards items={message.items} close={() => setOpen(false)} language={language} /> : null}
                          {message.error && <FollowUpChips chips={[t.chatRetry]} ask={ask} language={language} error />}
                        </div>
                      </div>
                    ))}
                    {loading && <AssistantLoading language={language} />}
                    <div ref={endRef} />
                  </div>
                </div>
                <div className="shrink-0 bg-white p-4 shadow-[0_-12px_30px_rgba(7,17,38,0.06)]">
                  {compactChips.length > 0 && <FollowUpChips chips={compactChips} ask={ask} language={language} />}
                  <form onSubmit={submit} className="mt-3 flex gap-2 rounded-[22px] bg-slate-50 p-2 ring-1 ring-slate-100">
                    <textarea rows={1} value={input} onKeyDown={keyDown} onChange={(event) => setInput(event.target.value)} placeholder={t.chatPlaceholder} className="max-h-24 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-sm font-medium text-[#050A1F] outline-none placeholder:text-slate-400" />
                    <button disabled={loading || !input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] bg-[#FF5A00] text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:opacity-60" aria-label={t.sendMessage}><Send className="h-4 w-4" /></button>
                  </form>
                </div>
              </div>
              {expanded && (
                <AssistantWorkspace items={latestItems} intent={latestIntent} filters={latestResultMessage?.filters || []} hasSearched={Boolean(latestResultMessage)} ask={ask} close={() => setOpen(false)} language={language} prompts={workspacePrompts} />
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function AssistantWelcome({ prompts, ask, language, showCards = true }: { prompts: Array<{ label: string; value: string; icon: LucideIcon }>; ask: (value: string) => void; language: Language; showCards?: boolean }) {
  const t = text[language];
  return (
    <div className="message-fade mb-4 rounded-[24px] bg-white p-4 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
      <div className="flex items-start gap-3">
        <BrandLogo className="h-11 w-11" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-6 text-[#050A1F]">{t.assistantWelcomeBody}</p>
          {showCards && <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {prompts.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <button key={prompt.value} onClick={() => ask(prompt.value)} className="group flex max-w-full items-center gap-2 rounded-2xl bg-[#FFFDF8] px-3 py-3 text-left text-sm font-bold text-[#050A1F] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-orange-50 hover:text-[#FF5A00] hover:shadow-lg hover:shadow-orange-500/10">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#FF5A00] group-hover:bg-[#FF5A00] group-hover:text-white"><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0">{prompt.label}</span>
                </button>
              );
            })}
          </div>}
        </div>
      </div>
    </div>
  );
}

function AssistantLoading({ language }: { language: Language }) {
  const t = text[language];
  return (
    <div className="message-fade mr-auto min-w-0 max-w-[94%]">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-[#667085]"><BrandLogo className="h-6 w-6" rounded="rounded-full" />TravChain</div>
      <div className="rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><span className="pulse-dot" />{t.chatTyping}</div>
        <div className="mt-3 grid gap-2">
          <div className="h-16 rounded-2xl shimmer" />
          <div className="h-16 rounded-2xl shimmer" />
        </div>
      </div>
    </div>
  );
}

function updateAssistantMemory(current: Record<string, string>, message: string, language: Language) {
  const normalized = message.toLowerCase();
  const normalizedKey = normalizeCityKey(message).replace(/-/g, ' ');
  const next = { ...current };
  const cities = [
    ['da nang', 'Da Nang'], ['đà nẵng', 'Da Nang'],
    ['hoi an', 'Hoi An'], ['hội an', 'Hoi An'],
    ['hue', 'Hue'], ['huế', 'Hue'],
    ['ha noi', 'Ha Noi'], ['hà nội', 'Ha Noi'],
    ['ho chi minh', 'Ho Chi Minh'], ['sài gòn', 'Ho Chi Minh'],
  ];
  const providers = ['cgv', 'lotte', 'galaxy', 'beta', 'cinestar'];
  const categories = [
    ['phim', 'cinema'], ['movie', 'cinema'], ['cinema', 'cinema'],
    ['khách sạn', 'hotel'], ['hotel', 'hotel'], ['homestay', 'homestay'],
    ['tour', 'local_tour'], ['vé máy bay', 'flight'], ['flight', 'flight'],
    ['shuttle', 'airport_transfer'], ['sân bay', 'airport_transfer'],
    ['hoàn tiền', 'refund'], ['refund', 'refund'], ['ví', 'wallet'], ['wallet', 'wallet'],
  ];
  const budget = message.match(/(\d+)\s*(triệu|tr|m|million)/i);
  const dateHint = normalized.includes('tối nay') || normalized.includes('tonight') ? (language === 'vi' ? 'tối nay' : 'tonight') : normalized.includes('cuối tuần') || normalized.includes('weekend') ? (language === 'vi' ? 'cuối tuần' : 'weekend') : '';
  const canonical = canonicalCities.find((item) => item.aliases.some((alias) => normalizedKey.includes(normalizeCityKey(alias).replace(/-/g, ' '))));
  const city = canonical ? null : cities.find(([needle]) => normalized.includes(needle));
  const provider = providers.find((needle) => normalized.includes(needle));
  const category = categories.find(([needle]) => normalized.includes(needle));
  if (canonical) next.city = canonical.nameEn;
  else if (city) next.city = city[1];
  if (provider) next.provider = provider.toUpperCase();
  if (category) next.category = category[1];
  if (budget) next.budget = budget[0];
  if (dateHint) next.date = dateHint;
  return next;
}

function FollowUpChips({ chips, ask, language, error }: { chips: string[]; ask: (value: string) => void; language: Language; error?: boolean }) {
  const t = text[language];
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chips.slice(0, 5).map((chip) => (
        <button key={chip} onClick={() => ask(error ? t.chatQuickCinema : chip)} className="max-w-full whitespace-normal rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold leading-4 text-[#FF5A00] transition hover:bg-orange-100">
          {error ? t.chatRetry : chip}
        </button>
      ))}
    </div>
  );
}

function AssistantWorkspace({ items, intent, filters, hasSearched, ask, close, language, prompts }: { items: AssistantItem[]; intent: AssistantIntent; filters: Array<{ key: string; label: string; options: string[] }>; hasSearched: boolean; ask: (value: string) => void; close: () => void; language: Language; prompts: Array<{ label: string; value: string; icon: LucideIcon }> }) {
  const t = text[language];
  const isCinema = intent === 'cinema_showtimes';
  const hasResults = items.length > 0;
  return (
    <aside className="tc-scroll min-w-0 overflow-y-auto overflow-x-hidden rounded-[24px] bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
      {!hasResults ? (
        <div className="grid min-h-full place-items-center">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#050A1F] text-white shadow-xl shadow-slate-950/20"><Sparkles className="h-6 w-6 text-[#FF5A00]" /></div>
            <h3 className="mt-5 text-2xl font-black text-[#050A1F]">{hasSearched ? t.assistantNoResults : t.chatWelcome}</h3>
            {!hasSearched && <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">{t.assistantEmptyWorkspace}</p>}
            {hasSearched ? (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[t.assistantChangeLocation, t.assistantViewAllServices, t.assistantTryTomorrow].map((chip) => <button key={chip} onClick={() => ask(chip)} className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black text-[#FF5A00] transition hover:bg-orange-100">{chip}</button>)}
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {prompts.map((prompt) => {
                  const Icon = prompt.icon;
                  return (
                    <button key={prompt.value} onClick={() => ask(prompt.value)} className="group rounded-[24px] bg-[#FFFDF8] p-4 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-xl hover:shadow-orange-500/10">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-[#FF5A00] group-hover:bg-[#FF5A00] group-hover:text-white"><Icon className="h-5 w-5" /></span>
                      <span className="mt-3 block text-sm font-black text-[#050A1F]">{prompt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="rounded-[24px] bg-[#050A1F] p-5 text-white shadow-xl shadow-slate-950/10">
            <p className="text-xs font-black uppercase tracking-[.14em] text-white/48">{t.assistantResults}</p>
            <h3 className="mt-2 text-2xl font-black">{isCinema ? t.cinemaTicketsTitle : t.assistantItineraryPreview}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/68">{t.assistantBookingSummary}</p>
          </div>
          <AssistantFilters filters={filters} language={language} fallbackCinema={isCinema} />
          <AssistantResultCards items={items} close={close} language={language} compact />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-[#FFFDF8] p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#667085]">{t.assistantItineraryPreview}</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#050A1F]">{items[0]?.location || items[0]?.province}</p>
            </div>
            <div className="rounded-[24px] bg-[#FFFDF8] p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#667085]">{t.assistantMapPreview}</p>
              <div className="mt-3 h-24 rounded-2xl bg-[linear-gradient(135deg,#F7F2E8,#FFE4D0)] p-3">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#FF5A00] shadow-sm">{items[0]?.province || items[0]?.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function AssistantFilters({ filters, language, fallbackCinema }: { filters: Array<{ key: string; label: string; options: string[] }>; language: Language; fallbackCinema: boolean }) {
  const t = text[language];
  const rows = filters.length ? filters : fallbackCinema ? [
    { key: 'provider', label: t.assistantProviderFilter, options: ['CGV', 'Lotte', 'Galaxy', 'Beta', 'Cinestar'] },
    { key: 'time', label: t.assistantTimeFilter, options: ['18:00', '19:30', '20:15', '21:00'] },
    { key: 'price', label: t.assistantPriceFilter, options: ['< 120K', '120K-150K', '> 150K'] },
  ] : [];
  if (!rows.length) return null;
  return (
    <div className="grid gap-3 rounded-[24px] bg-[#FFFDF8] p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs font-black uppercase tracking-[.14em] text-[#667085]">{t.assistantFilters}</p>
      {rows.map((row) => <FilterChipRow key={row.key} label={row.label} values={row.options} />)}
    </div>
  );
}

function FilterChipRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black text-[#667085]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => <button key={value} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#050A1F] shadow-sm ring-1 ring-slate-100 transition hover:bg-[#050A1F] hover:text-white">{value}</button>)}
      </div>
    </div>
  );
}

function AssistantResultCards({ items, close, language, compact = false }: { items: AssistantItem[]; close: () => void; language: Language; compact?: boolean }) {
  const t = text[language];
  return (
    <div className="mt-3 grid max-w-full gap-3 overflow-hidden">
      {items.map((item) => (
        <div key={item.id} className="premium-lift max-w-full overflow-hidden rounded-[20px] border border-slate-100 bg-[#FFFDF8]">
          <div className="flex gap-3 p-3">
            <img src={item.image || FALLBACK_IMAGE} className={`${compact ? 'h-20 w-20' : 'h-24 w-24'} shrink-0 rounded-2xl object-cover`} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-black">{item.title}</p>
              <p className="mt-1 break-words text-xs font-semibold text-slate-500">{item.providerBrand || item.type} / {item.location}</p>
              {item.movieTitle && <p className="mt-1 text-xs font-bold text-[#FF5A00]">{item.movieTitle}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {(item.badges || []).slice(0, 3).map((badge) => <span key={badge} className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">{badge}</span>)}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.timeSlots.slice(0, 4).map((slot) => <span key={slot} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{slot}</span>)}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                <span>{money(item.priceVnd, 'VND')}</span>
                {item.rating > 0 && <span>{t.rating} {item.rating} ({item.reviewCount || 0})</span>}
                {item.inventory > 0 && <span>{item.inventory} {t.slotsAvailable}</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-slate-100 text-center text-xs font-black">
            <Link to={item.ctaUrl} onClick={close} className="px-2 py-2 text-[#050A1F] transition hover:bg-slate-50">{t.detail}</Link>
            <Link to={item.ctaUrl} onClick={close} className="bg-[#050A1F] px-2 py-2 text-white transition hover:bg-[#FF5A00]">{item.ctaLabel || t.bookNow}</Link>
            <Link to={item.ctaUrl} onClick={close} className="px-2 py-2 text-[#FF5A00] transition hover:bg-orange-50">{t.addCart}</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function LandingPage(props: AppContext) {
  const { language } = props;
  const t = text[language];
  const { data: featured } = useServices('/api/services?limit=8');
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const vi = language === 'vi';
  return (
    <>
      <section className="relative overflow-hidden bg-[#071326] text-white">
        <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85" className="parallax-slow absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="animated-hero-overlay absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F8F4EC] to-transparent sm:h-24" />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold text-amber-100 backdrop-blur sm:mb-4 sm:px-4 sm:py-2 sm:text-sm"><Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{t.dappBadge}</p>
            <h1 className="display-lg max-w-4xl lg:whitespace-nowrap">{t.heroTitle}</h1>
            <p className="body-lg mt-3 max-w-2xl text-white/82 sm:mt-5">{t.heroBody}</p>
          </div>
          <SearchBar language={language} />
          <HeroTrustStrip language={language} />
        </div>
      </section>
      <div className="bg-[#F8F4EC]">
        <Section title={t.categoryAccess} subtitle={t.homeServiceGridSubtitle}>
          <CategoryGrid language={language} />
        </Section>
        <Section title={t.featuredDestinations} subtitle={t.featuredDestinationsSubtitle}>
          <DestinationGrid language={language} />
        </Section>
        <Section title={t.homeRecommendedTitle} subtitle={t.homeRecommendedSubtitle}>
          <ServiceGrid services={featured.slice(0, 8)} {...props} />
        </Section>
        <Testimonials language={language} />
        <Section title={t.homeAiTitle} subtitle={t.homeAiSubtitle}>
          <AiSuggestionGrid language={language} />
        </Section>
        <Section title={t.homeTripInspirationTitle} subtitle={t.homeTripInspirationSubtitle}>
          <TripInspiration language={language} />
        </Section>
        <Section title={t.homeQuickAccessTitle} subtitle={t.homeQuickAccessSubtitle}>
          <HomeQuickAccess language={language} />
        </Section>
        <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <InfoPanel title={t.passportTitle} body={t.passportTeaserBody} to="/passport" language={language} />
          <PartnerCtaPanel user={props.user} language={language} title={t.partnerCta} body={t.partnerBody} openTravelerModal={() => setPartnerModalOpen(true)} />
        </section>
      </div>
      {partnerModalOpen && <TravelerPartnerModal language={language} close={() => setPartnerModalOpen(false)} />}
    </>
  );
}

function HomeQuickAccess({ language }: { language: Language }) {
  const t = text[language];
  const items = [
    { to: '/explore', icon: MapPin, title: t.quickAccessDestinations, body: t.quickAccessDestinationsBody },
    { to: '/bookings', icon: ShoppingBag, title: t.quickAccessBookings, body: t.quickAccessBookingsBody },
    { to: '/wallet', icon: CreditCard, title: t.quickAccessWallet, body: t.quickAccessWalletBody },
    { to: '/#reviews', icon: Star, title: t.quickAccessReviews, body: t.quickAccessReviewsBody },
  ];
  return (
    <div className="grid gap-2.5 rounded-[22px] border border-[#E8E2D8] bg-white p-2 shadow-[0_10px_28px_rgba(7,19,38,0.05)] sm:grid-cols-2 sm:gap-3 sm:p-3 lg:grid-cols-4">
      {items.map(({ to, icon: Icon, title, body }) => (
        <Link key={to} to={to} className="group flex items-center gap-3 rounded-[16px] p-2.5 transition hover:bg-[#F8F4EC] sm:p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#FFF1E6] text-[#FF6A00] transition group-hover:bg-[#071326] group-hover:text-white"><Icon className="h-[18px] w-[18px]" /></span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5 text-[#071326]">{title}</span>
            <span className="mt-0.5 line-clamp-1 text-xs font-medium leading-5 text-[#667085] sm:line-clamp-2">{body}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function SearchBar({ language }: { language: Language }) {
  const [destination, setDestination] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const navigate = useNavigate();
  const t = text[language];
  const placeholders = language === 'vi'
    ? [t.searchPromptMovies, t.searchPromptHotel, t.searchPromptTour, t.searchPromptFlight]
    : [t.searchPromptMovies, t.searchPromptHotel, t.searchPromptTour, t.searchPromptFlight];
  const suggestions = [t.trendingMovies, t.trendingHotel, t.trendingTour, t.trendingFlight];
  const visibleSuggestions = suggestions.filter((item) => item.toLowerCase().includes(destination.toLowerCase())).slice(0, 4);
  useEffect(() => {
    const timer = window.setInterval(() => setPlaceholderIndex((value) => (value + 1) % placeholders.length), 2600);
    return () => window.clearInterval(timer);
  }, [placeholders.length]);
  function go(value: string) {
    navigate(`/services?destination=${encodeURIComponent(value)}&date=${date}`);
  }
  return (
    <div className="relative mt-6 sm:mt-9">
      <form onSubmit={(event) => { event.preventDefault(); go(destination || placeholders[placeholderIndex]); }} className="glass-search grid overflow-visible rounded-[24px] p-2 text-slate-950 sm:grid-cols-[minmax(0,1fr)_minmax(140px,170px)_138px]">
        <label className="flex min-w-0 items-center gap-3 border-b border-[#E8E2D8] px-3 py-3 sm:border-b-0 sm:border-r sm:px-4 sm:py-4">
          <Search className="h-5 w-5 shrink-0 text-[#FF6A00]" />
          <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={placeholders[placeholderIndex]} className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400" />
        </label>
        <label className="flex min-w-[140px] items-center gap-3 overflow-visible border-b border-[#E8E2D8] px-3 py-3 sm:border-b-0 sm:border-r sm:px-4 sm:py-4">
          <CalendarDays className="h-5 w-5 text-[#FF6A00]" />
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-w-[140px] bg-transparent text-sm font-medium outline-none [color-scheme:light]" style={{ whiteSpace: 'nowrap', overflow: 'visible' }} />
        </label>
        <button className="flex min-h-11 items-center justify-center gap-2 rounded-[16px] bg-[#FF6A00] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 sm:min-h-12 sm:rounded-[18px] sm:py-4">{t.search}<ChevronRight className="h-4 w-4" /></button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/12 px-3 py-2 text-xs font-semibold text-white/72 backdrop-blur">{t.trendingSearches}</span>
        {(destination ? visibleSuggestions : suggestions.slice(0, 4)).map((item) => (
          <button key={item} onClick={() => go(item)} className="rounded-full border border-white/16 bg-white/12 px-3 py-2 text-xs font-semibold text-white/88 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">{item}</button>
        ))}
      </div>
    </div>
  );
}

function HeroTrustStrip({ language }: { language: Language }) {
  const vi = language === 'vi';
  const items: Array<[LucideIcon, string, string]> = [
    [TicketCheck, vi ? 'Kho dịch vụ có thể đặt ngay' : 'Bookable inventory', vi ? 'Giá, chỗ trống và CTA đặt dịch vụ hiển thị rõ.' : 'Prices, availability, and booking CTAs stay visible.'],
    [QrCode, vi ? 'Biên nhận QR sau thanh toán' : 'QR receipt after checkout', vi ? 'Mã đặt chỗ, tổng tiền và Hash nằm trong cùng biên nhận.' : 'Booking code, total, and Hash stay in one receipt.'],
    [WalletCards, vi ? 'Ví VND và hoàn tiền' : 'VND wallet and refunds', vi ? 'Thanh toán, hoàn tiền và điểm thưởng đi cùng một luồng.' : 'Payments, refunds, and rewards follow one flow.'],
  ];
  return (
    <div className="mt-5 grid gap-2 rounded-[22px] border border-white/14 bg-white/10 p-2 text-white shadow-[0_18px_60px_rgba(5,10,31,0.18)] backdrop-blur-xl sm:grid-cols-3">
      {items.map(([Icon, title, body]) => (
        <div key={title} className="flex items-start gap-3 rounded-[16px] px-3 py-3 transition hover:bg-white/10">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/16 text-orange-100"><Icon className="h-5 w-5" /></span>
          <span className="min-w-0">
            <span className="block text-sm font-black leading-5">{title}</span>
            <span className="mt-1 line-clamp-2 block text-xs font-semibold leading-5 text-white/68">{body}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryGrid({ language }: { language: Language }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
      {homeServiceRoutes.map(({ to, labelKey, icon: Icon }) => (
        <Link key={to} to={to} className="group rounded-[16px] border border-[#E8E2D8] bg-white p-3 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_14px_32px_rgba(7,19,38,.08)] sm:rounded-[22px] sm:p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFF1E6] text-[#FF6A00] transition group-hover:bg-[#FF6A00] group-hover:text-white sm:h-12 sm:w-12 sm:rounded-2xl"><Icon className="h-[18px] w-[18px] sm:h-6 sm:w-6" /></span>
          <p className="mt-3 text-sm font-semibold leading-5 text-[#071326] sm:mt-4 sm:text-base">{translateText(language, labelKey)}</p>
          <p className="mt-1 line-clamp-1 text-[11px] font-medium leading-4 text-slate-500 sm:line-clamp-2 sm:text-xs sm:leading-5">{text[language].browseCuratedInventory}</p>
        </Link>
      ))}
    </div>
  );
}

function AiSuggestionGrid({ language }: { language: Language }) {
  const navigate = useNavigate();
  const t = text[language];
  const connectedPrompts = [
    [t.chatQuickCinema, '/services/cinema?province=da-nang'],
    [t.chatQuickHotel, '/services/stays?province=da-nang'],
    [t.chatQuickTour, '/services/tours?province=hoi-an'],
    [t.searchPromptHue, '/services/trips?province=hue'],
    [t.aiPromptFlightDaNangHaNoi, '/services/flights?origin=da-nang&routeDestination=ha-noi'],
    [t.aiPromptDaNangHoiAnShuttle, '/services/transport?transportType=shuttle&origin=da-nang&routeDestination=hoi-an'],
    [t.aiPromptHueDaNangTrain, '/services/transport/train?origin=hue&routeDestination=da-nang'],
    [t.aiPromptDaNangCombo, '/services/trips?province=da-nang'],
  ];
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {connectedPrompts.map(([prompt, to]) => (
        <button key={prompt} onClick={() => navigate(to)} className="rounded-[22px] border border-[#E8E2D8] bg-white p-4 text-left transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_14px_32px_rgba(7,19,38,.08)]">
          <Sparkles className="h-5 w-5 text-[#FF6A00]" />
          <p className="mt-3 text-sm font-semibold leading-6 text-[#071326]">{prompt}</p>
        </button>
      ))}
    </div>
  );
}

function TripInspiration({ language }: { language: Language }) {
  const t = text[language];
  const trips = [
    { city: 'Da Nang', title: t.tripInspirationDaNang, image: destinationImages[0] },
    { city: 'Hoi An', title: t.tripInspirationHoiAn, image: destinationImages[1] },
    { city: 'Hue', title: t.tripInspirationHue, image: destinationImages[2] },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {trips.map((trip) => (
        <Link key={trip.city} to={`/destination/${destinationSlug(trip.city)}`} className="group overflow-hidden rounded-[24px] border border-[#E8E2D8] bg-white transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(7,19,38,.1)]">
          <img src={trip.image} className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#FF6A00]">{trip.city}</p>
            <p className="mt-2 text-lg font-semibold leading-7 text-[#071326]">{trip.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function HowItWorks({ language }: { language: Language }) {
  const t = text[language];
  const steps = [
    [Search, t.howSearchTitle, t.howSearchBody],
    [TicketCheck, t.howChooseTitle, t.howChooseBody],
    [CreditCard, t.howPayTitle, t.howPayBody],
    [QrCode, t.howQrTitle, t.howQrBody],
    [Sparkles, t.howPassportTitle, t.howPassportBody],
  ];
  return (
    <Section title={t.howTitle} subtitle={t.howSubtitle}>
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
        { userId: { name: 'Minh Anh' }, rating: 5, country: 'Vietnam', helpful: 24, serviceBooked: 'Ba Na Hills Day Pass', createdAt: new Date().toISOString(), comment: 'Đặt vé tham quan và nhận QR rất nhanh, không phải đổi qua nhiều ứng dụng.', photo: destinationImages[0] },
        { userId: { name: 'Kenji' }, rating: 5, country: 'Japan', helpful: 18, serviceBooked: 'Hoi An Lantern Festival', createdAt: new Date().toISOString(), comment: 'Biên nhận có Hash giúp tôi dễ kiểm tra lại lịch sử thanh toán.', photo: destinationImages[1] },
        { userId: { name: 'Linh' }, rating: 4, country: 'Vietnam', helpful: 12, serviceBooked: 'Lo Lo Chai Village Tour', createdAt: new Date().toISOString(), comment: 'Các tour địa phương được trình bày rõ và dễ thêm vào giỏ.', photo: destinationImages[7] },
      ]
    : [
        { userId: { name: 'Minh Anh' }, rating: 5, country: 'Vietnam', helpful: 24, serviceBooked: 'Ba Na Hills Day Pass', createdAt: new Date().toISOString(), comment: 'Attraction booking and QR receipt were fast without switching apps.', photo: destinationImages[0] },
        { userId: { name: 'Kenji' }, rating: 5, country: 'Japan', helpful: 18, serviceBooked: 'Hoi An Lantern Festival', createdAt: new Date().toISOString(), comment: 'The Hash receipt makes payment history easy to verify.', photo: destinationImages[1] },
        { userId: { name: 'Linh' }, rating: 4, country: 'Vietnam', helpful: 12, serviceBooked: 'Lo Lo Chai Village Tour', createdAt: new Date().toISOString(), comment: 'Local tours are clear and easy to add to cart.', photo: destinationImages[7] },
      ];
  const reviews = state.data.length ? state.data : fallback;
  const average = reviews.length ? reviews.reduce((sum: number, item: any) => sum + Number(item.rating || 0), 0) / reviews.length : 0;
  const distribution = [5, 4, 3, 2, 1].map((score) => ({ score, count: reviews.filter((item: any) => Math.round(Number(item.rating || 0)) === score).length }));
  const maxCount = Math.max(1, ...distribution.map((item) => item.count));
  return (
    <Section title={text[language].testimonials} subtitle={text[language].testimonialSubtitle}>
      <div id="reviews" className="scroll-mt-24" />
      <div className="mb-5 grid gap-5 rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)] lg:grid-cols-[260px_1fr]">
        <div>
          <p className="text-4xl font-extrabold text-[#071126]">{average.toFixed(1)}/5</p>
          <div className="mt-2 flex items-center gap-2 text-[#FF5A00]"><Stars value={Math.round(average)} /></div>
          <p className="mt-2 text-sm font-medium text-[#667085]">{reviews.length} {text[language].totalReviews}</p>
        </div>
        <div className="grid gap-2">
          {distribution.map((item) => (
            <div key={item.score} className="grid grid-cols-[40px_1fr_28px] items-center gap-3 text-xs font-medium text-[#667085]">
              <span className="inline-flex items-center gap-1">{item.score}<Star className="h-3 w-3 fill-orange-400 text-orange-400" /></span>
              <span className="h-2 overflow-hidden rounded-full bg-orange-50"><span className="block h-full rounded-full bg-[#FF5A00]" style={{ width: `${Math.max(8, item.count / maxCount * 100)}%` }} /></span>
              <span>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {reviews.slice(0, 3).map((review: any) => {
          const name = review.userId?.name || text[language].travelerNameFallback;
          return (
          <article key={`${name}-${review.comment}`} className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)] transition duration-300 hover:-translate-y-1">
            {review.photo && <img src={review.photo} className="mb-4 aspect-[16/9] w-full rounded-[18px] object-cover" />}
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#050A1F] font-black text-white">{name.slice(0, 1)}</span>
              <div>
                <p className="font-semibold text-[#071126]">{name}</p>
                <p className="text-xs font-medium text-[#667085]">{review.country || text[language].travelerCountryFallback} / {new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[#FF5A00]"><Stars value={review.rating} /></div>
            <p className="mt-3 text-sm font-black text-[#071126]">{review.serviceBooked || review.serviceId?.title || text[language].serviceFallback}</p>
            <p className="mt-2 leading-7 text-[#667085]">{review.comment}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#FF5A00]"><ShieldCheck className="h-3.5 w-3.5" />{text[language].verifiedBooking}</span>
              <span className="rounded-full bg-[#F8F4EC] px-3 py-1 text-xs font-bold text-[#667085]">{text[language].helpfulCount.replace('{count}', String(review.helpful || 0))}</span>
            </div>
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
  const vi = props.language === 'vi';
  return (
    <div>
      <section className="relative overflow-hidden bg-[#050A1F] text-white">
        <img src={destinationImages[1]} className="absolute inset-0 h-full w-full object-cover opacity-65" />
        <div className="animated-hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="caption inline-flex rounded-full bg-white/14 px-4 py-2 text-amber-100 backdrop-blur">{vi ? 'Khám phá địa phương' : 'Local discovery'}</p>
          <h1 className="display-lg mt-5 max-w-4xl">{vi ? 'Thành phố, văn hóa, món ngon và những chuyến đi đang nổi' : 'Cities, culture, food, and trending trips'}</h1>
          <p className="body-lg mt-5 max-w-2xl text-white/82">{vi ? 'Không chỉ là grid card: TravChain kể câu chuyện thành phố và dẫn thẳng tới phim, homestay, tour, sự kiện, ẩm thực có thể đặt ngay.' : 'Not just a card grid: TravChain tells each city story and routes directly to bookable movies, homestays, tours, events, and dining.'}</p>
        </div>
      </section>
      <Section title={text[props.language].exploreDestinationsTitle} subtitle={text[props.language].exploreDestinationsSubtitle}>
        <DiscoveryGroups language={props.language} />
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {destinations.slice(0, 3).map((destination) => (
            <Link key={destination.slug} to={`/destination/${destination.slug}`} className="group overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
              <img src={destination.heroImage} className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="p-5"><p className="text-xl font-black">{vi ? destination.nameVi : destination.nameEn}</p><p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">{vi ? destination.descriptionVi : destination.descriptionEn}</p></div>
            </Link>
          ))}
        </div>
        <DestinationGrid language={props.language} />
      </Section>
    </div>
  );
}

function DiscoveryGroups({ language }: { language: Language }) {
  const t = text[language];
  const groups = [
    [t.exploreByCity, ['Da Nang', 'Hoi An', 'Ha Noi', 'Da Lat'].map((label) => ({ label, value: label }))],
    [t.exploreByExperience, [
      { label: t.hotel, value: 'Hotel' },
      { label: t.homestay, value: 'Homestay' },
      { label: t.cinema, value: 'Cinema' },
      { label: t.attraction, value: 'Attraction' },
      { label: t.event, value: 'Event' },
      { label: t.tour, value: 'Tour' },
    ]],
    [t.popularToday, ['Ba Na Hills', 'Hoi An Lantern', 'Fansipan'].map((label) => ({ label, value: label }))],
    [t.recommendedForYou, [
      { label: t.localTour, value: 'Local tour' },
      { label: t.foodTour, value: 'Food tour' },
      { label: t.ecoTourism, value: 'Eco-tourism' },
    ]],
  ];
  const routeFor = (value: string) => value === 'Cinema' ? '/services/cinema' : value === 'Hotel' || value === 'Homestay' ? '/services/stays' : value === 'Attraction' ? '/services/attractions' : value === 'Event' ? '/services/events' : value === 'Tour' || value.includes('tour') ? '/services/tours' : `/services?destination=${encodeURIComponent(value)}`;
  return <div className="mb-6 grid gap-4 lg:grid-cols-4">{groups.map(([title, values]: any) => <div key={title} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="font-black">{title}</p><div className="mt-4 flex flex-wrap gap-2">{values.map((item: { label: string; value: string }) => <Link key={item.value} to={routeFor(item.value)} className="rounded-full bg-orange-50 px-3 py-2 text-xs font-black text-orange-600 hover:bg-orange-100">{item.label}</Link>)}</div></div>)}</div>;
}

function ServicesPage(props: AppContext) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const destination = params.get('province') || params.get('destination') || '';
  const category = params.get('category');
  const [city, setCity] = useState(destinationProvince(destination));
  const [partner, setPartner] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [group, setGroup] = useState('popular');
  const { data, loading, error, retry } = useServices(`/api/services?limit=50${destination ? `&province=${encodeURIComponent(destination)}` : ''}`);
  const vi = props.language === 'vi';
  const t = text[props.language];
  const sections = [
    { title: vi ? 'Khách sạn & Homestay' : 'Hotels & Homestays', description: vi ? 'Lưu trú đã xác thực, chính sách hủy rõ ràng và QR nhận phòng.' : 'Verified stays with clear cancellation and QR check-in.', to: '/services/stays', types: ['hotel', 'homestay', 'stay'], query: '/api/services?types=hotel,homestay,stay&limit=4', icon: Hotel },
    { title: vi ? 'Vé máy bay' : 'Flights', description: vi ? 'Tuyến bay nội địa, hành lý, hạng ghế và thanh toán VND.' : 'Domestic routes, baggage, seat class, and VND checkout.', to: '/services/flights', types: ['flight'], query: '/api/services?type=flight&limit=4', icon: Plane },
    { title: vi ? 'Đưa đón sân bay' : 'Airport Transfer', description: vi ? 'Đưa đón sân bay, shuttle và xe riêng theo chuyến.' : 'Airport pickup, shuttle, and private route transfers.', to: '/services/transport/airport-transfer', types: ['transport'], transportTypes: ['airport_transfer'], query: '/api/services?type=transport&transportType=airport_transfer&limit=4', icon: Car },
    { title: vi ? 'Xe buýt & Shuttle' : 'Bus & Shuttle', description: vi ? 'Tuyến liên tỉnh, xe ghép và vé linh hoạt theo ngày.' : 'Intercity routes, shared shuttles, and flexible tickets.', to: '/services/transport/bus', types: ['transport'], transportTypes: ['bus', 'shuttle'], query: '/api/services?type=transport&transportType=bus,shuttle&limit=4', icon: Bus },
    { title: vi ? 'Tàu hỏa' : 'Rail', description: vi ? 'Tuyến tàu, ghế ngồi, khoang nằm và lịch khởi hành.' : 'Rail routes, seats, cabins, and departure schedules.', to: '/services/transport/train', types: ['transport'], transportTypes: ['train'], query: '/api/services?type=transport&transportType=train&limit=4', icon: Train },
    { title: vi ? 'Vé tham quan' : 'Attraction tickets', description: vi ? 'Vé Bà Nà Hills, phố cổ, hang động và điểm đến nổi bật.' : 'Theme parks, heritage sites, caves, and highlights.', to: '/services/attractions', types: ['attraction'], query: '/api/services?type=attraction&limit=4', icon: Landmark },
    { title: vi ? 'Tour địa phương' : 'Local tours', description: vi ? 'Food tour, culture tour, eco tour và trải nghiệm cộng đồng.' : 'Food, culture, eco, and community experiences.', to: '/services/tours', types: ['local_tour'], query: '/api/services?type=local_tour&limit=4', icon: MapPin },
    { title: vi ? 'Vé xem phim' : 'Movie tickets', description: vi ? 'CGV, Lotte, Galaxy, Beta và Cinestar theo thành phố, suất chiếu.' : 'CGV, Lotte, Galaxy, Beta, and Cinestar by city and showtime.', to: '/services/cinema', types: ['cinema'], query: '/api/services?type=cinema&limit=4', icon: Film },
    { title: vi ? 'Sự kiện & lễ hội' : 'Events & festivals', description: vi ? 'Lễ hội, đêm văn hóa và sự kiện địa phương.' : 'Festivals, cultural nights, and local events.', to: '/services/events', types: ['event'], query: '/api/services?type=event&limit=4', icon: TicketCheck },
    { title: vi ? 'Ẩm thực địa phương' : 'Local dining', description: vi ? 'Set ăn địa phương, food tour, bàn nhà hàng và trải nghiệm chợ.' : 'Local menus, food tours, restaurant tables, and market tastings.', to: '/services/restaurants', types: ['restaurant'], query: '/api/services?type=restaurant&limit=4', icon: Sparkles },
    { title: vi ? 'Combo chuyến đi' : 'Trip packages', description: vi ? 'Gói Đà Nẵng 3N2Đ, Hội An cuối tuần, Huế di sản và combo nghỉ dưỡng.' : 'Da Nang 3D2N, Hoi An weekend, Hue heritage, and resort bundles.', to: '/services/trips', types: ['trip'], query: '/api/services?type=trip&limit=4', icon: ShoppingBag },
  ];
  const resolveCategoryPath = (categoryValue: string) => sections.find((section) => section.to.endsWith(`/${categoryValue}`) || section.to === `/services/${categoryValue}`)?.to || `/services/${categoryValue}`;
  const activeType = category ? resolveCategoryPath(category) : 'all';
  const activeSection = activeType === 'all' ? null : sections.find((section) => section.to === activeType);
  const cities = Array.from(new Set(['Da Nang', 'Hoi An', 'Ha Noi', 'Ho Chi Minh', ...data.map((service) => service.province || service.location).filter(Boolean)])).slice(0, 8);
  const partners = Array.from(new Set(data.map((service) => service.providerBrand || service.airline).filter(Boolean))).slice(0, 8);
  const filteredData = data
    .filter((service) => {
      if (!activeSection) return true;
      const typeMatch = activeSection.types ? activeSection.types.includes(service.type) : true;
      const transportMatch = !activeSection.transportTypes?.length || activeSection.transportTypes.includes(service.transportType || '');
      return typeMatch && transportMatch;
    })
    .filter((service) => !city || `${service.province} ${service.location}`.toLowerCase().includes(city.toLowerCase()))
    .filter((service) => partner === 'all' || (service.providerBrand || service.airline || '').toLowerCase().includes(partner.toLowerCase()))
    .sort((a, b) => sortBy === 'price' ? a.priceVnd - b.priceVnd : sortBy === 'rating' ? b.rating - a.rating : b.reviewCount - a.reviewCount);
  const setActiveCategory = (slug: string) => {
    setPartner('all');
    setGroup('popular');
    navigate({ search: `${slug ? `category=${slug}` : ''}${destination ? `${slug ? '&' : ''}province=${encodeURIComponent(destination)}` : ''}` });
  };
  const fallbackRecommendations = (() => {
    const categoryTypes = activeSection?.types || [];
    const transportTypes = activeSection?.transportTypes || [];
    const sameCategory = data
      .filter((service) => (!categoryTypes.length || categoryTypes.includes(service.type)) && (!transportTypes.length || transportTypes.includes(service.transportType || '')))
      .sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating)
      .slice(0, 4);
    return sameCategory.length ? sameCategory : [...data].sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating).slice(0, 4);
  })();
  useEffect(() => {
    setPartner('all');
    setGroup('popular');
  }, [activeType]);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const categoryName = activeType === 'all' ? 'all' : sections.find(s => s.to === activeType)?.title || activeType;
      const resolvedType = activeType === 'all' ? 'all' : sections.find(s => s.to === activeType)?.types.join(',') || 'unknown';
      const provinceSlug = destination;
      const queryURL = `/api/services?limit=50${destination ? `&province=${encodeURIComponent(destination)}` : ''}`;
      const resultCount = filteredData.length;
      console.log('Debug ServicesPage:', { categoryName, resolvedType, provinceSlug, queryURL, resultCount });
    }
  }, [activeType, destination, filteredData.length, sections, vi]);
  const showFilteredResults = activeType !== 'all' || Boolean(city) || partner !== 'all';
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs language={props.language} items={[{ label: text[props.language].services, to: '/services' }]} />
      <div className="mb-6 overflow-hidden rounded-[26px] bg-[#071326] text-white">
        <div className="grid gap-6 p-7 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">TravChain</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{vi ? 'Gợi ý chuyến đi Đà Nẵng 3N2Đ' : 'Da Nang 3D2N Trip Builder'}</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/68">{vi ? 'Gom vé máy bay, đưa đón sân bay, khách sạn, vé tham quan và ví TravChain trong một hành trình.' : 'Bundle flights, airport transfer, hotel, attraction tickets, and TravChain Wallet into one connected trip.'}</p>
            <Link to="/services/trips?province=da-nang&duration=3n2d" className="mt-5 inline-flex rounded-2xl bg-[#FF6A00] px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600">{vi ? 'Xây hành trình này' : 'Build this trip'}</Link>
          </div>
          <div className="rounded-[24px] bg-white/10 p-4 ring-1 ring-white/10">
            {[
              [vi ? 'Vé máy bay' : 'Flight', '/services/flights?destination=da-nang'],
              [vi ? 'Đưa đón sân bay' : 'Airport transfer', '/services/transport?province=da-nang&transportType=airport_transfer'],
              [vi ? 'Khách sạn' : 'Hotel', '/services/stays?province=da-nang'],
              [vi ? 'Vé tham quan' : 'Attraction ticket', '/services/attractions?province=da-nang'],
              [vi ? 'Thanh toán QR / Ví TravChain' : 'QR / TravChain Wallet', '/wallet'],
            ].map(([item, to], index) => <Link key={item} to={to} className="mt-3 flex items-center gap-3 rounded-2xl px-2 py-2 text-sm font-medium transition hover:bg-white/10"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#FF6A00] text-xs">{index + 1}</span>{item}</Link>)}
          </div>
        </div>
      </div>
      {loading ? <SkeletonGrid /> : error && !data.length ? <StateBox text={error} retry={retry} /> : (
        <div className="grid gap-6">
          <div className="rounded-[24px] border border-[#E8E2D8] bg-white p-4">
            <div className="tc-scroll flex gap-2 overflow-x-auto pb-2">
              <button onClick={() => navigate({ search: destination ? `province=${encodeURIComponent(destination)}` : '' })} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${activeType === 'all' ? 'bg-[#071326] text-white' : 'bg-[#F8F4EC] text-[#667085]'}`}>{vi ? 'Tất cả' : 'All'}</button>
              {sections.map((section) => <button key={section.to} onClick={() => navigate({ search: `category=${section.to.split('/').pop()}${destination ? `&province=${encodeURIComponent(destination)}` : ''}` })} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${activeType === section.to ? 'bg-[#071326] text-white' : 'bg-[#F8F4EC] text-[#667085]'}`}>{section.title}</button>)}
            </div>
            <div className="mt-3 flex justify-end">
              <details className="relative">
                <summary className="list-none rounded-full bg-[#F8F4EC] px-4 py-2 text-sm font-semibold text-[#667085]">{vi ? 'Thêm' : 'More'}</summary>
                <div className="absolute right-0 z-20 mt-2 grid w-56 gap-1 rounded-2xl border border-[#E8E2D8] bg-white p-2 shadow-xl">
                  {sections.slice(6).map((section) => <button key={section.to} onClick={() => setActiveCategory(section.to.split('/').pop() || '')} className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#071326] hover:bg-orange-50">{section.title}</button>)}
                </div>
              </details>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <select value={city} onChange={(event) => setCity(event.target.value)} className="rounded-2xl border border-[#E8E2D8] bg-white px-4 py-3 text-sm font-medium outline-none">
                <option value="">{vi ? 'Tất cả thành phố' : 'All cities'}</option>
                {cities.map((item) => <option key={item} value={item}>{cityDisplayName(item, props.language)}</option>)}
              </select>
              <select value={partner} onChange={(event) => setPartner(event.target.value)} className="rounded-2xl border border-[#E8E2D8] bg-white px-4 py-3 text-sm font-medium outline-none">
                <option value="all">{vi ? 'Tất cả đối tác' : 'All partners'}</option>
                {partners.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-2xl border border-[#E8E2D8] bg-white px-4 py-3 text-sm font-medium outline-none">
                <option value="recommended">{t.sortRecommended}</option>
                <option value="rating">{t.sortTopRated}</option>
                <option value="price">{t.sortLowestPrice}</option>
              </select>
              <select value={group} onChange={(event) => setGroup(event.target.value)} className="rounded-2xl border border-[#E8E2D8] bg-white px-4 py-3 text-sm font-medium outline-none">
                {ecosystemGroups.map((item) => <option key={item.id} value={item.id}>{vi ? item.vi : item.en}</option>)}
              </select>
            </div>
          </div>
          {showFilteredResults && <section className="rounded-[24px] border border-[#E8E2D8] bg-white p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#FF6A00]">{ecosystemGroups.find((item) => item.id === group)?.[vi ? 'vi' : 'en']}</p>
                <h2 className="mt-1 text-2xl font-semibold">{vi ? 'Kết quả phù hợp với bộ lọc thông minh' : 'Results matching smart filters'}</h2>
              </div>
              <span className="rounded-full bg-[#F8F4EC] px-4 py-2 text-sm font-semibold text-[#667085]">{filteredData.length} {vi ? 'dịch vụ' : 'services'}</span>
            </div>
            <div className="mt-5">
              {filteredData.length > 0 ? (
                <ServiceGrid services={filteredData.slice(0, 8)} language={props.language} currency={props.currency} token={props.token} user={props.user} cart={props.cart} setCart={props.setCart} setToast={props.setToast} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold mb-4">{vi ? 'Chưa tìm thấy dịch vụ phù hợp' : 'No matching services found'}</p>
                  <p className="text-sm text-gray-600 mb-6">{vi ? 'Bạn có thể đổi bộ lọc, chọn thành phố khác hoặc xem các danh mục phổ biến.' : 'Try changing filters, selecting another city, or browsing popular categories.'}</p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button onClick={() => navigate({ search: destination ? `province=${encodeURIComponent(destination)}` : '' })} className="px-4 py-2 bg-[#FF6A00] text-white rounded-full hover:bg-[#FF5A00]">{vi ? 'Xóa bộ lọc' : 'Clear filters'}</button>
                    <button onClick={() => navigate('/services')} className="px-4 py-2 bg-[#071326] text-white rounded-full hover:bg-[#071326]/80">{vi ? 'Xem tất cả dịch vụ' : 'View all services'}</button>
                    <button onClick={() => navigate('/services?province=da-nang')} className="px-4 py-2 bg-[#14B8A6] text-white rounded-full hover:bg-[#14B8A6]/80">{vi ? 'Thử Đà Nẵng' : 'Try Da Nang'}</button>
                  </div>
                  {(() => {
                    const categoryTypes = sections.find(s => s.to === activeType)?.types || [];
                    const fallback = data.filter(s => categoryTypes.includes(s.type)).sort((a,b) => b.reviewCount - a.reviewCount).slice(0,4);
                    return fallback.length > 0 ? (
                      <div className="mt-8">
                        <p className="text-lg font-semibold mb-4">{vi ? 'Gợi ý gần nhất' : 'Closest suggestions'}</p>
                        <ServiceGrid services={fallback} language={props.language} currency={props.currency} token={props.token} user={props.user} cart={props.cart} setCart={props.setCart} setToast={props.setToast} />
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </section>}
          {sections.map(({ title, description, to, query, icon: Icon }) => (
            <ServiceSection key={to} title={title} description={description} to={to} query={query} icon={Icon} {...props} />
          ))}
        </div>
      )}
    </section>
  );
}

function ServiceSection({ title, description, to, query, icon: Icon, language, ...props }: AppContext & { title: string; description: string; to: string; query: string; icon: LucideIcon }) {
  const { data, loading, error, retry } = useServices(query);
  const fallback = !loading && !error && !data.length ? fallbackServicesForPath(query) : [];
  const services = data.length ? data : fallback;
  const vi = language === 'vi';
  const showError = Boolean(error && !services.length);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ServiceSection]', title, query, { count: services.length, error });
    }
  }, [title, query, services.length, error]);

  return (
    <section key={to} className="rounded-[24px] border border-[#E8E2D8] bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link to={to} className="group flex items-start gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFF1E6] text-[#FF6A00]"><Icon className="h-5 w-5" /></span>
          <span>
            <span className="block text-xl font-semibold text-[#071326] group-hover:text-[#FF6A00]">{title}</span>
            <span className="mt-1 block text-sm font-semibold leading-6 text-[#667085]">{description}</span>
          </span>
        </Link>
        <Link to={to} className="w-fit rounded-2xl bg-[#071326] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#FF6A00]">{vi ? 'Xem danh mục' : 'View category'}</Link>
      </div>
      <div className="mt-5">
        {loading ? <SkeletonGrid /> : showError ? <StateBox text={error} retry={retry} /> : services.length ? <ServiceGrid services={services} language={language} currency={props.currency} token={props.token} user={props.user} cart={props.cart} setCart={props.setCart} setToast={props.setToast} /> : <StateBox text={vi ? 'Chưa có dịch vụ nổi bật trong danh mục này.' : 'No featured services in this category yet.'} />}
      </div>
    </section>
  );
}

function DestinationPage(props: AppContext) {
  const { slug } = useParams();
  const destination = getDestination(slug || '') || destinations[0];
  const place = props.language === 'vi' ? destination.nameVi : destination.nameEn;
  const image = destination.heroImage;
  const { data, loading, error } = useServices(`/api/services?limit=50&province=${encodeURIComponent(destination.slug)}`);
  const fallbackServices = useServices('/api/services?limit=50');
  const t = text[props.language];
  const byType = (types: ServiceType[]) => data.filter((service) => types.includes(service.type)).slice(0, 4);
  const visibleServices = data.length ? data : fallbackServices.data.slice(0, 8);
  return (
    <div className="bg-[#F7F2E8]">
      <section className="relative overflow-hidden bg-[#050A1F] text-white">
        <img src={image} className="parallax-slow absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="animated-hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <p className="caption inline-flex rounded-full bg-white/14 px-4 py-2 text-amber-100 backdrop-blur">{t.destinationGuide}</p>
          <h1 className="display-lg mt-5 max-w-4xl">{place}</h1>
          <p className="body-lg mt-5 max-w-2xl text-white/82">{props.language === 'vi' ? destination.descriptionVi : destination.descriptionEn}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {[t.staysQuick, t.cinemaQuick, t.attraction, t.localTour, t.transportQuick, t.flightQuick, t.foodTour].map((item) => <span key={item} className="rounded-full border border-white/18 bg-white/12 px-4 py-2 text-sm font-bold backdrop-blur">{item}</span>)}
          </div>
        </div>
      </section>
      <Section title={t.exploreServices} subtitle={t.destinationServicesSubtitle}>
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            { icon: Hotel, title: t.staysQuick, body: t.trustedLocalPartners, to: `/services/stays?province=${destination.slug}` },
            { icon: Film, title: t.cinemaQuick, body: t.topBookedThisWeek, to: `/services/cinema?province=${destination.slug}` },
            { icon: Landmark, title: t.attraction, body: t.attractionsQuick, to: `/services/attractions?province=${destination.slug}` },
            { icon: MapPin, title: t.localTour, body: t.localFavorite, to: `/services/tours?province=${destination.slug}` },
            { icon: TicketCheck, title: t.diningQuick, body: props.language === 'vi' ? 'Bàn ăn, set địa phương và food tour.' : 'Dining sets, local tables, and food experiences.', to: `/services/restaurants?province=${destination.slug}` },
            { icon: Bus, title: t.transportQuick, body: props.language === 'vi' ? 'Xe, tàu và đưa đón theo tuyến.' : 'Route-based bus, train, and transfers.', to: `/services/transport?province=${destination.slug}` },
            { icon: Plane, title: t.flightQuick, body: props.language === 'vi' ? 'Tuyến bay, hành lý và hạng ghế.' : 'Flights, baggage, and seat class.', to: `/services/flights?province=${destination.slug}` },
          ].map((card) => <Link key={card.to} to={card.to}><InfoCard icon={card.icon} title={card.title} body={card.body} /></Link>)}
        </div>
        {loading || (!data.length && fallbackServices.loading) ? <SkeletonGrid /> : error ? <StateBox text={error} /> : <ServiceGrid services={visibleServices.length ? visibleServices : byType(['attraction', 'hotel', 'homestay', 'local_tour', 'event'])} {...props} />}
      </Section>
      <Section title={t.mapTeaserTitle} subtitle={t.mapTeaserBody}>
        <MapPreview destinationSlug={destination.slug} language={props.language} />
      </Section>
    </div>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="premium-card premium-lift p-5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#FF5A00]"><Icon className="h-5 w-5" /></span>
      <p className="mt-4 font-extrabold text-[#050A1F]">{title}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#667085]">{body}</p>
    </div>
  );
}

function MapPreview({ destinationSlug, language }: { destinationSlug: string; language: Language }) {
  const vi = language === 'vi';
  const pins = destinationSlug === 'da-nang'
    ? [
      { label: 'Mỹ Khê', to: '/services/stays?province=da-nang&area=my-khe', x: '68%', y: '45%' },
      { label: 'Sông Hàn', to: '/services?province=da-nang', x: '48%', y: '43%' },
      { label: 'Bà Nà Hills', to: '/services/attractions?province=da-nang', x: '22%', y: '34%' },
      { label: 'Hội An', to: '/services/tours?province=hoi-an', x: '72%', y: '76%' },
      { label: 'Sân bay Đà Nẵng', to: '/services/transport?province=da-nang&transportType=airport_transfer', x: '38%', y: '56%' },
    ]
    : [
      { label: vi ? 'Trung tâm' : 'Center', to: `/services?province=${destinationSlug}`, x: '48%', y: '46%' },
      { label: vi ? 'Lưu trú' : 'Stays', to: `/services/stays?province=${destinationSlug}`, x: '65%', y: '35%' },
      { label: vi ? 'Tour' : 'Tours', to: `/services/tours?province=${destinationSlug}`, x: '30%', y: '68%' },
    ];
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#DDE7DE] bg-[#EAF2E8] shadow-sm">
      <div className="relative min-h-[360px] bg-[linear-gradient(115deg,rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(25deg,rgba(7,19,38,.08)_1px,transparent_1px),radial-gradient(circle_at_18%_30%,#CFE8D7,transparent_26%),radial-gradient(circle_at_76%_72%,#F8E0BF,transparent_28%),linear-gradient(135deg,#EAF2E8,#DDE9F6)] bg-[length:52px_52px,70px_70px,100%_100%,100%_100%,100%_100%] p-5">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M22 34 C35 42, 42 56, 72 76" fill="none" stroke="#FF6A00" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M38 56 C45 48, 54 42, 68 45" fill="none" stroke="#071326" strokeWidth=".65" opacity=".28" />
        </svg>
        <div className="absolute left-5 top-5 max-w-xs rounded-3xl bg-white/92 p-4 shadow-xl backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#FF6A00]">{vi ? 'Bản đồ gợi ý' : 'Map preview'}</p>
          <h3 className="mt-1 text-xl font-black text-[#071326]">{destinationSlug === 'da-nang' ? 'Đà Nẵng' : cityDisplayName(destinationSlug, language)}</h3>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#667085]">{vi ? 'Chọn một điểm trên bản đồ để lọc dịch vụ gần đó.' : 'Pick a pin to filter nearby services.'}</p>
        </div>
        {pins.map((pin) => (
          <Link key={pin.label} to={pin.to} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-2 text-xs font-black text-[#071326] shadow-lg ring-2 ring-[#FF6A00]/20 transition hover:-translate-y-[55%] hover:bg-[#FF6A00] hover:text-white" style={{ left: pin.x, top: pin.y }}>
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#FF6A00]" />{pin.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Breadcrumbs({ language, items }: { language: Language; items: Array<{ label: string; to?: string }> }) {
  const root = language === 'vi' ? 'Dịch vụ' : 'Services';
  const normalized = items.length ? items : [{ label: root, to: '/services' }];
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#667085]">
      {normalized.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {item.to ? <Link to={item.to} className="hover:text-[#FF5A00]">{item.label}</Link> : <span className="text-[#050A1F]">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function CinemaPage(props: AppContext) {
  const [params] = useSearchParams();
  const [brand, setBrand] = useState('');
  const [province, setProvince] = useState(destinationProvince(params.get('province') || ''));
  const qs = `/api/services?type=cinema&limit=50${brand ? `&providerBrand=${encodeURIComponent(brand)}` : ''}${province ? `&province=${encodeURIComponent(province)}` : ''}`;
  const { data, loading, error, retry } = useServices(qs);
  return (
    <CatalogLayout title={text[props.language].cinemaTicketsTitle} subtitle={text[props.language].cinemaTicketsSubtitle} services={data} loading={loading} error={error} retry={retry} {...props}>
      <Breadcrumbs language={props.language} items={[{ label: text[props.language].services, to: '/services' }, { label: text[props.language].cinemaTicketsTitle }]} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cinemaBrands.map((item) => <button key={item} onClick={() => setBrand(item)} className={`rounded-3xl p-5 text-left shadow-sm ring-1 transition hover:-translate-y-1 ${brand === item ? 'bg-slate-950 text-white ring-slate-950' : 'bg-white text-slate-950 ring-slate-200'}`}><Film className="h-6 w-6 text-orange-500" /><p className="mt-4 font-black">{item}</p><p className={`mt-1 text-xs font-bold ${brand === item ? 'text-white/60' : 'text-slate-500'}`}>{text[props.language].chooseLocationMovieTime}</p></button>)}
      </div>
      {brand && <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="font-black">{brand}</p><div className="mt-3 grid gap-2 sm:grid-cols-3"><Metric label={text[props.language].location} value={province || text[props.language].chooseCity} /><Metric label={text[props.language].movie} value={text[props.language].flexibleTicketBundle} /><Metric label={text[props.language].showtime} value={text[props.language].cinemaSchedule} /></div></div>}
      <FilterPanel>
        <ChipGroup language={props.language} label={text[props.language].cinemaBrand} values={cinemaBrands} selected={brand} setSelected={setBrand} />
        <ChipGroup language={props.language} label={text[props.language].city} values={['Da Nang', 'Ha Noi', 'Ho Chi Minh']} selected={province} setSelected={setProvince} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function StaysPage(props: AppContext) {
  const [params] = useSearchParams();
  const [province, setProvince] = useState(destinationProvince(params.get('province') || ''));
  const [stayType, setStayType] = useState('');
  const type = stayType || 'stays';
  const { data, loading, error, retry } = useServices(`/api/services?type=${type}&limit=50${province ? `&province=${encodeURIComponent(province)}` : ''}`);
  return (
    <CatalogLayout title={text[props.language].staysTitle} subtitle={text[props.language].staysSubtitle} services={data} loading={loading} error={error} retry={retry} {...props}>
      <Breadcrumbs language={props.language} items={[{ label: text[props.language].services, to: '/services' }, { label: text[props.language].staysTitle }]} />
      <FilterPanel>
        <ChipGroup language={props.language} label={text[props.language].province} values={stayProvinces} selected={province} setSelected={setProvince} />
        <ChipGroup language={props.language} label={text[props.language].type} values={['hotel', 'homestay']} selected={stayType} setSelected={setStayType} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function CategoryPage(props: AppContext & { type: ServiceType; titleVi: string; titleEn: string; presets: string[] }) {
  const [params] = useSearchParams();
  const [province, setProvince] = useState(destinationProvince(params.get('province') || ''));
  const { data, loading, error, retry } = useServices(`/api/services?type=${props.type}&limit=50${province ? `&province=${encodeURIComponent(province)}` : ''}`);
  return (
    <CatalogLayout title={props.language === 'vi' ? props.titleVi : props.titleEn} subtitle={text[props.language].categoryPageSubtitle} services={data} loading={loading} error={error} retry={retry} {...props}>
      <Breadcrumbs language={props.language} items={[{ label: text[props.language].services, to: '/services' }, { label: props.language === 'vi' ? props.titleVi : props.titleEn }]} />
      <FilterPanel>
        <ChipGroup language={props.language} label={text[props.language].popular} values={props.presets} selected="" setSelected={() => undefined} />
        <ChipGroup language={props.language} label={text[props.language].province} values={stayProvinces} selected={province} setSelected={setProvince} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function FlightsPage(props: AppContext) {
  const [params] = useSearchParams();
  const [origin, setOrigin] = useState(destinationProvince(params.get('origin') || ''));
  const [routeDestination, setRouteDestination] = useState(destinationProvince(params.get('routeDestination') || params.get('destination') || params.get('province') || ''));
  const [seatClass, setSeatClass] = useState('');
  const query = `/api/services?type=flight&limit=50${origin ? `&origin=${encodeURIComponent(origin)}` : ''}${routeDestination ? `&routeDestination=${encodeURIComponent(routeDestination)}` : ''}`;
  const { data, loading, error, retry } = useServices(query);
  const filtered = seatClass ? data.filter((service) => service.seatClass === seatClass) : data;
  const vi = props.language === 'vi';
  return (
    <CatalogLayout title={vi ? 'Vé máy bay' : 'Flights'} subtitle={vi ? 'Chọn điểm đi, điểm đến, ngày bay, hành khách, hãng bay và hạng vé.' : 'Choose origin, destination, departure date, passengers, airline, and ticket option.'} services={filtered} loading={loading} error={error} retry={retry} {...props}>
      <Breadcrumbs language={props.language} items={[{ label: text[props.language].services, to: '/services' }, { label: vi ? 'Vé máy bay' : 'Flights' }]} />
      <FilterPanel>
        <ChipGroup language={props.language} label={vi ? 'Điểm đi' : 'Origin'} values={['Da Nang', 'Ha Noi', 'Ho Chi Minh', 'Nha Trang', 'Phu Quoc']} selected={origin} setSelected={setOrigin} />
        <ChipGroup language={props.language} label={vi ? 'Điểm đến' : 'Destination'} values={['Ha Noi', 'Da Nang', 'Ho Chi Minh', 'Da Lat', 'Phu Quoc']} selected={routeDestination} setSelected={setRouteDestination} />
        <ChipGroup language={props.language} label={vi ? 'Hạng vé' : 'Seat class'} values={['Economy', 'Premium Economy', 'Business']} selected={seatClass} setSelected={setSeatClass} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function TransportPage(props: AppContext & { transportType?: string }) {
  const [params] = useSearchParams();
  const [province, setProvince] = useState(destinationProvince(params.get('province') || ''));
  const [type, setType] = useState(props.transportType || params.get('transportType') || '');
  const [route, setRoute] = useState('');
  const origin = destinationProvince(params.get('origin') || '');
  const routeDestination = destinationProvince(params.get('routeDestination') || params.get('destination') || '');
  const query = `/api/services?type=transport&limit=50${type ? `&transportType=${encodeURIComponent(type)}` : ''}${province ? `&province=${encodeURIComponent(province)}` : ''}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}${routeDestination ? `&routeDestination=${encodeURIComponent(routeDestination)}` : ''}`;
  const { data, loading, error, retry } = useServices(query);
  const visible = route ? data.filter((service) => `${service.origin} ${service.routeDestination} ${service.title}`.toLowerCase().includes(route.toLowerCase())) : data;
  const vi = props.language === 'vi';
  return (
    <CatalogLayout title={vi ? 'Di chuyển' : 'Transport'} subtitle={vi ? 'Chọn loại di chuyển, tuyến, ngày giờ, số ghế rồi thanh toán VND.' : 'Choose type, route, date/time, seats, then checkout in VND.'} services={visible} loading={loading} error={error} retry={retry} {...props}>
      <Breadcrumbs language={props.language} items={[{ label: text[props.language].services, to: '/services' }, { label: vi ? 'Di chuyển' : 'Transport' }, ...(type ? [{ label: type }] : [])]} />
      <FilterPanel>
        <ChipGroup language={props.language} label={vi ? 'Loại di chuyển' : 'Transport type'} values={['bus', 'train', 'airport_transfer', 'private_car', 'shuttle']} selected={type} setSelected={setType} />
        <ChipGroup language={props.language} label={vi ? 'Tỉnh/thành' : 'Province'} values={stayProvinces} selected={province} setSelected={setProvince} />
        <ChipGroup language={props.language} label={vi ? 'Tuyến phổ biến' : 'Popular routes'} values={['Da Nang Hoi An', 'Ha Noi Sa Pa', 'Hue Da Nang', 'Nha Trang Airport']} selected={route} setSelected={setRoute} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function TripsPage(props: AppContext) {
  const [params] = useSearchParams();
  const [province, setProvince] = useState(destinationProvince(params.get('province') || ''));
  const [travelerType, setTravelerType] = useState('');
  const { data, loading, error, retry } = useServices(`/api/services?type=trip&limit=50${province ? `&province=${encodeURIComponent(province)}` : ''}`);
  const visible = travelerType ? data.filter((service) => service.travelerType === travelerType) : data;
  const vi = props.language === 'vi';
  return (
    <CatalogLayout title={vi ? 'Chuyến đi trọn gói' : 'Trip packages'} subtitle={vi ? 'Combo có khách sạn, di chuyển, vé tham quan, tour địa phương và trải nghiệm tùy chọn.' : 'Packages with stay, transport, attraction tickets, local tours, and optional experiences.'} services={visible} loading={loading} error={error} retry={retry} {...props}>
      <Breadcrumbs language={props.language} items={[{ label: text[props.language].services, to: '/services' }, { label: vi ? 'Chuyến đi trọn gói' : 'Trip packages' }]} />
      <FilterPanel>
        <ChipGroup language={props.language} label={vi ? 'Điểm đến' : 'Destination'} values={stayProvinces} selected={province} setSelected={setProvince} />
        <ChipGroup language={props.language} label={vi ? 'Kiểu khách' : 'Traveler type'} values={['family', 'couple', 'group', 'culture']} selected={travelerType} setSelected={setTravelerType} />
        <ChipGroup language={props.language} label={vi ? 'Thời lượng' : 'Duration'} values={['1 day', '2D1N', '3D2N']} selected="" setSelected={() => undefined} />
      </FilterPanel>
    </CatalogLayout>
  );
}

function CatalogLayout({ title, subtitle, services, loading, error, retry, children, ...props }: AppContext & { title: string; subtitle: string; services: Service[]; loading: boolean; error: string; retry?: () => void; children?: ReactNode }) {
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
      {loading ? <SkeletonGrid /> : error && !services.length ? <StateBox text={error} retry={retry} /> : services.length ? <ServiceGrid services={services} {...props} /> : <ServiceEmptyState language={props.language} />}
    </section>
  );
}

function ServiceEmptyState({ language, recommendations = [], props }: { language: Language; recommendations?: Service[]; props?: AppContext }) {
  const navigate = useNavigate();
  const vi = language === 'vi';
  return (
    <div className="rounded-[24px] border border-[#E8E2D8] bg-white p-8 text-center">
      <Sparkles className="mx-auto h-9 w-9 text-[#FF6A00]" />
      <h3 className="mt-4 text-xl font-black text-[#071326]">{vi ? 'Chưa tìm thấy dịch vụ phù hợp' : 'No matching services found'}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-[#667085]">{vi ? 'Bạn có thể đổi bộ lọc, chọn thành phố khác hoặc xem các danh mục phổ biến.' : 'Try changing filters, selecting another city, or browsing popular categories.'}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button onClick={() => navigate('/services')} className="rounded-full bg-[#FF6A00] px-4 py-2 text-sm font-bold text-white">{vi ? 'Xóa bộ lọc' : 'Clear filters'}</button>
        <button onClick={() => navigate('/services')} className="rounded-full bg-[#071326] px-4 py-2 text-sm font-bold text-white">{vi ? 'Xem tất cả dịch vụ' : 'View all services'}</button>
        <button onClick={() => navigate('/services?province=da-nang')} className="rounded-full bg-[#14B8A6] px-4 py-2 text-sm font-bold text-white">{vi ? 'Thử Đà Nẵng' : 'Try Da Nang'}</button>
      </div>
      {recommendations.length > 0 && props && (
        <div className="mt-8 text-left">
          <p className="mb-4 text-lg font-black text-[#071326]">{vi ? 'Gợi ý gần nhất' : 'Closest suggestions'}</p>
          <ServiceGrid services={recommendations} {...props} />
        </div>
      )}
    </div>
  );
}

function ServiceGrid({ services, language, currency, cart, setCart, setToast }: AppContext & { services: Service[] }) {
  if (!services.length) return <StateBox text={text[language].empty} />;
  return (
    <div className="grid grid-cols-2 gap-2.5 pb-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((service) => <ServiceCard key={service._id} service={service} language={language} currency={currency} cart={cart} setCart={setCart} setToast={setToast} />)}
    </div>
  );
}

function ServiceCard({ service, language, currency, cart, setCart, setToast }: Pick<AppContext, 'language' | 'currency' | 'cart' | 'setCart' | 'setToast'> & { service: Service }) {
  const t = text[language];
  const vi = language === 'vi';
  const provider = service.providerBrand || service.airline || (vi ? 'Đối tác TravChain' : 'TravChain partner');
  const hasRoute = service.type === 'flight' || service.type === 'transport';
  const routeLabel = [service.origin, service.routeDestination].filter(Boolean).join(' → ');
  return (
    <article className="group min-w-0 overflow-hidden rounded-[18px] border border-[#E8E2D8] bg-white shadow-[0_8px_22px_rgba(7,19,38,0.045)] transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_18px_40px_rgba(7,19,38,.1)] sm:rounded-[24px]">
      <Link to={`/service/${service._id}`} className="block">
        <div className="relative aspect-[1.15/1] overflow-hidden bg-slate-100 sm:aspect-[4/3]">
          <img src={service.coverImage || FALLBACK_IMAGE} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071326]/72 via-[#071326]/10 to-transparent opacity-90" />
          <div className="absolute left-2 top-2 flex max-w-[72%] flex-wrap gap-1.5 sm:left-3 sm:top-3">
            <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-black text-[#071326] backdrop-blur sm:text-xs">{serviceTypeLabel(service.type, language)}</span>
            <span className="hidden rounded-full bg-emerald-500/92 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur sm:inline-flex">QR</span>
          </div>
          <span aria-label={t.wishlist} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/92 text-[#071326] backdrop-blur transition group-hover:text-[#FF6A00] sm:right-3 sm:top-3 sm:h-9 sm:w-9">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2 sm:bottom-3 sm:left-3 sm:right-3">
            <span className="min-w-0 rounded-full bg-[#071326]/76 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur sm:text-xs">{provider}</span>
            <span className="rounded-full bg-[#FF6A00] px-2.5 py-1 text-[10px] font-black text-white shadow-lg shadow-orange-950/20 sm:px-3 sm:text-xs">{service.availability} {t.slotsAvailable}</span>
          </div>
        </div>
      </Link>
      <div className="p-3 sm:p-4">
        <Link to={`/service/${service._id}`} className="line-clamp-2 text-[13px] font-semibold leading-[18px] text-[#071326] hover:text-[#FF6A00] sm:text-base sm:leading-6">{service.title}</Link>
        <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] font-medium text-slate-500 sm:mt-2 sm:text-sm"><MapPin className="h-3 w-3 shrink-0 text-[#FF6A00] sm:h-4 sm:w-4" />{service.location}</p>
        {hasRoute && routeLabel && <p className="mt-2 truncate text-xs font-semibold text-[#071326]">{routeLabel} {service.departureLabel ? `/ ${service.departureLabel}` : ''}</p>}
        {service.type === 'trip' && <p className="mt-2 text-xs font-semibold text-[#071326]">{service.packageDuration || service.duration} / {(service.packageIncludes || []).slice(0, 3).join(' + ')}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#667085] sm:gap-2 sm:text-xs">
          <span className="rounded-full bg-orange-50 px-2 py-1 text-[#92400E]"><Star className="mr-1 inline h-3.5 w-3.5 fill-orange-400 text-orange-400 sm:h-4 sm:w-4" />{service.rating} ({service.reviewCount})</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{t.partnerVerified}</span>
        </div>
        <div className="mt-3 grid gap-3 border-t border-[#E8E2D8] pt-3 sm:mt-4 sm:flex sm:items-end sm:justify-between sm:gap-3 sm:pt-4">
          <p>
            <span className="block text-[10px] font-medium text-[#667085] sm:text-xs">{t.from}</span>
            <span className="text-[13px] font-semibold text-[#071326] sm:text-lg">{money(service.priceVnd, currency)}</span>
          </p>
          <button onClick={() => addCart(service, cart, setCart, setToast, language)} className="rounded-xl bg-[#071326] px-3 py-2.5 text-[11px] font-black text-white transition hover:bg-[#FF6A00] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">{t.addCart}</button>
        </div>
      </div>
    </article>
  );
}

function ServiceDetailPage(props: AppContext) {
  const { id } = useParams();
  const { data: service, loading, error } = useService(id || '');
  const reviews = useReviews(id || '');
  const related = useServices(service ? `/api/services?type=${service.type}&province=${encodeURIComponent(service.province || '')}&limit=4` : '');
  const t = text[props.language];
  if (loading) return <Section title={t.serviceDetail} subtitle=""><SkeletonGrid /></Section>;
  if (error || !service) return <Section title={t.serviceDetail} subtitle=""><StateBox text={error || t.notFound} /></Section>;
  const localized = localizedServiceContent(service, props.language);
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs language={props.language} items={[{ label: text[props.language].services, to: '/services' }, { label: serviceTypeLabel(service.type, props.language), to: `/services/${service.type === 'flight' ? 'flights' : service.type === 'local_tour' ? 'tours' : service.type === 'attraction' ? 'attractions' : service.type === 'restaurant' ? 'restaurants' : service.type === 'trip' ? 'trips' : service.type}` }, { label: localized.title }]} />
      <div className="grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            <img src={service.coverImage} className="aspect-[16/10] w-full rounded-3xl object-cover sm:col-span-2 sm:row-span-2 sm:h-full" />
            {(service.gallery || []).slice(1, 3).map((image) => <img key={image} src={image} className="aspect-[16/10] w-full rounded-3xl object-cover" />)}
          </div>
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">{service.providerBrand}</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">{localized.title}</h1>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
              <span><Star className="mr-1 inline h-4 w-4 fill-orange-400 text-orange-400" />{service.rating} ({service.reviewCount})</span>
              <span><MapPin className="mr-1 inline h-4 w-4 text-orange-500" />{service.location}</span>
              <span><CalendarDays className="mr-1 inline h-4 w-4 text-orange-500" />{service.duration}</span>
            </div>
            <p className="mt-6 leading-8 text-slate-700">{localized.description}</p>
            <p className="mt-3 leading-8 text-slate-700">{localized.detail}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {localized.highlights.map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700"><ShieldCheck className="mr-2 inline h-4 w-4 text-orange-500" />{item}</div>)}
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
          <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm font-bold text-orange-800">{localized.cancellationPolicy}</p>
          <button onClick={() => addCart(service, props.cart, props.setCart, props.setToast, props.language)} className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600">{text[props.language].addCart}</button>
          <Link to="/checkout" onClick={() => addCart(service, props.cart, props.setCart, props.setToast, props.language)} className="mt-3 block rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white">{text[props.language].bookNow}</Link>
          <button onClick={() => props.setToast(props.language === 'vi' ? 'Mở TravChain Assistant để hỏi thêm về dịch vụ này.' : 'Open TravChain Assistant to ask about this service.')} className="mt-3 w-full rounded-2xl border border-orange-100 bg-orange-50 px-5 py-3 text-sm font-black text-[#FF6A00]">{props.language === 'vi' ? 'Hỏi AI về dịch vụ này' : 'Ask AI about this service'}</button>
        </aside>
      </div>
      <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.14em] text-[#FF6A00]">{props.language === 'vi' ? 'Cùng thành phố / danh mục' : 'Same city / category'}</p>
            <h2 className="mt-1 text-2xl font-black">{props.language === 'vi' ? 'Dịch vụ liên quan' : 'Related services'}</h2>
          </div>
          <Link to={`/services?province=${destinationSlug(service.province || '')}`} className="rounded-full bg-[#071326] px-4 py-2 text-sm font-bold text-white">{props.language === 'vi' ? 'Xem thêm' : 'View more'}</Link>
        </div>
        <div className="mt-5">
          {related.loading ? <SkeletonGrid /> : <ServiceGrid services={related.data.filter((item) => item._id !== service._id).slice(0, 4)} {...props} />}
        </div>
      </section>
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
        <p className="mt-1 text-sm font-bold text-slate-500">{item.date} / {item.guests} {text[language].guestsLabel} / {item.quantity}x</p>
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
  const fee = 0;
  const grandTotal = total;
  const supportsInternationalCard = props.cart.some((item) => item.service.acceptsInternationalCard || item.service.settlementCurrency === 'USD');

  async function confirm() {
    if (!props.user || !props.token) return props.setToast(text[props.language].loginRequired);
    if (!props.cart.length) return props.setToast(text[props.language].cartEmpty);
    if (method === 'wallet' && !pin) return props.setToast(t.walletPinRequired);
    setBusy(true);
    setError('');
    try {
      const body = {
        items: props.cart.map((item) => ({ serviceId: item.service._id, quantity: item.quantity, guests: item.guests, date: item.date })),
        displayCurrency: 'VND',
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
      <BookingProgress language={props.language} active="payment" />
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-black">{t.paymentMethod}</h2>
          <div className="mt-4 grid gap-3">
            {[
              ['wallet', t.travchainWallet, t.walletPayDescription, WalletCards],
              ...(supportsInternationalCard ? [['card', t.internationalCard, t.cardPayDescription, CreditCard]] : []),
              ['qr', t.domesticQr, t.qrPayDescription, QrCode],
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
          {method === 'wallet' && <input value={pin} onChange={(event) => setPin(event.target.value)} type="password" placeholder={t.walletPin} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500" />}
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">{t.securityNote}</p>
          {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600">{error}</p>}
        </div>
        <div className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/15">
          <p className="text-xl font-black">{t.orderSummary}</p>
          <div className="mt-4 space-y-3">
            {props.cart.map((item) => (
              <div key={`${item.service._id}-${item.date}`} className="rounded-2xl bg-white/8 p-3">
                <p className="font-black">{item.service.title}</p>
                <p className="mt-1 text-xs font-bold text-white/55">{item.date} / {item.guests} {t.guestsLabel} / {item.quantity}x</p>
                <p className="mt-2 text-sm font-black">{money(item.service.priceVnd * item.quantity, 'VND')}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm font-bold">
            <div className="flex justify-between"><span className="text-white/55">{t.subtotal}</span><span>{money(total, 'VND')}</span></div>
            <div className="flex justify-between"><span className="text-white/55">{t.serviceFee}</span><span>{money(fee, 'VND')}</span></div>
            <div className="flex justify-between text-lg font-black"><span>{t.total}</span><span>{money(grandTotal, 'VND')}</span></div>
            {props.cart.some((item) => item.service.acceptsInternationalCard || item.service.settlementCurrency === 'USD') && <p className="rounded-2xl bg-white/8 p-3 text-xs font-bold text-white/58">{props.language === 'vi' ? 'Một số đối tác hỗ trợ thẻ quốc tế; USD chỉ hiển thị tham khảo khi cần.' : 'Some partners support international cards; USD is shown only as an optional reference when needed.'}</p>}
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
  const [tab, setTab] = useState<'upcoming' | 'current' | 'completed' | 'refunds'>('upcoming');
  const { data, loading, error } = useAuthed<Booking[]>('/api/bookings/my', props.token, []);
  const refunds = useAuthed<Refund[]>('/api/refunds/my', props.token, []);
  const t = text[props.language];
  if (!props.token) {
    return (
      <Section title={t.bookings} subtitle={props.language === 'vi' ? 'Đăng nhập để xem đơn đặt, QR receipt, hoàn tiền và Travel Passport stamp.' : 'Sign in to view bookings, QR receipts, refunds, and Travel Passport stamps.'}>
        <div className="rounded-[24px] border border-[#E8E2D8] bg-white p-6">
          <StateBox text={t.loginRequired} />
          <Link to="/login?role=traveler" className="mt-4 inline-flex rounded-full bg-[#071326] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FF6A00]">{t.signIn}</Link>
        </div>
      </Section>
    );
  }
  const now = Date.now();
  const upcoming = data.filter((booking) => !booking.status || ['pending', 'confirmed'].includes(booking.status));
  const current = data.filter((booking) => booking.items?.some((item) => Math.abs(new Date(item.date).getTime() - now) < 86400000 * 2));
  const completed = data.filter((booking) => ['completed', 'cancelled', 'refunded'].includes(booking.status || ''));
  const activeBookings = tab === 'current' ? current : tab === 'completed' ? completed : upcoming;
  const tabs = [
    ['upcoming', props.language === 'vi' ? 'Sắp tới' : 'Upcoming', upcoming.length],
    ['current', props.language === 'vi' ? 'Đang diễn ra' : 'Current', current.length],
    ['completed', props.language === 'vi' ? 'Hoàn thành' : 'Completed', completed.length],
    ['refunds', props.language === 'vi' ? 'Hoàn tiền' : 'Refunds', refunds.data.length],
  ] as const;
  return (
    <Section title={t.bookings} subtitle={props.language === 'vi' ? 'Mỗi đơn đặt được gom vào chuyến đi, có timeline, QR check-in, hỗ trợ hủy và hoàn tiền sau booking.' : 'Every booking is grouped into trips with timeline, QR check-in, cancellation, and refund support.'}>
      {loading ? <SkeletonGrid /> : error ? <StateBox text={error} /> : (
        <div className="grid gap-6">
          <div className="tc-scroll flex gap-2 overflow-x-auto rounded-[24px] border border-[#E8E2D8] bg-white p-2">
            {tabs.map(([value, label, count]) => (
              <button key={value} onClick={() => setTab(value)} className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold transition ${tab === value ? 'bg-[#071326] text-white' : 'text-slate-600 hover:bg-[#F8F4EC]'}`}>
                {label} <span className={tab === value ? 'text-white/70' : 'text-slate-400'}>{count}</span>
              </button>
            ))}
          </div>
          {tab === 'refunds' ? (
            refunds.loading ? <SkeletonGrid /> : <RefundList refunds={refunds.data} language={props.language} currency="VND" />
          ) : (
            <div className="grid gap-4">
              {activeBookings.map((booking) => <BookingCard key={booking._id} booking={booking} currency={props.currency} language={props.language} />)}
              {!activeBookings.length && (
                <div className="rounded-[24px] border border-[#E8E2D8] bg-white p-6">
                  <StateBox text={text[props.language].empty} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to="/services" className="rounded-full bg-[#071326] px-5 py-3 text-sm font-semibold text-white">{t.services}</Link>
                    <Link to="/explore" className="rounded-full border border-[#E8E2D8] px-5 py-3 text-sm font-semibold text-[#071326]">{t.explore}</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

function TripStatusPanel({ title, count, body, dark = false }: { title: string; count: number; body: string; dark?: boolean }) {
  return (
    <div className={`rounded-[24px] p-5 shadow-sm ring-1 ${dark ? 'bg-[#050A1F] text-white ring-[#050A1F]' : 'bg-white text-[#050A1F] ring-slate-200'}`}>
      <p className={`text-sm font-black ${dark ? 'text-orange-200' : 'text-[#667085]'}`}>{title}</p>
      <p className="mt-2 text-4xl font-black">{count}</p>
      <p className={`mt-2 text-sm font-semibold leading-6 ${dark ? 'text-white/64' : 'text-[#667085]'}`}>{body}</p>
    </div>
  );
}

function BookingCard({ booking, currency, language }: { booking: Booking; currency: Currency; language: Language }) {
  const vi = language === 'vi';
  const timeline = [
    vi ? 'Đặt dịch vụ' : 'Booked',
    vi ? 'Thanh toán ví/QR' : 'Wallet/QR paid',
    vi ? 'QR check-in' : 'QR check-in',
    vi ? 'Travel Passport update' : 'Travel Passport update',
  ];
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#E8E2D8] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(7,19,38,.1)]">
      <div className="grid gap-0 lg:grid-cols-[220px_1fr_280px]">
        <Link to={`/bookings/${booking._id}`} className="relative min-h-48 bg-slate-100">
          <img src={destinationImages[booking.bookingCode.length % destinationImages.length]} className="h-full min-h-48 w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#071326] backdrop-blur">QR</span>
        </Link>
        <div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#FF6A00]">{booking.bookingCode}</p>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{statusLabel(booking.status || 'confirmed', language)}</span>
          </div>
          <h3 className="mt-2 text-xl font-semibold text-[#071326]">{booking.items?.[0]?.titleSnapshot || text[language].travchainBooking}</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">{new Date(booking.createdAt).toLocaleString()}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {booking.items?.slice(0, 4).map((item, index) => <div key={`${item.serviceId}-${index}`} className="rounded-2xl bg-[#F8F4EC] p-3 text-sm font-medium text-[#667085]">{item.titleSnapshot}<span className="block text-xs text-[#071326]">{item.date} / {item.locationSnapshot}</span></div>)}
          </div>
        </div>
        </div>
        <div className="border-t border-[#E8E2D8] p-5 lg:border-l lg:border-t-0">
          <p className="text-xl font-semibold text-[#071326]">{money(booking.totalVnd, currency)}</p>
          <p className="mt-1 text-xs font-semibold uppercase text-slate-400">{booking.paymentMethod} / {booking.paymentStatus}</p>
          <div className="mt-4 grid gap-2">
            {timeline.map((step, index) => <div key={step} className="flex items-center gap-2 text-xs font-semibold text-[#667085]"><span className={`h-2.5 w-2.5 rounded-full ${index < 2 ? 'bg-[#FF6A00]' : 'bg-slate-200'}`} />{step}</div>)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to={`/receipt/${booking.bookingCode}`} className="rounded-2xl bg-[#071326] px-3 py-2 text-center text-xs font-semibold text-white">{vi ? 'Biên nhận QR' : 'QR receipt'}</Link>
            <Link to={`/bookings/${booking._id}`} className="rounded-2xl border border-[#E8E2D8] px-3 py-2 text-center text-xs font-semibold text-[#071326]">{vi ? 'Hỗ trợ' : 'Support'}</Link>
          </div>
        </div>
      </div>
    </div>
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
    const reason = window.prompt(t.cancelReason, t.changeOfPlans) || t.travelerCancellation;
    setBusy(true);
    try {
      const response = await api(`/api/bookings/${data._id}/cancel`, { method: 'PATCH', token: props.token, body: { reason } });
      props.setToast(`${t.refundStatus}: ${response.data?.refund?.status || t.requested}`);
      window.location.reload();
    } catch (err) {
      props.setToast(err instanceof Error ? err.message : t.checkoutFailed);
    } finally {
      setBusy(false);
    }
  }
  async function submitReview() {
    if (!data) return;
    const rating = Number(window.prompt(t.reviewRatingPrompt, '5'));
    if (!rating) return;
    const comment = window.prompt(t.reviewCommentPrompt, '') || '';
    try {
      await api('/api/reviews', { method: 'POST', token: props.token, body: { bookingId: data._id, serviceId: data.items[0]?.serviceId, rating, comment } });
      props.setToast(t.reviewSubmitted);
    } catch (err) {
      props.setToast(err instanceof Error ? err.message : t.checkoutFailed);
    }
  }
  return (
    <Section title={t.bookingDetail} subtitle={t.receiptHash}>
      {loading ? <SkeletonGrid /> : error || !data ? <StateBox text={error || t.notFound} /> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
          <div className="rounded-[28px] bg-[#050A1F] p-6 text-white shadow-[0_24px_58px_rgba(5,10,31,0.22)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-orange-200">{props.language === 'vi' ? 'Trip Dashboard' : 'Trip Dashboard'}</p>
                <h2 className="mt-2 text-2xl font-black">{data.items?.[0]?.locationSnapshot || 'TravChain Trip'}</h2>
                <p className="mt-2 text-sm font-semibold text-white/62">{props.language === 'vi' ? 'Countdown, thời tiết, QR check-in, nhắc lịch thông minh và hướng dẫn di chuyển được giữ lại sau khi đặt.' : 'Countdown, weather, QR check-in, smart reminders, and transport guidance stay active after booking.'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[props.language === 'vi' ? 'QR check-in' : 'QR check-in', props.language === 'vi' ? 'Thời tiết 28°C' : 'Weather 28°C', props.language === 'vi' ? 'Nhắc lịch' : 'Reminders'].map((item) => <span key={item} className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black ring-1 ring-white/10">{item}</span>)}
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
            <p className="text-sm font-black text-[#FF5A00]">{data.bookingCode}</p>
            <h2 className="mt-2 text-2xl font-black">{data.items?.[0]?.titleSnapshot || t.travchainBooking}</h2>
            <div className="mt-5 grid gap-3">
              {data.items.map((item) => (
                <div key={`${item.serviceId}-${item.date}`} className="rounded-2xl bg-[#F8F4EC] p-4">
                  <p className="font-black">{item.titleSnapshot}</p>
                  <p className="mt-1 text-sm font-bold text-[#667085]">{item.locationSnapshot} / {item.date} / {item.guests} {t.guestsLabel}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Detail label={t.paymentMethod} value={data.paymentMethod === 'qr' ? t.domesticQr : data.paymentMethod === 'card' ? t.internationalCard : t.travchainWallet} />
              <Detail label={t.status} value={`${data.status || 'confirmed'} / ${data.paymentStatus}`} />
              <Detail label={t.total} value={money(data.totalVnd, props.currency)} />
              <Detail label={t.transactionHash} value={data.transactionHash} mono />
            </div>
          </div>
          </div>
          <aside className="h-fit rounded-[24px] border border-orange-100 bg-white p-6 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
            <p className="text-xl font-black">{t.cancellationPolicy}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{t.refundEligibility}</span>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-[#FF5A00]">{t.refundEta}</span>
              <span className="rounded-full bg-[#F8F4EC] px-3 py-1 text-xs font-bold text-[#667085]">{t.walletRefundStatus}</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm font-bold text-[#667085]">
              <li>{t.freeCancel}</li>
              <li>{t.halfRefund}</li>
              <li>{t.noRefund}</li>
            </ul>
            {refund && <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-bold text-[#FF5A00]"><p>{t.refundStatus}: {refund.status}</p><p className="mt-1 break-all">{t.refundHash}: {refund.refundHash}</p></div>}
            {refund && <RefundTimeline status={refund.status} language={props.language} />}
            <Link to={`/receipt/${data.bookingCode}`} className="mt-5 block rounded-2xl bg-[#050A1F] px-5 py-3 text-center text-sm font-black text-white">{t.receiptButton}</Link>
            {data.status === 'completed' && <button onClick={submitReview} className="mt-3 w-full rounded-2xl border border-orange-200 px-5 py-3 text-sm font-black text-[#FF5A00]">{t.reviewButton}</button>}
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
  const vi = props.language === 'vi';
  const badges = [
    vi ? 'Explorer Plus' : 'Explorer Plus',
    vi ? 'Central Vietnam Traveler' : 'Central Vietnam Traveler',
    vi ? 'Verified Local Explorer' : 'Verified Local Explorer',
    vi ? '10 chuyến đi hoàn tất' : '10 completed trips',
  ];
  return (
    <Section title={text[props.language].passportTitle} subtitle={text[props.language].passportSubtitle}>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="relative overflow-hidden rounded-[32px] bg-[#050A1F] p-6 text-white shadow-[0_28px_70px_rgba(5,10,31,.28)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FF5A00]/25 blur-3xl" />
          <div className="absolute -bottom-12 left-8 h-36 w-36 rounded-full bg-[#14B8A6]/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-orange-200">Travel Passport</p>
                <p className="mt-2 text-3xl font-black">{membership.data?.tier || 'Explorer Plus'}</p>
              </div>
              <QrCode className="h-8 w-8 text-white/70" />
            </div>
            <p className="mt-8 text-sm font-bold text-white/58">{vi ? 'Danh tính du lịch đã xác thực' : 'Verified travel identity'}</p>
            <p className="mt-2 text-4xl font-black">{(membership.data?.points || 2840).toLocaleString('en-US')}</p>
            <p className="text-sm font-bold text-orange-200">{text[props.language].points}</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><span className="block h-full w-2/3 rounded-full bg-[#FF5A00]" /></div>
            <p className="mt-2 text-xs font-bold text-white/58">{vi ? 'Còn 1.200 điểm để lên hạng Voyager' : '1,200 points to Voyager tier'}</p>
          </div>
          <div className="relative mt-6 grid grid-cols-2 gap-2">
            {badges.map((badge) => <span key={badge} className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black ring-1 ring-white/10">{badge}</span>)}
          </div>
        </div>
        <div className="grid gap-5">
          <div className="grid gap-3 md:grid-cols-4">
            {[vi ? 'QR stamps' : 'QR stamps', vi ? 'Verified stays' : 'Verified stays', vi ? 'City badges' : 'City badges', vi ? 'Hash history' : 'Hash history'].map((item, index) => <Metric key={item} label={item} value={String(index === 0 ? stamps.data.length : 4 + index)} />)}
          </div>
          <div className="relative grid gap-4">
            <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-orange-200 sm:block" />
            {stamps.data.map((stamp: any) => <div key={stamp._id} className="relative overflow-hidden rounded-[28px] bg-white p-5 pl-8 shadow-sm ring-1 ring-slate-200"><span className="absolute left-3 top-6 hidden h-4 w-4 rounded-full bg-orange-500 ring-4 ring-orange-100 sm:block" /><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-black">{stamp.titleSnapshot}</p><p className="mt-1 text-sm font-bold text-slate-500">{stamp.locationSnapshot} / {stamp.usedAt}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{text[props.language].hashVerified}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-[110px_1fr]"><QrMock value={stamp.stampHash || stamp._id} /><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#667085]">{vi ? 'Blockchain hash history' : 'Blockchain hash history'}</p><code className="mt-2 block break-all rounded-2xl bg-slate-50 p-3 text-xs">{stamp.stampHash}</code><Link to={`/receipt/${stamp.bookingId?.bookingCode || ''}`} className="mt-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">{text[props.language].qrReceiptTitle}</Link></div></div></div>)}
          </div>
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
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000000');
  const [pin, setPin] = useState('');
  const t = text[props.language];

  async function setWalletPin(event: FormEvent) {
    event.preventDefault();
    await api('/api/wallet/set-pin', { method: 'POST', token: props.token, body: { pin } });
    setPin('');
    props.setToast(text[props.language].walletPinUpdated);
  }

  async function submitDeposit(event: FormEvent) {
    event.preventDefault();
    const source = sources.data.find((item) => item.isPrimary) || sources.data[0];
    if (!source) return props.setToast(t.addPaymentSourceFirst);
    const amount = Number(depositAmount);
    if (!amount) return;
    await api('/api/wallet/deposit', { method: 'POST', token: props.token, body: { amount, currency: 'VND', paymentSourceId: source._id } });
    setDepositOpen(false);
    window.location.reload();
  }

  if (!props.token) return <Section title={text[props.language].travchainWallet} subtitle={text[props.language].walletLoginSubtitle}><StateBox text={text[props.language].loginRequired} /></Section>;
  const tabs = [
    ['overview', text[props.language].overview],
    ['sources', text[props.language].paymentSources],
    ['transactions', text[props.language].transactions],
    ['refunds', text[props.language].refunds],
    ['security', text[props.language].security],
  ] as const;
  return (
    <Section title={text[props.language].travchainWallet} subtitle={text[props.language].walletSubtitle}>
      <div className="mb-5 flex flex-wrap gap-2">{tabs.map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`rounded-full px-4 py-2 text-sm font-black ${tab === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{label}</button>)}</div>
      {tab === 'overview' && (
        wallet.loading ? <SkeletonGrid /> : wallet.error ? <StateBox text={t.walletDataError} /> : <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-[28px] bg-[#050A1F] p-6 text-white shadow-[0_24px_58px_rgba(5,10,31,0.22)] sm:col-span-2">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#FF5A00]/25 blur-3xl" />
              <div className="absolute bottom-0 left-8 h-28 w-28 rounded-full bg-[#14B8A6]/20 blur-2xl" />
              <div className="relative">
                <p className="text-sm font-bold text-white/58">{text[props.language].travchainBalance}</p>
                <p className="mt-3 text-4xl font-extrabold">{money(wallet.data?.vndBalance || 0, 'VND')}</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-3">
                  <button onClick={() => setDepositOpen(true)} className="rounded-2xl bg-[#FF5A00] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-orange-600">{text[props.language].topUpCredits}</button>
                  <button onClick={() => setTab('refunds')} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/16">{text[props.language].refunds}</button>
                  <button onClick={() => setTab('sources')} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/16">{text[props.language].paymentSources}</button>
                </div>
              </div>
            </div>
            <Metric label={text[props.language].refundPending} value={money(wallet.data?.pendingBalance || 0, 'VND')} />
            <Metric label={text[props.language].travelCredits} value={money(wallet.data?.vndBalance || 0, 'VND')} />
            <Metric label={text[props.language].rewardPoints} value={(wallet.data?.rewardPoints || 0).toLocaleString('en-US')} />
            <Metric label={text[props.language].membershipTier} value={wallet.data?.membershipTier || 'Explorer'} />
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="font-black">{props.language === 'vi' ? 'Ví du lịch Web2.5' : 'Web2.5 travel wallet'}</p>
            <p className="mt-2 text-sm font-medium leading-6 text-white/62">{props.language === 'vi' ? 'Thanh toán VND là chính, hỗ trợ Visa quốc tế khi cần và giữ minh bạch bằng smart receipt có Hash.' : 'VND-first payments, international Visa support when needed, and smart receipts with Hash transparency.'}</p>
            <div className="mt-5 grid gap-3">
              <Info label={props.language === 'vi' ? 'Ngân hàng liên kết' : 'Linked banks'} value={String(sources.data.filter((source) => source.type === 'bank').length)} />
              <Info label={props.language === 'vi' ? 'Thẻ liên kết' : 'Linked cards'} value={String(sources.data.filter((source) => source.type === 'card').length)} />
              <Info label={text[props.language].cashbackRewards} value={`${wallet.data?.rewardPoints || 0} ${text[props.language].points}`} />
              <Info label={props.language === 'vi' ? 'Travel credits' : 'Travel credits'} value={money(wallet.data?.vndBalance || 0, 'VND')} />
            </div>
          </div>
        </div>
      )}
      {tab === 'sources' && (sources.loading ? <SkeletonGrid /> : sources.error ? <StateBox text={t.walletDataError} /> : <SourceList sources={sources.data} language={props.language} token={props.token} setToast={props.setToast} />)}
      {tab === 'transactions' && (transactions.loading ? <SkeletonGrid /> : transactions.error ? <StateBox text={t.walletDataError} /> : <TransactionList transactions={transactions.data} setSelected={setSelected} language={props.language} />)}
      {tab === 'refunds' && (refunds.loading ? <SkeletonGrid /> : refunds.error ? <StateBox text={t.walletDataError} /> : <RefundList refunds={refunds.data} language={props.language} currency="VND" />)}
      {tab === 'security' && <form onSubmit={setWalletPin} className="max-w-md rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="font-black">{text[props.language].walletPin}</p><input value={pin} onChange={(event) => setPin(event.target.value)} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="1234" /><button className="mt-3 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{text[props.language].updatePin}</button></form>}
      {selected && <TransactionModal transaction={selected} language={props.language} close={() => setSelected(null)} />}
      {depositOpen && <DepositModal amount={depositAmount} setAmount={setDepositAmount} sources={sources.data} language={props.language} close={() => setDepositOpen(false)} submit={submitDeposit} />}
    </Section>
  );
}

function DepositModal({ amount, setAmount, sources, language, close, submit }: { amount: string; setAmount: (value: string) => void; sources: PaymentSource[]; language: Language; close: () => void; submit: (event: FormEvent) => void }) {
  const t = text[language];
  const source = sources.find((item) => item.isPrimary) || sources[0];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#FF5A00]">{t.travchainWallet}</p><h2 className="mt-1 text-2xl font-black">{t.depositModalTitle}</h2><p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">{t.depositModalBody}</p></div>
          <button type="button" onClick={close} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button>
        </div>
        <label className="mt-5 block text-sm font-black">{t.depositAmount}</label>
        <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="10000" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-orange-300" />
        <div className="mt-4 rounded-2xl bg-[#F7F2E8] p-4">
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#667085]">{t.depositSource}</p>
          <p className="mt-1 font-black">{source ? source.providerName : t.addPaymentSourceFirst}</p>
          {source && <p className="text-sm font-bold text-[#667085]">{source.maskedNumber} / {source.currency}</p>}
        </div>
        <button disabled={!source} className="mt-5 w-full rounded-2xl bg-[#FF5A00] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 disabled:opacity-50">{t.depositAction}</button>
      </form>
    </div>
  );
}

function SourceList({ sources, language, token, setToast }: { sources: PaymentSource[]; language: Language; token: string; setToast: (value: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: 'bank', providerName: '', bankName: '', accountHolder: '', maskedNumber: '**** ', last4: '', currency: 'VND' });
  const t = text[language];
  const visibleSources = sources.filter((source) => source.type !== 'crypto_wallet');
  const typeLabel: Record<string, string> = { bank: t.bankCard, card: t.cardPaymentSource || t.internationalCard, domestic_qr: t.domesticQr };

  async function setPrimary(id: string) {
    await api(`/api/payment-sources/${id}/set-primary`, { method: 'PATCH', token });
    window.location.reload();
  }

  async function removeSource(id: string) {
    await api(`/api/payment-sources/${id}`, { method: 'DELETE', token });
    window.location.reload();
  }

  async function addSource(event: FormEvent) {
    event.preventDefault();
    await api('/api/payment-sources', { method: 'POST', token, body: { ...form, providerName: form.type === 'bank' ? (form.bankName || form.providerName) : form.providerName, isPrimary: !visibleSources.length } });
    setToast(t.addPaymentSource);
    window.location.reload();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-2xl bg-[#050A1F] px-4 py-3 text-sm font-black text-white transition hover:bg-[#FF5A00]"><Plus className="h-4 w-4" />{t.linkBank || t.addPaymentSource}</button>
      </div>
      {!visibleSources.length ? <StateBox text={t.noPaymentSources} /> : <div className="grid gap-3 md:grid-cols-2">{visibleSources.map((source) => (
        <div key={source._id} className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div><p className="font-black">{source.bankName || source.providerName}</p><p className="mt-1 text-sm font-bold text-slate-500">{typeLabel[source.type] || source.type} / {source.accountHolder ? `${source.accountHolder} / ` : ''}{source.maskedNumber} / {source.currency}</p></div>
            <CreditCard className="h-5 w-5 text-[#FF5A00]" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {source.isPrimary ? <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">{t.primarySource}</span> : <button onClick={() => setPrimary(source._id)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-slate-600 hover:border-orange-200 hover:text-[#FF5A00]">{t.setPrimary}</button>}
            <button onClick={() => removeSource(source._id)} className="rounded-full border border-red-100 px-3 py-1 text-xs font-black text-red-600 hover:bg-red-50">{t.removeSource}</button>
          </div>
        </div>
      ))}</div>}
      {adding && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form onSubmit={addSource} className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><h2 className="text-2xl font-black">{t.addPaymentSourceTitle}</h2><button type="button" onClick={() => setAdding(false)} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button></div>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold">
              <option value="bank">{t.bankCard}</option>
              <option value="card">{t.cardPaymentSource || t.internationalCard}</option>
              <option value="domestic_qr">{t.domesticQr}</option>
            </select>
            {form.type === 'bank' && <input value={form.bankName} onChange={(event) => setForm({ ...form, bankName: event.target.value })} placeholder={t.bankName || t.providerName} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />}
            {form.type !== 'bank' && <input value={form.providerName} onChange={(event) => setForm({ ...form, providerName: event.target.value })} placeholder={t.providerName} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />}
            <input value={form.accountHolder} onChange={(event) => setForm({ ...form, accountHolder: event.target.value })} placeholder={t.accountHolder || t.providerName} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />
            <input value={form.maskedNumber} onChange={(event) => setForm({ ...form, maskedNumber: event.target.value })} placeholder={t.maskedNumber} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />
            <input value={form.last4} onChange={(event) => setForm({ ...form, last4: event.target.value })} placeholder={t.last4} className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" />
            <button className="mt-5 w-full rounded-2xl bg-[#050A1F] px-5 py-3 text-sm font-black text-white hover:bg-[#FF5A00]">{t.addPaymentSource}</button>
          </form>
        </div>
      )}
    </div>
  );
  if (!sources.length) return <StateBox text={text[language].noPaymentSources} />;
  return <div className="grid gap-3 md:grid-cols-2">{sources.map((source) => <div key={source._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="font-black">{source.providerName}</p><p className="mt-1 text-sm font-bold text-slate-500">{source.maskedNumber} / {source.currency}</p>{source.isPrimary && <span className="mt-3 inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">{text[language].primary}</span>}</div>)}</div>;
}

function TransactionList({ transactions, setSelected, language }: { transactions: WalletTransaction[]; setSelected: (value: WalletTransaction) => void; language: Language }) {
  const [filter, setFilter] = useState('all');
  const customerTransactions = transactions.filter((item) => item.currency !== 'USDT');
  const visible = filter === 'all' ? customerTransactions : customerTransactions.filter((item) => item.type === filter);
  const filters = ['all', 'deposit', 'booking_payment', 'refund', 'withdraw'];
  const labels: Record<string, string> = {
    all: text[language].allTransactions,
    booking_payment: text[language].bookingPayment,
    deposit: text[language].deposit,
    refund: text[language].refund,
    reward: text[language].reward,
    fee: text[language].fee,
    withdraw: text[language].withdraw,
  };
  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-[#667085]">{text[language].transactionFilters}</p>
      <div className="mb-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-black ${filter === item ? 'bg-orange-500 text-white' : 'bg-white ring-1 ring-slate-200'}`}>{labels[item]}</button>)}</div>
      {!visible.length ? <StateBox text={text[language].noTransactions} /> : <div className="grid gap-3">{visible.map((tx) => <button key={tx._id} onClick={() => setSelected(tx)} className="grid gap-2 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:grid-cols-[1fr_auto]"><div><p className="font-black">{tx.description || tx.type}</p><p className="mt-1 text-xs font-black uppercase text-slate-400">{tx.type} / {tx.status}</p></div><p className="font-black">{walletAmount(tx.amount, tx.currency)}</p></button>)}</div>}
    </div>
  );
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-black ${filter === item ? 'bg-orange-500 text-white' : 'bg-white ring-1 ring-slate-200'}`}>{labels[item]}</button>)}</div>
      <div className="grid gap-3">{visible.map((tx) => <button key={tx._id} onClick={() => setSelected(tx)} className="grid gap-2 rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 sm:grid-cols-[1fr_auto]"><div><p className="font-black">{tx.description || tx.type}</p><p className="mt-1 text-xs font-black uppercase text-slate-400">{tx.type} / {tx.status}</p></div><p className="font-black">{walletAmount(tx.amount, tx.currency)}</p></button>)}</div>
    </div>
  );
}

function TransactionModal({ transaction, language, close }: { transaction: WalletTransaction; language: Language; close: () => void }) {
  const t = text[language];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-orange-600">{t.transaction}</p><h2 className="mt-1 text-2xl font-black">{transaction.referenceCode}</h2></div><button onClick={close} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button></div>
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
  const pending = refunds.filter((refund) => !['refunded', 'rejected'].includes(refund.status));
  const completed = refunds.filter((refund) => ['refunded', 'rejected'].includes(refund.status));
  const renderRefund = (refund: Refund) => (
    <div key={refund._id} className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-black">{refund.bookingId?.bookingCode || t.refundRequests}</p>
          <p className="mt-1 text-sm font-bold text-[#667085]">{refund.reason}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-black text-[#FF5A00]">{money(refund.amount, currency)}</p>
          <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${refund.status === 'refunded' ? 'bg-emerald-50 text-emerald-700' : refund.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{refund.status}</span>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-sm font-bold text-[#667085] sm:grid-cols-2">
        <p>{t.bookingCode}: {refund.bookingId?.bookingCode || '-'}</p>
        <p className="break-all">{t.refundHash}: {refund.refundHash || '-'}</p>
      </div>
      <RefundTimeline status={refund.status} language={language} />
      {refund.bookingId?.bookingCode && <Link to={`/receipt/${refund.bookingId.bookingCode}`} className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white hover:bg-[#FF5A00]">{t.viewBooking}</Link>}
    </div>
  );
  if (!refunds.length) return <StateBox text={t.noRefundRequestsYet} />;
  return (
    <div className="grid gap-6">
      <div><h3 className="mb-3 text-lg font-black">{t.pendingRefundsGroup}</h3>{pending.length ? <div className="grid gap-3">{pending.map(renderRefund)}</div> : <StateBox text={t.noRefundsPending} />}</div>
      <div><h3 className="mb-3 text-lg font-black">{t.completedRefunds}</h3>{completed.length ? <div className="grid gap-3">{completed.map(renderRefund)}</div> : <StateBox text={t.noRefundsCompleted} />}</div>
    </div>
  );
  if (!refunds.length) return <StateBox text={t.noRefundRequestsYet} />;
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
          <RefundTimeline status={refund.status} language={language} />
        </div>
      ))}
    </div>
  );
}

function RefundTimeline({ status, language }: { status: string; language: Language }) {
  const t = text[language];
  const normalized = status.toLowerCase();
  const steps = [
    ['pending', t.refundPendingState],
    ['approved', t.refundApprovedState],
    ['processing', t.refundProcessingState],
    ['refunded', t.refundRefundedState],
    ['rejected', t.refundRejectedState],
  ];
  const activeIndex = normalized.includes('reject') ? 4 : Math.max(0, steps.findIndex(([key]) => normalized.includes(key)));
  return (
    <div className="mt-4 rounded-2xl bg-[#F8F4EC] p-4">
      <p className="text-xs font-black uppercase tracking-[.14em] text-[#667085]">{t.refundTimeline}</p>
      <div className="mt-3 grid gap-2">
        {steps.map(([key, label], index) => {
          const active = index <= activeIndex;
          const rejected = key === 'rejected' && activeIndex === 4;
          return (
            <div key={key} className="flex items-center gap-3 text-sm font-bold">
              <span className={`grid h-6 w-6 place-items-center rounded-full ${active ? rejected ? 'bg-red-500 text-white' : 'bg-[#14B8A6] text-white' : 'bg-white text-[#667085]'}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <span className={active ? 'text-[#050A1F]' : 'text-[#667085]'}>{label}</span>
            </div>
          );
        })}
      </div>
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
            <div className="rounded-2xl bg-slate-50 p-4">{data.items.map((item: any) => <p key={item.titleSnapshot} className="text-sm font-bold">{item.titleSnapshot} / {item.date}</p>)}</div>
          </div>
          <div className="rounded-3xl bg-slate-950 p-5 text-white"><QrMock value={data.qrPayload || data.bookingCode} /><p className="mt-4 break-all text-center text-xs font-bold text-white/50">{data.qrPayload}</p></div>
        </div>
      )}
    </Section>
  );
}

function PublicInfoPage({ language, titleKey }: { language: Language; titleKey: string }) {
  return (
    <Section title={translateText(language, titleKey)} subtitle={text[language]['footer.info.subtitle']}>
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="max-w-3xl text-sm font-medium leading-7 text-slate-600">{text[language]['footer.info.body']}</p>
        <Link to="/services" className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-orange-600">
          {text[language].services}
        </Link>
      </div>
    </Section>
  );
}

function ProfilePage({ language, user, setUser, setToken }: AppContext & { setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  const token = localStorage.getItem(TOKEN_KEY) || '';
  const wallet = useAuthed<Wallet | null>('/api/wallet', token, null);
  const membership = useAuthed<any>('/api/membership/me', token, null);
  const bookings = useAuthed<Booking[]>('/api/bookings/my', token, []);
  const tier = membership.data?.tier || membership.data?.membershipTier || wallet.data?.membershipTier || text[language].notAvailable;
  const points = membership.data?.points ?? membership.data?.rewardPoints ?? wallet.data?.rewardPoints ?? 0;
  const balance = wallet.data ? money(wallet.data.vndBalance || 0, 'VND') : text[language].notAvailable;
  const shortcuts = [
    ['/bookings', text[language].myBookings, ShoppingBag],
    ['/wallet', text[language].wallet, WalletCards],
    ['/passport', text[language].passportTitle, QrCode],
    ['/notifications', text[language].notifications, Bell],
    ['/wallet', text[language].refunds, CreditCard],
  ] as const;

  function logout() {
    setUser(null);
    setToken('');
  }

  return (
    <Section title={text[language].profile} subtitle={text[language].accountInfo}>
      {!user ? <StateBox text={text[language].loginRequired} /> : (
        <div className="grid gap-5">
          <div className="grid gap-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[24px] bg-[#050A1F] p-6 text-white">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FF5A00] text-xl font-black">{user.name.slice(0, 1).toUpperCase()}</span>
              <h2 className="mt-5 text-2xl font-black">{user.name}</h2>
              <div className="mt-4 grid gap-3 text-sm font-bold text-white/72">
                <p>{text[language].email}: <span className="text-white">{user.email}</span></p>
                <p>{text[language].role}: <span className="text-white">{roleLabel(user.role, language)}</span></p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label={text[language].membershipTier} value={String(tier)} />
              <Metric label={text[language].rewardPoints} value={String(points)} />
              <Metric label={text[language].bookingCount} value={String(bookings.data.length)} />
              <Metric label={text[language].walletBalance} value={balance} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map(([to, label, Icon]) => (
              <Link key={to} to={to} className="flex items-center gap-3 rounded-3xl bg-white p-5 font-black shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:text-[#FF5A00] hover:shadow-lg">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-[#FF5A00]"><Icon className="h-5 w-5" /></span>
                {label}
              </Link>
            ))}
            <button onClick={logout} className="flex items-center gap-3 rounded-3xl bg-white p-5 text-left font-black text-red-600 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-lg">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600"><X className="h-5 w-5" /></span>
              {text[language].logout}
            </button>
          </div>
          <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xl font-extrabold text-[#050A1F]">{text[language].recentJourneys}</p>
                <p className="mt-1 text-sm font-medium text-[#667085]">{text[language].recentJourneysSubtitle}</p>
              </div>
              <Link to="/bookings" className="rounded-full bg-[#050A1F] px-4 py-2 text-sm font-bold text-white">{text[language].myBookings}</Link>
            </div>
            <div className="mt-4 grid gap-3">
              {bookings.data.slice(0, 3).map((booking) => (
                <Link key={booking._id} to={`/bookings/${booking._id}`} className="grid gap-2 rounded-2xl bg-[#F8F4EC] p-4 transition hover:-translate-y-0.5 hover:bg-orange-50 sm:grid-cols-[1fr_auto]">
                  <span>
                    <span className="block font-semibold text-[#050A1F]">{booking.items?.[0]?.titleSnapshot || text[language].travchainBooking}</span>
                    <span className="mt-1 block text-xs font-medium text-[#667085]">{booking.bookingCode} / {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-[#667085]">{booking.paymentStatus}</span>
                </Link>
              ))}
              {!bookings.data.length && <StateBox text={text[language].empty} />}
            </div>
          </div>
        </div>
      )}
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
      setError(caught instanceof Error ? caught.message : text[language].loginFailed);
    }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h2 className="text-2xl font-black">{text[language].signIn}</h2><button type="button" onClick={close}><X className="h-5 w-5" /></button></div>
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder={text[language].email} />
        <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder={text[language].password} />
        {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">{text[language].continue}</button>
      </form>
    </div>
  );
}

function LoginPage({ language, setToken, setUser }: { language: Language; setToken: (value: string) => void; setUser: (value: User) => void }) {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const requestedRole: Role = roleParam === 'partner' ? 'partner' : roleParam === 'admin' ? 'admin' : 'traveler';
  const [mode, setMode] = useState<Role>(requestedRole);
  const [form, setForm] = useState({ email: 'demo@travchain.vn', password: '123456' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setMode(requestedRole);
  }, [requestedRole]);

  useEffect(() => {
    setForm({
      email: mode === 'partner' ? 'partner@travchain.vn' : mode === 'admin' ? 'admin@travchain.vn' : 'demo@travchain.vn',
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
      setError(caught instanceof Error ? caught.message : text[language].loginFailed);
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
              {text[language].loginHeroBody}
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Info label={text[language].travelerRole} value="/explore" />
            <Info label={text[language].partnerRole} value="/partner/dashboard" />
            <Info label={text[language].adminRole} value="/admin/dashboard" />
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="h-fit rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-3xl font-black">{text[language].signIn}</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{text[language].loginSubtitle}</p>
        <div className="mt-5 grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
          {(['traveler', 'partner', 'admin'] as const).map((value) => (
            <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-xl px-4 py-3 text-sm font-black ${mode === value ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>
              {roleLabel(value, language)}
            </button>
          ))}
        </div>
        <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-orange-500" />
        <input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-orange-500" />
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
          {text[language].adminDemo}: admin@travchain.vn / 123456
        </div>
        {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600">{text[language].continue}</button>
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
  setToast(`${service.title} ${text[language].addedToCart}`);
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"><div className="mb-4 sm:mb-6"><h1 className="heading-xl tracking-normal text-[#071326]">{title}</h1>{subtitle && <p className="body-md mt-2 max-w-2xl text-[#667085] sm:mt-3">{subtitle}</p>}</div>{children}</section>;
}

function FilterPanel({ children }: { children: ReactNode }) {
  return <div className="mb-6 rounded-[24px] border border-[#E8E2D8] bg-white p-4">{children}</div>;
}

function ChipGroup({ label, values, selected, setSelected, language = 'en' }: { label: string; values: string[]; selected: string; setSelected: (value: string) => void; language?: Language }) {
  return <div className="mb-3 last:mb-0"><p className="mb-2 text-xs font-semibold uppercase tracking-[.14em] text-slate-400">{label}</p><div className="flex flex-wrap gap-2"><button onClick={() => setSelected('')} className={`rounded-full px-3 py-2 text-xs font-semibold ${!selected ? 'bg-[#071326] text-white' : 'bg-[#F8F4EC] text-[#667085]'}`}>{text[language].all}</button>{values.map((value) => <button key={value} onClick={() => setSelected(value)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${selected === value ? 'bg-[#FF6A00] text-white' : 'bg-[#F8F4EC] text-[#667085] hover:bg-orange-50 hover:text-[#FF6A00]'}`}>{value}</button>)}</div></div>;
}

function QuickChip({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/85 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">{label}</Link>;
}

function DestinationGrid({ language }: { language: Language }) {
  return <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{destinations.map((destination) => {
    const name = language === 'vi' ? destination.nameVi : destination.nameEn;
    return <Link key={destination.slug} to={`/destination/${destination.slug}`} className="group relative min-h-36 overflow-hidden rounded-[18px] bg-[#071326] p-3 text-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(7,19,38,.14)] sm:min-h-48 sm:rounded-[24px] sm:p-5"><img src={destination.heroImage} className="absolute inset-0 h-full w-full object-cover opacity-62 transition duration-700 group-hover:scale-110 group-hover:opacity-78" /><div className="absolute inset-0 bg-gradient-to-t from-[#071326]/88 via-[#071326]/28 to-transparent" /><div className="relative flex h-full min-h-28 flex-col justify-between sm:min-h-40"><span className="w-fit rounded-full bg-white/14 px-2 py-1 text-[10px] font-semibold backdrop-blur sm:px-3 sm:text-xs">{text[language].localFavorite}</span><div><p className="text-lg font-semibold sm:text-2xl">{name}</p><p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-white/78 sm:text-sm">{language === 'vi' ? destination.descriptionVi : destination.descriptionEn}</p></div></div></Link>;
  })}</div>;
}

function InfoPanel({ title, body, to, language = 'en' }: { title: string; body: string; to: string; language?: Language }) {
  return <Link to={to} className="rounded-[18px] bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-6"><p className="text-lg font-black sm:text-2xl">{title}</p><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 sm:mt-3 sm:line-clamp-none sm:leading-7">{body}</p><span className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white sm:mt-5 sm:px-4 sm:text-sm">{text[language].open} <ChevronRight className="h-4 w-4" /></span></Link>;
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
      title={text[language].adminControlTitle}
      body={text[language].adminControlBody}
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
            <h2 className="mt-2 text-2xl font-black">{text[language].travelerPartnerTitle}</h2>
          </div>
          <button onClick={close} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
          {text[language].travelerPartnerBody}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link to="/profile" onClick={close} className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white">{text[language].goToProfile}</Link>
          <Link to="/login?role=partner" onClick={close} className="rounded-2xl bg-orange-500 px-4 py-3 text-center text-sm font-black text-white">{text[language].partnerLogin}</Link>
        </div>
      </section>
    </div>
  );
}

function CheckoutSummary({ total, currency, language }: { total: number; currency: Currency; language: Language }) {
  return <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-white/50">{text[language].total}</p><p className="mt-2 text-3xl font-black">{money(total, currency)}</p><Link to="/checkout" className="mt-6 block rounded-2xl bg-orange-500 px-5 py-3 text-center text-sm font-black text-white">{text[language].checkout}</Link></aside>;
}

function BookingProgress({ language, active }: { language: Language; active: string }) {
  const t = text[language];
  const steps = [
    ['search', t.howSearchTitle, Search],
    ['service', t.howChooseTitle, TicketCheck],
    ['cart', t.cart, ShoppingBag],
    ['checkout', t.checkout, CreditCard],
    ['payment', t.paymentMethod, ShieldCheck],
    ['receipt', t.qrReceiptTitle, QrCode],
    ['passport', t.passportTitle, Sparkles],
  ] as const;
  const activeIndex = steps.findIndex(([key]) => key === active);
  return (
    <div className="mb-6 overflow-x-auto rounded-[24px] border border-orange-100 bg-white p-4 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
      <div className="grid min-w-[760px] grid-cols-7 items-center gap-2">
        {steps.map(([key, label, Icon], index) => {
          const done = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <div key={key} className="relative flex flex-col items-center gap-2 text-center">
              {index > 0 && <span className={`absolute right-1/2 top-5 h-0.5 w-full ${done || isActive ? 'bg-[#FF5A00]' : 'bg-orange-100'}`} />}
              <span className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 transition ${done ? 'border-[#14B8A6] bg-[#14B8A6] text-white' : isActive ? 'border-[#FF5A00] bg-[#FF5A00] text-white shadow-lg shadow-orange-500/25' : 'border-orange-100 bg-[#FFF8F0] text-[#667085]'}`}>
                {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <span className={`text-xs font-bold ${isActive ? 'text-[#050A1F]' : 'text-[#667085]'}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
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

function StateBox({ text, retry }: { text: string; retry?: () => void }) {
  const language = storedLanguage();
  const isFetchError = /failed to fetch|network|fetch|load failed|chưa tải được dữ liệu|could not load/i.test(text);
  const message = isFetchError ? (language === 'vi' ? 'Chưa tải được dữ liệu. Vui lòng thử lại.' : 'We could not load data. Please try again.') : text;
  return (
    <div className="premium-card grid place-items-center p-10 text-center">
      <div>
        <Sparkles className="mx-auto h-9 w-9 text-[#FF5A00]" />
        <p className="mt-4 text-lg font-extrabold text-[#050A1F]">{message}</p>
        <p className="mt-2 text-sm font-medium text-[#667085]">{text === translateText(language, 'empty') ? translateText(language, 'emptyJourneyCta') : translateText(language, 'startExploring')}</p>
        {(retry || isFetchError) && <button onClick={retry || (() => window.location.reload())} className="mt-5 rounded-full bg-[#071326] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#FF6A00]">{translateText(language, 'retry')}</button>}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="shimmer h-80 rounded-[24px]" />)}</div>;
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

function WorkspaceLayout({ title, nav, language, setLanguage, user, setUser, setToken }: { title: string; nav: Array<[string, string]>; language: Language; setLanguage: (value: Language) => void; user: User | null; setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  const notifications = useAuthed<any[]>('/api/notifications', localStorage.getItem(TOKEN_KEY) || '', []);
  const unread = notifications.data.filter((item) => !item.readStatus).length;
  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:p-6">
          <Link to="/" className="flex items-center gap-3"><BrandLogo /><span><span className="block font-black">TravChain</span><span className="block text-xs font-bold text-slate-500">{title}</span></span></Link>
          <Link to="/explore" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black lg:hidden">App</Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:overflow-visible lg:px-4">
          {nav.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `block shrink-0 rounded-2xl px-4 py-3 text-sm font-black ${isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</NavLink>)}
        </nav>
        <div className="hidden p-4 lg:block">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="font-black">{user?.name}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{user ? roleLabel(user.role, language) : ''}</p>
            <button onClick={() => { setUser(null); setToken(''); }} className="mt-4 w-full rounded-2xl bg-white px-4 py-2 text-xs font-black ring-1 ring-slate-200">{text[language].logout}</button>
          </div>
        </div>
      </aside>
      <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="font-black">{title}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black">{language.toUpperCase()}</button>
            <Link to={user?.role === 'admin' ? '/admin/logs' : '/partner/notifications'} className="relative rounded-full bg-orange-50 px-3 py-2 text-xs font-black text-orange-600">
              {text[language].notifications}
              {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[11px] text-white">{unread}</span>}
            </Link>
            <p className="hidden text-sm font-bold text-slate-500 sm:block">{user?.name}</p>
          </div>
        </div>
        <Outlet />
      </section>
    </main>
  );
}

function PartnerLayout({ language, setLanguage, user, setUser, setToken }: { language: Language; setLanguage: (value: Language) => void; user: User | null; setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  const p = language === 'vi' ? partnerVi : partnerEn;
  const nav: Array<[string, string]> = [
    ['/partner/dashboard', p.dashboard],
    ['/partner/onboarding', p.onboarding],
    ['/partner/services', p.services],
    ['/partner/bookings', p.bookings],
    ['/partner/revenue', p.revenue],
    ['/partner/wallet', p.wallet],
    ['/partner/payout', p.payout],
    ['/partner/reconciliation', p.reconciliation],
    ['/partner/refunds', p.refunds],
    ['/partner/notifications', p.notifications],
  ];
  return <WorkspaceLayout title={p.partnerCenter} nav={nav} language={language} setLanguage={setLanguage} user={user} setUser={setUser} setToken={setToken} />;
}

function AdminLayout({ language, setLanguage, user, setUser, setToken }: { language: Language; setLanguage: (value: Language) => void; user: User | null; setUser: (value: User | null) => void; setToken: (value: string) => void }) {
  const p = language === 'vi' ? partnerVi : partnerEn;
  const a = language === 'vi' ? adminVi : adminEn;
  const nav: Array<[string, string]> = [
    ['/admin/dashboard', p.dashboard],
    ['/admin/users', a.users],
    ['/admin/partners', text[language].partnerRole],
    ['/admin/services', p.services],
    ['/admin/bookings', p.bookings],
    ['/admin/revenue', p.revenue],
    ['/admin/refunds', p.refunds],
    ['/admin/logs', a.auditLogs],
  ];
  return <WorkspaceLayout title={p.adminControl} nav={nav} language={language} setLanguage={setLanguage} user={user} setUser={setUser} setToken={setToken} />;
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="mb-6"><p className="text-sm font-black uppercase tracking-[.18em] text-orange-600">TravChain</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">{subtitle}</p></div>;
}

function PartnerDashboardPage({ token, language }: { token: string; language: Language }) {
  const dashboard = useAuthed<any>('/api/partner/dashboard', token, null);
  const wallet = useAuthed<any>('/api/partner/wallet', token, null);
  const data = dashboard.data || {};
  const p = language === 'vi' ? partnerVi : partnerEn;
  const chartBars = [42, 58, 36, 72, 65, 84, 53];
  return (
    <>
      <PageHeader title={p.dashboard} subtitle={p.dashboardSubtitle} />
      <div className="mb-6 overflow-hidden rounded-[28px] bg-[#050A1F] p-6 text-white shadow-[0_24px_58px_rgba(5,10,31,0.22)]">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-200">{p.partnerOperatingCenterLabel}</p>
            <h2 className="mt-2 text-3xl font-black">{p.partnerOperatingCenterHeadline}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/62">{p.partnerOperatingCenterBody}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label={p.conversionRate} value="8.4%" />
            <Metric label={p.occupancy} value="76%" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#667085]">{p.monthlyRevenue}</p>
              <p className="mt-2 text-3xl font-extrabold text-[#050A1F]">{money(data.revenue || 0, 'VND')}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{p.healthy}</span>
          </div>
          <div className="mt-6"><MiniChart title={p.revenue7Days} bars={chartBars} /></div>
        </div>
        <div className="grid gap-4">
          <SignalCard title={p.todayBookings} value={String(data.orders || 0)} note={p.notifications} icon={ShoppingBag} />
          <SignalCard title={p.pendingPayout} value={money(wallet.data?.pendingBalance || 0, 'VND')} note={p.upcomingPayouts} icon={WalletCards} />
          <SignalCard title={p.lowInventoryAlert} value={data.inventory < 10 ? '< 10' : p.healthy} note={p.inventory} icon={Bell} />
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <MiniChart title={p.revenue30Days} bars={[55, 62, 48, 68, 75, 70, 88]} />
        <MiniChart title={p.revenueByService} bars={[75, 40, 64, 52, 81]} />
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="font-black">{p.refundTrend}</p>
          <RefundTimeline status={data.refundRequests ? 'processing' : 'pending'} language={language} />
        </div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          [p.aiRecommendationTitle, p.aiRecommendationBody],
          [p.payoutTimelineTitle, p.payoutTimelineBody],
          [p.disputeCenterTitle, p.disputeCenterBody],
        ].map(([title, body]) => <div key={title} className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="font-black text-[#050A1F]">{title}</p><p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">{body}</p></div>)}
      </div>
    </>
  );
}

function SignalCard({ title, value, note, icon: Icon }: { title: string; value: string; note: string; icon: LucideIcon }) {
  return (
    <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(7,17,38,0.07)]">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-[#FF5A00]"><Icon className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-medium text-[#667085]">{title}</p>
          <p className="mt-1 text-2xl font-extrabold text-[#050A1F]">{value}</p>
          <p className="mt-1 text-xs font-medium text-[#667085]">{note}</p>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ title, bars }: { title: string; bars: number[] }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="font-semibold text-[#050A1F]">{title}</p><div className="mt-5 flex h-32 items-end gap-2">{bars.map((value, index) => <span key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-[#FF5A00] to-[#FDBA74] transition hover:opacity-80" style={{ height: `${value}%` }} />)}</div></div>;
}

function PartnerServicesPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<Service[]>('/api/partner/services', token, []);
  const p = text[language];
  return <><PageHeader title={p.serviceManagement} subtitle={p.serviceManagementSubtitle} /><div className="mb-4 flex flex-wrap gap-2"><Link to="/partner/onboarding" className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white">{p.createService}</Link></div><DataTable rows={state.data} columns={['title', 'type', 'province', 'availability', 'status']} linkPrefix="/partner/services" /></>;
}

function PartnerServiceDetailPage({ token, language }: { token: string; language: Language }) {
  const { id } = useParams();
  const service = useService(id || '');
  const p = text[language];
  return <><PageHeader title={p.serviceDetail} subtitle={p.serviceDetailSubtitle} />{service.data ? <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><h2 className="text-2xl font-black">{service.data.title}</h2><p className="mt-2 text-slate-600">{service.data.description}</p><div className="mt-5 flex flex-wrap gap-2"><Link to={`/partner/services/${id}/calendar`} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">{p.calendar}</Link><Link to={`/partner/services/${id}/analytics`} className="rounded-2xl bg-white px-4 py-3 text-sm font-black ring-1 ring-slate-200">{p.analytics}</Link></div></div> : <StateBox text={service.error || p.loadingService} />}</>;
}

function PartnerCalendarPage({ language }: { language: Language }) {
  const days = Array.from({ length: 14 }, (_, index) => new Date(Date.now() + index * 86400000).toISOString().slice(0, 10));
  const p = text[language];
  return <><PageHeader title={p.calendarInventory} subtitle={p.calendarInventorySubtitle} /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{days.map((day, index) => <div key={day} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><p className="font-black">{day}</p><p className="mt-2 text-sm font-bold text-slate-500">{p.inventory}: {20 + index}</p><p className="text-sm font-bold text-slate-500">{p.rule}: {index % 6 === 0 ? p.weekendPricing : p.standard}</p></div>)}</div></>;
}

function PartnerAnalyticsPage({ token, language }: { token: string; language: Language }) {
  const services = useAuthed<Service[]>('/api/partner/services', token, []);
  const { id } = useParams();
  const service = services.data.find((item) => item._id === id);
  const bookings = Math.max(1, Math.round((service?.reviewCount || 12) / 4));
  const p = text[language];
  return <><PageHeader title={p.serviceAnalytics} subtitle={p.serviceAnalyticsSubtitle} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label={p.views} value={String((service?.reviewCount || 24) * 17)} /><Metric label={p.clicks} value={String((service?.reviewCount || 24) * 5)} /><Metric label={p.bookings} value={String(bookings)} /><Metric label={p.conversion} value={`${Math.round(bookings / ((service?.reviewCount || 24) * 5) * 100)}%`} /><Metric label={p.rating} value={String(service?.rating || 4.7)} /></div></>;
}

function PartnerBookingsPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<Booking[]>('/api/partner/bookings', token, []);
  const p = text[language];
  return <><PageHeader title={p.bookingManagement} subtitle={p.bookingManagementSubtitle} /><FilterPanel><ChipGroup language={language} label={p.status} values={['pending', 'confirmed', 'completed', 'cancelled', 'refunded']} selected="" setSelected={() => undefined} /></FilterPanel><DataTable rows={state.data} columns={['bookingCode', 'totalVnd', 'paymentStatus', 'reconciliationStatus', 'createdAt']} /></>;
}

function PartnerRefundsPage({ token, language, setToast }: { token: string; language: Language; setToast: (value: string) => void }) {
  const state = useAuthed<Refund[]>('/api/partner/refunds', token, []);
  const p = text[language];
  async function decide(id: string, action: 'approve' | 'reject') {
    try {
      const reason = window.prompt(p.reason, action === 'approve' ? p.eligibleCancellation : p.policyNotEligible) || '';
      await api(`/api/partner/refunds/${id}/${action}`, { method: 'PATCH', token, body: { reason } });
      setToast(action === 'approve' ? p.refundApproved : p.refundRejected);
      window.location.reload();
    } catch (error) {
      setToast(error instanceof Error ? error.message : p.refundUpdateFailed);
    }
  }
  return (
    <>
      <PageHeader title={p.refundManagement} subtitle={p.refundManagementSubtitle} />
      <div className="grid gap-3">
        {state.data.map((refund) => (
          <div key={refund._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-black">{refund.bookingId?.bookingCode || refund._id}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{refund.reason} / {refund.status}</p>
                <code className="mt-3 block break-all rounded-2xl bg-slate-50 p-3 text-xs">{refund.refundHash}</code>
              </div>
              <p className="font-black">{money(refund.amount, 'VND')}</p>
            </div>
            {refund.status === 'requested' && <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => decide(refund._id, 'approve')} className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white">{p.approve}</button><button onClick={() => decide(refund._id, 'reject')} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white">{p.reject}</button></div>}
          </div>
        ))}
        {!state.data.length && <StateBox text={p.noRefundRequests} />}
      </div>
    </>
  );
}

function PartnerRevenuePage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<any>('/api/partner/revenue', token, {});
  const p = text[language];
  return <><PageHeader title={p.revenue} subtitle={`${p.grossRevenue}, ${p.platformFee}, ${p.netRevenue}.`} /><div className="grid gap-4 sm:grid-cols-3"><Metric label={p.grossRevenue} value={money(state.data?.grossVnd || 0, 'VND')} /><Metric label={p.platformFee} value={money(state.data?.feeVnd || 0, 'VND')} /><Metric label={p.netRevenue} value={money(state.data?.netVnd || 0, 'VND')} /></div></>;
}

function PartnerWalletPage({ token, language }: { token: string; language: Language }) {
  const wallet = useAuthed<any>('/api/partner/wallet', token, null);
  const commission = useAuthed<any>('/api/partner/commission-breakdown', token, null);
  const p = text[language];
  return <><PageHeader title={p.partnerWallet} subtitle={p.partnerWalletSubtitle} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label={p.grossRevenue} value={money(commission.data?.grossVnd || 0, 'VND')} /><Metric label={`${p.platformFee} %`} value={`${Math.round((commission.data?.platformFeeRate || 0.08) * 100)}%`} /><Metric label={p.netRevenue} value={money(commission.data?.netVnd || 0, 'VND')} /><Metric label={p.pendingPayout} value={money(wallet.data?.pendingBalance || 0, 'VND')} /><Metric label={p.paidPayout} value={money(wallet.data?.availableBalance || 0, 'VND')} /></div></>;
}

function PartnerPayoutPage({ token, language, setToast }: { token: string; language: Language; setToast: (value: string) => void }) {
  const p = text[language];
  async function requestPayout() {
    try { await api('/api/partner/payout-request', { method: 'POST', token }); setToast(p.payoutSubmitted); } catch (error) { setToast(error instanceof Error ? error.message : p.payoutFailed); }
  }
  return <><PageHeader title={p.requestPayout} subtitle={p.requestPayoutSubtitle} /><button onClick={requestPayout} className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">{p.requestPayout}</button></>;
}

function PartnerReconciliationPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<any[]>('/api/partner/reconciliation', token, []);
  const p = text[language];
  return <><PageHeader title={p.reconciliation} subtitle={p.settlementRows} /><DataTable rows={state.data} columns={['grossVnd', 'platformFeeVnd', 'netVnd', 'status', 'createdAt']} /></>;
}

function PartnerOnboardingPage({ language = 'en' }: { language?: Language }) {
  const p = text[language];
  const fields = [p.businessName, p.logoUrl, p.province, p.contactPhone, p.bankAccount, p.serviceCategory];
  return <><PageHeader title={p.partnerOnboarding} subtitle={p.partnerOnboardingSubtitle} /><form className="grid max-w-3xl gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">{fields.map((field) => <input key={field} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold" placeholder={field} />)}<button type="button" className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{p.submitApproval}</button></form></>;
}

function NotificationsPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<any[]>('/api/notifications', token, []);
  const p = text[language];
  return <><PageHeader title={p.notifications} subtitle={p.notificationsSubtitle} /><DataTable rows={state.data} columns={['title', 'message', 'type', 'readStatus', 'createdAt']} /></>;
}

function AdminDashboardPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<any>('/api/admin/dashboard', token, {});
  const p = text[language];
  return <><PageHeader title={p.adminDashboard} subtitle={p.dashboardSubtitle} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label={p.users} value={String(state.data?.users || 0)} /><Metric label={p.partners} value={String(state.data?.partners || 0)} /><Metric label={p.bookings} value={String(state.data?.bookings || 0)} /><Metric label={p.services} value={String(state.data?.services || 0)} /><Metric label={p.revenue} value={money(state.data?.platformRevenueVnd || 0, 'VND')} /></div></>;
}

function AdminUsersPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<any[]>('/api/admin/users', token, []);
  const p = text[language];
  return <><PageHeader title={p.users} subtitle={p.usersSubtitle} /><DataTable rows={state.data} columns={['name', 'email', 'role', 'status', 'createdAt']} /></>;
}

function AdminPartnersPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<any[]>('/api/admin/partners', token, []);
  const p = text[language];
  return <><PageHeader title={p.partners} subtitle={p.partnersSubtitle} /><DataTable rows={state.data} columns={['name', 'email', 'companyName', 'status', 'createdAt']} /></>;
}

function AdminServicesPage({ token, language, setToast }: { token: string; language: Language; setToast: (value: string) => void }) {
  const state = useAuthed<Service[]>('/api/admin/services', token, []);
  const p = text[language];
  async function update(id: string, action: 'approve' | 'reject') {
    try { await api(`/api/admin/services/${id}/${action}`, { method: 'PATCH', token }); setToast(action === 'approve' ? p.serviceApproved : p.serviceRejected); } catch (error) { setToast(error instanceof Error ? error.message : p.actionFailed); }
  }
  return <><PageHeader title={p.serviceApproval} subtitle={p.serviceApprovalSubtitle} /><div className="grid gap-3">{state.data.map((service) => <div key={service._id} className="grid gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_auto]"><div><p className="font-black">{service.title}</p><p className="text-sm font-bold text-slate-500">{service.type} / {service.province}</p></div><div className="flex gap-2"><button onClick={() => update(service._id, 'approve')} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white">{p.approve}</button><button onClick={() => update(service._id, 'reject')} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white">{p.reject}</button></div></div>)}</div></>;
}

function AdminBookingsPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<Booking[]>('/api/admin/bookings', token, []);
  const p = text[language];
  return <><PageHeader title={p.bookingsTitle} subtitle={p.bookingsSubtitle} /><DataTable rows={state.data} columns={['bookingCode', 'totalVnd', 'paymentMethod', 'paymentStatus', 'createdAt']} /></>;
}

function AdminRevenuePage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<any>('/api/admin/platform-revenue', token, {});
  const p = text[language];
  return <><PageHeader title={p.platformRevenue} subtitle={p.revenueSubtitle} /><div className="grid gap-4 sm:grid-cols-3"><Metric label={p.gross} value={money(state.data?.grossVnd || 0, 'VND')} /><Metric label={p.platformFee} value={money(state.data?.platformFeeVnd || 0, 'VND')} /><Metric label={p.partnerNet} value={money(state.data?.partnerNetVnd || 0, 'VND')} /></div></>;
}

function AdminRefundsPage({ token, language, setToast }: { token: string; language: Language; setToast: (value: string) => void }) {
  const state = useAuthed<Refund[]>('/api/admin/refunds', token, []);
  const p = text[language];
  async function process(id: string, action: 'process' | 'reject') {
    try {
      await api(`/api/admin/refunds/${id}/${action}`, { method: 'PATCH', token, body: { reason: p.adminDecision } });
      setToast(action === 'process' ? p.refundProcessed : p.refundRejected);
      window.location.reload();
    } catch (error) {
      setToast(error instanceof Error ? error.message : p.refundActionFailed);
    }
  }
  return (
    <>
      <PageHeader title={p.refundOversight} subtitle={p.refundOversightSubtitle} />
      <div className="grid gap-3">
        {state.data.map((refund) => (
          <div key={refund._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="font-black">{refund.bookingId?.bookingCode || refund._id}</p>
                <p className="mt-1 text-sm font-bold text-slate-500">{refund.status} / {refund.reason}</p>
                <code className="mt-3 block break-all rounded-2xl bg-slate-50 p-3 text-xs">{refund.refundHash}</code>
              </div>
              <p className="font-black">{money(refund.amount, 'VND')}</p>
            </div>
            {refund.status !== 'processed' && <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => process(refund._id, 'process')} className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white">{p.processRefund}</button><button onClick={() => process(refund._id, 'reject')} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white">{p.reject}</button></div>}
          </div>
        ))}
        {!state.data.length && <StateBox text={p.noRefundRequests} />}
      </div>
    </>
  );
}

function AdminLogsPage({ token, language }: { token: string; language: Language }) {
  const state = useAuthed<any[]>('/api/admin/logs', token, []);
  const p = text[language];
  return <><PageHeader title={p.auditLogs} subtitle={p.auditLogsSubtitle} /><DataTable rows={state.data} columns={['action', 'targetType', 'targetId', 'createdAt']} /></>;
}

function DataTable({ rows, columns, linkPrefix }: { rows: any[]; columns: string[]; linkPrefix?: string }) {
  if (!rows.length) return <StateBox text={translateText(storedLanguage(), 'noData')} />;
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
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!path) return;
    let active = true;
    setLoading(true);
    setError('');
    api(path)
      .then((response) => active && setData(response.data ?? response))
      .catch((caught) => {
        if (!active) return;
        if (path.startsWith('/api/services')) setData(fallbackServicesForPath(path) as T);
        setError(friendlyFetchError(caught));
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [path, attempt]);
  return { data, loading, error, retry: () => setAttempt((value) => value + 1) };
}

function useAuthed<T>(path: string, token: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(Boolean(path && token));
  const [error, setError] = useState('');
  useEffect(() => {
    if (!path || !token) {
      setData(initial);
      setLoading(false);
      setError('');
      return;
    }
    let active = true;
    setLoading(true);
    api(path, { token }).then((response) => active && setData(response.data ?? response)).catch((caught) => active && setError(friendlyFetchError(caught))).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [path, token]);
  return { data, loading, error };
}

async function api(path: string, options: { method?: string; token?: string; body?: unknown } = {}) {
  try {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || `${text[storedLanguage()].requestFailed}: ${response.status}`);
    return payload;
  } catch (error) {
    throw new Error(friendlyFetchError(error));
  }
}

function friendlyFetchError(error: unknown) {
  const language = storedLanguage();
  const message = error instanceof Error ? error.message : String(error || '');
  if (/failed to fetch|network|load failed|fetch/i.test(message)) return translateText(language, 'dataLoadFailed');
  return message || translateText(language, 'dataLoadFailed');
}

function fallbackServicesForPath(path: string) {
  try {
    const url = new URL(path, 'http://travchain.local');
    const typeParam = url.searchParams.get('type') || '';
    const typesParam = url.searchParams.get('types') || '';
    const transportParam = url.searchParams.get('transportType') || '';
    const provinceParam = url.searchParams.get('province') || url.searchParams.get('destination') || '';
    const origin = destinationProvince(url.searchParams.get('origin') || '');
    const routeDestination = destinationProvince(url.searchParams.get('routeDestination') || '');
    const q = url.searchParams.get('q') || '';
    const typeCandidates = [...typesParam.split(','), ...typeParam.split(',')].map((value) => value.trim()).filter(Boolean);
    const types = typeCandidates.flatMap((value) => value === 'stays' ? ['hotel', 'homestay', 'stay'] : [value]);
    const transportTypes = transportParam.split(',').map((value) => value.trim()).filter(Boolean);
    const province = destinationProvince(provinceParam);
    return demoServices.filter((service) => {
      const typeMatch = !types.length || types.includes(service.type);
      const transportMatch = !transportTypes.length || transportTypes.includes(service.transportType || '');
      const provinceMatch = !province || `${service.province} ${service.destination} ${service.location}`.toLowerCase().includes(province.toLowerCase());
      const originMatch = !origin || `${service.origin || ''}`.toLowerCase().includes(origin.toLowerCase());
      const routeMatch = !routeDestination || `${service.routeDestination || ''}`.toLowerCase().includes(routeDestination.toLowerCase());
      const queryMatch = !q || `${service.title} ${service.description} ${service.location} ${service.destination}`.toLowerCase().includes(q.toLowerCase());
      return typeMatch && transportMatch && provinceMatch && originMatch && routeMatch && queryMatch;
    }).slice(0, Number(url.searchParams.get('limit') || 20));
  } catch {
    return demoServices.slice(0, 20);
  }
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
  return `${value.toLocaleString('vi-VN')} VND`;
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
