'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { submitQuoteRequest, QuoteRequestFormState } from '@/app/actions/quote-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, User, Calendar, MapPin, Clock, Zap } from 'lucide-react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { EVENT_TYPES } from '@/lib/types/quote';
import { AvailabilityDatePicker } from '@/components/availability-date-picker';

const initialState: QuoteRequestFormState = {
  success: false,
  message: '',
};

interface QuoteRequestFormProps {
  onSuccess?: (quoteNumber: string) => void;
}

export default function QuoteRequestForm({ onSuccess }: QuoteRequestFormProps) {
  const [state, formAction, isPending] = useActionState(submitQuoteRequest, initialState);
  const [hasPower, setHasPower] = useState<string>('');
  const [hasWater, setHasWater] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('MI');
  const [zipCode, setZipCode] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: mapsLoaded, loadError: mapsLoadError } = useJsApiLoader({
    id: 'google-places-script',
    googleMapsApiKey: mapsApiKey,
    libraries: ['places'],
  });

  useEffect(() => {
    if (state.success && state.quoteNumber && onSuccess) {
      onSuccess(state.quoteNumber);
    }
  }, [state.success, state.quoteNumber, onSuccess]);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.address_components) return;

    let streetNumber = '';
    let route = '';
    let locality = '';
    let region = '';
    let postal = '';

    place.address_components.forEach((component) => {
      const types = component.types;
      if (types.includes('street_number')) streetNumber = component.long_name;
      if (types.includes('route')) route = component.long_name;
      if (types.includes('locality')) locality = component.long_name;
      if (types.includes('administrative_area_level_1')) region = component.short_name;
      if (types.includes('postal_code')) postal = component.long_name;
    });

    const streetAddress = [streetNumber, route].filter(Boolean).join(' ').trim();
    if (streetAddress) setAddress(streetAddress);
    if (locality) setCity(locality);
    if (region) setStateCode(region);
    if (postal) setZipCode(postal);
  };

  if (state.success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 ring-4 ring-gold/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-serif font-semibold text-navy mb-2">
          Quote Request Received!
        </h3>
        {state.quoteNumber && (
          <p className="text-lg font-medium text-gold-text mb-4">
            Quote Number: {state.quoteNumber}
          </p>
        )}
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for your interest in Signature Luxe. We&apos;ll review your event details and send
          you a custom proposal within 1-2 business days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {state.message && !state.success && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{state.message}</p>
        </div>
      )}

      {/* Section 1: Contact Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gold/30">
          <span className='rounded-full bg-gold/30 p-2'><User className="h-7 w-7 text-gold-text" /></span>
          <h3 className="text-lg font-semibold text-navy">Contact Information</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="customer_name">Full Name *</FieldLabel>
            <Input
              id="customer_name"
              name="customer_name"
              required
              placeholder="John Smith"
            />
            {state.errors?.customer_name && (
              <p className="text-sm text-red-600 mt-1">{state.errors.customer_name[0]}</p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="(555) 555-5555"
            />
            {state.errors?.phone && (
              <p className="text-sm text-red-600 mt-1">{state.errors.phone[0]}</p>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email Address *</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
          {state.errors?.email && (
            <p className="text-sm text-red-600 mt-1">{state.errors.email[0]}</p>
          )}
        </Field>
      </div>

      {/* Section 2: Event Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gold/30">
          <span className='rounded-full bg-gold/30 p-2'><Calendar className="h-7 w-7 text-gold-text" /></span>
          <h3 className="text-lg font-semibold text-navy">Event Details</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="event_date">Event Date *</FieldLabel>
            <AvailabilityDatePicker
              name="event_date"
              error={state.errors?.event_date?.[0]}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event_type">Event Type *</FieldLabel>
            <input type="hidden" name="event_type" value={eventType} />
            <Select name="event_type" required value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.event_type && (
              <p className="text-sm text-red-600 mt-1">{state.errors.event_type[0]}</p>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="guest_count">Expected Number of Guests *</FieldLabel>
          <Input
            id="guest_count"
            name="guest_count"
            type="number"
            required
            min="1"
            placeholder="e.g., 150"
          />
          {state.errors?.guest_count && (
            <p className="text-sm text-red-600 mt-1">{state.errors.guest_count[0]}</p>
          )}
        </Field>
      </div>

      {/* Section 3: Event Location */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gold/30">
          <span className='rounded-full bg-gold/30 p-2'><MapPin className="h-7 w-7 text-gold-text" /></span>
          <h3 className="text-lg font-semibold text-navy">Event Location</h3>
        </div>
        
        <Field>
          <FieldLabel htmlFor="event_address">Street Address *</FieldLabel>
          {mapsApiKey && mapsLoaded && !mapsLoadError ? (
          // TODO: Migrate to Google's PlaceAutocompleteElement once the preferred React integration is finalized.
          <Autocomplete
            onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
            onPlaceChanged={handlePlaceChanged}
            options={{ componentRestrictions: { country: 'us' }, fields: ['address_components'], types: ['address'] }}
          >
            <Input
            id="event_address"
            name="event_address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main Street"
          />
          </Autocomplete>
        ) : (
          <Input
            id="event_address"
            name="event_address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main Street"
          />
        )}
        {(!mapsApiKey || mapsLoadError) && (
          <p className='mt-2 text-xs text-charcoal/70'>Address autocomplete is unavailable right now. Please enter address details manually.</p>
        )}
          {state.errors?.event_address && (
            <p className="text-sm text-red-600 mt-1">{state.errors.event_address[0]}</p>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="city">City *</FieldLabel>
            <Input
              id="city"
              name="city"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Detroit"
            />
            {state.errors?.city && (
              <p className="text-sm text-red-600 mt-1">{state.errors.city[0]}</p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input
              id="state"
              name="state"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              placeholder="MI"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip_code">ZIP Code *</FieldLabel>
            <Input
              id="zip_code"
              name="zip_code"
              required
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="48000"
            />
            {state.errors?.zip_code && (
              <p className="text-sm text-red-600 mt-1">{state.errors.zip_code[0]}</p>
            )}
          </Field>
        </div>
      </div>

      {/* Section 4: Event Timing */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gold/30">
          <span className='rounded-full bg-gold/30 p-2'><Clock className="h-7 w-7 text-gold-text" /></span>
          <h3 className="text-lg font-semibold text-navy">Event Timing</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="event_start_time">Start Time *</FieldLabel>
            <Input 
              id="event_start_time" 
              name="event_start_time" 
              type="time" 
              required 
            />
            {state.errors?.event_start_time && (
              <p className="text-sm text-red-600 mt-1">{state.errors.event_start_time[0]}</p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="event_end_time">End Time *</FieldLabel>
            <Input 
              id="event_end_time" 
              name="event_end_time" 
              type="time" 
              required 
            />
            {state.errors?.event_end_time && (
              <p className="text-sm text-red-600 mt-1">{state.errors.event_end_time[0]}</p>
            )}
          </Field>
        </div>
        <p className="text-sm text-muted-foreground">
          Note: Events extending past 10:00 PM may incur after-hours fees.
        </p>
      </div>

      {/* Section 5: Site Utilities */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gold/30">
          <span className='rounded-full bg-gold/30 p-2'><Zap className="h-7 w-7 text-gold-text" /></span>
          <h3 className="text-lg font-semibold text-navy">Site Utilities</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="has_power">
              Is power available within 100 feet? *
            </FieldLabel>
            <input type="hidden" name="has_power" value={hasPower} />
            <Select 
              name="has_power" 
              required 
              value={hasPower} 
              onValueChange={setHasPower}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No (generator required)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="has_water">
              Is water available within 100 feet? *
            </FieldLabel>
            <input type="hidden" name="has_water" value={hasWater} />
            <Select 
              name="has_water" 
              required 
              value={hasWater} 
              onValueChange={setHasWater}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No (water service required)</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <p className="text-sm text-muted-foreground">
          If utilities are not available on-site, additional fees may apply for generator and/or water service.
        </p>
      </div>

      {/* Section 6: Additional Notes */}
      <div className="space-y-4">
        <Field>
          <FieldLabel htmlFor="additional_notes">
            Additional Notes or Special Requests
          </FieldLabel>
          <Textarea
            id="additional_notes"
            name="additional_notes"
            rows={4}
            placeholder="Share any additional details about your event, venue access, special requirements..."
          />
        </Field>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-navy hover:bg-navy/90 text-white border border-gold/30 shadow-sm text-base font-semibold"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Spinner className="mr-2" />
            Submitting Request...
          </>
        ) : (
          'Request Quote'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        By submitting this form, you agree to be contacted regarding your inquiry.
        <br />
        <span className="text-xs">* Required fields</span>
      </p>
    </form>
  );
}
