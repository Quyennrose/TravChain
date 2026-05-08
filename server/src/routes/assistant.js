import express from 'express';
import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';

export const assistantRouter = express.Router();

const chatSchema = z.object({
  message: z.string().trim().min(1).max(600),
  language: z.enum(['vi', 'en']).default('vi'),
  userId: z.string().optional(),
  context: z.object({
    currentRoute: z.string().optional(),
    selectedCity: z.string().optional(),
    selectedDate: z.string().optional(),
    cartItems: z.number().int().nonnegative().optional(),
    userRole: z.string().optional(),
  }).optional(),
});

const cinemaSlots = ['18:00', '19:30', '20:15', '21:00'];
const providerBrands = ['CGV', 'Lotte', 'Galaxy', 'Beta', 'Cinestar'];

const provinceAliases = [
  ['Da Nang', ['da nang', 'danang', 'my khe']],
  ['Hoi An', ['hoi an', 'hoian']],
  ['Ha Noi', ['ha noi', 'hanoi']],
  ['Ho Chi Minh', ['ho chi minh', 'sai gon', 'saigon']],
  ['Hue', ['hue']],
  ['Sa Pa', ['sa pa', 'sapa']],
  ['Da Lat', ['da lat', 'dalat']],
  ['Phu Quoc', ['phu quoc']],
  ['Nha Trang', ['nha trang']],
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
  event_search: ['event'],
  restaurant_search: ['restaurant'],
  transport_search: ['transport'],
  destination_recommendation: ['hotel', 'homestay', 'attraction', 'event', 'local_tour', 'restaurant', 'transport'],
  itinerary_suggestion: ['hotel', 'homestay', 'attraction', 'event', 'local_tour'],
  budget_trip: ['hotel', 'homestay', 'attraction', 'local_tour', 'restaurant'],
  family_trip: ['hotel', 'homestay', 'attraction', 'local_tour'],
  couple_trip: ['hotel', 'homestay', 'event', 'restaurant', 'local_tour'],
  weekend_trip: ['hotel', 'homestay', 'attraction', 'event', 'local_tour'],
};

function vi(value) {
  return value;
}

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(message, terms) {
  const plain = normalize(message);
  return terms.some((term) => plain.includes(normalize(term)));
}

function detectProvince(message, context) {
  const explicit = context?.selectedCity || '';
  const plain = normalize(`${message} ${explicit}`);
  const found = provinceAliases.find(([, aliases]) => aliases.some((alias) => plain.includes(normalize(alias))));
  return found?.[0] || explicit || '';
}

function detectProvider(message) {
  const plain = normalize(message);
  return providerBrands.find((brand) => plain.includes(normalize(brand))) || '';
}

function detectDateWord(message, context) {
  if (context?.selectedDate) return 'selected_date';
  if (hasAny(message, ['toi nay', 'tonight'])) return 'tonight';
  if (hasAny(message, ['hom nay', 'today'])) return 'today';
  if (hasAny(message, ['ngay mai', 'tomorrow'])) return 'tomorrow';
  if (hasAny(message, ['cuoi tuan', 'weekend'])) return 'weekend';
  if (hasAny(message, ['tuan nay', 'this week'])) return 'this_week';
  return '';
}

function detectIntent(message) {
  if (hasAny(message, ['cgv', 'lotte', 'galaxy', 'beta', 'cinestar'])) return 'movie_provider_search';
  if (hasAny(message, ['phim', 'cinema', 'movie', 'suat chieu', 'showtime'])) return 'cinema_showtimes';
  if (hasAny(message, ['homestay', 'home stay', 'local stay'])) return 'homestay_search';
  if (hasAny(message, ['khach san', 'hotel', 'resort', 'gan bien', 'my khe', 'stay'])) return 'hotel_search';
  if (hasAny(message, ['ba na', 've tham quan', 'attraction', 'ticket', 'vinwonders', 'fansipan', 'phong nha'])) return 'attraction_ticket';
  if (hasAny(message, ['tour', 'local tour', 'hoi an cuoi tuan', 'family friendly'])) return 'local_tour_search';
  if (hasAny(message, ['su kien', 'event', 'festival', 'le hoi'])) return 'event_search';
  if (hasAny(message, ['nha hang', 'an gi', 'restaurant', 'food', 'dining'])) return 'restaurant_search';
  if (hasAny(message, ['xe', 'dua don', 'san bay', 'transport', 'transfer'])) return 'transport_search';
  if (hasAny(message, ['goi y', 'di dau', 'destination', 'recommend'])) return 'destination_recommendation';
  if (hasAny(message, ['lich trinh', 'itinerary', '2 ngay', '3 ngay', 'plan'])) return 'itinerary_suggestion';
  if (hasAny(message, ['2 trieu', 'ngan sach', 'budget', 'gia re', 'tiet kiem'])) return 'budget_trip';
  if (hasAny(message, ['gia dinh', 'tre em', 'family'])) return 'family_trip';
  if (hasAny(message, ['cap doi', 'lang man', 'couple', 'romantic'])) return 'couple_trip';
  if (hasAny(message, ['cuoi tuan', 'weekend'])) return 'weekend_trip';
  if (hasAny(message, ['trang thai don', 'booking status', 'don cua toi', 'my booking'])) return 'booking_status';
  if (hasAny(message, ['huy dat cho', 'toi muon huy', 'cancel booking', 'cancel'])) return hasAny(message, ['cancel booking']) ? 'cancel_booking' : 'refund_help';
  if (hasAny(message, ['hoan tien', 'refund'])) return 'refund_help';
  if (hasAny(message, ['vi travchain', 'wallet', 'nap tien', 'rut tien', 'pin'])) return 'wallet_help';
  if (hasAny(message, ['thanh toan', 'payment method', 'card', 'qr'])) return 'payment_method_help';
  if (hasAny(message, ['travel passport', 'passport'])) return 'passport_help';
  if (hasAny(message, ['membership', 'nft', 'hang thanh vien', 'diem thuong'])) return 'membership_help';
  if (hasAny(message, ['doi tac', 'partner', 'ban dich vu'])) return 'partner_help';
  return 'fallback';
}

