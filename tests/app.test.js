process.env.NODE_ENV = 'test';
process.env.CACHE_DRIVER = 'memory';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

const request = require('supertest');
const app = require('../app');

describe('Bike Rental API security and integration tests', () => {
  test('GET / returns API metadata and security headers', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Bike rental API is running');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  test('GET /status returns runtime metrics', async () => {
    const response = await request(app).get('/status');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('memoryUsage');
    expect(response.body).toHaveProperty('cpuUsage');
  });

  test('POST /auth/register validates invalid email and short password before database call', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        name: 'A',
        email: 'bad-email',
        password: '123',
        confirmPassword: '123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  test('GET /auth/profile rejects request without JWT token', async () => {
    const response = await request(app).get('/auth/profile');

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe('Token is missing');
  });
});
