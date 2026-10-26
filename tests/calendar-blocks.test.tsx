import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { activeCalendarBlocks, blockedCalendarDates, blocksOnDate, type CalendarBlock } from '@/lib/calendar-blocks';
import { UpcomingBookedEvents, BookingCalendar } from '@/components/admin/booking-calendar';
import { BookingOutlook } from '@/components/admin/booking-outlook';

const reservation: CalendarBlock = { id: 'synthetic-msu', title: 'MSU Tailgate vs Washington', organization_name: 'RevelXP', start_date: '2026-11-14', end_date: '2026-11-14', block_type: 'partner_booking', availability_effect: 'hard_block', status: 'active' };
afterEach(() => vi.useRealTimers());
describe('reserved partner dates', () => {
  it('includes every day of a range, bounded to the visible month', () => {
    const blocks = [{ ...reservation, start_date: '2026-10-30', end_date: '2026-11-02' }];
    expect(blockedCalendarDates(blocks, '2026-11-01', '2026-11-30')).toEqual(['2026-11-01','2026-11-02']);
    expect(blocksOnDate(blocks, '2026-10-31')).toHaveLength(1);
  });
  it('excludes cancelled and malformed ranges', () => {
    expect(activeCalendarBlocks([{ ...reservation, status: 'cancelled' }, { ...reservation, end_date: '2026-11-13' }])).toEqual([]);
  });
  it('shows upcoming partner bookings without requiring a customer quote', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-25T12:00:00-04:00'));
    const html = renderToStaticMarkup(<UpcomingBookedEvents quotes={[]} blocks={[reservation, { ...reservation, id: 'past', title: 'Past tailgate', start_date: '2026-09-04', end_date: '2026-09-04' }, { ...reservation, id: 'cancelled', title: 'Cancelled tailgate', status: 'cancelled' }]} />);
    expect(html).toContain('MSU Tailgate vs Washington'); expect(html).toContain('RevelXP');
    expect(html).not.toContain('Past tailgate'); expect(html).not.toContain('Cancelled tailgate');
  });
  it('does not promote a tentative hold into upcoming booked events', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-25T12:00:00-04:00'));
    expect(renderToStaticMarkup(<UpcomingBookedEvents quotes={[]} blocks={[{ ...reservation, availability_effect: 'soft_hold' }]} />)).not.toContain(reservation.title);
  });
  it('describes a reserved date in the calendar and selected-day detail', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-14T12:00:00-05:00'));
    const html = renderToStaticMarkup(<BookingCalendar quotes={[]} blocks={[reservation]} />);
    expect(html).toContain('MSU Tailgate vs Washington'); expect(html).toContain('Reserved partner date');
    expect(html).toContain('reserved'); expect(html).not.toContain('>Available<');
  });
  it('shows the partner reservation in the dashboard outlook', () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-25T12:00:00-04:00'));
    const html = renderToStaticMarkup(<BookingOutlook quotes={[]} blocks={[reservation]} />);
    expect(html).toContain('MSU Tailgate vs Washington'); expect(html).toContain('Nov 14, 2026');
  });
});
