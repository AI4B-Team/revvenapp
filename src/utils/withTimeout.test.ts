import { describe, it, expect } from 'bun:test';
import { withTimeout } from './withTimeout';

describe('bounded schedule requests', () => {
  it('rejects a request that never settles', async () => {
    await expect(withTimeout(new Promise(() => {}), 10)).rejects.toThrow('Request timed out');
  });
  it('preserves a successful response', async () => {
    expect(await withTimeout(Promise.resolve({ id: 'saved-schedule' }), 100)).toEqual({ id: 'saved-schedule' });
  });
  it('preserves failures instead of treating them as empty schedules', async () => {
    await expect(withTimeout(Promise.reject(new Error('Access denied')), 100)).rejects.toThrow('Access denied');
  });
});