function filterFor(intent, province, message) {
  const types = serviceIntentTypes[intent] || [];
  const filter = { status: 'approved' };
  if (types.length === 1) filter.type = types[0];
  if (types.length > 1) filter.type = { $in: types };
  if (province) filter.province = new RegExp(province, 'i');
  const provider = detectProvider(message);
  if (provider) filter.providerBrand = new RegExp(provider, 'i');
  if (intent === 'attraction_ticket' && hasAny(message, ['ba na'])) filter.title = /ba na/i;
  return filter;
}

function filtersFor(intent, language) {
  if (intent === 'cinema_showtimes' || intent === 'movie_provider_search') {
    return [
      { key: 'provider', label: language === 'vi' ? vi('Nhà cung cấp') : 'Provider', options: providerBrands },
      { key: 'time', label: language === 'vi' ? vi('Giờ chiếu') : 'Showtime', options: cinemaSlots },
      { key: 'price', label: language === 'vi' ? vi('Khoảng giá') : 'Price range', options: ['< 120K', '120K-150K', '> 150K'] },
    ];
  }
  return [
    { key: 'price', label: language === 'vi' ? vi('Khoảng giá') : 'Price range', options: ['VND', 'USD'] },
    { key: 'rating', label: language === 'vi' ? vi('Đánh giá') : 'Rating', options: ['4.5+', '4.7+', '4.9'] },
  ];
}

function itemFromService(service, intent, language) {
  const inventory = service.availability ?? service.inventory ?? 0;
  const isTimed = ['cinema_showtimes', 'movie_provider_search', 'event_search'].includes(intent);
  return {
    id: String(service._id),
    type: service.type,
    title: service.title,
    movieTitle: service.type === 'cinema'
      ? service.title.replace(/cgv|lotte|galaxy|beta|cinestar|cinema|cinemas|vincom|da nang/gi, '').trim() || (language === 'vi' ? vi('Phim đang chiếu') : 'Now showing')
      : undefined,
    providerBrand: service.providerBrand || '',
    location: service.location,
    province: service.province,
    image: service.coverImage || service.imageUrl,
    priceVnd: service.priceVnd,
    rating: service.rating,
    reviewCount: service.reviewCount || 0,
    inventory,
    timeSlots: isTimed ? cinemaSlots.slice(0, Math.max(2, Math.min(4, Math.ceil((inventory || 12) / 16)))) : [],
    badges: language === 'vi' ? [vi('Còn chỗ'), 'QR', vi('Đối tác xác thực'), 'QR receipt'] : ['Available', 'QR', 'Verified partner'],
    ctaLabel: language === 'vi' ? vi('Đặt ngay') : 'Book now',
    ctaUrl: `/service/${service._id}`,
  };
}

function actionsFor(language, intent, empty = false) {
  if (language === 'vi') {
    if (empty) return [
      { label: vi('Đổi địa điểm'), value: vi('Đổi địa điểm') },
      { label: vi('Thử ngày mai'), value: vi('Thử ngày mai') },
      { label: vi('Xem tất cả dịch vụ'), url: '/services' },
    ];
    if (intent.includes('cinema') || intent === 'movie_provider_search') return [
      { label: vi('Xem rạp ở Đà Nẵng'), url: '/services/cinema' },
      { label: vi('Thử ngày mai'), value: vi('Tối mai Đà Nẵng có phim gì?') },
      { label: vi('Xem tất cả vé xem phim'), url: '/services/cinema' },
    ];
    return [
      { label: vi('Xem chi tiết'), url: '/services' },
      { label: vi('Đổi địa điểm'), value: vi('Đổi địa điểm') },
    ];
  }
  if (empty) return [
    { label: 'Change destination', value: 'Change destination' },
    { label: 'Try tomorrow', value: 'Try tomorrow' },
    { label: 'View all services', url: '/services' },
  ];
  return [
    { label: 'View details', url: '/services' },
    { label: 'Change destination', value: 'Change destination' },
  ];
}

