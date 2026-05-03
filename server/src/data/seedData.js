export const seedCategories = [
  { name: 'Cinema', slug: 'cinema', type: 'cinema' },
  { name: 'Hotel', slug: 'hotel', type: 'hotel' },
  { name: 'Homestay', slug: 'homestay', type: 'homestay' },
  { name: 'Attraction', slug: 'attraction', type: 'attraction' },
  { name: 'Event', slug: 'event', type: 'event' },
  { name: 'Local tour', slug: 'local-tour', type: 'local_tour' },
  { name: 'Restaurant', slug: 'restaurant', type: 'restaurant' },
  { name: 'Transport', slug: 'transport', type: 'transport' },
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

const generated = Array.from({ length: 49 }, (_, index) => {
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

export const seedServices = [...baseServices, ...generated].map(buildService);
