import express from 'express';
import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';

export const assistantRouter = express.Router();

const chatSchema = z.object({
  message: z.string().trim().min(1).max(600),
  language: z.enum(['vi', 'en']).default('vi'),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    text: z.string().max(1200),
  })).max(8).optional(),
  context: z.object({
    currentRoute: z.string().optional(),
    city: z.string().optional(),
    category: z.string().optional(),
    date: z.string().optional(),
    provider: z.string().optional(),
    budget: z.string().optional(),
    lastIntent: z.string().optional(),
    selectedCity: z.string().optional(),
    selectedDate: z.string().optional(),
    cartItems: z.number().int().nonnegative().optional(),
    userRole: z.string().optional(),
  }).optional(),
});

const cinemaSlots = ['18:00', '19:30', '20:15', '21:00'];
const transportSlots = ['06:30', '08:00', '13:30', '19:45', '21:30'];
const providerBrands = ['CGV', 'Lotte', 'Galaxy', 'Beta', 'Cinestar'];

const provinceAliases = [
  ['Da Nang', ['da nang', 'đà nẵng', 'da-nang', 'danang', 'my khe']],
  ['Hoi An', ['hoi an', 'hoian']],
  ['Ha Noi', ['ha noi', 'hanoi', 'noi bai']],
  ['Ho Chi Minh', ['ho chi minh', 'sai gon', 'saigon', 'tan son nhat']],
  ['Hue', ['hue', 'phu bai']],
  ['Sa Pa', ['sa pa', 'sapa']],
  ['Da Lat', ['da lat', 'dalat']],
  ['Phu Quoc', ['phu quoc']],
  ['Nha Trang', ['nha trang', 'cam ranh']],
  ['Ninh Binh', ['ninh binh']],
  ['Phong Nha', ['phong nha']],
  ['Ha Giang', ['ha giang']],
];

const serviceIntentTypes = {
  cinema_showtimes: ['cinema'],
  movie_provider_search: ['cinema'],
  hotel_search: ['hotel'],
  homestay_search: ['homestay'],
  attraction_ticket: ['attraction'],
  local_tour_search: ['local_tour'],
  flight_search: ['flight'],
  bus_search: ['transport'],
  train_search: ['transport'],
  airport_transfer: ['transport'],
  trip_package: ['trip'],
  event_search: ['event'],
  restaurant_search: ['restaurant'],
  destination_recommendation: ['hotel', 'homestay', 'attraction', 'event', 'local_tour', 'restaurant', 'transport', 'flight', 'trip'],
  itinerary_suggestion: ['hotel', 'homestay', 'attraction', 'event', 'local_tour', 'transport', 'trip'],
  budget_trip: ['hotel', 'homestay', 'attraction', 'local_tour', 'restaurant', 'transport', 'trip'],
  family_trip: ['hotel', 'homestay', 'attraction', 'local_tour', 'trip'],
  couple_trip: ['hotel', 'homestay', 'event', 'restaurant', 'local_tour', 'trip'],
  weekend_trip: ['hotel', 'homestay', 'attraction', 'event', 'local_tour', 'transport', 'trip'],
};

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function provinceRegex(value) {
  const raw = String(value || '').trim();
  const normalized = normalize(raw).replace(/\s+/g, '-');
  const found = provinceAliases.find(([province, aliases]) => normalize(province).replace(/\s+/g, '-') === normalized || aliases.some((alias) => normalize(alias).replace(/\s+/g, '-') === normalized));
  const aliases = found ? [found[0], ...found[1]] : [raw];
  const patterns = aliases.map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[-\s]+/g, '[-\\s]*'));
  return new RegExp(patterns.join('|'), 'i');
}

function hasAny(message, terms) {
  const plain = normalize(message);
  return terms.some((term) => plain.includes(normalize(term)));
}

function detectProvince(message, context) {
  const explicit = context?.city || context?.selectedCity || '';
  const plain = normalize(`${message} ${explicit}`);
  const found = provinceAliases.find(([, aliases]) => aliases.some((alias) => plain.includes(normalize(alias))));
  return found?.[0] || explicit || '';
}

function detectRoute(message) {
  const plain = normalize(message);
  const ordered = provinceAliases.map(([province, aliases]) => ({ province, index: Math.min(...aliases.map((alias) => plain.indexOf(normalize(alias))).filter((index) => index >= 0)) })).filter((item) => Number.isFinite(item.index)).sort((a, b) => a.index - b.index);
  return { origin: ordered[0]?.province || '', routeDestination: ordered[1]?.province || '' };
}

