import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addDays, getSeoulDate, getWeekDates, getWeekStart } from '../app/utils/week.ts'

test('today uses the Seoul date across the UTC midnight boundary', () => {
  assert.equal(getSeoulDate(new Date('2026-10-02T14:59:59Z')), '2026-10-02')
  assert.equal(getSeoulDate(new Date('2026-10-02T15:00:00Z')), '2026-10-03')
})

test('every date in the current week resolves to the same Monday', () => {
  const dates = getWeekDates('2026-09-28')
  assert.deepEqual(dates, ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'])
  dates.forEach(date => assert.equal(getWeekStart(date), '2026-09-28'))
  assert.equal(getWeekStart('2026-10-05'), '2026-10-05')
})

test('previous and next weeks handle year and leap-day boundaries', () => {
  assert.equal(getWeekStart('2027-01-01'), '2026-12-28')
  assert.equal(addDays('2026-12-28', 7), '2027-01-04')
  assert.equal(addDays('2027-01-04', -7), '2026-12-28')
  assert.equal(addDays('2028-02-28', 1), '2028-02-29')
  assert.equal(addDays('2028-02-28', 2), '2028-03-01')
})
