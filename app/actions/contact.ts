'use server';

import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export interface ContactFormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// Initialize Resend (will gracefully fail if API key not set)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    // Basic validation
    const errors: Record<string, string[]> = {};
    if (!name?.trim()) errors.name = ['Name is required'];
    if (!email?.trim()) errors.email = ['Email is required'];
    if (!subject?.trim()) errors.subject = ['Subject is required'];
    if (!message?.trim()) errors.message = ['Message is required'];

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: 'Please fill in all required fields.',
        errors,
      };
    }

    const supabase = await createClient();

    // Insert into contact_submissions table
    const { error: dbError } = await supabase.from('contact_submissions').insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
    });

    if (dbError) {
      console.error('[v0] Database error:', dbError);
      return {
        success: false,
        message: 'Failed to submit message. Please try again.',
      };
    }

    // Send email notification
    if (resend) {
      try {
        await resend.emails.send({
          from:
            process.env.EMAIL_FROM ??
            'Signature Luxe <notifications@signatureluxeevents.com>',
          replyTo: email,
          to: 'info@signatureluxeevents.com',
          subject: `Contact Form: ${subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        });
      } catch (emailError) {
        console.error('[v0] Email error (non-fatal):', emailError);
        // Don't fail the whole request if email fails
      }
    }

    return {
      success: true,
      message: 'Message sent successfully!',
    };
  } catch (error) {
    console.error('[v0] Unexpected error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
