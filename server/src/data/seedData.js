export const seedCategories = [
  { name: 'Cinema', slug: 'cinema', type: 'cinema' },
  { name: 'Hotel', slug: 'hotel', type: 'hotel' },
  { name: 'Homestay', slug: 'homestay', type: 'homestay' },
  { name: 'Attraction', slug: 'attraction', type: 'attraction' },
  { name: 'Event', slug: 'event', type: 'event' },
  { name: 'Local tour', slug: 'local-tour', type: 'local_tour' },
  { name: 'Restaurant', slug: 'restaurant', type: 'restaurant' },
  { name: 'Transport', slug: 'transport', type: 'transport' },
  { name: 'Flights', slug: 'flights', type: 'flight' },
  { name: 'Trip packages', slug: 'trips', type: 'trip' },
];

const imageMap = {
  cinema: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  homestay: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  attraction: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  event: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
  local_tour: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  restaurant: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  transport: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=1200&q=80',
  flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
  trip: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
};

const baseServices = [
  ['cinema', 'CGV Cinemas', 'CGV Vincom Da Nang', 'Da Nang', 'Hai Chau', 135000],
  ['cinema', 'CGV Cinemas', 'CGV Vincom Ba Trieu', 'Ha Noi', 'Hai Ba Trung', 145000],
  ['cinema', 'Lotte Cinema', 'Lotte Cinema Da Nang', 'Da Nang', 'Hai Chau', 120000],
  ['cinema', 'Lotte Cinema', 'Lotte Cinema Go Vap', 'Ho Chi Minh', 'Go Vap', 125000],
  ['cinema', 'Galaxy Cinema', 'Galaxy Nguyen Du', 'Ho Chi Minh', 'District 1', 130000],
  ['cinema', 'Beta Cinemas', 'Beta My Dinh', 'Ha Noi', 'Nam Tu Liem', 95000],
  ['cinema', 'Cinestar', 'Cinestar Quoc Thanh', 'Ho Chi Minh', 'District 1', 110000],
  ['homestay', 'Local Host', 'Dalat Pine Valley Homestay', 'Da Lat', 'Pine Valley', 620000],
  ['homestay', 'Local Host', 'Hoi An Riverside Homestay', 'Hoi An', 'Cam Pho', 540000],
  ['hotel', 'TravChain Stay', 'Da Nang Beach Hotel', 'Da Nang', 'Son Tra', 1250000],
  ['hotel', 'TravChain Stay', 'Hue Heritage Hotel', 'Hue', 'Thuan Thanh', 920000],
  ['homestay', 'Mountain Host', 'Sapa Mountain Lodge', 'Sa Pa', 'Muong Hoa', 780000],
  ['hotel', 'Island Resort', 'Phu Quoc Beach Resort', 'Phu Quoc', 'Duong Dong', 1850000],
  ['hotel', 'Ocean Stay', 'Nha Trang Ocean Hotel', 'Nha Trang', 'Loc Tho', 1120000],
  ['attraction', 'Sun World', 'Ba Na Hills Day Pass', 'Da Nang', 'Hoa Vang', 950000],
  ['attraction', 'Hoi An Authority', 'Hoi An Ancient Town Ticket', 'Hoi An', 'Ancient Town', 120000],
  ['attraction', 'Hue Heritage', 'Hue Imperial City Ticket', 'Hue', 'Imperial City', 200000],
  ['attraction', 'Trang An', 'Trang An Boat Tour', 'Ninh Binh', 'Hoa Lu', 280000],
  ['attraction', 'Fansipan Legend', 'Fansipan Cable Car', 'Sa Pa', 'Fansipan', 850000],
  ['attraction', 'Phong Nha', 'Phong Nha Cave Ticket', 'Phong Nha', 'Ke Bang', 250000],
  ['attraction', 'VinWonders', 'VinWonders Phu Quoc', 'Phu Quoc', 'Ganh Dau', 890000],
  ['event', 'Local Culture', 'Hoi An Lantern Festival', 'Hoi An', 'Ancient Town', 220000],
  ['event', 'Hue Festival', 'Hue Festival Night', 'Hue', 'Perfume River', 340000],
  ['event', 'Da Nang Event', 'Da Nang Fireworks Event', 'Da Nang', 'Han River', 450000],
  ['event', 'Indie Vietnam', 'Dalat Music Weekend', 'Da Lat', 'City Center', 390000],
  ['event', 'Local Food Fair', 'Local Food Fair', 'Ha Noi', 'Old Quarter', 160000],
  ['local_tour', 'Community Tour', 'Lo Lo Chai Village Tour', 'Ha Giang', 'Lo Lo Chai', 520000],
  ['local_tour', 'Community Tour', 'Quynh Son Community Tour', 'Lang Son', 'Quynh Son', 430000],
  ['local_tour', 'Eco Tour', 'Bay Mau Coconut Forest Tour', 'Hoi An', 'Cam Thanh', 360000],
  ['local_tour', 'Foodie Host', 'Hanoi Old Quarter Food Tour', 'Ha Noi', 'Old Quarter', 390000],
  ['local_tour', 'Mekong Host', 'Mekong Local Life Tour', 'Ho Chi Minh', 'Mekong Gateway', 690000],
];

