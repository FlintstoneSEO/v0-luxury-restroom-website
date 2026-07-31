'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  formatDateOnlyValue,
  formatLocalDateOnly,
  getMinimumEventDate,
  parseLocalDateOnly,
} from '@/lib/date-only';

interface BookedDatesResponse {
  ok: boolean;
  bookedDates?: string[];
}

export function AvailabilityDatePicker({
  name = 'eventDate',
  id = name,
  error,
}: {
  name?: string;
  id?: string;
  error?: string;
}) {
  const descriptionId = useId();
  const errorId = useId();
  const [value, setValue] = useState('');
  const [bookedDateValues, setBookedDateValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const minimumDateValue = useMemo(() => getMinimumEventDate(), []);
  const minimumDate = useMemo(
    () => parseLocalDateOnly(minimumDateValue),
    [minimumDateValue],
  );
  const bookedDates = useMemo(
    () => bookedDateValues.map(parseLocalDateOnly),
    [bookedDateValues],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadBookedDates() {
      try {
        const response = await fetch('/api/availability/booked-dates', {
          cache: 'no-store',
          signal: controller.signal,
        });
        const body = (await response.json()) as BookedDatesResponse;
        if (!response.ok || !body.ok || !Array.isArray(body.bookedDates)) {
          throw new Error('Availability request failed');
        }
        setBookedDateValues(body.bookedDates);
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') setLoadFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadBookedDates();
    return () => controller.abort();
  }, []);

  const describedBy = [descriptionId, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-required="true"
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className="min-h-11 w-full justify-start border-input bg-background text-left font-normal"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <CalendarDays className="size-4" aria-hidden="true" />
            )}
            {value
              ? formatLocalDateOnly(value)
              : loading
                ? 'Loading available dates…'
                : 'Select an event date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? parseLocalDateOnly(value) : undefined}
            defaultMonth={minimumDate}
            disabled={[{ before: minimumDate }, ...bookedDates]}
            modifiers={{ booked: bookedDates }}
            modifiersClassNames={{
              booked: 'line-through text-red-700 opacity-70',
            }}
            onSelect={(date) => {
              if (!date) return;
              setValue(formatDateOnlyValue(date));
              setOpen(false);
            }}
            aria-label="Choose an available event date"
          />
        </PopoverContent>
      </Popover>
      <p id={descriptionId} className="text-sm text-muted-foreground">
        Select a date at least 7 days from today. Dates shown as unavailable are already booked.
      </p>
      {loadFailed && (
        <p role="status" className="text-sm text-amber-800">
          Live availability could not be loaded. You may still choose a date; we will verify it when you submit.
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
