import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AI_SCHEMA_VERSION } from '@mini-pdf-tools/shared';
import { aiSnapshot, normalizeAiFields, type Entitlement } from './entitlements.ts';

function weekPass(overrides: Partial<Entitlement> = {}): Entitlement {
  return {
    email: 'pass@example.com',
    customerId: 'cus_week',
    plan: 'week',
    status: 'active',
    expiresAt: '2026-09-21T00:00:00.000Z',
    aiUsed: 8,
    ...overrides
  };
}

describe('AI credit migration', () => {
  const now = Date.parse('2026-09-14T12:00:00.000Z');

  it('resets unused Pass credits without converting old aiUsed', () => {
    const next = normalizeAiFields(weekPass(), now);
    assert.equal(next.aiUsed, 0);
    assert.equal(next.aiSchemaVersion, AI_SCHEMA_VERSION);
    assert.equal(aiSnapshot(weekPass(), now).remaining, 100);
  });

  it('keeps usage after the v2 schema is applied', () => {
    const next = normalizeAiFields(weekPass({ aiUsed: 12, aiSchemaVersion: AI_SCHEMA_VERSION }), now);
    assert.equal(next.aiUsed, 12);
    assert.equal(aiSnapshot(next, now).remaining, 88);
  });

  it('resets Pro usage when the calendar month changes', () => {
    const entry: Entitlement = {
      email: 'pro@example.com',
      customerId: 'cus_month',
      plan: 'month',
      status: 'active',
      expiresAt: null,
      aiUsed: 40,
      aiPeriodKey: '2026-08',
      aiSchemaVersion: AI_SCHEMA_VERSION
    };
    const next = normalizeAiFields(entry, Date.parse('2026-09-14T12:00:00.000Z'));
    assert.equal(next.aiUsed, 0);
    assert.equal(next.aiPeriodKey, '2026-09');
  });
});