const provinces = ['Da Nang', 'Hoi An', 'Hue', 'Ha Noi', 'Ho Chi Minh', 'Ninh Binh', 'Sa Pa', 'Ha Giang', 'Phong Nha', 'Da Lat', 'Phu Quoc', 'Nha Trang'];
const types = ['cinema', 'hotel', 'homestay', 'attraction', 'event', 'local_tour', 'restaurant', 'transport'];
const brands = {
  cinema: ['CGV Cinemas', 'Lotte Cinema', 'Galaxy Cinema', 'Beta Cinemas', 'Cinestar'],
  hotel: ['TravChain Stay', 'Urban Hotel', 'Heritage Collection'],
  homestay: ['Local Host', 'Community Stay', 'Garden Homes'],
  attraction: ['Local Authority', 'Sun World', 'VinWonders'],
  event: ['Local Culture', 'Festival Board', 'Indie Vietnam'],
  local_tour: ['Community Tour', 'Eco Tour', 'Foodie Host'],
  restaurant: ['Local Table', 'Taste Vietnam', 'Market Kitchen'],
  transport: ['Smart Transfer', 'Airport Link', 'City Shuttle'],
};

function buildService([type, providerBrand, title, province, district, priceVnd], index) {
  const coverImage = imageMap[type];
  const durationByType = {
    cinema: '2 hours',
    hotel: '2D1N',
    homestay: '2D1N',
    attraction: '1 day',
    event: '3 hours',
    local_tour: '5 hours',
    restaurant: '90 minutes',
    transport: '1 hour',
    flight: '1h 25m',
    trip: '3D2N',
  };
  return {
    type,
    providerBrand,
    title,
    province,
    district,
    location: `${district}, ${province}`,
    destination: province,
    priceVnd,
    priceUsd: Math.round((priceVnd / 24500) * 100) / 100,
    rating: Math.round((4.35 + (index % 8) * 0.07) * 10) / 10,
    reviewCount: 24 + index * 4,
    inventory: 16 + (index % 12) * 5,
    availability: 16 + (index % 12) * 5,
    duration: durationByType[type],
    imageUrl: coverImage,
    coverImage,
    gallery: [
      coverImage,
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    description: `${title} is a verified TravChain service with live inventory, transparent pricing, QR receipt, and simulated blockchain hash record.`,
    detail: `${title} supports the production booking flow: service detail, cart, checkout, payment confirmation, QR receipt, Travel Passport stamp, partner reconciliation, and transaction history.`,
    highlights: ['Live availability', 'QR receipt', 'Hash record', 'Partner verified'],
    cancellationPolicy: type === 'cinema' ? 'Cinema tickets can be cancelled before partner seat confirmation.' : 'Free cancellation up to 24 hours before use when partner policy allows.',
    tags: [type, province.toLowerCase().replaceAll(' ', '-'), providerBrand.toLowerCase().replaceAll(' ', '-')],
    sustainabilityScore: 66 + (index % 28),
    isFeatured: index < 16,
  };
}

function buildFlight(index) {
  const routes = [
    ['Da Nang', 'Ha Noi', 'DAD', 'HAN'],
    ['Ha Noi', 'Da Nang', 'HAN', 'DAD'],
    ['Ho Chi Minh', 'Da Nang', 'SGN', 'DAD'],
    ['Da Nang', 'Ho Chi Minh', 'DAD', 'SGN'],
    ['Da Nang', 'Nha Trang', 'DAD', 'CXR'],
    ['Ha Noi', 'Nha Trang', 'HAN', 'CXR'],
    ['Ha Noi', 'Phu Quoc', 'HAN', 'PQC'],
    ['Ho Chi Minh', 'Phu Quoc', 'SGN', 'PQC'],
    ['Da Nang', 'Da Lat', 'DAD', 'DLI'],
    ['Da Nang', 'Da Lat', 'DAD', 'DLI'],
    ['Ha Noi', 'Da Lat', 'HAN', 'DLI'],
    ['Phu Quoc', 'Ho Chi Minh', 'PQC', 'SGN'],
    ['Nha Trang', 'Da Nang', 'CXR', 'DAD'],
  ];
  const airlines = ['Vietnam Airlines', 'Vietjet Air', 'Bamboo Airways', 'Vietravel Airlines', 'Pacific Airlines'];
  const route = routes[index % routes.length];
  const airline = airlines[index % airlines.length];
  const hour = 6 + (index % 12);
  const departureTime = new Date(Date.UTC(2026, 4, 20 + (index % 21), hour, 15));
  const arrivalTime = new Date(departureTime.getTime() + 85 * 60 * 1000);
  return {
    ...buildService(['flight', airline, `${airline} ${route[0]} - ${route[1]} ${String(index + 1).padStart(2, '0')}`, route[0], route[2], 890000 + (index % 7) * 180000], 120 + index),
    airline,
    flightNumber: `${airline.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}${200 + index}`,
    originAirport: route[2],
    destinationAirport: route[3],
    origin: route[0],
    routeDestination: route[1],
    departureLabel: `${String(hour).padStart(2, '0')}:15`,
    arrivalLabel: `${String(hour + 1).padStart(2, '0')}:40`,
    departureTime,
    arrivalTime,
    seats: 18 + (index % 9) * 6,
    baggage: index % 2 === 0 ? '7kg cabin + 20kg checked' : '7kg cabin',
    seatClass: index % 5 === 0 ? 'Business' : index % 3 === 0 ? 'Premium Economy' : 'Economy',
    refundable: index % 4 === 0,
    acceptsInternationalCard: true,
    settlementCurrency: index % 4 === 0 ? 'USD' : 'VND',
    highlights: ['VND total', 'Optional international card', 'QR receipt', 'Hash record'],
  };
}

function buildTransport(index) {
  const routes = [
    ['shuttle', 'Da Nang', 'Hoi An', 'Da Nang Center', 'Hoi An Ancient Town', 160000],
    ['bus', 'Ha Noi', 'Sa Pa', 'My Dinh Station', 'Sa Pa Center', 320000],
    ['airport_transfer', 'Da Nang', 'Da Nang', 'Da Nang Airport', 'My Khe Beach', 220000],
    ['airport_transfer', 'Da Nang', 'Hoi An', 'Da Nang Airport', 'Hoi An Ancient Town', 420000],
    ['airport_transfer', 'Nha Trang', 'Nha Trang', 'Cam Ranh Airport', 'Nha Trang Center', 190000],
    ['train', 'Hue', 'Da Nang', 'Hue Station', 'Da Nang Station', 180000],
    ['train', 'Ha Noi', 'Ninh Binh', 'Ha Noi Station', 'Ninh Binh Station', 160000],
    ['train', 'Da Nang', 'Nha Trang', 'Da Nang Station', 'Nha Trang Station', 520000],
    ['shuttle', 'Nha Trang', 'Nha Trang', 'Cam Ranh Airport', 'Nha Trang Center', 190000],
    ['private_car', 'Da Nang', 'Ba Na Hills', 'Da Nang Hotel', 'Ba Na Hills', 720000],
    ['bus', 'Ho Chi Minh', 'Mui Ne', 'Mien Dong Station', 'Mui Ne Beach', 290000],
    ['bus', 'Ho Chi Minh', 'Da Lat', 'Mien Dong Station', 'Da Lat Center', 360000],
    ['private_car', 'Ha Noi', 'Ninh Binh', 'Old Quarter', 'Tam Coc', 520000],
    ['airport_transfer', 'Phu Quoc', 'Phu Quoc', 'Phu Quoc Airport', 'Duong Dong', 210000],
  ];
  const providers = ['Green Shuttle', 'Sapa Express', 'Airport Link', 'Vietnam Railways', 'Coastal Transfer'];
  const route = routes[index % routes.length];
  const providerBrand = providers[index % providers.length];
  const departureHour = [6, 8, 13, 19, 21][index % 5];
  const departureTime = new Date(Date.UTC(2026, 4, 20 + (index % 21), departureHour, index % 2 ? 30 : 0));
  const arrivalTime = new Date(departureTime.getTime() + (route[0] === 'train' ? 160 : route[0] === 'bus' ? 345 : 55) * 60 * 1000);
  return {
    ...buildService(['transport', providerBrand, `${route[1]} - ${route[2]} ${route[0].replaceAll('_', ' ')} ${index + 1}`, route[1], route[3], route[5] + (index % 4) * 30000], 160 + index),
    transportType: route[0],
    origin: route[1],
    routeDestination: route[2],
    departureLabel: ['06:30', '08:00', '13:30', '19:45', '21:30'][index % 5],
    arrivalLabel: ['08:00', '13:45', '15:00', '22:30', '23:00'][index % 5],
    departureTime,
    arrivalTime,
    seats: 4 + (index % 8) * 4,
    duration: route[0] === 'train' ? '2h 40m' : route[0] === 'bus' ? '5h 45m' : '45 minutes',
    highlights: ['Seat inventory', 'QR receipt', 'VND payment', 'Partner verified'],
  };
}

function buildTrip(index) {
  const trips = [
    ['Da Nang 3N2D beach cinema Ba Na', 'Da Nang', '3D2N', 4590000, 'family'],
    ['Hoi An weekend lantern food tour', 'Hoi An', '2D1N', 2490000, 'couple'],
    ['Hue heritage 2N1D rail escape', 'Hue', '2D1N', 2790000, 'culture'],
    ['Sa Pa cloud hunt 3N2D', 'Sa Pa', '3D2N', 3890000, 'group'],
    ['Phu Quoc resort 3N2D', 'Phu Quoc', '3D2N', 5290000, 'family'],
    ['3 ngày Đà Nẵng - Hội An', 'Da Nang', '3D2N', 4290000, 'family'],
    ['2 ngày Sa Pa săn mây', 'Sa Pa', '2D1N', 2890000, 'couple'],
    ['1 ngày Bà Nà Hills', 'Da Nang', '1 day', 1490000, 'group'],
    ['Huế heritage day trip', 'Hue', '1 day', 1190000, 'culture'],
    ['Nha Trang beach weekend', 'Nha Trang', '2D1N', 3190000, 'family'],
    ['Phú Quốc resort escape', 'Phu Quoc', '3D2N', 4990000, 'family'],
    ['Hà Nội food culture tour', 'Ha Noi', '2D1N', 2590000, 'couple'],
    ['Ninh Bình discovery getaway', 'Ninh Binh', '1 day', 1290000, 'group'],
  ];
  const trip = trips[index % trips.length];
  return {
    ...buildService(['trip', 'TravChain Trips', `${trip[0]} package ${index + 1}`, trip[1], 'Central', trip[3] + (index % 3) * 350000], 220 + index),
    packageDuration: trip[2],
    travelerType: trip[4],
    packageIncludes: ['hotel', 'transport', 'attraction ticket', 'local tour', index % 2 === 0 ? 'event' : 'cinema'].filter(Boolean),
    duration: trip[2],
    highlights: ['Hotel included', 'Transport included', 'Attraction ticket', 'Local tour', `Estimated total ${trip[3].toLocaleString('vi-VN')} VND`, `Itinerary ${trip[2]}`],
  };
}

function buildRestaurant(index) {
  const restaurants = [
    ['Local Table', 'My Khe seafood tasting', 'Da Nang', 'My Khe', 320000],
    ['Local Table', 'Da Nang seafood set for two', 'Da Nang', 'My Khe', 420000],
    ['Local Table', 'Da Nang Han River dinner set', 'Da Nang', 'Han River', 380000],
    ['Taste Vietnam', 'Hoi An cao lau set', 'Hoi An', 'Ancient Town', 180000],
    ['Taste Vietnam', 'Hoi An food tour tasting pass', 'Hoi An', 'Ancient Town', 390000],
    ['Hue Kitchen', 'Hue royal cuisine dinner', 'Hue', 'Citadel', 420000],
    ['Hue Kitchen', 'Hue royal cuisine tasting menu', 'Hue', 'Perfume River', 520000],
    ['Old Quarter Eats', 'Ha Noi street food table', 'Ha Noi', 'Old Quarter', 260000],
    ['Dalat Garden', 'Da Lat farm dinner', 'Da Lat', 'Tuyen Lam', 350000],
    ['Sapa Lodge', 'Highland hot pot feast', 'Sa Pa', 'Muong Hoa', 310000],
    ['Saigon Street', 'Riverfront lunch set', 'Ho Chi Minh', 'District 1', 280000],
    ['Mekong Market', 'Floating market tasting menu', 'Can Tho', 'Ninh Kieu', 240000],
    ['Island Table', 'Phu Quoc local dining seafood grill', 'Phu Quoc', 'Duong Dong', 480000],
    ['Island Table', 'Phu Quoc night market tasting', 'Phu Quoc', 'Night Market', 260000],
  ];
  return buildService(['restaurant', ...restaurants[index % restaurants.length]], 260 + index);
}

const generated = Array.from({ length: 79 }, (_, index) => {
  const type = types[index % types.length];
  const province = provinces[index % provinces.length];
  const providerBrand = brands[type][index % brands[type].length];
  const district = ['Central', 'Riverside', 'Old Town', 'Beachside', 'Heritage Quarter'][index % 5];
  const titleType = {
    cinema: 'Movie Ticket Bundle',
    hotel: 'Smart Hotel Room',
    homestay: 'Local Homestay',
    attraction: 'Attraction Day Pass',
    event: 'Culture Event',
    local_tour: 'Community Tour',
    restaurant: 'Local Dining Set',
    transport: 'Airport Transfer',
  }[type];
  const basePrice = {
    cinema: 105000,
    hotel: 980000,
    homestay: 560000,
    attraction: 310000,
    event: 240000,
    local_tour: 460000,
    restaurant: 280000,
    transport: 220000,
  }[type];
  return [type, providerBrand, `${province} ${titleType} ${index + 1}`, province, district, basePrice + (index % 6) * 55000];
});

const flights = Array.from({ length: 30 }, (_, index) => buildFlight(index));
const transports = Array.from({ length: 120 }, (_, index) => buildTransport(index));
const trips = Array.from({ length: 25 }, (_, index) => buildTrip(index));
const restaurants = Array.from({ length: 30 }, (_, index) => buildRestaurant(index));

export const seedServices = [
  ...baseServices.map(buildService),
  ...generated.map(buildService),
  ...flights,
  ...transports,
  ...trips,
  ...restaurants,
];
