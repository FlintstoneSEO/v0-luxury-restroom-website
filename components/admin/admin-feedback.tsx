import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Inbox, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';

export function AdminLoadingState({ label = 'Loading admin data…' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-48 items-center justify-center rounded-xl border border-[#d9d1c8] bg-white p-8">
      <span className="flex items-center gap-3 text-sm font-medium text-charcoal">
        <Loader2 className="size-5 animate-spin text-navy motion-reduce:animate-none" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Empty className="min-h-56 border border-dashed border-[#c8b9a8] bg-white">
      <EmptyHeader>
        <EmptyMedia variant="icon"><Inbox aria-hidden="true" /></EmptyMedia>
        <EmptyTitle className="font-serif text-navy">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}

export function AdminErrorState({
  title = 'Unable to load this admin screen',
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-900">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="text-red-800">
        <p>{description}</p>
        {action}
      </AlertDescription>
    </Alert>
  );
}

export function AdminSaveState({
  state,
  message,
  className,
}: {
  state: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
  className?: string;
}) {
  if (state === 'idle' && !message) return null;

  const content = {
    idle: { icon: null, text: message || '' },
    saving: { icon: Loader2, text: message || 'Saving changes…' },
    success: { icon: CheckCircle2, text: message || 'Changes saved.' },
    error: { icon: AlertCircle, text: message || 'Changes could not be saved.' },
  }[state];
  const Icon = content.icon;

  return (
    <p
      role={state === 'error' ? 'alert' : 'status'}
      aria-live={state === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'flex items-center gap-2 text-sm font-medium',
        state === 'error' ? 'text-red-700' : state === 'success' ? 'text-emerald-800' : 'text-muted-foreground',
        className,
      )}
    >
      {Icon && <Icon className={cn('size-4', state === 'saving' && 'animate-spin motion-reduce:animate-none')} aria-hidden="true" />}
      {content.text}
    </p>
  );
}
