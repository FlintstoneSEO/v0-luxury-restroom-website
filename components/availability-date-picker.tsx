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

interface LimitedDatesResponse {
  ok: boolean;
  limitedDates?: string[];
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
  const [limitedDateValues, setLimitedDateValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const minimumDateValue = useMemo(() => getMinimumEventDate(), []);
  const minimumDate = useMemo(
    () => parseLocalDateOnly(minimumDateValue),
    [minimumDateValue],
  );
  const limitedDates = useMemo(
    () => limitedDateValues.map(parseLocalDateOnly),
    [limitedDateValues],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadLimitedDates() {
      try {
        const response = await fetch('/api/availability/booked-dates', {
          cache: 'no-store',
          signal: controller.signal,
        });
        const body = (await response.json()) as LimitedDatesResponse;
        if (!response.ok || !body.ok || !Array.isArray(body.limitedDates)) {
          throw new Error('Availability request failed');
        }
        setLimitedDateValues(body.limitedDates);
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') setLoadFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadLimitedDates();
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
            disabled={{ before: minimumDate }}
            modifiers={{ limited: limitedDates }}
            modifiersClassNames={{
              limited: 'border border-amber-500 bg-amber-50 font-semibold text-amber-950',
            }}
            onSelect={(date) => {
              if (!date) return;
              setValue(formatDateOnlyValue(date));
              setOpen(false);
            }}
            aria-label="Choose an event date"
          />
        </PopoverContent>
      </Popover>
      <p id={descriptionId} className="text-sm text-muted-foreground">
        Select a date at least 7 days from today. Amber dates have limited availability, but you may still request them.
      </p>
      {value && limitedDateValues.includes(value) && (
        <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
          This date currently has limited availability. You may still submit your event details, and we will confirm availability or alternate options.
        </p>
      )}
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
