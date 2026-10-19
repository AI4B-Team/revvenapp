import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { withTimeout } from './withTimeout';

describe('bounded schedule requests', () => {
  it('rejects a request that never settles', async () => {
    await assert.rejects(withTimeout(new Promise(() => {}), 10), /Request timed out/);
  });
  it('preserves a successful response', async () => {
    assert.deepEqual(await withTimeout(Promise.resolve({ id: 'saved-schedule' }), 100), { id: 'saved-schedule' });
  });
  it('preserves failures instead of treating them as empty schedules', async () => {
    await assert.rejects(withTimeout(Promise.reject(new Error('Access denied')), 100), /Access denied/);
  });
});