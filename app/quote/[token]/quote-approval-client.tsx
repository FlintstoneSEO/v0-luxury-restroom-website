'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, MessageSquare, Loader2, Calendar, MapPin, Users, Clock } from 'lucide-react';

interface Quote {
  id: string;
  quote_number?: string;
  customer_name: string;
  email: string;
  event_date: string;
  event_type: string;
  event_address: string;
  city: string;
  state: string;
  zip_code: string;
  guest_count: number;
  event_start_time: string;
  event_end_time: string;
  has_power: boolean;
  has_water: boolean;
  base_price?: number;
  travel_fee?: number;
  utility_fee?: number;
  after_hours_fee?: number;
  cleaning_fee?: number;
  damage_waiver_fee?: number;
  rush_booking_fee?: number;
  subtotal?: number;
  total_price?: number;
  discount_amount?: number;
  pretax_total?: number;
  taxable_amount?: number;
  tax_rate?: number;
  sales_tax_amount?: number;
  deposit_percentage?: number;
  deposit_amount?: number;
  final_balance?: number;
  customer_notes?: string;
  status: string;
  created_at: string;
  is_test_quote?: boolean;
}

interface QuoteOption {
  id: string;
  option_label: string;
  option_description?: string | null;
  is_recommended: boolean;
  status: string;
  has_power?: boolean | null;
  has_water?: boolean | null;
  base_price: number;
  travel_fee: number;
  utility_fee: number;
  after_hours_fee: number;
  cleaning_fee: number;
  damage_waiver_fee: number;
  rush_booking_fee: number;
  subtotal: number;
  discount_amount: number;
  pretax_total: number;
  taxable_amount: number;
  tax_rate: number;
  sales_tax_amount: number;
  total_price: number;
  deposit_percentage: number;
  deposit_amount: number;
  final_balance: number;
  needs_manual_distance_review: boolean;
}

interface QuoteApprovalClientProps {
  quote: Quote;
  token: string;
  alreadyResponded: boolean;
  options?: QuoteOption[];
  publicSiteOrigin: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timeString: string) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function PriceRow({ label, amount, isDiscount = false }: { label: string; amount: number; isDiscount?: boolean }) {
  return (
    <div className={`flex justify-between ${isDiscount ? 'text-green-700' : ''}`}>
      <span>{label}</span>
      <span>{isDiscount ? '-' : ''}{formatCurrency(amount || 0)}</span>
    </div>
  );
}

