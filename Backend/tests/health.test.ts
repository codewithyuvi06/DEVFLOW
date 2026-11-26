import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
describe('health endpoint', () => {
  it('returns healthy status without requiring MongoDB', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, service: 'devflow-api', status: 'healthy' });
  });
});