function detectProvider(message) {
  const plain = normalize(message);
  return providerBrands.find((brand) => plain.includes(normalize(brand))) || '';
}

function detectProviderWithContext(message, context) {
  return detectProvider(message) || context?.provider || '';
}

function detectDateWord(message, context) {
  if (context?.date) return context.date;
  if (context?.selectedDate) return 'selected_date';
  if (hasAny(message, ['toi nay', 'tonight'])) return 'tonight';
  if (hasAny(message, ['hom nay', 'today'])) return 'today';
  if (hasAny(message, ['ngay mai', 'tomorrow'])) return 'tomorrow';
  if (hasAny(message, ['cuoi tuan', 'weekend'])) return 'weekend';
  if (hasAny(message, ['tuan nay', 'this week'])) return 'this_week';
  return '';
}

function detectIntent(message) {
  const plain = normalize(message);
  if (['xin chao', 'chao ban', 'hello', 'hi', 'hey'].includes(plain)) return 'greeting';
  if (/\b(hello|hi|hey)\b/.test(plain) && plain.split(' ').length <= 3) return 'greeting';
  if (hasAny(message, ['ban lam duoc gi', 'ban giup duoc gi', 'what can you do', 'help me'])) return 'capability_intro';
  if (hasAny(message, ['lien ket ngan hang', 'them ngan hang', 'bank link', 'bank account'])) return 'bank_link_help';
  if (hasAny(message, ['doi tac thanh toan', 'partner payment', 'settlement', 'visa cho doi tac'])) return 'partner_payment_help';
  if (hasAny(message, ['dua don san bay', 'airport transfer', 'airport shuttle', 'shuttle san bay', 'shuttle'])) return 'airport_transfer';
  if (hasAny(message, ['may bay', 've may bay', 'flight', 'airline', 'san bay'])) return 'flight_search';
  if (hasAny(message, ['xe buyt', 'xe bus', 'sleeper bus', 'bus'])) return 'bus_search';
  if (hasAny(message, ['tau', 'train', 'duong sat'])) return 'train_search';
  if (hasAny(message, ['combo', 'tron goi', 'goi y combo', 'trip package', '3 ngay', '2 ngay'])) return 'trip_package';
  if (hasAny(message, ['cgv', 'lotte', 'galaxy', 'beta', 'cinestar'])) return 'movie_provider_search';
  if (hasAny(message, ['phim', 'cinema', 'movie', 'suat', 'suat chieu', 'showtime', 'sau 8h', 'sau 20h'])) return 'cinema_showtimes';
  if (hasAny(message, ['homestay', 'home stay', 'local stay'])) return 'homestay_search';
  if (hasAny(message, ['khach san', 'hotel', 'resort', 'gan bien', 'my khe', 'stay'])) return 'hotel_search';
  if (hasAny(message, ['ba na', 've tham quan', 'attraction', 'ticket', 'vinwonders', 'fansipan', 'phong nha'])) return 'attraction_ticket';
  if (hasAny(message, ['tour', 'local tour', 'hoi an cuoi tuan', 'family friendly'])) return 'local_tour_search';
  if (hasAny(message, ['su kien', 'event', 'festival', 'le hoi'])) return 'event_search';
  if (hasAny(message, ['nha hang', 'an gi', 'restaurant', 'food', 'dining'])) return 'restaurant_search';
  if (hasAny(message, ['xe', 'dua don', 'transport', 'transfer', 'shuttle'])) return 'airport_transfer';
  if (hasAny(message, ['2 trieu', 'ngan sach', 'budget', 'gia re', 'tiet kiem'])) return 'budget_trip';
  if (hasAny(message, ['lich trinh', 'itinerary', 'plan'])) return 'itinerary_suggestion';
  if (hasAny(message, ['goi y', 'di dau', 'phan van', 'destination', 'recommend'])) return 'destination_recommendation';
  if (hasAny(message, ['gia dinh', 'tre em', 'family'])) return 'family_trip';
  if (hasAny(message, ['cap doi', 'lang man', 'couple', 'romantic'])) return 'couple_trip';
  if (hasAny(message, ['cuoi tuan', 'weekend'])) return 'weekend_trip';
  if (hasAny(message, ['trang thai don', 'booking status', 'don cua toi', 'my booking'])) return 'booking_status';
  if (hasAny(message, ['huy dat cho', 'toi muon huy', 'cancel booking', 'cancel'])) return hasAny(message, ['cancel booking']) ? 'cancel_booking' : 'refund_help';
  if (hasAny(message, ['hoan tien', 'refund'])) return 'refund_help';
  if (hasAny(message, ['vi travchain', 'wallet', 'nap tien', 'rut tien', 'pin', 'tin dung du lich'])) return 'wallet_help';
  if (hasAny(message, ['thanh toan', 'payment method', 'card', 'qr', 'visa'])) return 'payment_method_help';
  if (hasAny(message, ['travel passport', 'passport'])) return 'passport_help';
  if (hasAny(message, ['membership', 'nft', 'hang thanh vien', 'diem thuong'])) return 'membership_help';
  if (hasAny(message, ['doi tac', 'partner', 'ban dich vu'])) return 'partner_help';
  return 'fallback';
}

