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
  deposit_amount?: number;
  final_balance?: number;
  customer_notes?: string;
  status: string;
  created_at: string;
}

interface QuoteApprovalClientProps {
  quote: Quote;
  token: string;
  alreadyResponded: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
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

export default function QuoteApprovalClient({ quote, token, alreadyResponded }: QuoteApprovalClientProps) {
  const [response, setResponse] = useState<'approve' | 'changes' | 'decline' | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyResponded);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!response) return;

    if (response === 'changes' && !comments.trim()) {
      setError('Please provide details for requested changes.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/quote/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_type: response === 'approve' ? 'approved' : response === 'changes' ? 'change_requested' : 'declined',
          comments: comments.trim() || undefined,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || 'Failed to submit response');
      }

      setSubmitted(true);
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
            href="/"
            className="inline-block bg-[#2d3a47] text-white px-6 py-3 rounded-md hover:bg-[#2d3a47]/90 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const eventLocation = `${quote.event_address}, ${quote.city}, ${quote.state} ${quote.zip_code}`;

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
        {/* Welcome */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-serif font-bold text-[#2d3a47] mb-2">
            Hi {quote.customer_name},
          </h2>
          <p className="text-muted-foreground">
            Thank you for considering Signature Luxe for your luxury restroom rental needs.
            Please review the details below and let us know how you&apos;d like to proceed.
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
          <h3 className="text-lg font-semibold text-[#2d3a47] mb-4">Quote Summary</h3>
          <div className="space-y-2 text-sm">
            {(quote.base_price ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Base Rental</span>
                <span>{formatCurrency(quote.base_price || 0)}</span>
              </div>
            )}
            {(quote.travel_fee ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Travel Fee</span>
                <span>{formatCurrency(quote.travel_fee || 0)}</span>
              </div>
            )}
            {(quote.utility_fee ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Utility Fee (Generator/Water)</span>
                <span>{formatCurrency(quote.utility_fee || 0)}</span>
              </div>
            )}
            {(quote.after_hours_fee ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>After Hours Fee</span>
                <span>{formatCurrency(quote.after_hours_fee || 0)}</span>
              </div>
            )}
            {(quote.cleaning_fee ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Cleaning Fee</span>
                <span>{formatCurrency(quote.cleaning_fee || 0)}</span>
              </div>
            )}
            {(quote.damage_waiver_fee ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Damage Waiver</span>
                <span>{formatCurrency(quote.damage_waiver_fee || 0)}</span>
              </div>
            )}
            {(quote.rush_booking_fee ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>Rush Booking Fee</span>
                <span>{formatCurrency(quote.rush_booking_fee || 0)}</span>
              </div>
            )}
            {(quote.discount_amount ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(quote.discount_amount || 0)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-lg font-bold text-[#2d3a47]">
              <span>Total</span>
              <span>{formatCurrency(quote.total_price || 0)}</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#2d3a47]/5 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Deposit Required</span>
              <span className="font-semibold">{formatCurrency(quote.deposit_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Balance Due at Event</span>
              <span>{formatCurrency(quote.final_balance || 0)}</span>
            </div>
          </div>
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
          <h3 className="text-lg font-semibold text-[#2d3a47] mb-4">Your Response</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
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
              <span className="font-medium">Request Changes</span>
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
                    ? 'Please describe the changes you would like...'
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
                disabled={submitting || (response === 'changes' && !comments.trim())}
                className="w-full bg-[#2d3a47] hover:bg-[#2d3a47]/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Response'
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
