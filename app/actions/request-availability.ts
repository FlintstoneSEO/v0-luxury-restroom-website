'use server';

import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { calculateQuotePrice, formatCurrency } from '@/lib/pricing-engine';

export interface RequestAvailabilityState {
  success: boolean;
  message: string;
  quoteNumber?: string;
  errors?: Record<string, string[]>;
}

// Initialize Resend (will gracefully fail if API key not set)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Base location for distance calculation (Signature Luxe headquarters)
const BASE_LOCATION = {
  lat: 42.4855,  // Example: Somewhere in Michigan
  lng: -83.3753,
};

// Simple distance estimation based on ZIP code (rough Michigan ZIP zones)
function estimateDistanceFromZip(zipCode: string): number {
  const zip = parseInt(zipCode?.slice(0, 3) || '0', 10);
  
  // Michigan ZIP code ranges and approximate distances from base
  if (zip >= 480 && zip <= 489) return 25;  // Detroit metro area
  if (zip >= 490 && zip <= 499) return 60;  // Western Michigan
  if (zip >= 486 && zip <= 487) return 80;  // Northern Lower Michigan
  if (zip >= 496 && zip <= 499) return 120; // Upper Peninsula
  
  return 40; // Default for unknown/out of state
}

// Parse address to extract city, state, zip
function parseAddress(address: string): { city: string; state: string; zipCode: string } {
  // Try to extract ZIP code
  const zipMatch = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  const zipCode = zipMatch ? zipMatch[1] : '';
  
  // Try to extract state (MI, Michigan, etc.)
  const stateMatch = address.match(/\b(MI|Michigan)\b/i);
  const state = stateMatch ? 'MI' : 'MI'; // Default to MI
  
  // Try to extract city (word before state or comma-separated)
  const cityMatch = address.match(/([A-Za-z\s]+),\s*(MI|Michigan)/i);
  const city = cityMatch ? cityMatch[1].trim() : 'Unknown';
  
  return { city, state, zipCode };
}