function filterFor(intent, province, message, context = {}) {
  const types = serviceIntentTypes[intent] || [];
  const filter = { status: 'approved' };
  if (types.length === 1) filter.type = types[0];
  if (types.length > 1) filter.type = { $in: types };
  if (province && !['flight_search', 'bus_search', 'train_search', 'airport_transfer'].includes(intent)) filter.province = provinceRegex(province);
  const provider = detectProviderWithContext(message, context);
  if (provider) filter.providerBrand = new RegExp(provider, 'i');
  if (intent === 'attraction_ticket' && hasAny(message, ['ba na'])) filter.title = /ba na/i;
  if (intent === 'bus_search') filter.transportType = { $in: ['bus', 'shuttle'] };
  if (intent === 'train_search') filter.transportType = 'train';
  if (intent === 'airport_transfer') filter.transportType = { $in: ['airport_transfer', 'shuttle', 'private_car'] };

  if (['flight_search', 'bus_search', 'train_search', 'airport_transfer'].includes(intent)) {
    const route = detectRoute(`${context?.city || ''} ${message}`);
    if (route.origin) filter.origin = new RegExp(route.origin, 'i');
    if (route.routeDestination) filter.routeDestination = new RegExp(route.routeDestination, 'i');
  }
  return filter;
}

function filtersFor(intent, language) {
  const vi = language === 'vi';
  if (intent === 'cinema_showtimes' || intent === 'movie_provider_search') {
    return [
      { key: 'provider', label: vi ? 'Nhà cung cấp' : 'Provider', options: providerBrands },
      { key: 'time', label: vi ? 'Giờ chiếu' : 'Showtime', options: cinemaSlots },
      { key: 'price', label: vi ? 'Khoảng giá' : 'Price range', options: ['< 120K', '120K-150K', '> 150K'] },
    ];
  }
  if (intent === 'flight_search') {
    return [
      { key: 'airline', label: vi ? 'Hãng bay' : 'Airline', options: ['Vietnam Airlines', 'Vietjet Air', 'Bamboo Airways', 'Vietravel Airlines'] },
      { key: 'seatClass', label: vi ? 'Hạng vé' : 'Seat class', options: ['Economy', 'Premium Economy', 'Business'] },
      { key: 'baggage', label: vi ? 'Hành lý' : 'Baggage', options: ['7kg', '20kg', '30kg'] },
    ];
  }
  if (['bus_search', 'train_search', 'airport_transfer'].includes(intent)) {
    return [
      { key: 'transportType', label: vi ? 'Loại di chuyển' : 'Transport type', options: ['bus', 'train', 'airport_transfer', 'private_car', 'shuttle'] },
      { key: 'time', label: vi ? 'Giờ đi' : 'Departure time', options: transportSlots },
      { key: 'price', label: vi ? 'Khoảng giá' : 'Price range', options: ['< 200K', '200K-500K', '> 500K'] },
    ];
  }
  if (intent === 'trip_package') {
    return [
      { key: 'duration', label: vi ? 'Thời lượng' : 'Duration', options: ['1 ngày', '2 ngày', '3 ngày'] },
      { key: 'travelerType', label: vi ? 'Kiểu khách' : 'Traveler type', options: ['family', 'couple', 'solo', 'group'] },
      { key: 'budget', label: vi ? 'Ngân sách' : 'Budget', options: ['< 2M', '2M-5M', '> 5M'] },
    ];
  }
  return [
    { key: 'price', label: vi ? 'Khoảng giá' : 'Price range', options: ['VND', '< 500K', '500K-2M', '> 2M'] },
    { key: 'rating', label: vi ? 'Đánh giá' : 'Rating', options: ['4.5+', '4.7+', '4.9'] },
  ];
}

