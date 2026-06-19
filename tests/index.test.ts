import request from 'supertest';
import app from '../src/index';

describe('TypeScript-A-B-Testing', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/v1/assign', async () => {
    const res = await request(app)
      .post('/api/v1/assign')
      .send({ user_id: 'user-123', experiment: 'homepage-redesign' });
    expect(res.status).toBe(200);
    expect(['control', 'variant_a', 'variant_b']).toContain(res.body.variant);
  });

});