export default function QuoteApprovalClient({
  quote,
  token,
  alreadyResponded,
  options = [],
  publicSiteOrigin,
}: QuoteApprovalClientProps) {
  const [response, setResponse] = useState<'approve' | 'changes' | 'decline' | 'message' | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyResponded);
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visibleOptions = options.filter((option) => option.status !== 'deleted');
  const hasOptions = visibleOptions.length > 0;
  const [selectedOptionId, setSelectedOptionId] = useState<string>(visibleOptions.find((option) => option.is_recommended)?.id ?? visibleOptions[0]?.id ?? '');

  const handleSubmit = async () => {
    if (!response) return;

    if (response === 'changes' && !comments.trim()) {
      setError('Please provide details for requested quote changes.');
      return;
    }

    if (response === 'message' && !comments.trim()) {
      setError('Please enter your question or message.');
      return;
    }

    if (response === 'approve' && hasOptions && !selectedOptionId) {
      setError('Please choose a quote option before approving.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const isMessage = response === 'message';
      const res = await fetch(`/api/quote/${token}/${isMessage ? 'message' : 'respond'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isMessage
          ? { message: comments.trim() }
          : {
              response_type: response === 'approve' ? 'approved' : response === 'changes' ? 'change_requested' : 'declined',
              comments: comments.trim() || undefined,
              selected_quote_option_id: response === 'approve' && hasOptions ? selectedOptionId : undefined,
            }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || 'Failed to submit response');
      }

      if (response === 'message') {
        setMessageSent(true);
        setComments('');
        setResponse(null);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2d3a47] mb-4">
            {alreadyResponded ? 'Response Already Submitted' : 'Thank You!'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {alreadyResponded
              ? 'You have already responded to this quote. Our team will be in touch shortly.'
              : 'Your response has been submitted. Our team will be in touch shortly.'}
          </p>
          <a
            href={publicSiteOrigin}
            className="inline-block bg-[#2d3a47] text-white px-6 py-3 rounded-md hover:bg-[#2d3a47]/90 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const eventLocation = `${quote.event_address}, ${quote.city}, ${quote.state} ${quote.zip_code}`;
  const singleQuoteOption: QuoteOption = {
    id: quote.id,
    option_label: 'Quote Summary',
    option_description: null,
    is_recommended: false,
    status: quote.status,
    has_power: quote.has_power,
    has_water: quote.has_water,
    base_price: quote.base_price ?? 0,
    travel_fee: quote.travel_fee ?? 0,
    utility_fee: quote.utility_fee ?? 0,
    after_hours_fee: quote.after_hours_fee ?? 0,
    cleaning_fee: quote.cleaning_fee ?? 0,
    damage_waiver_fee: quote.damage_waiver_fee ?? 0,
    rush_booking_fee: quote.rush_booking_fee ?? 0,
    subtotal: quote.subtotal ?? 0,
    discount_amount: quote.discount_amount ?? 0,
    pretax_total: quote.pretax_total ?? quote.total_price ?? 0,
    taxable_amount: quote.taxable_amount ?? 0,
    tax_rate: quote.tax_rate ?? 0,
    sales_tax_amount: quote.sales_tax_amount ?? 0,
    total_price: quote.total_price ?? 0,
    deposit_percentage: quote.deposit_percentage ?? 0,
    deposit_amount: quote.deposit_amount ?? 0,
    final_balance: quote.final_balance ?? 0,
    needs_manual_distance_review: false,
  };
  const pricingOptions = hasOptions ? visibleOptions : [singleQuoteOption];

  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Header */}
      <header className="bg-[#2d3a47] text-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-serif font-bold">Signature Luxe Events & Amenities</h1>
          <p className="text-[#ded2c4] mt-1">Your Quote Review</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {quote.is_test_quote && (
          <div className="rounded-lg border-2 border-amber-500 bg-amber-100 p-4 text-sm text-amber-950" role="status">
            <p className="font-bold">Test Quote</p>
            <p>This quote is for internal testing only. Responses affect only this test quote.</p>
          </div>
        )}
        {/* Welcome */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-serif font-bold text-[#2d3a47] mb-2">
            Hi {quote.customer_name},
          </h2>
          <p className="text-muted-foreground">
            Thank you for considering Signature Luxe for your luxury restroom rental needs.
            Review your quote details below. When ready, approve, request quote revisions, decline, or send us a question without using your quote link.
          </p>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#2d3a47] mb-4">Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#ded2c4] mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Event Date</div>
                <div className="font-medium">{formatDate(quote.event_date)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#ded2c4] mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Event Time</div>
                <div className="font-medium">
                  {formatTime(quote.event_start_time)} - {formatTime(quote.event_end_time)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#ded2c4] mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium">{eventLocation}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[#ded2c4] mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Guest Count</div>
                <div className="font-medium">{quote.guest_count} guests</div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#ded2c4]/30">
            <div className="text-sm text-muted-foreground mb-1">Event Type</div>
            <div className="font-medium">{quote.event_type}</div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${quote.has_power ? 'bg-green-500' : 'bg-red-400'}`} />
              <span>Power {quote.has_power ? 'Available' : 'Not Available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${quote.has_water ? 'bg-green-500' : 'bg-red-400'}`} />
              <span>Water {quote.has_water ? 'Available' : 'Not Available'}</span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#2d3a47] mb-4">{hasOptions ? 'Choose Your Quote Option' : 'Quote Summary'}</h3>
          {hasOptions && (
            <p className="mb-4 text-sm text-muted-foreground">Select the option you would like to approve. Request Changes and Decline remain available without selecting an option.</p>
          )}
          <div className="space-y-4" role={hasOptions ? 'radiogroup' : undefined} aria-label={hasOptions ? 'Choose your quote option' : undefined}>
            {pricingOptions.map((option) => {
              const selected = selectedOptionId === option.id;
              const hasSalesTax = Number(option.tax_rate || 0) > 0 || Number(option.sales_tax_amount || 0) > 0;
              return (
                <label
                  key={option.id}
                  className={`block rounded-lg border-2 p-4 transition-colors focus-within:ring-2 focus-within:ring-[#2d3a47] focus-within:ring-offset-2 ${
                    hasOptions && selected ? 'border-[#2d3a47] bg-[#f8f5f1]' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {hasOptions && (
                      <input
                        type="radio"
                        name="quote-option"
                        value={option.id}
                        checked={selected}
                        onChange={() => setSelectedOptionId(option.id)}
                        className="mt-1 h-4 w-4 accent-[#2d3a47]"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-[#2d3a47]">{option.option_label}</h4>
                          {option.option_description && <p className="mt-1 text-sm text-muted-foreground">{option.option_description}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {option.is_recommended && (
                            <span className="rounded-full border border-[#2d3a47]/40 bg-[#2d3a47]/10 px-2.5 py-1 text-xs font-semibold text-[#2d3a47]">Recommended</span>
                          )}
                          {hasOptions && selected && (
                            <span className="rounded-full border border-[#2d3a47] bg-[#2d3a47] px-2.5 py-1 text-xs font-semibold text-white">Selected</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        {option.base_price > 0 && <PriceRow label="Base Rental" amount={option.base_price} />}
                        {option.travel_fee > 0 && <PriceRow label="Travel Fee" amount={option.travel_fee} />}
                        {option.utility_fee > 0 && <PriceRow label="Utility Fee (Generator/Water)" amount={option.utility_fee} />}
                        {option.after_hours_fee > 0 && <PriceRow label="After Hours Fee" amount={option.after_hours_fee} />}
                        {option.cleaning_fee > 0 && <PriceRow label="Cleaning Fee" amount={option.cleaning_fee} />}
                        {option.damage_waiver_fee > 0 && <PriceRow label="Damage Waiver" amount={option.damage_waiver_fee} />}
                        {option.rush_booking_fee > 0 && <PriceRow label="Rush Booking Fee" amount={option.rush_booking_fee} />}
                        {option.discount_amount > 0 && <PriceRow label="Discount" amount={option.discount_amount} isDiscount />}
                        <PriceRow label="Service Subtotal" amount={option.subtotal || 0} />
                        {hasSalesTax && <PriceRow label="Pretax Total" amount={option.pretax_total || 0} />}
                        {hasSalesTax && (
                          <PriceRow
                            label={`Michigan Sales Tax (${((option.tax_rate || 0) * 100).toFixed(0)}%)`}
                            amount={option.sales_tax_amount || 0}
                          />
                        )}
                      </div>

                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="flex justify-between text-lg font-bold text-[#2d3a47]">
                          <span>{hasSalesTax ? 'Total Including Sales Tax' : 'Total'}</span>
                          <span className="whitespace-nowrap">{formatCurrency(option.total_price || 0)}</span>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg bg-[#2d3a47]/5 p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Deposit Required{option.deposit_percentage > 0 ? ` (${option.deposit_percentage.toFixed(0)}%)` : ''}</span>
                          <span className="whitespace-nowrap font-semibold">{formatCurrency(option.deposit_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Balance Due at Event</span>
                          <span className="whitespace-nowrap">{formatCurrency(option.final_balance || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          {pricingOptions.some((option) => Number(option.tax_rate || 0) > 0 || Number(option.sales_tax_amount || 0) > 0) && (
            <p className="mt-4 rounded-lg bg-[#2d3a47]/5 p-3 text-sm text-[#2d3a47]">
              Michigan sales tax is calculated at 6% and is included in the total shown.
            </p>
          )}
        </div>

        {/* Customer Notes */}
        {quote.customer_notes && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#2d3a47] mb-2">Notes for You</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{quote.customer_notes}</p>
          </div>
        )}

        {/* Response Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#2d3a47] mb-2">Your Response</h3>
          <p className="text-muted-foreground mb-4">
            Review your quote details below. When ready, approve, request quote revisions, decline, or send us a question without using your quote link.
          </p>

          {messageSent && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              Your message has been sent. You can still return to this quote link to approve, request changes, or decline.
            </div>
          )}

          <div className="mb-4 rounded-lg border border-[#d2c2ae] bg-[#f8f5f1] p-4 text-sm text-[#2d3a47]">
            Have a question before approving? Send us a message and your quote link will remain active.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => setResponse('approve')}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                response === 'approve'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CheckCircle className={`w-8 h-8 ${response === 'approve' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="font-medium">Approve Quote</span>
            </button>
            <button
              onClick={() => setResponse('changes')}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                response === 'changes'
                  ? 'border-[#d2c2ae] bg-[#f8f5f1]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageSquare className={`w-8 h-8 ${response === 'changes' ? 'text-[#2d3a47]' : 'text-gray-400'}`} />
              <span className="font-medium">Request Quote Changes</span>
              <span className="text-xs text-muted-foreground text-center">Use this for revised event details, pricing, or options.</span>
            </button>

            <button
              onClick={() => setResponse('message')}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                response === 'message'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <MessageSquare className={`w-8 h-8 ${response === 'message' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="font-medium">Ask a Question</span>
            </button>
            <button
              onClick={() => setResponse('decline')}
              className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                response === 'decline'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <XCircle className={`w-8 h-8 ${response === 'decline' ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="font-medium">Decline Quote</span>
            </button>
          </div>

          {response && (
            <div className="space-y-4">
              <Textarea
                placeholder={
                  response === 'approve'
                    ? 'Any additional comments? (optional)'
                    : response === 'changes'
                    ? 'Please describe the quote changes you would like...'
                    : response === 'message'
                    ? 'Type your question or message here...'
                    : 'Would you like to share why? (optional)'
                }
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitting || ((response === 'changes' || response === 'message') && !comments.trim()) || (response === 'approve' && hasOptions && !selectedOptionId)}
                className="w-full bg-[#2d3a47] hover:bg-[#2d3a47]/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {response === 'message' ? 'Sending...' : 'Submitting...'}
                  </>
                ) : (
                  response === 'message' ? 'Send Message' : 'Submit Response'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Questions? Contact us at info@signatureluxeevents.com</p>
        </div>
      </main>
    </div>
  );
}
