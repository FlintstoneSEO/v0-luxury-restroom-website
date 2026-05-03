"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle } from "lucide-react"

const eventTypes = [
  { value: "wedding", label: "Wedding" },
  { value: "private-party", label: "Private Party" },
  { value: "corporate-event", label: "Corporate Event" },
  { value: "festival", label: "Festival / Community Event" },
  { value: "construction", label: "Construction / Long-Term" },
  { value: "disaster-relief", label: "Disaster Relief / Government" },
  { value: "other", label: "Other" },
]

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not-sure", label: "Not Sure" },
]

export function RequestAvailabilityForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Connect to Supabase database
    // TODO: Send email notification
    // TODO: Trigger admin dashboard update
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-serif font-semibold text-navy mb-2">
          Request Received!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for your interest. We&apos;ll review your event details and send
          you a custom proposal within 1-2 business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
          <Input
            id="firstName"
            name="firstName"
            required
            placeholder="Your first name"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
          <Input
            id="lastName"
            name="lastName"
            required
            placeholder="Your last name"
          />
        </Field>
      </div>

      {/* Contact Fields */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="(555) 555-5555"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email Address *</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </Field>
      </div>

      {/* Event Details */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="eventDate">Event Date *</FieldLabel>
          <Input id="eventDate" name="eventDate" type="date" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="eventType">Event Type *</FieldLabel>
          <Select name="eventType" required>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Location */}
      <Field>
        <FieldLabel htmlFor="location">Event Location / Address *</FieldLabel>
        <Input
          id="location"
          name="location"
          required
          placeholder="Full address or venue name"
        />
      </Field>

      {/* Guest Count and Times */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="guestCount">Estimated Guest Count</FieldLabel>
          <Input
            id="guestCount"
            name="guestCount"
            type="number"
            placeholder="e.g., 150"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="startTime">Event Start Time</FieldLabel>
          <Input id="startTime" name="startTime" type="time" />
        </Field>
        <Field>
          <FieldLabel htmlFor="endTime">Event End Time</FieldLabel>
          <Input id="endTime" name="endTime" type="time" />
        </Field>
      </div>

      {/* Power and Water */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="powerAvailable">
            Is power available within 100 feet?
          </FieldLabel>
          <Select name="powerAvailable">
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="waterAvailable">
            Is water available within 100 feet?
          </FieldLabel>
          <Select name="waterAvailable">
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {yesNoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Additional Details */}
      <Field>
        <FieldLabel htmlFor="details">
          Tell us about your event or rental needs
        </FieldLabel>
        <Textarea
          id="details"
          name="details"
          rows={4}
          placeholder="Share any additional details about your event, venue, or specific requirements..."
        />
      </Field>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full bg-navy hover:bg-navy/90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner className="mr-2" />
            Submitting...
          </>
        ) : (
          "Request Availability"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        By submitting this form, you agree to be contacted regarding your inquiry.
      </p>
    </form>
  )
}
