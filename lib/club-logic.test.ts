import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPkr,
  formatHourlyRateTag,
  validateCourtInput,
  validateClubProfileInput,
  calculateClubMetrics,
  filterCourts,
  INITIAL_CLUBS,
  MATRIX_TIME_SLOTS,
  formatMatrixDateLabel,
  stepMatrixDate,
  calculateWalkInPricePkr,
  validateWalkInBookingInput,
} from './club-logic';

test('formatPkr and formatHourlyRateTag format currency and hourly tags accurately', () => {
  assert.equal(formatPkr(4000), 'PKR 4,000');
  assert.equal(formatPkr(7000), 'PKR 7,000');
  assert.equal(formatHourlyRateTag(4000, 'Base'), 'PKR 4,000/hr (Base)');
  assert.equal(formatHourlyRateTag(7000, 'Peak'), 'PKR 7,000/hr (Peak)');
});

test('MATRIX_TIME_SLOTS spans 60-minute increments from 07:00 to 24:00', () => {
  assert.equal(MATRIX_TIME_SLOTS[0], '07:00');
  assert.equal(MATRIX_TIME_SLOTS[MATRIX_TIME_SLOTS.length - 1], '24:00');
  assert.equal(MATRIX_TIME_SLOTS.length, 18);
});

test('formatMatrixDateLabel and stepMatrixDate format and step dates accurately', () => {
  assert.equal(formatMatrixDateLabel('2026-10-23'), 'Today: 23 Oct 2026');
  assert.equal(stepMatrixDate('2026-10-23', -1), '2026-10-22');
  assert.equal(stepMatrixDate('2026-10-23', 1), '2026-10-24');
  assert.equal(formatMatrixDateLabel('2026-10-24'), '24 Oct 2026');
});

test('calculateWalkInPricePkr and validateWalkInBookingInput work for walk-in modal', () => {
  const court1 = INITIAL_CLUBS[0].courts[0]; // base 4000, peak 7000
  assert.equal(calculateWalkInPricePkr(court1, '10:00', 60, '17:00'), 4000);
  assert.equal(calculateWalkInPricePkr(court1, '10:00', 90, '17:00'), 6000);
  assert.equal(calculateWalkInPricePkr(court1, '18:00', 120, '17:00'), 14000);

  const bad = validateWalkInBookingInput({ playerName: 'A', phoneNumber: '123' });
  assert.equal(bad.valid, false);

  const good = validateWalkInBookingInput({
    playerName: 'Ali R.',
    phoneNumber: '+92 300 1234567',
  });
  assert.equal(good.valid, true);
});

test('validateCourtInput enforces required name and peak >= base rate', () => {
  const invalidEmpty = validateCourtInput({
    name: '  ',
    type: 'Full Panoramic Glass',
    environment: 'Indoor',
    baseRatePkr: '',
    peakRatePkr: '',
  });
  assert.equal(invalidEmpty.valid, false);
  assert.ok(invalidEmpty.errors.name);
  assert.ok(invalidEmpty.errors.baseRatePkr);
  assert.ok(invalidEmpty.errors.peakRatePkr);

  const validInput = validateCourtInput({
    name: 'Court 5 - Full Panoramic',
    type: 'Full Panoramic Glass',
    environment: 'Indoor',
    baseRatePkr: 4000,
    peakRatePkr: 7000,
  });
  assert.equal(validInput.valid, true);
});

test('calculateClubMetrics and filterCourts compute accurate values', () => {
  const isbCourts = INITIAL_CLUBS[0].courts;
  const metrics = calculateClubMetrics(isbCourts);
  assert.equal(metrics.totalCourts, 4);
  assert.equal(metrics.activeCourts, 4);

  const indoorOnly = filterCourts(isbCourts, { environment: 'Indoor' });
  assert.equal(indoorOnly.length, 2);
});
