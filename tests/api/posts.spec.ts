import { test, expect } from '@playwright/test';

test.describe('Posts API', () => {
  test('GET /posts returns a list', async ({ request }) => {
    const res = await request.get('/posts');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /posts/1 has expected shape', async ({ request }) => {
    const res = await request.get('/posts/1');
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({
      id: 1,
      userId: expect.any(Number),
      title: expect.any(String),
    });
  });

  test('POST /posts creates a resource', async ({ request }) => {
    const res = await request.post('/posts', {
      data: { title: 'hello', body: 'world', userId: 1 },
    });
    expect(res.status()).toBe(201);
    expect(await res.json()).toMatchObject({ title: 'hello', id: expect.any(Number) });
  });

  test('unknown post returns 404', async ({ request }) => {
    const res = await request.get('/posts/999999');
    expect(res.status()).toBe(404);
  });
});
