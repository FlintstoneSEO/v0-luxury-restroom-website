'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
  AvailabilityBlock,
  AvailabilityBlockType,
  AvailabilityEffect,
} from '@/lib/availability';

const blockTypeOptions: Array<{ value: AvailabilityBlockType; label: string }> = [
  { value: 'partner_booking', label: 'Partner booking' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'owner_unavailable', label: 'Owner unavailable' },
  { value: 'equipment_unavailable', label: 'Equipment unavailable' },
  { value: 'other', label: 'Other' },
];

export function AvailabilityBlockForm({
  selectedDate,
  block,
  onSaved,
  onCancel,
}: {
  selectedDate: string;
  block?: AvailabilityBlock | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(block?.title ?? '');
  const [startDate, setStartDate] = useState(block?.start_date ?? selectedDate);
  const [endDate, setEndDate] = useState(block?.end_date ?? selectedDate);
  const [blockType, setBlockType] = useState<AvailabilityBlockType>(block?.block_type ?? 'partner_booking');
  const [effect, setEffect] = useState<AvailabilityEffect>(block?.availability_effect ?? 'hard_block');
  const [organization, setOrganization] = useState(block?.organization_name ?? '');
  const [notes, setNotes] = useState(block?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmConflict, setConfirmConflict] = useState(false);

  async function save(allowConflict: boolean) {
    setSaving(true);
    setError(null);
    try {
      const endpoint = block
        ? `/api/admin/availability-blocks/${block.id}`
        : '/api/admin/availability-blocks';
      const response = await fetch(endpoint, {
        method: block ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          start_date: startDate,
          end_date: endDate,
          block_type: blockType,
          availability_effect: effect,
          organization_name: organization || null,
          notes: notes || null,
          allow_conflict: allowConflict,
          ...(block ? { expected_updated_at: block.updated_at } : {}),
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        if (response.status === 409 && body.requires_confirmation) {
          setConfirmConflict(true);
          setError(body.message || 'This range overlaps another blocking commitment.');
          return;
        }
        throw new Error(body.message || 'The availability block could not be saved.');
      }
      onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'The availability block could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void save(confirmConflict);
      }}
    >
      {error && (
        <div role="alert" className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-950">
          <strong className="block">{confirmConflict ? 'Conflict confirmation required' : 'Unable to save'}</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="availability-block-title">Title</Label>
        <Input
          id="availability-block-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
          required
          placeholder="Lions Tailgate Weekend 1"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="availability-block-start">Start date</Label>
          <Input
            id="availability-block-start"
            type="date"
            value={startDate}
            onChange={(event) => {
              const nextStart = event.target.value;
              setStartDate(nextStart);
              if (endDate < nextStart) setEndDate(nextStart);
              setConfirmConflict(false);
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability-block-end">End date</Label>
          <Input
            id="availability-block-end"
            type="date"
            min={startDate}
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setConfirmConflict(false);
            }}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="availability-block-type">Block type</Label>
          <select
            id="availability-block-type"
            value={blockType}
            onChange={(event) => {
              const nextType = event.target.value as AvailabilityBlockType;
              setBlockType(nextType);
              if (nextType === 'partner_booking') setEffect('hard_block');
              setConfirmConflict(false);
            }}
            className="border-input bg-background min-h-11 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {blockTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="availability-block-effect">Availability effect</Label>
          <select
            id="availability-block-effect"
            value={effect}
            onChange={(event) => {
              setEffect(event.target.value as AvailabilityEffect);
              setConfirmConflict(false);
            }}
            className="border-input bg-background min-h-11 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            <option value="hard_block">Hard block — prevents commitment</option>
            <option value="soft_hold">Soft hold — warning only</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability-block-organization">Partner or organization</Label>
        <Input
          id="availability-block-organization"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          maxLength={160}
          required={blockType === 'partner_booking'}
          placeholder="XYZ Tailgating"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability-block-notes">Internal notes</Label>
        <Textarea
          id="availability-block-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="Delivery, setup, event, and pickup details"
        />
        <p className="text-xs text-muted-foreground">Never shown in public availability responses.</p>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-[#e5e0db] pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving} className={confirmConflict ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-navy text-white hover:bg-navy/90'}>
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {confirmConflict ? `${block ? 'Save' : 'Create'} despite conflict` : block ? 'Save changes' : 'Create block'}
        </Button>
      </div>
    </form>
  );
}