function itemFromService(service, intent, language) {
  const inventory = service.availability ?? service.inventory ?? 0;
  const isTimed = ['cinema_showtimes', 'movie_provider_search', 'event_search', 'flight_search', 'bus_search', 'train_search', 'airport_transfer'].includes(intent);
  const timeSlots = service.departureLabel ? [service.departureLabel] : intent === 'cinema_showtimes' || intent === 'movie_provider_search' ? cinemaSlots : isTimed ? transportSlots.slice(0, 3) : [];
  return {
    id: String(service._id),
    type: service.type,
    title: service.title,
    movieTitle: service.type === 'cinema' ? service.title.replace(/cgv|lotte|galaxy|beta|cinestar|cinema|cinemas|vincom|da nang/gi, '').trim() || (language === 'vi' ? 'Phim đang chiếu' : 'Now showing') : undefined,
    providerBrand: service.providerBrand || service.airline || '',
    location: service.location,
    province: service.province,
    image: service.coverImage || service.imageUrl,
    priceVnd: service.priceVnd,
    rating: service.rating,
    reviewCount: service.reviewCount || 0,
    inventory,
    timeSlots,
    badges: language === 'vi' ? ['Còn chỗ', 'QR', 'Đối tác xác thực'] : ['Available', 'QR', 'Verified partner'],
    ctaLabel: language === 'vi' ? 'Đặt ngay' : 'Book now',
    ctaUrl: `/service/${service._id}`,
  };
}

function actionsFor(language, intent, empty = false) {
  const vi = language === 'vi';
  if (empty) return vi
    ? [{ label: 'Đổi địa điểm', value: 'Đổi địa điểm' }, { label: 'Thử ngày mai', value: 'Thử ngày mai' }, { label: 'Xem tất cả dịch vụ', url: '/services' }]
    : [{ label: 'Change destination', value: 'Change destination' }, { label: 'Try tomorrow', value: 'Try tomorrow' }, { label: 'View all services', url: '/services' }];
  if (['flight_search'].includes(intent)) return vi
    ? [{ label: 'Xem vé máy bay', url: '/services/flights' }, { label: 'Thử cuối tuần', value: 'Vé máy bay cuối tuần này' }]
    : [{ label: 'View flights', url: '/services/flights' }, { label: 'Try weekend', value: 'Flights this weekend' }];
  if (['bus_search', 'train_search', 'airport_transfer'].includes(intent)) return vi
    ? [{ label: 'Xem di chuyển', url: '/services/transport' }, { label: 'Đổi giờ đi', value: 'Đổi giờ đi' }]
    : [{ label: 'View transport', url: '/services/transport' }, { label: 'Change time', value: 'Change departure time' }];
  if (intent === 'trip_package') return vi
    ? [{ label: 'Xem chuyến đi trọn gói', url: '/services/trips' }, { label: 'Đổi ngân sách', value: 'Đổi ngân sách' }]
    : [{ label: 'View trip packages', url: '/services/trips' }, { label: 'Change budget', value: 'Change budget' }];
  return vi ? [{ label: 'Xem chi tiết', url: '/services' }, { label: 'Đổi địa điểm', value: 'Đổi địa điểm' }] : [{ label: 'View details', url: '/services' }, { label: 'Change destination', value: 'Change destination' }];
}

function followUps(language, intent, empty = false) {
  const vi = language === 'vi';
  if (empty) return vi ? ['Đổi địa điểm', 'Xem tất cả dịch vụ', 'Thử ngày mai'] : ['Change destination', 'View all services', 'Try tomorrow'];
  const map = {
    cinema_showtimes: vi ? ['Suất sau 20:00', 'Chỉ CGV', 'Giá thấp nhất'] : ['After 20:00', 'Only CGV', 'Lowest price'],
    movie_provider_search: vi ? ['Suất sau 20:00', 'Chỉ CGV', 'Giá thấp nhất'] : ['After 20:00', 'Only CGV', 'Lowest price'],
    flight_search: vi ? ['Bay cuối tuần', 'Có hành lý', 'Giá thấp nhất'] : ['Weekend flights', 'With baggage', 'Lowest price'],
    bus_search: vi ? ['Xe đêm', 'Ghế còn trống', 'Giá thấp nhất'] : ['Night bus', 'Seats available', 'Lowest price'],
    train_search: vi ? ['Tàu ngày mai', 'Ghế mềm', 'Giá thấp nhất'] : ['Tomorrow train', 'Soft seat', 'Lowest price'],
    airport_transfer: vi ? ['Xe riêng', 'Đón sân bay', 'Giá thấp nhất'] : ['Private car', 'Airport pickup', 'Lowest price'],
    trip_package: vi ? ['3 ngày Đà Nẵng', 'Gia đình', 'Dưới 5 triệu'] : ['3 days in Da Nang', 'Family trip', 'Under 5M'],
    refund_help: vi ? ['Xem đơn đặt', 'Chính sách hoàn tiền', 'Mở ví'] : ['View bookings', 'Refund policy', 'Open wallet'],
    wallet_help: vi ? ['Liên kết ngân hàng', 'Nạp tín dụng', 'Vì sao cần PIN?'] : ['Link bank', 'Top up credits', 'Why PIN?'],
  };
  return map[intent] || (vi ? ['Xem thêm', 'Tìm địa điểm khác', 'Giá thấp nhất'] : ['More options', 'Try another destination', 'Lowest price']);
}

