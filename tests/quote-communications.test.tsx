import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CustomerContactActions, QuoteCommunications } from '@/components/admin/quote-communications';

describe('Customer communication controls', () => {
  it('opens the customer phone and a quote-specific email without sending automatically', () => {
    const html = renderToStaticMarkup(<CustomerContactActions email="customer@example.com" phone="(517) 555-1234" quoteNumber="Q-123" />);
    expect(html).toContain('href="tel:5175551234"');
    expect(html).toContain('href="mailto:customer%40example.com?subject=Re%3A%20Quote%20Q-123"');
    expect(html).toContain('Call customer');
    expect(html).toContain('Email customer');
  });
  it('omits unusable contact links', () => {
    const html = renderToStaticMarkup(<CustomerContactActions email="" phone="" quoteNumber="Q-123" />);
    expect(html).not.toContain('href=');
    expect(html).toContain('No customer contact details saved.');
  });
  it('renders questions as escaped text with timestamps and makes the sync boundary clear', () => {
    const html = renderToStaticMarkup(<QuoteCommunications customerName="Customer" email="customer@example.com" quoteNumber="Q-123" communications={{error: false, messages: [{id:'1', changed_at:'2026-10-26T12:00:00Z', message:'Can we change time?\n<script>alert(1)</script>'}]}} />);
    expect(html).toContain('Can we change time?');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('dateTime="2026-10-26T12:00:00Z"');
    expect(html).toContain('not synced here yet');
  });
  it('distinguishes a failed load from an empty conversation', () => {
    const view = (error: boolean) => renderToStaticMarkup(<QuoteCommunications customerName="Customer" email="" quoteNumber="Q-123" communications={{error, messages:[]}} />);
    expect(view(false)).toContain('No customer questions yet.');
    expect(view(true)).toContain('role="alert"');
    expect(view(true)).not.toContain('No customer questions yet.');
  });
});
