import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testUser: { email: string; password: string; firstName: string; lastName: string };
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Setup test user data
    testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'Test1234Password',
      firstName: 'Test',
      lastName: 'User',
    };
  });

  afterAll(async () => {
    // Cleanup: Delete test user if created
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.firstName).toBe(testUser.firstName);
      expect(response.body.user.lastName).toBe(testUser.lastName);
      expect(response.body.user.role).toBe('USER');
      expect(response.body.user.emailVerified).toBe(false);

      createdUserId = response.body.user.id;
    });

    it('should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: `test2-${Date.now()}@example.com`,
          password: 'weak',
        })
        .expect(400);
    });

    it('should fail with password missing uppercase', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: `test3-${Date.now()}@example.com`,
          password: 'test1234',
        })
        .expect(400);
    });

    it('should fail with password missing number', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          email: `test4-${Date.now()}@example.com`,
          password: 'TestPassword',
        })
        .expect(400);
    });

    it('should fail when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should accept optional fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-optional-${Date.now()}@example.com`,
          password: 'Test1234Password',
        })
        .expect(201);

      expect(response.body.user).toHaveProperty('id');
      // Cleanup
      await prisma.user.delete({ where: { id: response.body.user.id } }).catch(() => {});
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('should fail with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: testUser.password,
        })
        .expect(400);
    });

    it('should fail with missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;
    let accessToken: string;

    beforeAll(async () => {
      // Get tokens from login
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should refresh access token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).not.toBe(accessToken); // Should be a new token
    });

    it('should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should fail with missing refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = response.body.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body).toHaveProperty('firstName');
      expect(response.body).toHaveProperty('lastName');
      expect(response.body).toHaveProperty('role');
      expect(response.body).toHaveProperty('emailVerified');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /auth/sessions', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = response.body.accessToken;
    });

    it('should get user sessions with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('createdAt');
        expect(response.body[0]).toHaveProperty('expiresAt');
      }
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/sessions')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;
    let sessionId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = response.body.accessToken;

      // Get session ID from sessions endpoint
      const sessionsResponse = await request(app.getHttpServer())
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`);

      if (sessionsResponse.body.length > 0) {
        sessionId = sessionsResponse.body[0].id;
      }
    });

    it('should logout successfully with valid session ID', async () => {
      if (sessionId) {
        const response = await request(app.getHttpServer())
          .post('/auth/logout')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ sessionId })
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Logged out successfully');
      }
    });

    it('should fail without session ID', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ sessionId: 'some-id' })
        .expect(401);
    });
  });

  describe('DELETE /auth/sessions/:sessionId', () => {
    let accessToken: string;
    let sessionId: string;

    beforeAll(async () => {
      // Create a new session
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      accessToken = response.body.accessToken;

      // Get session ID
      const sessionsResponse = await request(app.getHttpServer())
        .get('/auth/sessions')
        .set('Authorization', `Bearer ${accessToken}`);

      if (sessionsResponse.body.length > 0) {
        sessionId = sessionsResponse.body[0].id;
      }
    });

    it('should revoke session successfully', async () => {
      if (sessionId) {
        const response = await request(app.getHttpServer())
          .delete(`/auth/sessions/${sessionId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Session revoked successfully');
      }
    });

    it('should fail with non-existent session ID', async () => {
      await request(app.getHttpServer())
        .delete('/auth/sessions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .delete(`/auth/sessions/${sessionId || 'some-id'}`)
        .expect(401);
    });
  });
});

