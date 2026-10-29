import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authenticatePartner,
  calculateCommissionSummary,
  INITIAL_PARTNER_CLUBS,
} from './pakpadel-auth';

test('authenticatePartner routes admin@clifton.pk to dashboard_club', () => {
  const res = authenticatePartner('admin@clifton.pk', 'pakpadel2026');
  assert.equal(res.valid, true);
  assert.equal(res.role, 'club_admin');
  assert.equal(res.targetView, 'dashboard_club');
});

test('authenticatePartner routes super@pakpadel.pk to dashboard_super', () => {
  const res = authenticatePartner('  SUPER@PAKPADEL.PK ', 'supersecret');
  assert.equal(res.valid, true);
  assert.equal(res.role, 'super_admin');
  assert.equal(res.targetView, 'dashboard_super');
});

test('authenticatePartner validates empty, invalid format, and unknown emails', () => {
  const emptyEmail = authenticatePartner('', '123456');
  assert.equal(emptyEmail.valid, false);
  assert.ok(emptyEmail.emailError);

  const badFormat = authenticatePartner('not-an-email', '123456');
  assert.equal(badFormat.valid, false);
  assert.ok(badFormat.emailError);

  const emptyPass = authenticatePartner('admin@clifton.pk', '');
  assert.equal(emptyPass.valid, false);
  assert.ok(emptyPass.passwordError);

  const unknownUser = authenticatePartner('player@gmail.com', '123456');
  assert.equal(unknownUser.valid, false);
  assert.ok(unknownUser.formError);
});

test('calculateCommissionSummary computes accurate gross and commission totals', () => {
  const summary = calculateCommissionSummary(INITIAL_PARTNER_CLUBS, 10);
  assert.equal(summary.totalGrossPkr, 24390000);
  assert.equal(summary.totalCommissionPkr, 2439000);
  assert.equal(summary.totalCourts, 17);
  assert.equal(summary.activeClubsCount, 4);
});
