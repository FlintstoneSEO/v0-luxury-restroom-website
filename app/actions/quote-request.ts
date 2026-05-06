"use server"

import { createClient } from "@/lib/supabase/server"

export type QuoteRequestFormState = {
  success: boolean
  message: string
  errors?: {
    name?: string[]
    email?: string[]
    phone?: string[]
    message?: string[]
  }
}

export async function submitQuoteRequest(
  _prevState: QuoteRequestFormState,
  formData: FormData
): Promise<QuoteRequestFormState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const message = formData.get("message") as string

  // Basic validation
  const errors: QuoteRequestFormState["errors"] = {}

  if (!name || name.trim().length < 2) {
    errors.name = ["Please enter your full name"]
  }

  if (!email || !email.includes("@")) {
    errors.email = ["Please enter a valid email address"]
  }

  if (!message || message.trim().length < 10) {
    errors.message = ["Please provide more details about your request (at least 10 characters)"]
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please fix the errors below",
      errors,
    }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.from("quote_requests").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      message: message.trim(),
    })

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        message: "Something went wrong. Please try again or contact us directly.",
      }
    }

    return {
      success: true,
      message: "Thank you! We've received your quote request and will be in touch within 1-2 business days.",
    }
  } catch (error) {
    console.error("Submission error:", error)
    return {
      success: false,
      message: "Something went wrong. Please try again or contact us directly.",
    }
  }
}