function helperAnswer(language, intent, context) {
  const cartNote = context?.cartItems ? (language === 'vi' ? ` Bạn đang có ${context.cartItems} dịch vụ trong giỏ.` : ` You have ${context.cartItems} services in your cart.`) : '';
  const viAnswers = {
    greeting: 'Xin chào, mình là TravChain Assistant. Mình có thể tìm phim, khách sạn, vé tham quan, tour, di chuyển, vé máy bay, ví và hoàn tiền cho chuyến đi của bạn.',
    capability_intro: 'Mình có thể giúp bạn tìm dịch vụ du lịch, vé xem phim, khách sạn, tour, vé máy bay, di chuyển, kiểm tra đơn đặt, hỗ trợ hoàn tiền, ví TravChain và Travel Passport.',
    booking_status: 'Mình có thể kiểm tra đơn gần đây nếu bạn đã đăng nhập. Mở Đặt chỗ để xem trạng thái thanh toán, QR và hoàn tiền.',
    cancel_booking: 'Bạn có thể hủy đặt chỗ từ trang Đặt chỗ nếu chính sách còn hiệu lực. TravChain sẽ hiển thị điều kiện hoàn tiền và Hash giao dịch.',
    refund_help: 'Bạn có thể mở Đặt chỗ để yêu cầu hoàn tiền khi chính sách còn hiệu lực. Hoàn tiền được theo dõi bằng trạng thái, tín dụng du lịch và Hash minh bạch.',
    wallet_help: 'Ví TravChain dùng VND làm tín dụng du lịch chính để thanh toán đặt chỗ, nhận hoàn tiền, quản lý PIN, QR nội địa, thẻ và tài khoản ngân hàng liên kết.',
    bank_link_help: 'Để liên kết ngân hàng, mở Ví, vào Nguồn thanh toán, chọn Liên kết ngân hàng, nhập tên ngân hàng, chủ tài khoản và số tài khoản đã ẩn rồi đặt làm nguồn chính.',
    payment_method_help: 'TravChain hỗ trợ Tín dụng du lịch VND, tài khoản ngân hàng liên kết, QR nội địa và thẻ. USD chỉ hiển thị tham khảo khi đối tác hỗ trợ thẻ quốc tế.',
    partner_payment_help: 'Đối tác có thể bật acceptsInternationalCard và chọn settlementCurrency là VND hoặc USD. Khách vẫn thấy tổng VND là mặc định.',
    passport_help: 'Travel Passport lưu dấu chuyến đi, QR, điểm thưởng, hạng thành viên và Hash đặt chỗ trong một hồ sơ du lịch.',
    membership_help: 'Membership và NFT giúp ghi nhận hạng thành viên, điểm thưởng và quyền lợi có thể mở rộng trong TravChain.',
    partner_help: 'Đối tác có thể đăng dịch vụ, quản lý tồn kho, theo dõi doanh thu, đối soát và xử lý hoàn tiền trong cổng đối tác.',
    fallback: 'Mình có thể tìm phim, khách sạn, homestay, vé tham quan, tour, sự kiện, nhà hàng, di chuyển, vé máy bay, combo, ví và hoàn tiền trên TravChain.',
  };
  const enAnswers = {
    greeting: 'Hello, I am TravChain Assistant. I can help find movies, stays, attractions, tours, transport, flights, wallet support, and refunds.',
    capability_intro: 'I can help you find travel services, movie tickets, hotels, tours, flights, transport, booking status, refunds, TravChain Wallet, and Travel Passport.',
    booking_status: 'I can help check recent bookings when you are signed in. Open Bookings to review payment status, QR, and refunds.',
    cancel_booking: 'You can cancel from Bookings when the policy allows it. TravChain shows refund eligibility and transaction Hash records.',
    refund_help: 'Refunds are tracked with status, travel credits, and transparent Hash records when partner policy allows it.',
    wallet_help: 'TravChain Wallet uses VND travel credits for booking payment, refunds, PIN security, domestic QR, cards, and linked bank accounts.',
    bank_link_help: 'Open Wallet, go to Payment Sources, choose Link bank, enter bank name, account holder, and masked account number, then set it as primary.',
    payment_method_help: 'TravChain supports VND travel credits, linked bank accounts, domestic QR, and cards. USD is only an optional reference when the partner supports international cards.',
    partner_payment_help: 'Partners can enable acceptsInternationalCard and choose settlementCurrency as VND or USD. Travelers still see VND as the default total.',
    passport_help: 'Travel Passport stores trip stamps, QR, reward points, membership tier, and booking Hash records in one travel profile.',
    membership_help: 'Membership and NFT features help track tier, reward points, and extensible TravChain benefits.',
    partner_help: 'Partners can publish services, manage inventory, track revenue, reconcile, and process refunds in Partner Center.',
    fallback: 'I can search TravChain for movies, hotels, homestays, attractions, tours, events, restaurants, transport, flights, trip packages, wallet, and refunds.',
  };
  return `${language === 'vi' ? viAnswers[intent] || viAnswers.fallback : enAnswers[intent] || enAnswers.fallback}${cartNote}`;
}

