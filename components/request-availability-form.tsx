"use client"

import { useActionState, useState } from "react"
import type { ChangeEvent } from "react"
import Script from "next/script"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle } from "lucide-react"
import { submitRequestAvailability, RequestAvailabilityState } from "@/app/actions/request-availability"
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from "@reach/combobox"
import usePlacesAutocomplete from "use-places-autocomplete"
import "@reach/combobox/styles.css"

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

const initialState: RequestAvailabilityState = {
  success: false,
  message: '',
}

function AddressAutocomplete({
  value,
  onAddressSelect,
  error,
}: {
  value: string
  onAddressSelect: (address: string) => void
  error?: string[]
}) {
  const {
    ready,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "us" },
    },
    debounce: 300,
  })

  const handleSelect = async (description: string) => {
    setValue(description, false)
    clearSuggestions()
    onAddressSelect(description)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setValue(nextValue)
    onAddressSelect(nextValue)
  }

  return (
    <div className="relative">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={handleChange}
          disabled={!ready}
          placeholder="Search for your event address..."
          className={`w-full px-3 py-2 border rounded-md bg-background text-base md:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d3a47] disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-red-500" : "border-input"
          }`}
        />
        {status === "OK" && (
          <ComboboxPopover>
            <ComboboxList>
              {data.map(({ place_id, description }) => (
                <ComboboxOption key={place_id} value={description}>
                  {description}
                </ComboboxOption>
              ))}
            </ComboboxList>
          </ComboboxPopover>
        )}
      </Combobox>
      {error && <p className="text-sm text-red-600 mt-1">{error[0]}</p>}
    </div>
  )
}

export function RequestAvailabilityForm() {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const [state, formAction, isPending] = useActionState(submitRequestAvailability, initialState)
  const [locationValue, setLocationValue] = useState("")

  const handleSubmit = async (formData: FormData) => {
    formData.set("location", locationValue)
    formAction(formData)
  }

  if (state.success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-serif font-semibold text-navy mb-2">
          Request Received!
        </h3>
        {state.quoteNumber && (
          <p className="text-[#2d3a47] font-semibold mb-4">
            Quote Number: {state.quoteNumber}
          </p>
        )}
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for your interest! Your custom quote has been generated. We&apos;ll 
          review your event details and contact you within 1-2 business days to finalize 
          your reservation.
        </p>
      </div>
    )
  }

  return (
    <>
      {mapsApiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`}
          strategy="afterInteractive"
        />
      ) : null}
      <form action={handleSubmit} className="space-y-6">
      {state.message && !state.success && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{state.message}</p>
        </div>
      )}

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
          {state.errors?.firstName && (
            <p className="text-sm text-red-600 mt-1">{state.errors.firstName[0]}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
          <Input
            id="lastName"
            name="lastName"
            required
            placeholder="Your last name"
          />
          {state.errors?.lastName && (
            <p className="text-sm text-red-600 mt-1">{state.errors.lastName[0]}</p>
          )}
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
          {state.errors?.phone && (
            <p className="text-sm text-red-600 mt-1">{state.errors.phone[0]}</p>
          )}
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
          {state.errors?.email && (
            <p className="text-sm text-red-600 mt-1">{state.errors.email[0]}</p>
          )}
        </Field>
      </div>

      {/* Event Details */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="eventDate">Event Date *</FieldLabel>
          <Input id="eventDate" name="eventDate" type="date" required />
          {state.errors?.eventDate && (
            <p className="text-sm text-red-600 mt-1">{state.errors.eventDate[0]}</p>
          )}
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
          {state.errors?.eventType && (
            <p className="text-sm text-red-600 mt-1">{state.errors.eventType[0]}</p>
          )}
        </Field>
      </div>

      {/* Location with Address Autocomplete */}
      <Field>
        <FieldLabel htmlFor="location">Event Location / Address *</FieldLabel>
        <AddressAutocomplete
          value={locationValue}
          onAddressSelect={setLocationValue}
          error={state.errors?.location}
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
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Spinner className="mr-2" />
            Submitting...
          </>
        ) : (
          "Request Availability"
        )}
      </Button>

      <p className="text-center text-base text-muted-foreground">
        By submitting this form, you agree to be contacted regarding your inquiry.
      </p>
      </form>
    </>
  )
}
