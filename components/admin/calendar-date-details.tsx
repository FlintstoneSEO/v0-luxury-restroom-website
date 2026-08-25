'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AvailabilityBlockForm } from '@/components/admin/availability-block-form';
import type { AvailabilityBlock, AvailabilityDaySummary } from '@/lib/availability';
import { formatLocalDateOnly } from '@/lib/date-only';
import { formatAdminStatus } from '@/lib/quotes/status';
import type { CalendarQuote } from '@/components/admin/booking-calendar';

function blockTypeLabel(block: AvailabilityBlock) {
  return block.block_type.split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');
}

function BlockCard({
  block,
  onEdit,
  onRemove,
}: {
  block: AvailabilityBlock;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-xl border border-violet-300 bg-violet-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Badge className="border-violet-500 bg-violet-100 text-violet-950" variant="outline">
            {block.availability_effect === 'hard_block' ? 'Date blocked' : 'Soft hold'}
          </Badge>
          <h3 className="mt-2 font-serif text-lg font-semibold text-navy">{block.title}</h3>
          <p className="text-sm font-medium text-charcoal">{block.organization_name || blockTypeLabel(block)}</p>
        </div>
        <Badge variant="outline">{blockTypeLabel(block)}</Badge>
      </div>
      <p className="mt-3 text-sm text-charcoal">
        {formatLocalDateOnly(block.start_date)}
        {block.end_date !== block.start_date ? ` – ${formatLocalDateOnly(block.end_date)}` : ''}
      </p>
      {block.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{block.notes}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onEdit}>
          <Pencil className="size-3.5" aria-hidden="true" /> Edit block
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onRemove} className="border-red-300 text-red-800 hover:bg-red-50">
          <Trash2 className="size-3.5" aria-hidden="true" /> Remove block
        </Button>
      </div>
    </article>
  );
}

function QuoteCard({ quote }: { quote: CalendarQuote }) {
  return (
    <Link href={`/admin/quotes/${quote.id}`} className="block rounded-lg border border-[#d9d1c8] bg-white p-3 hover:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
      <span className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-navy">{quote.customer_name}</strong>
        <Badge variant="outline">{formatAdminStatus(quote.status, 'quote')}</Badge>
      </span>
      <span className="mt-1 block text-sm text-muted-foreground">#{quote.quote_number || quote.id.slice(0, 8)} · {quote.event_type}</span>
    </Link>
  );
}

export function CalendarDateDetails({
  open,
  onOpenChange,
  selectedDate,
  summary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  summary: AvailabilityDaySummary<CalendarQuote>;
}) {
  const router = useRouter();
  const [editingBlock, setEditingBlock] = useState<AvailabilityBlock | null | undefined>(undefined);
  const [removingBlock, setRemovingBlock] = useState<AvailabilityBlock | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setEditingBlock(undefined);
      setRemovingBlock(null);
      setRemoveError(null);
    }
    onOpenChange(nextOpen);
  }

  async function removeBlock() {
    if (!removingBlock) return;
    setRemoveError(null);
    const response = await fetch(`/api/admin/availability-blocks/${removingBlock.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expected_updated_at: removingBlock.updated_at }),
    });
    const body = await response.json();
    if (!response.ok) {
      setRemoveError(body.message || 'The block could not be removed.');
      return;
    }
    setRemovingBlock(null);
    router.refresh();
  }

  const allQuotes = [...summary.blockingQuotes, ...summary.activeRequests, ...summary.closedRequests];

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-navy">
              {editingBlock === undefined ? formatLocalDateOnly(selectedDate) : editingBlock ? 'Edit availability block' : 'Block dates'}
            </DialogTitle>
            <DialogDescription>
              {editingBlock === undefined
                ? 'Review commitments and quote activity, or add an operational block.'
                : 'Date ranges are inclusive. Internal details are never shown publicly.'}
            </DialogDescription>
          </DialogHeader>

          {editingBlock !== undefined ? (
            <AvailabilityBlockForm
              key={`${editingBlock?.id ?? 'new'}-${selectedDate}`}
              selectedDate={selectedDate}
              block={editingBlock}
              onCancel={() => setEditingBlock(undefined)}
              onSaved={() => {
                setEditingBlock(undefined);
                router.refresh();
              }}
            />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{summary.state.replaceAll('_', ' ')}</Badge>
                <Badge variant="outline">{summary.activeRequestCount} active request{summary.activeRequestCount === 1 ? '' : 's'}</Badge>
                <Badge variant="outline">{summary.activeBlocks.length} block{summary.activeBlocks.length === 1 ? '' : 's'}</Badge>
              </div>

              {summary.hasBlockingConflict && (
                <div role="alert" className="rounded-lg border border-red-400 bg-red-50 p-3 text-sm text-red-950">
                  <AlertTriangle className="mr-1 inline size-4" aria-hidden="true" />
                  More than one blocking commitment covers this date. Resolve this operational conflict.
                </div>
              )}
              {summary.hardBlocks.length > 0 && summary.activeRequestCount > 0 && (
                <div role="status" className="rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm font-semibold text-amber-950">
                  {summary.activeRequestCount} quote request{summary.activeRequestCount === 1 ? '' : 's'} also exist for this blocked date.
                </div>
              )}

              {summary.activeBlocks.length > 0 && (
                <section aria-labelledby="date-blocks-heading" className="space-y-3">
                  <h2 id="date-blocks-heading" className="font-semibold text-navy">Availability blocks</h2>
                  {summary.activeBlocks.map((block) => (
                    <BlockCard key={block.id} block={block} onEdit={() => setEditingBlock(block)} onRemove={() => setRemovingBlock(block)} />
                  ))}
                </section>
              )}

              {allQuotes.length > 0 && (
                <section aria-labelledby="date-quotes-heading" className="space-y-2">
                  <h2 id="date-quotes-heading" className="font-semibold text-navy">Quote and booking activity</h2>
                  {allQuotes.map((quote) => <QuoteCard key={quote.id} quote={quote} />)}
                </section>
              )}

              {summary.activeBlocks.length === 0 && allQuotes.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#c8b9a8] bg-[#faf8f5] p-6 text-center">
                  <p className="font-semibold text-navy">No activity for this date</p>
                  <p className="mt-1 text-sm text-muted-foreground">The date is currently available.</p>
                </div>
              )}

              <Button type="button" onClick={() => setEditingBlock(null)} className="w-full bg-navy text-white hover:bg-navy/90">
                <CalendarPlus className="size-4" aria-hidden="true" /> Block this date
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(removingBlock)} onOpenChange={(nextOpen) => !nextOpen && setRemovingBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove availability block?</AlertDialogTitle>
            <AlertDialogDescription>
              This restores normal availability for the range. Quote and booking records are not changed, and the block remains in history as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {removeError && <p role="alert" className="text-sm text-red-700">{removeError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel>Keep block</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); void removeBlock(); }} className="bg-red-700 text-white hover:bg-red-800">
              Remove block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
