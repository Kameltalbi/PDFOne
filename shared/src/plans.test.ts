import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aiCreditCost, billedPages, calendarMonthKey, limitsForPlan, PLAN_LIMITS } from './plans.ts';

describe('ai credit math', () => {
  it('translate bills one credit per page up to 100', () => {
    assert.equal(billedPages('translate', 1), 1);
    assert.equal(billedPages('translate', 5), 5);
    assert.equal(billedPages('translate', 100), 100);
    assert.equal(billedPages('translate', 150), 100);
    assert.equal(aiCreditCost('translate', 5), 5);
    assert.equal(aiCreditCost('translate', 150), 100);
  });

  it('summarize bills one credit per page up to 20', () => {
    assert.equal(aiCreditCost('summarize', 5), 5);
    assert.equal(aiCreditCost('summarize', 20), 20);
    assert.equal(aiCreditCost('summarize', 100), 20);
  });

  it('never bills zero pages', () => {
    assert.equal(aiCreditCost('translate', 0), 1);
    assert.equal(aiCreditCost('summarize', -3), 1);
  });

  it('exposes validated pools', () => {
    assert.equal(PLAN_LIMITS.free.aiCredits, 5);
    assert.equal(PLAN_LIMITS.free.dailyJobs, 5);
    assert.equal(PLAN_LIMITS.week.aiCredits, 100);
    assert.equal(PLAN_LIMITS.month.aiCredits, 500);
    assert.equal(PLAN_LIMITS.year.aiCredits, 500);
    assert.equal(limitsForPlan('year').aiCredits, 500);
    assert.equal(limitsForPlan(null).id, 'free');
  });

  it('calendar month key is YYYY-MM', () => {
    assert.match(calendarMonthKey(new Date('2026-09-14T19:00:00.000Z')), /^2026-09$/);
  });

  it('tool weights can change without touching billed pages', () => {
    assert.equal(aiCreditCost('translate', 5, { translate: 2, summarize: 1 }), 10);
    assert.equal(aiCreditCost('summarize', 100, { translate: 1, summarize: 3 }), 60);
  });
});
