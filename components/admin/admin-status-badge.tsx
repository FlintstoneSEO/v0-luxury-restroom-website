import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatAdminStatus, getAdminStatusTone, type AdminStatusFamily } from '@/lib/quotes/status';
import { cn } from '@/lib/utils';

const toneStyles = {
  neutral: 'border-slate-300 bg-slate-50 text-slate-800',
  info: 'border-blue-300 bg-blue-50 text-blue-900',
  warning: 'border-amber-400 bg-amber-50 text-amber-950',
  success: 'border-emerald-400 bg-emerald-50 text-emerald-900',
  danger: 'border-rose-300 bg-rose-50 text-rose-900',
} as const;

const toneIcons = {
  neutral: Clock3,
  info: Send,
  warning: AlertCircle,
  success: CheckCircle2,
  danger: AlertCircle,
} as const;

export function AdminStatusBadge({
  status,
  family = 'quote',
  prefix,
  className,
}: {
  status?: string | null;
  family?: AdminStatusFamily;
  prefix?: string;
  className?: string;
}) {
  const normalizedStatus = status || 'unknown';
  const tone = getAdminStatusTone(normalizedStatus, family);
  const Icon = family === 'agreement' ? FileCheck2 : family === 'deposit' ? CreditCard : toneIcons[tone];

  return (
    <Badge
      variant="outline"
      className={cn('rounded-full px-2.5 py-1 font-semibold', toneStyles[tone], className)}
      title={`${prefix ? `${prefix}: ` : ''}${formatAdminStatus(normalizedStatus, family)}`}
    >
      <Icon aria-hidden="true" />
      <span>{prefix ? `${prefix}: ` : ''}{formatAdminStatus(normalizedStatus, family)}</span>
    </Badge>
  );
}
