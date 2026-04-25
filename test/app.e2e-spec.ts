import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ReadyOn Time-Off Service (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Seed initial balance via realtime sync before tests run
    await request(app.getHttpServer())
      .post('/sync/realtime')
      .send({ employeeId: 'EMP001', locationId: 'LOC01', days: 10 });
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Balance ──────────────────────────────────────────────────────────────

  it('GET /balances/EMP001/LOC01 → returns seeded balance', async () => {
    const res = await request(app.getHttpServer())
      .get('/balances/EMP001/LOC01')
      .expect(200);

    expect(res.body.employeeId).toBe('EMP001');
    expect(res.body.days).toBe(10);
  });

  it('GET /balances/UNKNOWN/LOC01 → 404 when not found', async () => {
    await request(app.getHttpServer())
      .get('/balances/UNKNOWN/LOC01')
      .expect(404);
  });

  // ── Time-Off Request ─────────────────────────────────────────────────────

  it('POST /timeoff/request → approves and deducts balance', async () => {
    const res = await request(app.getHttpServer())
      .post('/timeoff/request')
      .send({ employeeId: 'EMP001', locationId: 'LOC01', days: 3 })
      .expect(201);

    expect(res.body.status).toBe('APPROVED');
    expect(res.body.requestedDays).toBe(3);

    const bal = await request(app.getHttpServer()).get('/balances/EMP001/LOC01');
    expect(bal.body.days).toBe(7); // 10 - 3
  });

  it('POST /timeoff/request → rejects insufficient balance', async () => {
    const res = await request(app.getHttpServer())
      .post('/timeoff/request')
      .send({ employeeId: 'EMP001', locationId: 'LOC01', days: 999 })
      .expect(400);

    expect(res.body.message).toContain('Insufficient balance');
  });

  it('POST /timeoff/request → rejects zero days', async () => {
    await request(app.getHttpServer())
      .post('/timeoff/request')
      .send({ employeeId: 'EMP001', locationId: 'LOC01', days: 0 })
      .expect(400);
  });

  it('POST /timeoff/request → rejects unknown employee', async () => {
    await request(app.getHttpServer())
      .post('/timeoff/request')
      .send({ employeeId: 'GHOST', locationId: 'LOC01', days: 2 })
      .expect(400);
  });

  // ── Cancel ───────────────────────────────────────────────────────────────

  it('POST /timeoff/1/cancel → cancels and restores balance', async () => {
    // First create a new request to cancel (avoid stale state from previous runs)
    const newReq = await request(app.getHttpServer())
      .post('/timeoff/request')
      .send({ employeeId: 'EMP001', locationId: 'LOC01', days: 2 })
      .expect(201);

    const requestId = newReq.body.id;

    // Now cancel it
    const res = await request(app.getHttpServer())
      .post(`/timeoff/${requestId}/cancel`)
      .expect(200);

    expect(res.body.status).toBe('CANCELLED');

    // Balance: 10 (initial) - 3 (first request) = 7, then - 2 (this request) = 5, then + 2 (restored) = 7
    const bal = await request(app.getHttpServer()).get('/balances/EMP001/LOC01');
    expect(bal.body.days).toBe(7);
  });

  it('POST /timeoff/:id/cancel again → rejects double-cancel', async () => {
    // Create a new request
    const newReq = await request(app.getHttpServer())
      .post('/timeoff/request')
      .send({ employeeId: 'EMP001', locationId: 'LOC01', days: 1 })
      .expect(201);

    const requestId = newReq.body.id;

    // Cancel it first time - should succeed
    await request(app.getHttpServer())
      .post(`/timeoff/${requestId}/cancel`)
      .expect(200);

    // Cancel again - should fail
    const res = await request(app.getHttpServer())
      .post(`/timeoff/${requestId}/cancel`)
      .expect(400);

    expect(res.body.message).toContain('already cancelled');
  });

  it('POST /timeoff/9999/cancel → 404 for unknown request', async () => {
    await request(app.getHttpServer())
      .post('/timeoff/9999/cancel')
      .expect(404);
  });

  // ── Sync ─────────────────────────────────────────────────────────────────

  it('POST /sync/realtime → upserts balance', async () => {
    const res = await request(app.getHttpServer())
      .post('/sync/realtime')
      .send({ employeeId: 'EMP001', locationId: 'LOC01', days: 20 })
      .expect(201);

    expect(res.body.days).toBe(20);
  });

  it('POST /sync/batch → syncs multiple records', async () => {
    const res = await request(app.getHttpServer())
      .post('/sync/batch')
      .send({
        records: [
          { employeeId: 'EMP001', locationId: 'LOC01', days: 15 },
          { employeeId: 'EMP002', locationId: 'LOC01', days: 5 },
        ],
      })
      .expect(201);

    expect(res.body.count).toBe(2);
    expect(res.body.message).toContain('successfully');
  });

  it('POST /sync/batch → rejects empty records', async () => {
    await request(app.getHttpServer())
      .post('/sync/batch')
      .send({ records: [] })
      .expect(400);
  });
});