function answerFor(language, intent, items, province, context, usedAlternatives) {
  if (!serviceIntentTypes[intent]) return helperAnswer(language, intent, context);
  if (!items.length) return language === 'vi'
    ? 'Mình chưa tìm thấy dịch vụ phù hợp. Bạn có thể đổi địa điểm, đổi ngày hoặc xem danh mục liên quan.'
    : 'I could not find a matching service. You can change destination, change date, or browse a related category.';
  if (usedAlternatives) return language === 'vi'
    ? 'Mình chưa thấy kết quả đúng hoàn toàn trong dữ liệu hiện tại, nhưng có các lựa chọn gần nhất bạn có thể xem tiếp.'
    : 'I could not find an exact match in the current data, but these nearby alternatives are available to book.';
  if (language === 'vi') {
    if (intent === 'cinema_showtimes' || intent === 'movie_provider_search') return `Mình tìm thấy ${items.length} lựa chọn xem phim${province ? ` ở ${province}` : ''}. Một số suất phù hợp: ${items.flatMap((item) => item.timeSlots).slice(0, 3).join(', ')}.`;
    if (intent === 'flight_search') return `Mình tìm thấy ${items.length} lựa chọn vé máy bay có thể đặt ngay, hiển thị giá VND, giờ bay và số chỗ còn lại.`;
    if (['bus_search', 'train_search', 'airport_transfer'].includes(intent)) return `Mình tìm thấy ${items.length} lựa chọn di chuyển phù hợp với tuyến và thời gian bạn hỏi.`;
    if (intent === 'trip_package') return `Mình gợi ý ${items.length} chuyến đi trọn gói có lưu trú, di chuyển và trải nghiệm có thể đặt ngay.`;
    if (intent === 'hotel_search' || intent === 'homestay_search') return `Mình tìm thấy ${items.length} lựa chọn lưu trú${province ? ` ở ${province}` : ''}, có giá, đánh giá và tình trạng còn chỗ.`;
    return `Mình tìm thấy ${items.length} dịch vụ phù hợp trong TravChain.`;
  }
  if (intent === 'cinema_showtimes' || intent === 'movie_provider_search') return `I found ${items.length} cinema options${province ? ` in ${province}` : ''}. Useful showtimes include ${items.flatMap((item) => item.timeSlots).slice(0, 3).join(', ')}.`;
  if (intent === 'flight_search') return `I found ${items.length} bookable flight options with VND pricing, times, and availability.`;
  if (['bus_search', 'train_search', 'airport_transfer'].includes(intent)) return `I found ${items.length} transport options matching your route and time.`;
  if (intent === 'trip_package') return `I found ${items.length} trip packages combining stays, transport, and experiences.`;
  return `I found ${items.length} matching TravChain services.`;
}

function bookingItems(bookings, language) {
  return bookings.map((booking) => ({
    id: String(booking._id),
    type: 'booking',
    title: booking.items?.[0]?.titleSnapshot || booking.bookingCode,
    providerBrand: booking.paymentStatus,
    location: booking.items?.[0]?.locationSnapshot || '',
    province: '',
    image: '',
    priceVnd: booking.totalVnd,
    rating: 0,
    reviewCount: 0,
    inventory: 0,
    timeSlots: [],
    badges: [booking.status, booking.paymentStatus].filter(Boolean),
    ctaLabel: language === 'vi' ? 'Xem đặt chỗ' : 'View booking',
    ctaUrl: '/bookings',
  }));
}

