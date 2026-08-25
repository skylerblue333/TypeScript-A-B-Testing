import request from 'supertest';

import app, { assignmentBucket, experiments } from '../src/index';

describe('Sky A/B Testing', () => {
  beforeEach(() => {
    for (const name of [...experiments.keys()]) {
      if (name !== 'homepage-redesign') experiments.delete(name);
    }
  });

  it('reports health and readiness', async () => {
    expect((await request(app).get('/health')).body).toEqual({ status: 'ok', service: 'sky-ab-testing' });
    expect((await request(app).get('/ready')).body).toEqual({ ready: true });
  });

  it('creates a weighted experiment and lists it', async () => {
    const created = await request(app).post('/api/v1/experiments').send({
      name: 'checkout-copy',
      variants: [
        { name: 'control', weight: 50 },
        { name: 'short-copy', weight: 50 },
      ],
    });
    expect(created.status).toBe(201);
    const listed = await request(app).get('/api/v1/experiments');
    expect(listed.body.map((item: { name: string }) => item.name)).toContain('checkout-copy');
  });

  it('rejects invalid weights and duplicates', async () => {
    const invalid = await request(app).post('/api/v1/experiments').send({
      name: 'bad-test',
      variants: [
        { name: 'a', weight: 20 },
        { name: 'b', weight: 20 },
      ],
    });
    expect(invalid.status).toBe(422);

    const duplicate = await request(app).post('/api/v1/experiments').send({
      name: 'homepage-redesign',
      variants: [
        { name: 'a', weight: 50 },
        { name: 'b', weight: 50 },
      ],
    });
    expect(duplicate.status).toBe(409);
  });

  it('assigns the same user deterministically', async () => {
    const first = await request(app)
      .post('/api/v1/assign')
      .send({ user_id: 'user-123', experiment: 'homepage-redesign' });
    const second = await request(app)
      .post('/api/v1/assign')
      .send({ user_id: 'user-123', experiment: 'homepage-redesign' });
    expect(first.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(['control', 'variant_a', 'variant_b']).toContain(first.body.variant);
  });

  it('uses stable bounded buckets and returns 404 for unknown experiments', async () => {
    expect(assignmentBucket('x', 'user-1')).toBe(assignmentBucket('x', 'user-1'));
    expect(assignmentBucket('x', 'user-1')).toBeGreaterThanOrEqual(0);
    expect(assignmentBucket('x', 'user-1')).toBeLessThan(100);
    expect(
      (await request(app).post('/api/v1/assign').send({ user_id: 'user', experiment: 'missing' })).status,
    ).toBe(404);
  });
});
