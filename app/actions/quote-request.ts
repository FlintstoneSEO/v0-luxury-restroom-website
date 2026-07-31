"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { QuoteFormData } from "@/lib/types/quote"
import { validateQuoteFormData } from "@/lib/pricing-engine"
import { buildQuoteCalculation } from '@/lib/quotes/build-quote-calculation'
import { Resend } from 'resend'
import { quoteRequestConfirmationTemplate } from '@/lib/email/templates'
import { escapeHtml } from '@/lib/escape-html'
import { getAdminAppOrigin, getPublicSiteOrigin } from '@/lib/app-origins'
import {
  checkEventDateAvailability,
  EVENT_DATE_ALREADY_BOOKED_MESSAGE,
} from '@/lib/availability-server'
import { getMinimumEventDate, isDateOnlyBefore } from '@/lib/date-only'

// Initialize Resend (will gracefully fail if API key not set)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const QUOTE_ACTION_VERSION = "service-role-v2"

export type QuoteRequestFormState = {
  success: boolean
  message: string
  quoteNumber?: string
  errors?: Record<string, string[]>
}

export async function submitQuoteRequest(
  _prevState: QuoteRequestFormState,
  formData: FormData
): Promise<QuoteRequestFormState> {
  const honeypot = String(formData.get('company_website') || '').trim()
  if (honeypot) {
    return {
      success: false,
      message: 'We could not save your quote request right now. Please contact us directly while we resolve this.',
    }
  }

  // Extract all form fields
  const data: QuoteFormData = {
    customer_name: formData.get("customer_name") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    event_date: formData.get("event_date") as string,
    event_type: formData.get("event_type") as string,
    guest_count: parseInt(formData.get("guest_count") as string, 10),
    event_address: formData.get("event_address") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string || 'MI',
    zip_code: formData.get("zip_code") as string,
    event_start_time: formData.get("event_start_time") as string,
    event_end_time: formData.get("event_end_time") as string,
    has_power: formData.get("has_power") === "true",
    has_water: formData.get("has_water") === "true",
    additional_notes: formData.get("additional_notes") as string || undefined,
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log('[quote-request] payload before submit', {
      ...data,
      email: data.email ? '[redacted]' : data.email,
      phone: data.phone ? '[redacted]' : data.phone,
    })
  }

  // Validation
  const errors = validateQuoteFormData(data)
  if (
    data.event_date &&
    isDateOnlyBefore(data.event_date, getMinimumEventDate())
  ) {
    errors.event_date = ['Please select a date at least 7 days from today']
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors,
    }
  }

  try {
    console.log('[quote-request] action version', QUOTE_ACTION_VERSION)

    // Insert quote request with server-only service role client (bypasses anon RLS)
    let supabaseAdmin

    try {
      supabaseAdmin = createAdminClient()
    } catch (error) {
      if (error instanceof Error && error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        console.error('[quote-request] Missing server env var: SUPABASE_SERVICE_ROLE_KEY')
      } else {
        console.error('[quote-request] Failed to create admin client', error)
      }

      return {
        success: false,
        message: 'We could not save your quote request right now. Please contact us directly while we resolve this.',
      }
    }

    const initialAvailability = await checkEventDateAvailability(
      supabaseAdmin,
      data.event_date,
    )
    if (!initialAvailability.available) {
      return {
        success: false,
        message: EVENT_DATE_ALREADY_BOOKED_MESSAGE,
        errors: { event_date: [EVENT_DATE_ALREADY_BOOKED_MESSAGE] },
      }
    }

    const { distanceMiles, priceBreakdown, distanceCalculationStatus, distanceCalculationMessage } = await buildQuoteCalculation(data)

    const normalizedEmail = data.email.trim().toLowerCase()
    const normalizedAddress = data.event_address.trim()
    const duplicateAddressKey = normalizedAddress.toLowerCase()
    const duplicateWindowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data: recentDuplicate, error: duplicateError } = await supabaseAdmin
      .from('quote_requests')
      .select('id, event_address')
      .eq('email', normalizedEmail)
      .eq('event_date', data.event_date)
      .gte('created_at', duplicateWindowStart)
      .limit(10)

    if (duplicateError) {
      console.error('[quote-request] duplicate detection failed', duplicateError)
    }

    if (recentDuplicate?.some((quote) => String(quote.event_address || '').trim().toLowerCase() === duplicateAddressKey)) {
      return {
        success: false,
        message: 'We already received a matching quote request. Please wait a few minutes before submitting again.',
      }
    }

    const needsManualDistanceReview = distanceCalculationStatus === 'fallback'

    const finalAvailability = await checkEventDateAvailability(
      supabaseAdmin,
      data.event_date,
    )
    if (!finalAvailability.available) {
      return {
        success: false,
        message: EVENT_DATE_ALREADY_BOOKED_MESSAGE,
        errors: { event_date: [EVENT_DATE_ALREADY_BOOKED_MESSAGE] },
      }
    }

    const { data: insertedQuote, error } = await supabaseAdmin
      .from("quote_requests")
      .insert({
        customer_name: data.customer_name.trim(),
        phone: data.phone.trim(),
        email: normalizedEmail,
        event_date: data.event_date,
        event_type: data.event_type,
        guest_count: data.guest_count,
        event_address: normalizedAddress,
        city: data.city.trim(),
        state: data.state,
        zip_code: data.zip_code.trim(),
        event_start_time: data.event_start_time,
        event_end_time: data.event_end_time,
        has_power: data.has_power,
        has_water: data.has_water,
        additional_notes: data.additional_notes?.trim() || null,
        distance_miles: distanceMiles,
        base_price: priceBreakdown.base_price,
        travel_fee: priceBreakdown.travel_fee,
        utility_fee: priceBreakdown.utility_fee,
        after_hours_fee: priceBreakdown.after_hours_fee,
        cleaning_fee: priceBreakdown.cleaning_fee,
        damage_waiver_fee: priceBreakdown.damage_waiver_fee,
        rush_booking_fee: priceBreakdown.rush_booking_fee,
        subtotal: priceBreakdown.subtotal,
        discount_amount: priceBreakdown.discount_amount,
        pretax_total: priceBreakdown.pretax_total,
        taxable_amount: priceBreakdown.taxable_amount,
        tax_rate: priceBreakdown.tax_rate,
        sales_tax_amount: priceBreakdown.sales_tax_amount,
        total_price: priceBreakdown.total_price,
        deposit_percentage: priceBreakdown.deposit_percentage,
        status: "pending_review",
        deposit_amount: priceBreakdown.deposit_amount,
        deposit_status: "due",
        final_balance: priceBreakdown.final_balance,
        agreement_status: "not_sent",
        calculated_breakdown: priceBreakdown,
        needs_manual_distance_review: needsManualDistanceReview,
      })
      .select('id, quote_number')
      .single()
    if (process.env.NODE_ENV !== 'production') {
      console.log('[quote-request] database insert response', {
        hasError: !!error,
        errorCode: error?.code,
        insertedQuoteId: insertedQuote?.id,
        quoteNumber: insertedQuote?.quote_number,
      })
    }

    if (error) {
      if (
        error.code === 'P0001' &&
        error.message.includes('EVENT_DATE_ALREADY_BOOKED')
      ) {
        return {
          success: false,
          message: EVENT_DATE_ALREADY_BOOKED_MESSAGE,
          errors: { event_date: [EVENT_DATE_ALREADY_BOOKED_MESSAGE] },
        }
      }
      console.error("[quote-request] insert error", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })

      if (error.code === '42501') {
        console.error('[quote-request] RLS blocked insert. Confirm service role key is configured in production.')
      }
      
      // Return more specific error for debugging
      return {
        success: false,
        message: process.env.NODE_ENV === 'development' 
          ? `Database error: ${error.message}` 
          : "We could not save your quote request right now. Please contact us directly while we resolve this.",
      }
    }

    // Send email notification
    if (resend) {
      try {
        const adminAppOrigin = getAdminAppOrigin()
        const publicSiteOrigin = getPublicSiteOrigin()
        const adminQuoteUrl = `${adminAppOrigin}/admin/quotes/${insertedQuote?.id}`
        const adminDashboardUrl = `${adminAppOrigin}/admin`

        const safeQuoteNumber = escapeHtml(insertedQuote?.quote_number || 'Pending')
        const safeCustomerName = escapeHtml(data.customer_name)
        const safeEmail = escapeHtml(data.email)
        const safePhone = escapeHtml(data.phone)
        const safeEventDate = escapeHtml(data.event_date)
        const safeEventType = escapeHtml(data.event_type)
        const safeStartTime = escapeHtml(data.event_start_time)
        const safeEndTime = escapeHtml(data.event_end_time)
        const safeEventAddress = escapeHtml(data.event_address)
        const safeCity = escapeHtml(data.city)
        const safeState = escapeHtml(data.state)
        const safeZipCode = escapeHtml(data.zip_code)
        const safeDistanceMessage = distanceCalculationMessage ? escapeHtml(distanceCalculationMessage) : ''
        const safeAdditionalNotes = data.additional_notes ? escapeHtml(data.additional_notes) : ''
        const safeAdminQuoteUrl = escapeHtml(adminQuoteUrl)
        const safeAdminDashboardUrl = escapeHtml(adminDashboardUrl)

        await resend.emails.send({
          from: 'Signature Luxe Events & Amenities <info@signatureluxeevents.com>',
          replyTo: 'info@signatureluxeevents.com',
          to: 'info@signatureluxeevents.com',
          subject: `New Quote Request: ${insertedQuote?.quote_number} - ${data.customer_name}`,
          html: `
            <h2>New Quote Request Received</h2>
            <p><strong>Quote Number:</strong> ${safeQuoteNumber}</p>
            <hr />
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${safeCustomerName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
            <hr />
            <h3>Event Details</h3>
            <p><strong>Date:</strong> ${safeEventDate}</p>
            <p><strong>Type:</strong> ${safeEventType}</p>
            <p><strong>Guest Count:</strong> ${data.guest_count}</p>
            <p><strong>Time:</strong> ${safeStartTime} - ${safeEndTime}</p>
            <hr />
            <h3>Location</h3>
            <p><strong>Address:</strong> ${safeEventAddress}</p>
            <p><strong>City:</strong> ${safeCity}, ${safeState} ${safeZipCode}</p>
            <p><strong>Calculated Driving Distance:</strong> ${distanceMiles.toFixed(1)} miles</p>
            ${distanceCalculationStatus === 'fallback' ? `<p><strong>Distance Notice:</strong> ${safeDistanceMessage}</p>` : ''}
            <hr />
            <h3>Site Utilities</h3>
            <p><strong>Power Available:</strong> ${data.has_power ? 'Yes' : 'No'}</p>
            <p><strong>Water Available:</strong> ${data.has_water ? 'Yes' : 'No'}</p>
            ${data.additional_notes ? `<p><strong>Additional Notes:</strong> ${safeAdditionalNotes}</p>` : ''}
            <hr />
            <h3>Calculated Pricing</h3>
            <p><strong>Base Price:</strong> $${priceBreakdown.base_price.toFixed(2)}</p>
            ${priceBreakdown.travel_fee > 0 ? `<p><strong>Travel Fee:</strong> $${priceBreakdown.travel_fee.toFixed(2)}</p>` : ''}
            ${priceBreakdown.utility_fee > 0 ? `<p><strong>Utility Fee:</strong> $${priceBreakdown.utility_fee.toFixed(2)}</p>` : ''}
            ${priceBreakdown.after_hours_fee > 0 ? `<p><strong>After Hours Fee:</strong> $${priceBreakdown.after_hours_fee.toFixed(2)}</p>` : ''}
            <p><strong>Service Subtotal:</strong> $${priceBreakdown.subtotal.toFixed(2)}</p>
            <p><strong>Michigan Sales Tax (${(priceBreakdown.tax_rate * 100).toFixed(0)}%):</strong> $${priceBreakdown.sales_tax_amount.toFixed(2)}</p>
            <p><strong>Total Including Sales Tax:</strong> $${priceBreakdown.total_price.toFixed(2)}</p>
            <p><strong>Deposit (${priceBreakdown.deposit_percentage.toFixed(0)}%):</strong> $${priceBreakdown.deposit_amount.toFixed(2)}</p>
            <p><strong>Final Balance:</strong> $${priceBreakdown.final_balance.toFixed(2)}</p>
            <hr />
            <h3>Admin Links</h3>
            <p><a href="${safeAdminQuoteUrl}" target="_blank" rel="noopener noreferrer">Open this quote request</a></p>
            <p><a href="${safeAdminDashboardUrl}" target="_blank" rel="noopener noreferrer">Open admin dashboard</a></p>
          `,
        })

        const customerConfirmation = quoteRequestConfirmationTemplate({
          customerName: data.customer_name,
          quoteNumber: insertedQuote?.quote_number || 'Pending',
          eventDate: data.event_date,
          eventLocation: `${data.city}, ${data.state}`,
          businessPhoneDisplay: '(517) 295-0107',
          businessPhoneHref: '+15172950107',
          contactUrl: `${publicSiteOrigin}/contact`,
        })


        await resend.emails.send({
          from: 'Signature Luxe Events & Amenities <info@signatureluxeevents.com>',
          replyTo: 'info@signatureluxeevents.com',
          to: data.email.trim().toLowerCase(),
          subject: `We received your quote request (${insertedQuote?.quote_number})`,
          html: customerConfirmation.html,
          text: customerConfirmation.text,
        })
      } catch (emailError) {
        console.error('[v0] Email error (non-fatal):', emailError)
        // Don't fail the whole request if email fails
      }
    }

    return {
      success: true,
      message: "Thank you! Your quote request has been submitted successfully.",
      quoteNumber: insertedQuote?.quote_number,
    }
  } catch (error) {
    console.error("Submission error:", error)
    return {
      success: false,
      message: "We could not save your quote request right now. Please contact us directly while we resolve this.",
    }
  }
}
