import test from 'node:test';
import assert from 'node:assert/strict';
import { buildKortanaReply } from '../lib/kortana.js';

test('buildKortanaReply includes presence and recent context', () => {
  const reply = buildKortanaReply('Help me stay consistent', [
    { content: 'We talked about focus earlier.' }
  ]);

  assert.match(reply, /Kortana is/i);
  assert.match(reply, /phone/i);
  assert.match(reply, /focus/i);
});
