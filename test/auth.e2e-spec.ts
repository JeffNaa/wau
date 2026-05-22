import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Clean up database before each test to ensure deterministic role assignment
    const prisma = app.get(PrismaService);
    await prisma.client.userToken.deleteMany();
    await prisma.client.user.deleteMany();
    await prisma.client.role.deleteMany();

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/register (POST) - first user should succeed', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'password123', name: 'Admin' })
      .expect(201)
      .expect((res) => {
        expect(res.body.token).toBeDefined();
        expect(res.body.token.token).toBeDefined();
        expect(res.body.user.email).toBe('admin@test.com');
      });
  });

  it('/auth/login (POST) - should return token', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user@test.com', password: 'password123' });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'password123' })
      .expect(201)
      .expect((res) => {
        expect(res.body.token).toBeDefined();
        expect(res.body.token.token).toBeDefined();
      });
  });

  it('/auth/me (GET) - should require auth', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('/auth/me (GET) - should return user with valid token', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'me@test.com', password: 'password123' });

    const token = registerRes.body.token.token;

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('me@test.com');
      });
  });

  it('/auth/logout (POST) - should revoke token', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'logout@test.com', password: 'password123' });

    const token = registerRes.body.token.token;

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  // === Plugin Permissions ===
  it('GET /plugins without auth → 401', () => {
    return request(app.getHttpServer()).get('/plugins').expect(401);
  });

  it('GET /plugins as USER → 403', async () => {
    // Register an admin first so the next user becomes USER
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'password123' });

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'plugin_user@test.com', password: 'password123' });
    const token = registerRes.body.token.token;

    return request(app.getHttpServer())
      .get('/plugins')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('GET /plugins as ADMIN → 200', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'password123' });
    const token = registerRes.body.token.token;

    return request(app.getHttpServer())
      .get('/plugins')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