export async function submitRequestAvailability(
  prevState: RequestAvailabilityState,
  formData: FormData
): Promise<RequestAvailabilityState> {
  try {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const eventDate = formData.get('eventDate') as string;
    const eventType = formData.get('eventType') as string;
    const location = formData.get('location') as string;
    const guestCountStr = formData.get('guestCount') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const powerAvailable = formData.get('powerAvailable') as string;
    const waterAvailable = formData.get('waterAvailable') as string;
    const details = formData.get('details') as string;

    // Basic validation
    const errors: Record<string, string[]> = {};
    if (!firstName?.trim()) errors.firstName = ['First name is required'];
    if (!lastName?.trim()) errors.lastName = ['Last name is required'];
    if (!phone?.trim()) errors.phone = ['Phone number is required'];
    if (!email?.trim()) errors.email = ['Email is required'];
    if (!eventDate?.trim()) errors.eventDate = ['Event date is required'];
    if (!eventType?.trim()) errors.eventType = ['Event type is required'];
    if (!location?.trim()) errors.location = ['Location is required'];

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Please fill in all required fields.',
        errors,
      };
    }

    const supabase = await createClient();

    // Parse location for city, state, zip
    const { city, state, zipCode } = parseAddress(location);
    
    // Estimate distance and calculate pricing
    const guestCount = guestCountStr ? parseInt(guestCountStr, 10) : 100; // Default to 100 guests
    const distanceMiles = estimateDistanceFromZip(zipCode);
    const hasPower = powerAvailable === 'yes';
    const hasWater = waterAvailable === 'yes';
    const eventEndTime = endTime || '22:00'; // Default to 10 PM if not specified
    
    // Calculate the quote price
    const priceBreakdown = calculateQuotePrice(
      guestCount,
      distanceMiles,
      hasPower,
      hasWater,
      eventEndTime
    );

    // Insert into availability_requests table
    const { data: availabilityRequest, error: availabilityError } = await supabase
      .from('availability_requests')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        event_date: eventDate,
        event_type: eventType,
        location: location.trim(),
        guest_count: guestCount,
        start_time: startTime || null,
        end_time: endTime || null,
        power_available: powerAvailable || null,
        water_available: waterAvailable || null,
        details: details?.trim() || null,
      })
      .select()
      .single();

    if (availabilityError) {
      console.error('[v0] Availability request error:', availabilityError);
      return {
        success: false,
        message: 'Failed to submit request. Please try again.',
      };
    }

    // Now create the quote in quote_requests table
    const { data: quoteRequest, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        customer_name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        email: email.trim(),
        event_date: eventDate,
        event_type: eventType,
        guest_count: guestCount,
        event_address: location.trim(),
        city: city,
        state: state,
        zip_code: zipCode,
        event_start_time: startTime || '12:00',
        event_end_time: eventEndTime,
        has_power: hasPower,
        has_water: hasWater,
        additional_notes: details?.trim() || null,
        distance_miles: distanceMiles,
        base_price: priceBreakdown.base_price,
        travel_fee: priceBreakdown.travel_fee,
        utility_fee: priceBreakdown.utility_fee,
        after_hours_fee: priceBreakdown.after_hours_fee,
        total_price: priceBreakdown.total_price,
        deposit_amount: priceBreakdown.deposit_amount,
        final_balance: priceBreakdown.final_balance,
        calculated_breakdown: priceBreakdown,
        status: 'pending',
      })
      .select('quote_number')
      .single();

    if (quoteError) {
      console.error('[v0] Quote creation error:', quoteError);
      // Don't fail the whole request - availability was saved
    }

    const quoteNumber = quoteRequest?.quote_number || 'N/A';

    // Send email notification with quote details
    if (resend) {
      try {
        await resend.emails.send({
          from: 'noreply@resend.dev',
          replyTo: 'info@signatureluxeevents.com',
          to: 'info@signatureluxeevents.com',
          subject: `New Quote Request ${quoteNumber} - ${firstName} ${lastName}`,
          html: `
            <h2>New Quote Request Received</h2>
            <p><strong>Quote Number:</strong> ${quoteNumber}</p>
            <hr />
            
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <hr />
            
            <h3>Event Details</h3>
            <p><strong>Event Date:</strong> ${eventDate}</p>
            <p><strong>Event Type:</strong> ${eventType}</p>
            <p><strong>Guest Count:</strong> ${guestCount}</p>
            <p><strong>Start Time:</strong> ${startTime || 'Not specified'}</p>
            <p><strong>End Time:</strong> ${endTime || 'Not specified'}</p>
            <hr />
            
            <h3>Location</h3>
            <p><strong>Address:</strong> ${location}</p>
            <p><strong>Estimated Distance:</strong> ${distanceMiles} miles</p>
            <hr />
            
            <h3>Site Utilities</h3>
            <p><strong>Power Available:</strong> ${powerAvailable || 'Not specified'}</p>
            <p><strong>Water Available:</strong> ${waterAvailable || 'Not specified'}</p>
            ${details ? `<p><strong>Additional Details:</strong> ${details}</p>` : ''}
            <hr />
            
            <h3 style="color: #b45309;">Calculated Quote</h3>
            <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">Base Price (${priceBreakdown.details.guest_tier})</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatCurrency(priceBreakdown.base_price)}</td>
              </tr>
              ${priceBreakdown.travel_fee > 0 ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">Travel Fee (${priceBreakdown.details.extra_miles} extra miles)</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatCurrency(priceBreakdown.travel_fee)}</td>
              </tr>
              ` : ''}
              ${priceBreakdown.utility_fee > 0 ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">Utility Fee ${priceBreakdown.details.generator_needed ? '(Generator)' : ''} ${priceBreakdown.details.water_needed ? '(Water)' : ''}</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatCurrency(priceBreakdown.utility_fee)}</td>
              </tr>
              ` : ''}
              ${priceBreakdown.after_hours_fee > 0 ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">After Hours Fee (${priceBreakdown.details.after_hours_count} hrs)</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatCurrency(priceBreakdown.after_hours_fee)}</td>
              </tr>
              ` : ''}
              <tr style="font-weight: bold; background-color: #fef3c7;">
                <td style="padding: 8px; border-bottom: 2px solid #b45309;">Total Price</td>
                <td style="padding: 8px; border-bottom: 2px solid #b45309; text-align: right;">${formatCurrency(priceBreakdown.total_price)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5;">Deposit (25%)</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatCurrency(priceBreakdown.deposit_amount)}</td>
              </tr>
              <tr>
                <td style="padding: 8px;">Balance Due</td>
                <td style="padding: 8px; text-align: right;">${formatCurrency(priceBreakdown.final_balance)}</td>
              </tr>
            </table>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              <em>Note: This is an automated quote estimate. Final pricing may vary based on site visit and additional requirements.</em>
            </p>
          `,
        });
      } catch (emailError) {
        console.error('[v0] Email error (non-fatal):', emailError);
        // Don't fail the whole request if email fails
      }
    }

    return {
      success: true,
      message: 'Request submitted successfully! Your custom quote has been generated.',
      quoteNumber: quoteNumber,
    };
  } catch (error) {
    console.error('[v0] Unexpected error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