function compactItem(item) {
  return {
    title: item.title,
    type: item.type,
    provider: item.providerBrand,
    location: item.location,
    province: item.province,
    priceVnd: item.priceVnd,
    rating: item.rating,
    reviews: item.reviewCount,
    availability: item.inventory,
    times: item.timeSlots,
    badges: item.badges,
    ctaUrl: item.ctaUrl,
  };
}

function assistantSystemPrompt(language) {
  if (language === 'vi') {
    return [
      'Bạn là TravChain Assistant, trợ lý đặt dịch vụ du lịch trong ứng dụng TravChain.',
      'Trả lời bằng tiếng Việt tự nhiên, rõ ràng, chuyên nghiệp và ngắn gọn. Không viết markdown dài.',
      'Mục tiêu là giúp người dùng ra quyết định và đặt được dịch vụ phù hợp nhanh nhất.',
      'Chỉ dùng dữ liệu trong TravChainContext. Không bịa giá, số chỗ, lịch bay, giờ chiếu, chính sách, địa điểm hoặc dịch vụ không có trong context.',
      'Nếu có kết quả dịch vụ, chọn tối đa 3 lựa chọn tốt nhất. Với mỗi lựa chọn, nêu tên, lý do phù hợp, giá VND, rating hoặc số chỗ/giờ nếu có.',
      'Kết câu bằng bước tiếp theo cụ thể như mở chi tiết dịch vụ, thêm vào giỏ, đổi ngày, đổi điểm đến hoặc xem danh mục liên quan.',
      'Nếu không có kết quả, nói rõ chưa có dữ liệu phù hợp và đề xuất 2-3 cách tìm lại. Không xin lỗi dài dòng.',
      'Nếu câu hỏi liên quan thanh toán, ví, hoàn tiền hoặc Travel Passport, giải thích theo luồng sản phẩm TravChain và tránh nói như tư vấn tài chính/crypto.',
      'Giọng điệu như concierge du lịch cao cấp: thân thiện, thực tế, đáng tin cậy, không quảng cáo quá đà.',
    ].join('\n');
  }
  return [
    'You are TravChain Assistant, a booking-focused travel concierge inside the TravChain app.',
    'Answer in natural, concise, professional English. Avoid long markdown.',
    'Your goal is to help the user choose and book the right service quickly.',
    'Only use TravChainContext. Do not invent prices, availability, schedules, policies, or services not present in context.',
    'If service results exist, recommend at most 3 best options. For each option, include name, why it fits, VND price, rating or slots/times when available.',
    'End with a concrete next step such as opening service details, adding to cart, changing date, changing destination, or browsing a related category.',
    'If there are no results, say that clearly and suggest 2-3 ways to search again. Do not over-apologize.',
    'For payment, wallet, refund, or Travel Passport questions, explain the TravChain product flow and avoid financial or crypto-investment advice.',
    'Sound like a premium travel concierge: helpful, practical, trustworthy, and not overhyped.',
  ].join('\n');
}

function assistantUserPrompt({ body, intent, province, dateWord, items, filters, followUps, actions, deterministicAnswer, usedAlternatives }) {
  const context = {
    userMessage: body.message,
    language: body.language,
    intent,
    province,
    dateWord,
    route: detectRoute(body.message),
    appContext: body.context || {},
    usedAlternatives,
    deterministicAnswer,
    services: items.slice(0, 6).map(compactItem),
    filters,
    followUps,
    actions,
    history: (body.history || []).slice(-6),
    productRules: {
      currency: 'VND is the primary booking currency',
      bookingFlow: 'service detail -> cart -> checkout -> QR receipt -> Travel Passport stamp',
      transparency: 'Hash records are receipt/proof records, not shown as crypto balances',
      simulatedData: true,
    },
  };
  const instruction = body.language === 'vi'
    ? 'Hãy viết câu trả lời cuối cùng cho người dùng. Không nhắc đến JSON, context, prompt hoặc dữ liệu nội bộ.'
    : 'Write the final user-facing answer only. Do not mention JSON, context, prompts, or internal data.';
  return `TravChainContext:\n${JSON.stringify(context, null, 2)}\n\n${instruction}`;
}