function followUps(language, intent, empty = false) {
  if (language === 'vi') {
    if (empty) return [vi('Đổi địa điểm'), vi('Xem tất cả dịch vụ'), vi('Thử ngày mai')];
    if (intent === 'cinema_showtimes' || intent === 'movie_provider_search') return [vi('Suất sau 20:00'), vi('Chỉ CGV'), vi('Giá thấp nhất'), vi('Xem tất cả vé xem phim')];
    if (intent === 'hotel_search' || intent === 'homestay_search') return [vi('Gần biển hơn'), vi('Giá thấp nhất'), vi('Đánh giá cao'), vi('Xem thêm')];
    if (intent === 'refund_help' || intent === 'cancel_booking') return [vi('Xem đơn đặt'), vi('Chính sách hoàn tiền'), vi('Mở ví')];
    return [vi('Xem thêm'), vi('Tìm địa điểm khác'), vi('Giá thấp nhất')];
  }
  if (empty) return ['Change destination', 'View all services', 'Try tomorrow'];
  if (intent === 'cinema_showtimes' || intent === 'movie_provider_search') return ['After 20:00', 'Only CGV', 'Lowest price', 'View all cinema tickets'];
  if (intent === 'hotel_search' || intent === 'homestay_search') return ['Closer to beach', 'Lowest price', 'Top rated', 'More options'];
  if (intent === 'refund_help' || intent === 'cancel_booking') return ['View bookings', 'Refund policy', 'Open wallet'];
  return ['More options', 'Try another destination', 'Lowest price'];
}

function helperAnswer(language, intent, context) {
  const cartNote = context?.cartItems ? (language === 'vi' ? ` ${vi('Bạn đang có')} ${context.cartItems} ${vi('dịch vụ trong giỏ')}.` : ` You have ${context.cartItems} services in your cart.`) : '';
  const viAnswers = {
    booking_status: vi('Mình có thể kiểm tra đơn gần đây nếu bạn đã đăng nhập. Mở Đặt chỗ để xem trạng thái thanh toán, QR và hoàn tiền.'),
    cancel_booking: vi('Bạn có thể hủy đặt chỗ từ trang Đặt chỗ nếu chính sách còn hiệu lực. TravChain sẽ hiển thị điều kiện hoàn tiền và Hash giao dịch.'),
    refund_help: vi('Bạn có thể mở Bookings để hủy đặt chỗ khi chính sách còn hiệu lực. Hoàn tiền phụ thuộc chính sách đối tác và trạng thái xác nhận; TravChain sẽ hiển thị Hash hoàn tiền và giao dịch ví.'),
    wallet_help: vi('Ví TravChain dùng để nạp tín dụng du lịch, thanh toán đặt chỗ, nhận hoàn tiền, quản lý PIN và theo dõi Hash giao dịch.'),
    payment_method_help: vi('TravChain hỗ trợ Ví TravChain, thẻ quốc tế và QR nội địa. Bạn có thể đặt nguồn thanh toán chính trong mục Ví.'),
    passport_help: vi('Travel Passport lưu dấu chuyến đi, QR, điểm thưởng, hạng thành viên và Hash đặt chỗ trong một hồ sơ du lịch.'),
    membership_help: vi('Membership và NFT giúp ghi nhận hạng thành viên, điểm thưởng và quyền lợi có thể mở rộng trong TravChain.'),
    partner_help: vi('Đối tác có thể đăng dịch vụ, quản lý tồn kho, theo dõi doanh thu, đối soát và xử lý hoàn tiền trong cổng đối tác.'),
    fallback: vi('Mình có thể tìm phim, khách sạn, homestay, vé tham quan, tour, sự kiện, nhà hàng, đưa đón, ví và hoàn tiền trên TravChain.'),
  };
  const enAnswers = {
    booking_status: 'I can help check recent bookings when you are signed in. Open Bookings to review payment status, QR, and refunds.',
    cancel_booking: 'You can cancel from Bookings when the policy allows it. TravChain shows refund eligibility and transaction Hash records.',
    refund_help: 'Refund timing depends on partner policy and confirmation status. You can track status, refund Hash, and wallet transactions in Refunds.',
    wallet_help: 'TravChain Wallet is used for travel credits, booking payments, refunds, PIN security, and transaction Hash records.',
    payment_method_help: 'TravChain supports TravChain Wallet, international cards, and domestic QR. You can manage the primary source in Wallet.',
    passport_help: 'Travel Passport stores trip stamps, QR, reward points, membership tier, and booking Hash records in one travel profile.',
    membership_help: 'Membership and NFT features help track tier, reward points, and extensible TravChain benefits.',
    partner_help: 'Partners can publish services, manage inventory, track revenue, reconcile, and process refunds in Partner Center.',
    fallback: 'I can search TravChain for movies, hotels, homestays, attractions, tours, events, restaurants, transport, wallet, and refunds.',
  };
  return `${language === 'vi' ? viAnswers[intent] || viAnswers.fallback : enAnswers[intent] || enAnswers.fallback}${cartNote}`;
}

