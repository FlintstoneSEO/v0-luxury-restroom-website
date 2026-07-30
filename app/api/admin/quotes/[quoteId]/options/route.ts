import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteOptionInputSchema } from '@/lib/quotes/schema';
import { normalizeOptionPricing } from '@/lib/quotes/quote-options';
import { getPricingSettings } from '@/lib/quotes/build-quote-calculation';
import { financialLockMessage, isQuoteFinanciallyLocked } from '@/lib/quotes/financial-lock';

const OPTION_SELECT = '*';

export async function GET(_request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('quote_options')
    .select(OPTION_SELECT)
    .eq('quote_request_id', quoteId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, options: data ?? [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ quoteId: string }> }) {
  const adminAuth = await requireAdminUser();
  if (!adminAuth.ok) return adminAuth.response;

  const { quoteId } = await params;
  const body = await request.json().catch(() => ({}));
  const validation = quoteOptionInputSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ ok: false, message: 'Invalid quote option', details: validation.error.errors }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: quote, error: quoteError } = await supabase
    .from('quote_requests')
    .select('id, status, quote_sent_at, approved_at, customer_response_at, customer_response_type, agreement_status, deposit_status, has_power, has_water, distance_miles, base_price, travel_fee, utility_fee, after_hours_fee, cleaning_fee, damage_waiver_fee, rush_booking_fee, subtotal, discount_amount, pretax_total, taxable_amount, tax_rate, sales_tax_amount, total_price, deposit_percentage, deposit_amount, final_balance, calculated_breakdown, needs_manual_distance_review')
    .eq('id', quoteId)
    .single();

  if (quoteError || !quote) return NextResponse.json({ ok: false, message: 'Quote not found' }, { status: 404 });
  if (isQuoteFinanciallyLocked(quote)) {
    return NextResponse.json({ ok: false, message: financialLockMessage() }, { status: 409 });
  }

  const input = validation.data;
  const pricingSettings = await getPricingSettings();
  const pricing = normalizeOptionPricing({
    base_price: input.base_price ?? quote.base_price ?? 0,
    travel_fee: input.travel_fee ?? quote.travel_fee ?? 0,
    utility_fee: input.utility_fee ?? quote.utility_fee ?? 0,
    after_hours_fee: input.after_hours_fee ?? quote.after_hours_fee ?? 0,
    cleaning_fee: input.cleaning_fee ?? quote.cleaning_fee ?? 0,
    damage_waiver_fee: input.damage_waiver_fee ?? quote.damage_waiver_fee ?? 0,
    rush_booking_fee: input.rush_booking_fee ?? quote.rush_booking_fee ?? 0,
    discount_amount: input.discount_amount ?? quote.discount_amount ?? 0,
    sales_tax_percentage: pricingSettings.sales_tax_percentage,
    deposit_percentage: pricingSettings.deposit_percentage,
  });

  if (input.is_recommended) {
    await supabase.from('quote_options').update({ is_recommended: false }).eq('quote_request_id', quoteId);
  }

  const { data, error } = await supabase
    .from('quote_options')
    .insert({
      quote_request_id: quoteId,
      option_label: input.option_label,
      option_description: input.option_description ?? null,
      is_recommended: input.is_recommended ?? false,
      status: input.status ?? 'draft',
      has_power: input.has_power ?? quote.has_power,
      has_water: input.has_water ?? quote.has_water,
      distance_miles: input.distance_miles ?? quote.distance_miles,
      ...pricing,
      calculated_breakdown: {
        ...(quote.calculated_breakdown ?? {}),
        ...pricing,
        details: {
          ...((quote.calculated_breakdown?.details as Record<string, unknown> | undefined) ?? {}),
          sales_tax_percentage: pricingSettings.sales_tax_percentage,
          deposit_percentage: pricingSettings.deposit_percentage,
        },
      },
      needs_manual_distance_review: input.needs_manual_distance_review ?? quote.needs_manual_distance_review ?? false,
      updated_at: new Date().toISOString(),
    })
    .select(OPTION_SELECT)
    .single();

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, option: data }, { status: 201 });
}
