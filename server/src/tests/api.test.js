import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app.js';
import { Membership } from '../models/Membership.js';
import { PaymentSource } from '../models/PaymentSource.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';

let mongo;
let app;
let travelerToken;
let partnerToken;
let service;

async function register(role, email) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: `${role} user`, email, password: '123456', role });
  return response.body.token;
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  travelerToken = await register('traveler', 'traveler@test.dev');
  partnerToken = await register('partner', 'partner@test.dev');
  const partner = await User.findOne({ email: 'partner@test.dev' });
  service = await Service.create({
    type: 'hotel',
    title: 'Test Hotel',
    province: 'Da Nang',
    location: 'Da Nang',
    destination: 'Da Nang',
    priceVnd: 100000,
    imageUrl: 'https://example.com/hotel.jpg',
    description: 'A valid test hotel service.',
    highlights: ['QR'],
    availability: 5,
    status: 'approved',
    partnerId: partner._id,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('TravChain API', () => {
  it('registers and logs in a user', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'traveler@test.dev', password: '123456' })
      .expect(200);

    expect(login.body.token).toBeTruthy();
    expect(login.body.user.role).toBe('traveler');
  });

  it('returns approved services', async () => {
    const response = await request(app).get('/api/services').expect(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Test Hotel');
  });

  it('returns cinema booking cards from assistant chat', async () => {
    const partner = await User.findOne({ email: 'partner@test.dev' });
    await Service.create({
      type: 'cinema',
      title: 'CGV Vincom Da Nang',
      providerBrand: 'CGV Cinemas',
      province: 'Da Nang',
      district: 'Hai Chau',
      location: 'Hai Chau, Da Nang',
      destination: 'Da Nang',
      priceVnd: 135000,
      imageUrl: 'https://example.com/cgv.jpg',
      description: 'Cinema tickets with available seats.',
      highlights: ['Tonight'],
      availability: 24,
      inventory: 24,
      status: 'approved',
      partnerId: partner._id,
    });

    const response = await request(app)
      .post('/api/assistant/chat')
      .send({ message: 'Tối nay Đà Nẵng có phim gì?', language: 'vi' })
      .expect(200);

    expect(response.body.intent).toBe('cinema_showtimes');
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].providerBrand).toBe('CGV Cinemas');
    expect(response.body.items[0].timeSlots.length).toBeGreaterThan(0);
    expect(response.body.items[0].badges).toContain('QR receipt');
    expect(response.body.items[0].ctaUrl).toContain('/service/');
    expect(response.body.followUps.length).toBeGreaterThan(0);
  });

  it('returns hotel, attraction, and refund assistant responses', async () => {
    const partner = await User.findOne({ email: 'partner@test.dev' });
    await Service.insertMany([
      {
        type: 'attraction',
        title: 'Ba Na Hills Day Pass',
        providerBrand: 'Sun World',
        province: 'Da Nang',
        district: 'Hoa Vang',
        location: 'Hoa Vang, Da Nang',
        destination: 'Da Nang',
        priceVnd: 950000,
        imageUrl: 'https://example.com/bana.jpg',
        description: 'Ba Na Hills ticket availability.',
        availability: 12,
        status: 'approved',
        partnerId: partner._id,
      },
    ]);

    const hotel = await request(app)
      .post('/api/assistant/chat')
      .send({ message: 'Khách sạn gần biển Mỹ Khê', language: 'vi' })
      .expect(200);
    expect(hotel.body.intent).toBe('hotel_search');
    expect(hotel.body.items[0].title).toBe('Test Hotel');

    const attraction = await request(app)
      .post('/api/assistant/chat')
      .send({ message: 'Vé Bà Nà Hills còn không?', language: 'vi' })
      .expect(200);
    expect(attraction.body.intent).toBe('attraction_ticket');
    expect(attraction.body.items[0].title).toContain('Ba Na Hills');

    const refund = await request(app)
      .post('/api/assistant/chat')
      .send({ message: 'Tôi muốn hủy đặt chỗ', language: 'vi' })
      .expect(200);
    expect(refund.body.intent).toBe('refund_help');
    expect(refund.body.answer).toContain('Bookings');
  });

  it('allows a partner to create a pending service', async () => {
    const response = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({
        type: 'local_tour',
        title: 'Partner Tour',
        location: 'Hoi An',
        priceVnd: 200000,
        imageUrl: 'https://example.com/tour.jpg',
        description: 'A partner created local tour.',
        highlights: ['Local guide'],
        availability: 10,
      })
      .expect(201);

    expect(response.body.data.status).toBe('pending_review');
  });

  it('prevents unauthorized partner service creation by traveler', async () => {
    await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        type: 'event',
        title: 'Bad Event',
        location: 'Hue',
        priceVnd: 100000,
        imageUrl: 'https://example.com/event.jpg',
        description: 'Should not be created.',
        availability: 1,
      })
      .expect(403);
  });

  it('creates booking, decrements inventory, creates hash and membership points', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        items: [{ serviceId: service._id.toString(), quantity: 2, guests: 2, date: '2026-05-10' }],
        paymentMethod: 'qr',
      })
      .expect(201);

    expect(response.body.data.bookingCode).toMatch(/^TC-/);
    expect(response.body.data.transactionHash).toMatch(/^0x/);

    const updatedService = await Service.findById(service._id);
    expect(updatedService.availability).toBe(3);

    const traveler = await User.findOne({ email: 'traveler@test.dev' });
    const membership = await Membership.findOne({ userId: traveler._id });
    expect(membership.points).toBeGreaterThan(0);
  });

  it('blocks overbooking', async () => {
    await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        items: [{ serviceId: service._id.toString(), quantity: 8, guests: 8, date: '2026-05-10' }],
        paymentMethod: 'wallet',
      })
      .expect(400);
  });

  it('blocks locked account access', async () => {
    const user = await User.findOne({ email: 'traveler@test.dev' });
    user.status = 'locked';
    await user.save();

    await request(app)
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${travelerToken}`)
      .expect(403);
  });

  it('supports wallet source, deposit, PIN and booking payment', async () => {
    await request(app)
      .post('/api/wallet/set-pin')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({ pin: '1234' })
      .expect(200);

    const sourceResponse = await request(app)
      .post('/api/payment-sources')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        type: 'domestic_qr',
        providerName: 'VietQR',
        maskedNumber: 'VietQR **** 2026',
        last4: '2026',
        currency: 'VND',
      })
      .expect(201);

    await request(app)
      .post('/api/wallet/deposit')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({ amount: 500000, currency: 'VND', paymentSourceId: sourceResponse.body.data._id })
      .expect(201);

    const response = await request(app)
      .post('/api/wallet/pay-booking')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        pin: '1234',
        items: [{ serviceId: service._id.toString(), quantity: 1, guests: 1, date: '2026-05-12' }],
      })
      .expect(201);

    expect(response.body.data.booking.bookingCode).toMatch(/^TC-/);
    expect(response.body.data.transaction.transactionHash).toMatch(/^0x/);
    const wallet = await Wallet.findOne({ userId: (await User.findOne({ email: 'traveler@test.dev' }))._id });
    expect(wallet.vndBalance).toBe(400000);
    expect(await PaymentSource.countDocuments()).toBe(1);
    expect(await WalletTransaction.countDocuments({ type: 'booking_payment' })).toBe(1);
  });
});