function answerFor(language, intent, items, province, context, usedAlternatives) {
  if (!serviceIntentTypes[intent]) return helperAnswer(language, intent, context);
  if (!items.length) {
    return language === 'vi'
      ? vi('Mình chưa tìm thấy dịch vụ phù hợp. Bạn có thể đổi địa điểm, đổi ngày hoặc xem danh mục liên quan.')
      : 'I could not find a matching service. You can change destination, change date, or browse a related category.';
  }
  if (usedAlternatives) {
    return language === 'vi'
      ? vi(`Mình chưa thấy kết quả đúng hoàn toàn trong dữ liệu hiện tại, nhưng có các lựa chọn gần nhất bạn có thể xem tiếp.`)
      : 'I could not find an exact match in the current data, but these nearby alternatives are available to book.';
  }
  if (language === 'vi') {
    if (intent === 'cinema_showtimes' || intent === 'movie_provider_search') return vi(`Mình tìm thấy ${items.length} lựa chọn xem phim${province ? ` ở ${province}` : ''}. Một số suất phù hợp: ${items.flatMap((item) => item.timeSlots).slice(0, 3).join(', ')}.`);
    if (intent === 'hotel_search' || intent === 'homestay_search') return vi(`Mình tìm thấy ${items.length} lựa chọn lưu trú${province ? ` ở ${province}` : ''}, có giá, đánh giá và tình trạng còn chỗ.`);
    if (intent === 'itinerary_suggestion') return vi(`Mình gợi ý các dịch vụ có thể đặt để ghép thành lịch trình${province ? ` ở ${province}` : ''}.`);
    return vi(`Mình tìm thấy ${items.length} dịch vụ phù hợp trong TravChain.`);
  }
  if (intent === 'cinema_showtimes' || intent === 'movie_provider_search') return `I found ${items.length} cinema options${province ? ` in ${province}` : ''}. Useful showtimes include ${items.flatMap((item) => item.timeSlots).slice(0, 3).join(', ')}.`;
  if (intent === 'hotel_search' || intent === 'homestay_search') return `I found ${items.length} stay options${province ? ` in ${province}` : ''} with prices, ratings, and availability.`;
  if (intent === 'itinerary_suggestion') return `I found bookable services you can combine into an itinerary${province ? ` in ${province}` : ''}.`;
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
    ctaLabel: language === 'vi' ? vi('Xem đặt chỗ') : 'View booking',
    ctaUrl: '/bookings',
  }));
}

async function serviceItems(intent, province, message, language) {
  const primary = await Service.find(filterFor(intent, province, message))
    .sort({ rating: -1, availability: -1, createdAt: -1 })
    .limit(6);
  if (primary.length) return { services: primary, usedAlternatives: false };

  const types = serviceIntentTypes[intent] || [];
  const alternatives = await Service.find({
    status: 'approved',
    ...(types.length ? { type: types.length === 1 ? types[0] : { $in: types } } : {}),
  })
    .sort({ rating: -1, availability: -1, createdAt: -1 })
    .limit(6);
  return { services: alternatives, usedAlternatives: alternatives.length > 0 };
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
      const result = await serviceItems(intent, province, body.message, body.language);
      usedAlternatives = result.usedAlternatives;
      items = result.services.map((service) => itemFromService(service, intent, body.language));
    }

    if (intent === 'booking_status' && body.userId) {
      const bookings = await Booking.find({ userId: body.userId }).sort({ createdAt: -1 }).limit(3);
      items = bookingItems(bookings, body.language);
    }

    const empty = !items.length;
    res.json({
      intent,
      answer: answerFor(body.language, intent, items, province, body.context, usedAlternatives),
      confidence: intent === 'fallback' ? 0.35 : 0.82,
      items,
      followUps: followUps(body.language, intent, empty),
      actions: actionsFor(body.language, intent, empty),
      filters: filtersFor(intent, body.language),
      emptyStateType: empty ? (usedAlternatives ? 'alternatives' : 'no_result') : null,
      meta: { province, dateWord, usedAlternatives },
    });
  } catch (error) {
    next(error);
  }
});
