'use server';

import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export interface RequestAvailabilityState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// Initialize Resend (will gracefully fail if API key not set)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
    const guestCount = formData.get('guestCount') as string;
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

    // Insert into availability_requests table
    const { error: dbError } = await supabase.from('availability_requests').insert({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      event_date: eventDate,
      event_type: eventType,
      location: location.trim(),
      guest_count: guestCount ? parseInt(guestCount, 10) : null,
      start_time: startTime || null,
      end_time: endTime || null,
      power_available: powerAvailable || null,
      water_available: waterAvailable || null,
      details: details?.trim() || null,
    });

    if (dbError) {
      console.error('[v0] Database error:', dbError);
      return {
        success: false,
        message: 'Failed to submit request. Please try again.',
      };
    }

    // Send email notification
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Signature Luxe <noreply@signatureluxeevents.com>',
          to: 'info@signatureluxeevents.com',
          subject: `New Availability Request from ${firstName} ${lastName}`,
          html: `
            <h2>New Availability Request</h2>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Event Date:</strong> ${eventDate}</p>
            <p><strong>Event Type:</strong> ${eventType}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Guest Count:</strong> ${guestCount || 'Not specified'}</p>
            <p><strong>Start Time:</strong> ${startTime || 'Not specified'}</p>
            <p><strong>End Time:</strong> ${endTime || 'Not specified'}</p>
            <p><strong>Power Available:</strong> ${powerAvailable || 'Not specified'}</p>
            <p><strong>Water Available:</strong> ${waterAvailable || 'Not specified'}</p>
            <p><strong>Additional Details:</strong></p>
            <p>${details || 'None provided'}</p>
          `,
        });
      } catch (emailError) {
        console.error('[v0] Email error (non-fatal):', emailError);
        // Don't fail the whole request if email fails
      }
    }

    return {
      success: true,
      message: 'Request submitted successfully!',
    };
  } catch (error) {
    console.error('[v0] Unexpected error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
