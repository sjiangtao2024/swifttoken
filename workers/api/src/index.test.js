import test from 'node:test';
import assert from 'node:assert/strict';

import { isAllowedApiPath } from './index.js';

test('allows api gateway paths', () => {
  assert.equal(isAllowedApiPath('/v1/chat/completions'), true);
  assert.equal(isAllowedApiPath('/api/status'), true);
  assert.equal(isAllowedApiPath('/v1/models'), true);
});

test('blocks console and page paths', () => {
  assert.equal(isAllowedApiPath('/'), false);
  assert.equal(isAllowedApiPath('/setting'), false);
  assert.equal(isAllowedApiPath('/api/setup'), false);
  assert.equal(isAllowedApiPath('/web-assets/app.js'), false);
});