function normalizeLlmContent(value) {
  return String(value || '')
    .replace(/^```(?:json|markdown)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function configuredGeminiApiKey() {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'PASTE_YOUR_GEMINI_API_KEY_HERE') return '';
  return apiKey;
}

function geminiModelPath(model) {
  const normalized = String(model || 'gemini-2.5-flash').trim().replace(/^models\//, '');
  return `models/${normalized}`;
}

async function askGemini(params) {
  const apiKey = configuredGeminiApiKey();
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!apiKey) {
    return { answer: params.deterministicAnswer, provider: 'fallback', model, error: 'GEMINI_API_KEY is not configured' };
  }

  const baseUrl = (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || process.env.AI_TIMEOUT_MS || 12000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}/v1beta/${geminiModelPath(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: assistantSystemPrompt(params.body.language) }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: assistantUserPrompt(params) }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          topP: 0.85,
          maxOutputTokens: 800,
        },
      }),
    });
    if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
    const payload = await response.json();
    const answer = normalizeLlmContent(payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '');
    if (!answer || answer.length < 8) throw new Error('Gemini returned an empty answer');
    return { answer, provider: 'gemini', model };
  } catch (error) {
    return {
      answer: params.deterministicAnswer,
      provider: 'fallback',
      model,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function askAssistantLlm(params) {
  if (process.env.NODE_ENV === 'test' || process.env.AI_PROVIDER === 'fallback') {
    return { answer: params.deterministicAnswer, provider: 'fallback', model: 'disabled' };
  }

  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
  if (provider === 'gemini') return askGemini(params);
  return { answer: params.deterministicAnswer, provider: 'fallback', model: provider || 'disabled', error: `Unsupported AI_PROVIDER ${provider}` };
}

async function serviceItems(intent, province, message, context = {}) {
  const primary = await Service.find(filterFor(intent, province, message, context)).sort({ rating: -1, availability: -1, createdAt: -1 }).limit(6);
  if (primary.length) return { services: primary, usedAlternatives: false };
  const types = serviceIntentTypes[intent] || [];
  const alternatives = await Service.find({
    status: 'approved',
    ...(types.length ? { type: types.length === 1 ? types[0] : { $in: types } } : {}),
  }).sort({ rating: -1, availability: -1, createdAt: -1 }).limit(4);
  if (alternatives.length) return { services: alternatives, usedAlternatives: true };
  const popular = await Service.find({ status: 'approved' }).sort({ rating: -1, availability: -1, createdAt: -1 }).limit(4);
  return { services: popular, usedAlternatives: popular.length > 0 };
}

assistantRouter.post('/chat', async (req, res, next) => {
  try {
    const body = chatSchema.parse(req.body);
    const intent = detectIntent(body.message);
    const province = detectProvince(body.message, body.context);
    const dateWord = detectDateWord(body.message, body.context);
    let items = [];
    let usedAlternatives = false;

    if (serviceIntentTypes[intent]) {
      const result = await serviceItems(intent, province, body.message, body.context || {});
      usedAlternatives = result.usedAlternatives;
      items = result.services.map((service) => itemFromService(service, intent, body.language));
    }

    if (intent === 'booking_status' && body.userId) {
      const bookings = await Booking.find({ userId: body.userId }).sort({ createdAt: -1 }).limit(3);
      items = bookingItems(bookings, body.language);
    }

    const empty = !items.length;
    const filters = filtersFor(intent, body.language);
    const nextFollowUps = followUps(body.language, intent, empty);
    const nextActions = actionsFor(body.language, intent, empty);
    const deterministicAnswer = answerFor(body.language, intent, items, province, body.context, usedAlternatives);
    const llm = await askAssistantLlm({
      body,
      intent,
      province,
      dateWord,
      items,
      filters,
      followUps: nextFollowUps,
      actions: nextActions,
      deterministicAnswer,
      usedAlternatives,
    });

    res.json({
      intent,
      answer: llm.answer,
      confidence: llm.provider === 'gemini' ? 0.92 : (intent === 'fallback' ? 0.35 : 0.84),
      mode: serviceIntentTypes[intent] ? (items.length ? 'booking_results' : 'no_result') : 'conversation',
      items,
      followUps: nextFollowUps,
      actions: nextActions,
      filters,
      contextPatch: {
        city: province || body.context?.city || '',
        category: serviceIntentTypes[intent]?.[0] || body.context?.category || '',
        date: dateWord || body.context?.date || '',
        provider: detectProviderWithContext(body.message, body.context || {}),
        budget: body.context?.budget || '',
        lastIntent: intent,
      },
      error: null,
      emptyStateType: empty ? (usedAlternatives ? 'alternatives' : 'no_result') : null,
      meta: { province, dateWord, usedAlternatives, route: detectRoute(body.message), aiProvider: llm.provider, aiModel: llm.model, aiError: llm.error || null },
    });
  } catch (error) {
    next(error);
  }
});
