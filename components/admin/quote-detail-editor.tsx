'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { QuoteRequest, QuoteOption, QUOTE_STATUSES, AGREEMENT_TRACKING_STATUSES, DEPOSIT_TRACKING_STATUSES, EVENT_TYPES } from '@/lib/quotes/types';
import { calculateQuoteFinancials, DEFAULT_PRICING } from '@/lib/pricing-engine';
import { isQuoteFinanciallyLocked } from '@/lib/quotes/financial-lock';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft, Send, FileSignature, CreditCard, RotateCcw, AlertTriangle, Eye, Plus, Copy, Pencil, Trash2, Star } from 'lucide-react';
import { SameDateRequestsPanel } from '@/components/admin/same-date-requests-panel';
import type { CalendarQuote } from '@/components/admin/booking-calendar';
import { isBookingBlockingStatus, isRealQuote, type AvailabilityBlock } from '@/lib/availability';

interface QuoteDetailEditorProps {
  quote: QuoteRequest;
  sameDateQuotes?: CalendarQuote[];
  sameDateBlocks?: AvailabilityBlock[];
  depositPercentage?: number;
  salesTaxPercentage?: number;
}

type TestQuoteSendResult = {
  quote_id: string;
  approval_link?: string;
};

type QuoteEmailPreview = {
  to: string;
  subject: string;
  html: string;
  text: string;
};


type QuoteOptionForm = {
  id?: string;
  option_label: string;
  option_description: string;
  is_recommended: boolean;
  has_power: boolean;
  has_water: boolean;
  base_price: number;
  travel_fee: number;
  utility_fee: number;
  after_hours_fee: number;
  cleaning_fee: number;
  damage_waiver_fee: number;
  rush_booking_fee: number;
  discount_amount: number;
  pretax_total: number;
  taxable_amount: number;
  tax_rate: number;
  sales_tax_amount: number;
  total_price: number;
  deposit_percentage: number;
  deposit_amount: number;
  final_balance: number;
};

function buildOptionForm(option?: QuoteOption, quote?: QuoteRequest): QuoteOptionForm {
  return {
    id: option?.id,
    option_label: option?.option_label ?? '',
    option_description: option?.option_description ?? '',
    is_recommended: option?.is_recommended ?? false,
    has_power: option?.has_power ?? quote?.has_power ?? false,
    has_water: option?.has_water ?? quote?.has_water ?? false,
    base_price: option?.base_price ?? quote?.base_price ?? 0,
    travel_fee: option?.travel_fee ?? quote?.travel_fee ?? 0,
    utility_fee: option?.utility_fee ?? quote?.utility_fee ?? 0,
    after_hours_fee: option?.after_hours_fee ?? quote?.after_hours_fee ?? 0,
    cleaning_fee: option?.cleaning_fee ?? quote?.cleaning_fee ?? 0,
    damage_waiver_fee: option?.damage_waiver_fee ?? quote?.damage_waiver_fee ?? 0,
    rush_booking_fee: option?.rush_booking_fee ?? quote?.rush_booking_fee ?? 0,
    discount_amount: option?.discount_amount ?? quote?.discount_amount ?? 0,
    pretax_total: option?.pretax_total ?? quote?.pretax_total ?? 0,
    taxable_amount: option?.taxable_amount ?? quote?.taxable_amount ?? 0,
    tax_rate: option?.tax_rate ?? quote?.tax_rate ?? 0,
    sales_tax_amount: option?.sales_tax_amount ?? quote?.sales_tax_amount ?? 0,
    total_price: option?.total_price ?? quote?.total_price ?? 0,
    deposit_percentage: option?.deposit_percentage ?? quote?.deposit_percentage ?? 0,
    deposit_amount: option?.deposit_amount ?? quote?.deposit_amount ?? 0,
    final_balance: option?.final_balance ?? quote?.final_balance ?? 0,
  };
}

type RecalculationTriggerFields = {
  event_address: string;
  city: string;
  state: string;
  zip_code: string;
  guest_count: number;
  event_date: string;
  event_start_time: string;
  event_end_time: string;
  has_power: boolean;
  has_water: boolean;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getStoredDepositPercentage(quote: QuoteRequest) {
  if (Number.isFinite(quote.deposit_percentage) && Number(quote.deposit_percentage) >= 0) {
    return Number(quote.deposit_percentage);
  }
  const details = quote.calculated_breakdown?.details;
  const breakdownPercentage = typeof details === 'object' && details !== null
    ? Number((details as Record<string, unknown>).deposit_percentage)
    : Number.NaN;

  if (Number.isFinite(breakdownPercentage) && breakdownPercentage >= 0) {
    return breakdownPercentage;
  }

  return DEFAULT_PRICING.deposit_percentage;
}

function getStoredSalesTaxPercentage(quote: QuoteRequest) {
  if (Number.isFinite(quote.tax_rate) && Number(quote.tax_rate) >= 0) {
    return Number(quote.tax_rate) * 100;
  }
  const details = quote.calculated_breakdown?.details;
  const breakdownPercentage = typeof details === 'object' && details !== null
    ? Number((details as Record<string, unknown>).sales_tax_percentage)
    : Number.NaN;

  return Number.isFinite(breakdownPercentage)
    ? breakdownPercentage
    : DEFAULT_PRICING.sales_tax_percentage;
}

type PricingInput = {
  base_price: number;
  travel_fee: number;
  utility_fee: number;
  after_hours_fee: number;
  cleaning_fee: number;
  damage_waiver_fee: number;
  rush_booking_fee: number;
  discount_amount: number;
};

function calculatePricingTotals(
  input: PricingInput,
  salesTaxPercentage: number,
  depositPercentage: number
) {
  return calculateQuoteFinancials({
    ...input,
    sales_tax_percentage: salesTaxPercentage,
    deposit_percentage: depositPercentage,
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Not yet';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatCustomerResponse(quote: QuoteRequest) {
  if (!quote.customer_response_type) return 'Pending';

  return quote.customer_response_type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : '';
}

function getRecalculationTriggerFields(quote: QuoteRequest): RecalculationTriggerFields {
  return {
    event_address: quote.event_address ?? '',
    city: quote.city ?? '',
    state: quote.state ?? '',
    zip_code: quote.zip_code ?? '',
    guest_count: quote.guest_count ?? 0,
    event_date: quote.event_date ?? '',
    event_start_time: quote.event_start_time ?? '',
    event_end_time: quote.event_end_time ?? '',
    has_power: quote.has_power ?? false,
    has_water: quote.has_water ?? false,
  };
}

function hasFallbackDistanceCalculation(quote: QuoteRequest) {
  const details = quote.calculated_breakdown?.details;
  return quote.needs_manual_distance_review === true || (typeof details === 'object' && details !== null && (details as Record<string, unknown>).distance_calculation_status === 'fallback');
}

function getDistanceCalculationMessage(quote: QuoteRequest) {
  const details = quote.calculated_breakdown?.details;
  if (typeof details === 'object' && details !== null) {
    const message = (details as Record<string, unknown>).distance_calculation_message;
    if (typeof message === 'string') return message;
  }

  return 'Distance used fallback mileage. Verify travel fee manually.';
}

export default function QuoteDetailEditor({
  quote,
  sameDateQuotes = [],
  sameDateBlocks = [],
  depositPercentage: configuredDepositPercentage,
  salesTaxPercentage: configuredSalesTaxPercentage,
}: QuoteDetailEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    // Customer
    customer_name: quote.customer_name ?? '',
    email: quote.email ?? '',
    phone: quote.phone ?? '',
    
    // Event
    event_date: quote.event_date ?? '',
    event_type: quote.event_type ?? '',
    guest_count: quote.guest_count ?? 0,
    event_address: quote.event_address ?? '',
    city: quote.city ?? '',
    state: quote.state ?? '',
    zip_code: quote.zip_code ?? '',
    event_start_time: quote.event_start_time ?? '',
    event_end_time: quote.event_end_time ?? '',
    has_power: quote.has_power ?? false,
    has_water: quote.has_water ?? false,
    additional_notes: quote.additional_notes ?? '',
    distance_miles: quote.distance_miles ?? 0,
    
    // Pricing
    base_price: quote.base_price ?? 0,
    travel_fee: quote.travel_fee ?? 0,
    utility_fee: quote.utility_fee ?? 0,
    after_hours_fee: quote.after_hours_fee ?? 0,
    cleaning_fee: quote.cleaning_fee ?? 0,
    damage_waiver_fee: quote.damage_waiver_fee ?? 0,
    rush_booking_fee: quote.rush_booking_fee ?? 0,
    subtotal: quote.subtotal ?? 0,
    discount_amount: quote.discount_amount ?? 0,
    pretax_total: quote.pretax_total ?? 0,
    taxable_amount: quote.taxable_amount ?? 0,
    tax_rate: quote.tax_rate ?? 0,
    sales_tax_amount: quote.sales_tax_amount ?? 0,
    total_price: quote.total_price ?? 0,
    deposit_percentage: quote.deposit_percentage ?? 0,
    deposit_amount: quote.deposit_amount ?? 0,
    final_balance: quote.final_balance ?? 0,
    quote_expires_at: toDateInputValue(quote.quote_expires_at),
    is_manual_override: quote.is_manual_override ?? false,
    
    // Workflow
    status: quote.status,
    agreement_status: quote.agreement_status,
    deposit_status: quote.deposit_status,
    internal_notes: quote.internal_notes ?? '',
    customer_notes: quote.customer_notes ?? '',
    
    // Agreement
    agreement_document_url: quote.agreement_document_url ?? '',
    signed_document_url: quote.signed_document_url ?? '',
    agreement_provider_reference_id: quote.agreement_provider_reference_id ?? '',
    dropbox_sign_request_id: quote.dropbox_sign_request_id ?? '',
    dropbox_sign_signature_id: quote.dropbox_sign_signature_id ?? '',
    signed_agreement_url: quote.signed_agreement_url ?? '',
    agreement_sent_at: quote.agreement_sent_at ?? '',
    agreement_signed_at: quote.agreement_signed_at ?? '',
    
    // Deposit
    deposit_payment_link: quote.deposit_payment_link ?? '',
    square_deposit_invoice_id: quote.square_deposit_invoice_id ?? '',
    square_deposit_invoice_url: quote.square_deposit_invoice_url ?? '',
    deposit_due_date: toDateInputValue(quote.deposit_due_date),
    deposit_paid_at: quote.deposit_paid_at ?? '',
    deposit_paid_amount: quote.deposit_paid_amount ?? 0,
    deposit_transaction_reference: quote.deposit_transaction_reference ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [sendingAgreement, setSendingAgreement] = useState(false);
  const [sendingDepositInvoice, setSendingDepositInvoice] = useState(false);
  const [previewingQuoteEmail, setPreviewingQuoteEmail] = useState(false);
  const [emailPreview, setEmailPreview] = useState<QuoteEmailPreview | null>(null);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [lastSavedRecalculationFields, setLastSavedRecalculationFields] = useState<RecalculationTriggerFields>(() => getRecalculationTriggerFields(quote));
  const [distanceReviewQuote, setDistanceReviewQuote] = useState<QuoteRequest>(quote);
  const [recalculatingQuote, setRecalculatingQuote] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [quoteOptions, setQuoteOptions] = useState<QuoteOption[]>(quote.quote_options ?? []);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [savingOption, setSavingOption] = useState(false);
  const [recalculatingOptionId, setRecalculatingOptionId] = useState<string | null>(null);
  const [optionDialogOpen, setOptionDialogOpen] = useState(false);
  const [optionForm, setOptionForm] = useState<QuoteOptionForm>(() => buildOptionForm(undefined, quote));
  const [testQuoteDialogOpen, setTestQuoteDialogOpen] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState('');
  const [sendingTestQuote, setSendingTestQuote] = useState(false);
  const [testQuoteResult, setTestQuoteResult] = useState<TestQuoteSendResult | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  const financiallyLocked = isQuoteFinanciallyLocked(quote);
  const storedDepositPercentage = getStoredDepositPercentage(quote);
  const storedSalesTaxPercentage = getStoredSalesTaxPercentage(quote);
  const depositPercentage = financiallyLocked
    ? storedDepositPercentage
    : Number.isFinite(configuredDepositPercentage)
      ? Number(configuredDepositPercentage)
      : DEFAULT_PRICING.deposit_percentage;
  const salesTaxPercentage = financiallyLocked
    ? storedSalesTaxPercentage
    : Number.isFinite(configuredSalesTaxPercentage)
      ? Number(configuredSalesTaxPercentage)
      : DEFAULT_PRICING.sales_tax_percentage;
  const otherBookingOwnsDate = sameDateQuotes.some(
    (sameDateQuote) =>
      sameDateQuote.id !== quote.id &&
      isRealQuote(sameDateQuote) &&
      isBookingBlockingStatus(sameDateQuote.status),
  );
  const hardDateBlocks = sameDateBlocks.filter((block) => block.status === 'active' && block.availability_effect === 'hard_block');
  const softDateHolds = sameDateBlocks.filter((block) => block.status === 'active' && block.availability_effect === 'soft_hold');

  // Calculate subtotal, total, deposit, and final balance
  const recalculatePricing = useCallback(() => {
    return calculatePricingTotals({
      base_price: form.base_price,
      travel_fee: form.travel_fee,
      utility_fee: form.utility_fee,
      after_hours_fee: form.after_hours_fee,
      cleaning_fee: form.cleaning_fee,
      damage_waiver_fee: form.damage_waiver_fee,
      rush_booking_fee: form.rush_booking_fee,
      discount_amount: form.discount_amount,
    }, salesTaxPercentage, depositPercentage);
  }, [form.base_price, form.travel_fee, form.utility_fee, form.after_hours_fee, form.cleaning_fee, form.damage_waiver_fee, form.rush_booking_fee, form.discount_amount, salesTaxPercentage, depositPercentage]);

  const applyQuoteToForm = (updatedQuote: QuoteRequest, options?: { markRecalculated?: boolean }) => {
    if (options?.markRecalculated) {
      setLastSavedRecalculationFields(getRecalculationTriggerFields(updatedQuote));
      setDistanceReviewQuote(updatedQuote);
    }
    setForm(prev => ({
      ...prev,
      customer_name: updatedQuote.customer_name ?? '',
      email: updatedQuote.email ?? '',
      phone: updatedQuote.phone ?? '',
      event_date: updatedQuote.event_date ?? '',
      event_type: updatedQuote.event_type ?? '',
      guest_count: updatedQuote.guest_count ?? 0,
      event_address: updatedQuote.event_address ?? '',
      city: updatedQuote.city ?? '',
      state: updatedQuote.state ?? '',
      zip_code: updatedQuote.zip_code ?? '',
      event_start_time: updatedQuote.event_start_time ?? '',
      event_end_time: updatedQuote.event_end_time ?? '',
      has_power: updatedQuote.has_power ?? false,
      has_water: updatedQuote.has_water ?? false,
      additional_notes: updatedQuote.additional_notes ?? '',
      distance_miles: updatedQuote.distance_miles ?? 0,
      base_price: updatedQuote.base_price ?? 0,
      travel_fee: updatedQuote.travel_fee ?? 0,
      utility_fee: updatedQuote.utility_fee ?? 0,
      after_hours_fee: updatedQuote.after_hours_fee ?? 0,
      cleaning_fee: updatedQuote.cleaning_fee ?? 0,
      damage_waiver_fee: updatedQuote.damage_waiver_fee ?? 0,
      rush_booking_fee: updatedQuote.rush_booking_fee ?? 0,
      subtotal: updatedQuote.subtotal ?? 0,
      pretax_total: updatedQuote.pretax_total ?? 0,
      taxable_amount: updatedQuote.taxable_amount ?? 0,
      tax_rate: updatedQuote.tax_rate ?? 0,
      sales_tax_amount: updatedQuote.sales_tax_amount ?? 0,
      total_price: updatedQuote.total_price ?? 0,
      deposit_percentage: updatedQuote.deposit_percentage ?? 0,
      deposit_amount: updatedQuote.deposit_amount ?? 0,
      final_balance: updatedQuote.final_balance ?? 0,
      quote_expires_at: toDateInputValue(updatedQuote.quote_expires_at),
      is_manual_override: updatedQuote.is_manual_override ?? false,
      status: updatedQuote.status,
      agreement_status: updatedQuote.agreement_status,
      deposit_status: updatedQuote.deposit_status,
      internal_notes: updatedQuote.internal_notes ?? '',
      customer_notes: updatedQuote.customer_notes ?? '',
      agreement_document_url: updatedQuote.agreement_document_url ?? '',
      signed_document_url: updatedQuote.signed_document_url ?? '',
      agreement_provider_reference_id: updatedQuote.agreement_provider_reference_id ?? '',
      dropbox_sign_request_id: updatedQuote.dropbox_sign_request_id ?? '',
      dropbox_sign_signature_id: updatedQuote.dropbox_sign_signature_id ?? '',
      signed_agreement_url: updatedQuote.signed_agreement_url ?? '',
      agreement_sent_at: updatedQuote.agreement_sent_at ?? '',
      agreement_signed_at: updatedQuote.agreement_signed_at ?? '',
      deposit_payment_link: updatedQuote.deposit_payment_link ?? '',
      square_deposit_invoice_id: updatedQuote.square_deposit_invoice_id ?? '',
      square_deposit_invoice_url: updatedQuote.square_deposit_invoice_url ?? '',
      deposit_due_date: toDateInputValue(updatedQuote.deposit_due_date),
      deposit_paid_at: updatedQuote.deposit_paid_at ?? '',
      deposit_paid_amount: updatedQuote.deposit_paid_amount ?? 0,
      deposit_transaction_reference: updatedQuote.deposit_transaction_reference ?? '',
    }));
  };

  const saveQuote = async () => {
    const res = await fetch(`/api/admin/quotes/${quote.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Failed to save quote');

    return body.quote as QuoteRequest;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const updatedQuote = await saveQuote();
      applyQuoteToForm(updatedQuote);
      setMessage({ type: 'success', text: 'Quote updated successfully. Use Save & Recalculate Pricing if event details changed.' });
      router.refresh();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save quote changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/admin');
    router.refresh();
  };

  const handleSendTestQuote = async () => {
    if (!testRecipientEmail.trim()) {
      setMessage({ type: 'error', text: 'Enter a test recipient email first.' });
      return;
    }

    setSendingTestQuote(true);
    setMessage(null);
    setTestQuoteResult(null);

    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_recipient_email: testRecipientEmail.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to send test quote');
      setTestQuoteResult({ quote_id: body.quote_id, approval_link: body.approval_link });
      setMessage({ type: 'success', text: quote.is_test_quote ? 'Test quote sent.' : 'A cloned test quote was created and sent. The real quote was not changed.' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send test quote.' });
    } finally {
      setSendingTestQuote(false);
    }
  };

  const handleSendQuoteEmail = async (confirmSoftHold = false) => {
    setSendingQuote(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm_soft_hold: confirmSoftHold }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to send quote email');

      setMessage({ type: 'success', text: 'Quote email sent successfully.' });
      setEmailPreviewOpen(false);
      setForm(prev => ({ ...prev, status: 'quote_sent' }));
      router.refresh();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send quote email.',
      });
    } finally {
      setSendingQuote(false);
    }
  };

  const handleSaveAndRecalculatePricing = async () => {
    setRecalculatingQuote(true);
    setMessage(null);

    try {
      await saveQuote();

      const res = await fetch(`/api/admin/quotes/${quote.id}/recalculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          force: form.is_manual_override,
          revise: financiallyLocked,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to recalculate pricing');

      const updatedQuote = body.quote as QuoteRequest;
      applyQuoteToForm(updatedQuote, { markRecalculated: true });
      setMessage({ type: 'success', text: 'Quote saved and pricing recalculated from the latest quote details. Manual override has been turned off.' });
      router.refresh();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save and recalculate pricing.',
      });
    } finally {
      setRecalculatingQuote(false);
    }
  };

  const handlePreviewQuoteEmail = async () => {
    setPreviewingQuoteEmail(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/email-preview`, {
        method: 'GET',
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to load quote email preview');

      setEmailPreview({
        to: body.to,
        subject: body.subject,
        html: body.html,
        text: body.text,
      });
      setEmailPreviewOpen(true);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load quote email preview.',
      });
    } finally {
      setPreviewingQuoteEmail(false);
    }
  };


  const loadQuoteOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/options`, { method: 'GET' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to load quote options');
      setQuoteOptions(body.options ?? []);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load quote options.' });
    } finally {
      setLoadingOptions(false);
    }
  }, [quote.id]);

  useEffect(() => {
    let active = true;

    fetch(`/api/admin/quotes/${quote.id}/options`, { method: 'GET' })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || 'Failed to load quote options');
        if (active) setQuoteOptions(body.options ?? []);
      })
      .catch((error) => {
        if (active) {
          setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load quote options.' });
        }
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, [quote.id]);

  const openOptionDialog = (option?: QuoteOption) => {
    setOptionForm(buildOptionForm(option, quote));
    setOptionDialogOpen(true);
  };

  const duplicateCurrentQuoteAsOption = () => {
    setOptionForm({
      option_label: quoteOptions.length === 0 ? 'Option A: Current Quote' : `Option ${String.fromCharCode(65 + quoteOptions.length)}: Current Quote`,
      option_description: 'Duplicated from the current quote pricing.',
      is_recommended: quoteOptions.length === 0,
      has_power: form.has_power,
      has_water: form.has_water,
      base_price: form.base_price,
      travel_fee: form.travel_fee,
      utility_fee: form.utility_fee,
      after_hours_fee: form.after_hours_fee,
      cleaning_fee: form.cleaning_fee,
      damage_waiver_fee: form.damage_waiver_fee,
      rush_booking_fee: form.rush_booking_fee,
      ...calculatePricingTotals(form, salesTaxPercentage, depositPercentage),
    });
    setOptionDialogOpen(true);
  };

  const saveOption = async () => {
    if (!optionForm.option_label.trim()) {
      setMessage({ type: 'error', text: 'Option label is required.' });
      return;
    }

    setSavingOption(true);
    setMessage(null);
    try {
      const res = await fetch(
        optionForm.id ? `/api/admin/quotes/${quote.id}/options/${optionForm.id}` : `/api/admin/quotes/${quote.id}/options`,
        {
          method: optionForm.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(optionForm),
        }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to save quote option');
      await loadQuoteOptions();
      setOptionDialogOpen(false);
      setMessage({ type: 'success', text: 'Quote option saved.' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save quote option.' });
    } finally {
      setSavingOption(false);
    }
  };

  const recalculateOption = async (optionId: string) => {
    setRecalculatingOptionId(optionId);
    setMessage(null);
    try {
      await saveQuote();
      const res = await fetch(`/api/admin/quotes/${quote.id}/options/${optionId}/recalculate`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to recalculate option');
      await loadQuoteOptions();
      setMessage({ type: 'success', text: 'Quote option recalculated.' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to recalculate quote option.' });
    } finally {
      setRecalculatingOptionId(null);
    }
  };

  const deleteOption = async (optionId: string) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/options/${optionId}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Failed to delete quote option');
      await loadQuoteOptions();
      setMessage({ type: 'success', text: 'Quote option deleted.' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete quote option.' });
    }
  };

  const markRecommended = async (optionId: string) => {
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/options/${optionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_recommended: true }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to mark recommended');
      await loadQuoteOptions();
      setMessage({ type: 'success', text: 'Recommended option updated.' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to mark option recommended.' });
    }
  };


  const handleSendAgreement = async () => {
    setSendingAgreement(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/send-agreement`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to send agreement');
      applyQuoteToForm(body.quote as QuoteRequest);
      setMessage({ type: 'success', text: 'Dropbox Sign agreement sent to the customer.' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send agreement.' });
    } finally {
      setSendingAgreement(false);
    }
  };

  const handleSendDepositInvoice = async () => {
    setSendingDepositInvoice(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/quotes/${quote.id}/send-deposit-invoice`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Failed to send deposit invoice');
      applyQuoteToForm(body.quote as QuoteRequest);
      setMessage({ type: 'success', text: 'Square deposit invoice sent to the customer.' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to send deposit invoice.' });
    } finally {
      setSendingDepositInvoice(false);
    }
  };

  const markAgreementSent = async () => {
    setForm(prev => ({
      ...prev,
      agreement_status: 'sent',
      agreement_sent_at: new Date().toISOString(),
    }));
    setMessage({ type: 'success', text: 'Agreement marked as sent. Remember to save changes.' });
  };

  const markAgreementSigned = async () => {
    setForm(prev => ({
      ...prev,
      agreement_status: 'signed',
      agreement_signed_at: new Date().toISOString(),
      status: 'agreement_signed',
    }));
    setMessage({ type: 'success', text: 'Agreement marked as signed. Remember to save changes.' });
  };

  const markDepositRequested = async () => {
    setForm(prev => ({
      ...prev,
      deposit_status: 'requested',
      status: 'deposit_pending',
    }));
    setMessage({ type: 'success', text: 'Deposit marked as requested. Remember to save changes.' });
  };

  const markDepositPaid = async () => {
    setForm(prev => ({
      ...prev,
      deposit_status: 'paid',
      deposit_paid_at: new Date().toISOString(),
      deposit_paid_amount: prev.deposit_amount,
      status: 'deposit_paid',
    }));
    setMessage({ type: 'success', text: 'Deposit marked as paid. Remember to save changes.' });
  };

  const calculatedPricing = form.is_manual_override
    ? {
        subtotal: form.subtotal,
        discount_amount: form.discount_amount,
        pretax_total: form.pretax_total,
        taxable_amount: form.taxable_amount,
        tax_rate: form.tax_rate,
        sales_tax_amount: form.sales_tax_amount,
        total_price: form.total_price,
        deposit_percentage: form.deposit_percentage,
        deposit_amount: form.deposit_amount,
        final_balance: form.final_balance,
      }
    : recalculatePricing();
  const calculatedOptionPricing = calculatePricingTotals(
    optionForm,
    salesTaxPercentage,
    depositPercentage,
  );
  const fallbackDistance = hasFallbackDistanceCalculation(distanceReviewQuote);
  const distanceMessage = getDistanceCalculationMessage(distanceReviewQuote);
  const quoteDetailsChanged =
    form.event_address !== lastSavedRecalculationFields.event_address ||
    form.city !== lastSavedRecalculationFields.city ||
    form.state !== lastSavedRecalculationFields.state ||
    form.zip_code !== lastSavedRecalculationFields.zip_code ||
    form.guest_count !== lastSavedRecalculationFields.guest_count ||
    form.event_date !== lastSavedRecalculationFields.event_date ||
    form.event_start_time !== lastSavedRecalculationFields.event_start_time ||
    form.event_end_time !== lastSavedRecalculationFields.event_end_time ||
    form.has_power !== lastSavedRecalculationFields.has_power ||
    form.has_water !== lastSavedRecalculationFields.has_water;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={handleBackToDashboard} className="flex items-center gap-2 text-[#2d3a47] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d3a47] focus-visible:ring-offset-2 rounded">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-serif font-bold text-[#2d3a47] mb-1">{quote.customer_name}</h1>
              {fallbackDistance && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800" title={distanceMessage}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Distance review needed
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              {quote.email} | {quote.phone}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Quote #{quote.quote_number || quote.id.slice(0, 8)} | Created {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#2d3a47]">
              {formatCurrency(calculatedPricing.total_price)}
            </p>
            <p className="text-sm text-muted-foreground">Total Quote</p>
          </div>
        </div>
      </div>

      {quote.is_test_quote && (
        <div className="rounded-lg border-2 border-amber-500 bg-amber-100 p-4 text-sm text-amber-950">
          <p className="font-bold">TEST QUOTE</p>
          <p>Customer actions on this page affect only this test quote{quote.test_source_quote_id ? ` cloned from ${quote.test_source_quote_id}` : ''}. They do not update a source real quote.</p>
        </div>
      )}

      {!quote.is_test_quote && sameDateQuotes.length > 0 && (
        <SameDateRequestsPanel currentQuoteId={quote.id} quotes={sameDateQuotes} />
      )}

      {!quote.is_test_quote && hardDateBlocks.length > 0 && (
        <div role="alert" className="rounded-lg border-2 border-violet-500 bg-violet-50 p-4 text-sm text-violet-950">
          <p className="font-bold uppercase tracking-wide">Request on blocked date</p>
          <p className="mt-1">{hardDateBlocks.length} active hard block{hardDateBlocks.length === 1 ? '' : 's'} cover this event date. The lead can be reviewed, but it cannot become a committed booking until the block is removed or the event date changes.</p>
          <a href={`/admin/calendar?date=${quote.event_date}`} className="mt-2 inline-block font-semibold underline">View date in calendar</a>
        </div>
      )}
      {!quote.is_test_quote && hardDateBlocks.length === 0 && softDateHolds.length > 0 && (
        <div role="status" className="rounded-lg border border-violet-300 bg-violet-50 p-4 text-sm text-violet-950">
          <p className="font-bold">Soft hold on event date</p>
          <p className="mt-1">This date has an operational hold. Review it before sending customer-visible documents.</p>
        </div>
      )}

      {fallbackDistance && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Fallback distance calculation</p>
            <p>{distanceMessage}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg flex gap-3 items-start ${
            message.type === 'success'
              ? 'bg-[#2d3a47]/5 border border-[#2d3a47]/20'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#2d3a47] flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={message.type === 'success' ? 'text-[#2d3a47]' : 'text-red-700'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Customer Information */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="customer_name">Customer Name</FieldLabel>
            <Input
              id="customer_name"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field>
            <FieldLabel htmlFor="event_date">Event Date</FieldLabel>
            <Input
              id="event_date"
              type="date"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event_type">Event Type</FieldLabel>
            <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="guest_count">Guest Count</FieldLabel>
            <Input
              id="guest_count"
              type="number"
              value={form.guest_count}
              onChange={(e) => setForm({ ...form, guest_count: parseInt(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="distance_miles">Distance (miles)</FieldLabel>
            <Input
              id="distance_miles"
              type="number"
              step="0.1"
              value={form.distance_miles}
              onChange={(e) => setForm({ ...form, distance_miles: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="event_address">Event Address</FieldLabel>
            <Input
              id="event_address"
              value={form.event_address}
              onChange={(e) => setForm({ ...form, event_address: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="state">State</FieldLabel>
            <Input
              id="state"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="zip_code">ZIP Code</FieldLabel>
            <Input
              id="zip_code"
              value={form.zip_code}
              onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event_start_time">Start Time</FieldLabel>
            <Input
              id="event_start_time"
              type="time"
              value={form.event_start_time}
              onChange={(e) => setForm({ ...form, event_start_time: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event_end_time">End Time</FieldLabel>
            <Input
              id="event_end_time"
              type="time"
              value={form.event_end_time}
              onChange={(e) => setForm({ ...form, event_end_time: e.target.value })}
            />
          </Field>
          <Field className="flex items-center gap-2 md:col-span-2">
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="has_power"
                  checked={form.has_power}
                  onCheckedChange={(checked) => setForm({ ...form, has_power: !!checked })}
                />
                <label htmlFor="has_power" className="text-sm">Power Available</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="has_water"
                  checked={form.has_water}
                  onCheckedChange={(checked) => setForm({ ...form, has_water: !!checked })}
                />
                <label htmlFor="has_water" className="text-sm">Water Available</label>
              </div>
            </div>
          </Field>
          <Field className="md:col-span-2 lg:col-span-4">
            <FieldLabel htmlFor="additional_notes">Additional Notes (from customer)</FieldLabel>
            <Textarea
              id="additional_notes"
              value={form.additional_notes}
              onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
              rows={3}
            />
          </Field>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2d3a47]">Pricing</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20"
              onClick={() => setConfirmDialog({
                open: true,
                title: financiallyLocked
                  ? 'Start a Financial Revision?'
                  : form.is_manual_override
                    ? 'Save & Replace Manual Pricing?'
                    : 'Save & Recalculate Pricing?',
                description: financiallyLocked
                  ? 'This expires unused customer approval links, recalculates the quote using current 6% tax and 40% deposit settings, and returns it to draft. You must review and resend it before the customer can act.'
                  : form.is_manual_override
                  ? 'This will save the current form values, rerun server-side pricing, replace manual pricing values, and turn off Manual Override.'
                  : 'This will save the current form values, then rerun server-side pricing and update mileage and calculated pricing fields.',
                action: handleSaveAndRecalculatePricing,
              })}
              disabled={recalculatingQuote}
            >
              {recalculatingQuote ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              {financiallyLocked ? 'Start Financial Revision' : 'Save & Recalculate Pricing'}
            </Button>
            <div className="flex items-center gap-2">
            <Checkbox
              id="is_manual_override"
              checked={form.is_manual_override}
              onCheckedChange={(checked) => setForm({ ...form, is_manual_override: !!checked })}
            />
            <label htmlFor="is_manual_override" className="text-sm">Manual Override</label>
            </div>
          </div>
        </div>
        {quoteDetailsChanged && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>Address or quote details changed. Save &amp; Recalculate to update mileage and pricing.</p>
          </div>
        )}
        {form.is_manual_override && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#2d3a47]/30 bg-[#2d3a47]/5 p-3 text-sm text-[#2d3a47]">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>Manual Override is enabled. Saving and recalculating requires confirmation before calculated pricing replaces manual values.</p>
          </div>
        )}
        {financiallyLocked && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" role="status">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>Customer-facing pricing is locked. Non-financial details may still be saved. Use Start Financial Revision to apply current tax and deposit rules.</p>
          </div>
        )}
        <fieldset disabled={financiallyLocked} className="grid grid-cols-2 gap-4 disabled:opacity-70 md:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="base_price">Base Price</FieldLabel>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="travel_fee">Travel Fee</FieldLabel>
            <Input
              id="travel_fee"
              type="number"
              step="0.01"
              value={form.travel_fee}
              onChange={(e) => setForm({ ...form, travel_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="utility_fee">Utility Fee</FieldLabel>
            <Input
              id="utility_fee"
              type="number"
              step="0.01"
              value={form.utility_fee}
              onChange={(e) => setForm({ ...form, utility_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="after_hours_fee">After Hours Fee</FieldLabel>
            <Input
              id="after_hours_fee"
              type="number"
              step="0.01"
              value={form.after_hours_fee}
              onChange={(e) => setForm({ ...form, after_hours_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="cleaning_fee">Cleaning Fee</FieldLabel>
            <Input
              id="cleaning_fee"
              type="number"
              step="0.01"
              value={form.cleaning_fee}
              onChange={(e) => setForm({ ...form, cleaning_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="damage_waiver_fee">Damage Waiver</FieldLabel>
            <Input
              id="damage_waiver_fee"
              type="number"
              step="0.01"
              value={form.damage_waiver_fee}
              onChange={(e) => setForm({ ...form, damage_waiver_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="rush_booking_fee">Rush Booking Fee</FieldLabel>
            <Input
              id="rush_booking_fee"
              type="number"
              step="0.01"
              value={form.rush_booking_fee}
              onChange={(e) => setForm({ ...form, rush_booking_fee: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="discount_amount">Discount</FieldLabel>
            <Input
              id="discount_amount"
              type="number"
              step="0.01"
              value={form.discount_amount}
              onChange={(e) => setForm({ ...form, discount_amount: parseFloat(e.target.value) || 0 })}
            />
          </Field>
        </fieldset>

        <div className="mt-6 rounded-lg bg-[#2d3a47]/5 p-4">
          <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Service Subtotal</span><span className="whitespace-nowrap font-semibold">{formatCurrency(calculatedPricing.subtotal)}</span></div>
            {calculatedPricing.discount_amount > 0 && (
              <div className="flex justify-between gap-4 text-green-700"><span>Discount</span><span className="whitespace-nowrap font-semibold">-{formatCurrency(calculatedPricing.discount_amount)}</span></div>
            )}
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Pretax Total</span><span className="whitespace-nowrap font-semibold">{formatCurrency(calculatedPricing.pretax_total)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Michigan Sales Tax ({(calculatedPricing.tax_rate * 100).toFixed(0)}%)</span><span className="whitespace-nowrap font-semibold">{formatCurrency(calculatedPricing.sales_tax_amount)}</span></div>
            <div className="flex justify-between gap-4 border-t border-[#2d3a47]/15 pt-2 font-bold text-[#2d3a47]"><span>Total Including Sales Tax</span><span className="whitespace-nowrap">{formatCurrency(calculatedPricing.total_price)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Deposit Required ({calculatedPricing.deposit_percentage.toFixed(0)}%)</span><span className="whitespace-nowrap font-semibold">{formatCurrency(calculatedPricing.deposit_amount)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Balance Due</span><span className="whitespace-nowrap font-semibold">{formatCurrency(calculatedPricing.final_balance)}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Field>
            <FieldLabel htmlFor="deposit_amount">Deposit Amount</FieldLabel>
            <Input
              id="deposit_amount"
              type="number"
              step="0.01"
              value={calculatedPricing.deposit_amount}
              readOnly
              aria-describedby="deposit-derived-help"
            />
            <p id="deposit-derived-help" className="mt-1 text-xs text-muted-foreground">Calculated from the tax-inclusive total.</p>
          </Field>
          <Field>
            <FieldLabel htmlFor="quote_expires_at">Quote Expires</FieldLabel>
            <Input
              id="quote_expires_at"
              type="date"
              value={form.quote_expires_at}
              onChange={(e) => setForm({ ...form, quote_expires_at: e.target.value })}
            />
          </Field>
        </div>
      </div>

      {/* Quote Options */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2d3a47]">Quote Options</h2>
            <p className="text-sm text-muted-foreground">Create multiple pricing options for the same event so the customer can choose one during approval.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20" onClick={() => openOptionDialog()} disabled={financiallyLocked}>
              <Plus className="mr-2 h-4 w-4" /> Add Option
            </Button>
            <Button type="button" variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20" onClick={duplicateCurrentQuoteAsOption} disabled={financiallyLocked}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate Current Quote as Option
            </Button>
          </div>
        </div>

        {quoteDetailsChanged && quoteOptions.length > 0 && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="status">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <p>Quote details changed. Recalculate options before sending.</p>
          </div>
        )}

        {loadingOptions ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading quote options...</div>
        ) : quoteOptions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#ded2c4] bg-[#f8f7f5] p-4 text-sm text-muted-foreground">
            No quote options yet. Add an option or duplicate the current quote to get started.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {quoteOptions.map((option) => (
              <div key={option.id} className="rounded-lg border border-[#ded2c4]/70 p-4 focus-within:ring-2 focus-within:ring-[#2d3a47]/50">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#2d3a47]">{option.option_label}</h3>
                      {option.is_recommended && <span className="rounded-full border border-[#2d3a47]/40 bg-[#2d3a47]/10 px-2 py-0.5 text-xs font-semibold text-[#2d3a47]">Recommended</span>}
                      {option.status === 'selected' && <span className="rounded-full border border-green-700 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-800">Selected</span>}
                    </div>
                    {option.option_description && <p className="mt-1 text-sm text-muted-foreground">{option.option_description}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">Power: {option.has_power ? 'Available' : 'Customer needs service'} • Water: {option.has_water ? 'Available' : 'Customer needs service'}</p>
                  </div>
                  <p className="text-right text-lg font-bold text-[#2d3a47]">{formatCurrency(option.total_price || 0)}</p>
                </div>

                {option.needs_manual_distance_review && (
                  <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5" /> Distance review needed for this option.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>Base: <strong>{formatCurrency(option.base_price || 0)}</strong></span>
                  <span>Travel: <strong>{formatCurrency(option.travel_fee || 0)}</strong></span>
                  <span>Utility: <strong>{formatCurrency(option.utility_fee || 0)}</strong></span>
                  <span>Cleaning: <strong>{formatCurrency(option.cleaning_fee || 0)}</strong></span>
                  <span>Damage Waiver: <strong>{formatCurrency(option.damage_waiver_fee || 0)}</strong></span>
                  <span>Rush Booking: <strong>{formatCurrency(option.rush_booking_fee || 0)}</strong></span>
                  <span>Discount: <strong>-{formatCurrency(option.discount_amount || 0)}</strong></span>
                  <span>Pretax Total: <strong>{formatCurrency(option.pretax_total || 0)}</strong></span>
                  <span>Tax ({((option.tax_rate || 0) * 100).toFixed(0)}%): <strong>{formatCurrency(option.sales_tax_amount || 0)}</strong></span>
                  <span>Total: <strong>{formatCurrency(option.total_price || 0)}</strong></span>
                  <span>Deposit ({Number(option.deposit_percentage || 0).toFixed(0)}%): <strong>{formatCurrency(option.deposit_amount || 0)}</strong></span>
                  <span className="col-span-2">Balance Due: <strong>{formatCurrency(option.final_balance || 0)}</strong></span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20" onClick={() => openOptionDialog(option)} disabled={financiallyLocked}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Option
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20" onClick={() => recalculateOption(option.id)} disabled={financiallyLocked || recalculatingOptionId === option.id}>
                    {recalculatingOptionId === option.id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1.5 h-3.5 w-3.5" />} Recalculate Option
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20" onClick={() => markRecommended(option.id)} disabled={financiallyLocked || option.is_recommended}>
                    <Star className="mr-1.5 h-3.5 w-3.5" /> Mark Recommended
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => setConfirmDialog({ open: true, title: 'Delete Quote Option', description: `Delete ${option.option_label}? This cannot be undone.`, action: () => deleteOption(option.id) })} disabled={financiallyLocked || option.status === 'selected'}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Option
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow Status */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Workflow Status</h2>
        {otherBookingOwnsDate && (
          <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-900">
            Another quote owns this event date. Blocking booking statuses are unavailable until the date is changed to an open date.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="status">Quote Status</FieldLabel>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUOTE_STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    disabled={otherBookingOwnsDate && isBookingBlockingStatus(s)}
                  >
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="agreement_status">Agreement Status</FieldLabel>
            <Select value={form.agreement_status} onValueChange={(v) => setForm({ ...form, agreement_status: v as typeof form.agreement_status })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGREEMENT_TRACKING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_status">Deposit Status</FieldLabel>
            <Select value={form.deposit_status} onValueChange={(v) => setForm({ ...form, deposit_status: v as typeof form.deposit_status })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPOSIT_TRACKING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Agreement Tracking */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Agreement Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="agreement_document_url">Agreement Document URL</FieldLabel>
            <Input
              id="agreement_document_url"
              type="url"
              value={form.agreement_document_url}
              onChange={(e) => setForm({ ...form, agreement_document_url: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="signed_document_url">Signed Document URL</FieldLabel>
            <Input
              id="signed_document_url"
              type="url"
              value={form.signed_document_url}
              onChange={(e) => setForm({ ...form, signed_document_url: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="agreement_provider_reference_id">Provider Reference ID</FieldLabel>
            <Input
              id="agreement_provider_reference_id"
              value={form.agreement_provider_reference_id}
              onChange={(e) => setForm({ ...form, agreement_provider_reference_id: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Agreement Dates</FieldLabel>
            <div className="text-sm text-muted-foreground space-y-1 pt-2">
              {form.agreement_sent_at && <div>Sent: {new Date(form.agreement_sent_at).toLocaleString()}</div>}
              {form.agreement_signed_at && <div>Signed: {new Date(form.agreement_signed_at).toLocaleString()}</div>}
              {!form.agreement_sent_at && !form.agreement_signed_at && <div>Not yet sent</div>}
            </div>
          </Field>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            className="bg-[#2d3a47] hover:bg-[#1f2933] text-white"
            onClick={handleSendAgreement}
            disabled={sendingAgreement || form.agreement_status === 'signed'}
          >
            {sendingAgreement ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSignature className="w-4 h-4 mr-2" />}
            Send Agreement
          </Button>
          <Button
            variant="outline"
            className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20"
            disabled={!form.dropbox_sign_request_id}
            onClick={() => setMessage({ type: 'success', text: `Agreement status: ${form.agreement_status.replace(/_/g, ' ')}` })}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Agreement Status
          </Button>
          {form.signed_agreement_url && (
            <Button asChild variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20">
              <a href={form.signed_agreement_url} target="_blank" rel="noreferrer">View Signed Agreement</a>
            </Button>
          )}
          <Button
            variant="outline"
            className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20"
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Mark Agreement as Sent',
              description: 'This will update the agreement status to "Sent" and record the current timestamp.',
              action: markAgreementSent,
            })}
            disabled={form.agreement_status === 'signed'}
          >
            <FileSignature className="w-4 h-4 mr-2" />
            Mark Agreement Sent
          </Button>
          <Button
            variant="outline"
            className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20"
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Mark Agreement as Signed',
              description: 'This will update the agreement status to "Signed" and record the current timestamp.',
              action: markAgreementSigned,
            })}
            disabled={form.agreement_status === 'signed'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Agreement Signed
          </Button>
        </div>
      </div>

      {/* Deposit Tracking */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Deposit Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="deposit_payment_link">Payment Link</FieldLabel>
            <Input
              id="deposit_payment_link"
              type="url"
              value={form.deposit_payment_link}
              onChange={(e) => setForm({ ...form, deposit_payment_link: e.target.value })}
              placeholder="https://..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_due_date">Due Date</FieldLabel>
            <Input
              id="deposit_due_date"
              type="date"
              value={form.deposit_due_date}
              onChange={(e) => setForm({ ...form, deposit_due_date: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_paid_amount">Paid Amount</FieldLabel>
            <Input
              id="deposit_paid_amount"
              type="number"
              step="0.01"
              value={form.deposit_paid_amount}
              onChange={(e) => setForm({ ...form, deposit_paid_amount: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="deposit_transaction_reference">Transaction Reference</FieldLabel>
            <Input
              id="deposit_transaction_reference"
              value={form.deposit_transaction_reference}
              onChange={(e) => setForm({ ...form, deposit_transaction_reference: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Payment Date</FieldLabel>
            <div className="text-sm text-muted-foreground pt-2">
              {form.deposit_paid_at ? new Date(form.deposit_paid_at).toLocaleString() : 'Not yet paid'}
            </div>
          </Field>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            className="bg-[#2d3a47] hover:bg-[#1f2933] text-white"
            onClick={handleSendDepositInvoice}
            disabled={sendingDepositInvoice || form.agreement_status !== 'signed' || form.deposit_status === 'paid'}
          >
            {sendingDepositInvoice ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
            Send Deposit Invoice
          </Button>
          <Button asChild variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20" disabled={!form.square_deposit_invoice_url}>
            <a href={form.square_deposit_invoice_url || '#'} target="_blank" rel="noreferrer">View Square Invoice</a>
          </Button>
          <Button
            variant="outline"
            className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20"
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Mark Deposit as Requested',
              description: 'This will update the deposit status to "Requested".',
              action: markDepositRequested,
            })}
            disabled={form.deposit_status === 'paid'}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Mark Deposit Requested
          </Button>
          <Button
            variant="outline"
            className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20"
            onClick={() => setConfirmDialog({
              open: true,
              title: 'Mark Deposit as Paid',
              description: 'This will update the deposit status to "Paid" and record the current timestamp.',
              action: markDepositPaid,
            })}
            disabled={form.deposit_status === 'paid'}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Deposit Paid
          </Button>
        </div>
      </div>

      {/* Customer Activity */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Customer Activity</h2>
        <div className="space-y-3 text-sm text-[#2d3a47]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[#ded2c4]/60 bg-[#f8f7f5] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#4b5563]">Quote email sent</p>
              <p className="mt-1 font-medium">{formatDateTime(quote.quote_sent_at)}</p>
            </div>
            <div className="rounded-lg border border-[#ded2c4]/60 bg-[#f8f7f5] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#4b5563]">Quote link opened</p>
              <p className="mt-1 font-medium">{formatDateTime(quote.quote_viewed_at)}</p>
            </div>
            <div className="rounded-lg border border-[#ded2c4]/60 bg-[#f8f7f5] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#4b5563]">Link views</p>
              <p className="mt-1 font-medium">{quote.quote_view_count ?? 0}</p>
            </div>
            <div className="rounded-lg border border-[#ded2c4]/60 bg-[#f8f7f5] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#4b5563]">Customer response</p>
              <p className="mt-1 font-medium">{formatCustomerResponse(quote)}</p>
              {quote.customer_response_at && (
                <p className="mt-1 text-xs text-[#4b5563]">{formatDateTime(quote.customer_response_at)}</p>
              )}
            </div>
          </div>

          {quote.quote_sent_at ? (
            quote.quote_viewed_at ? (
              <p>Customer has opened the quote link.</p>
            ) : (
              <p>Customer has not opened the quote link yet.</p>
            )
          ) : (
            <p>Quote has not been emailed to the customer yet.</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg border border-[#ded2c4]/30 p-6">
        <h2 className="text-xl font-semibold text-[#2d3a47] mb-4">Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="internal_notes">Internal Notes (Staff Only)</FieldLabel>
            <Textarea
              id="internal_notes"
              value={form.internal_notes}
              onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
              placeholder="Private notes for your team..."
              rows={4}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer_notes">Customer Notes</FieldLabel>
            <Textarea
              id="customer_notes"
              value={form.customer_notes}
              onChange={(e) => setForm({ ...form, customer_notes: e.target.value })}
              placeholder="Notes visible to customer..."
              rows={4}
            />
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#2d3a47] hover:bg-[#2d3a47]/90 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviewQuoteEmail}
          disabled={previewingQuoteEmail}
          className="flex-1 border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20 focus-visible:ring-[#2d3a47]/50"
        >
          {previewingQuoteEmail ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading Preview...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Preview Quote Email
            </>
          )}
        </Button>
        <Button
          variant="default"
          onClick={() => setConfirmDialog({
            open: true,
            title: 'Send Quote Email',
            description: softDateHolds.length > 0
              ? 'A soft hold exists on this date. Sending is allowed, but confirm the operational hold has been reviewed before this quote goes to the customer.'
              : 'This will send an email to the customer with a link to review and approve the quote. The quote status will be updated to "Quote Sent".',
            action: () => handleSendQuoteEmail(softDateHolds.length > 0),
          })}
          disabled={sendingQuote || !['pending_review', 'new', 'under_review', 'draft_quote', 'change_requested', 'quote_sent'].includes(form.status)}
          className="flex-1 bg-[#2d3a47] hover:bg-[#2d3a47]/90 text-white"
        >
          {sendingQuote ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Quote Email
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => setTestQuoteDialogOpen(true)} className="flex-1 border-amber-300 text-amber-900 hover:bg-amber-50">
          <Send className="w-4 h-4 mr-2" />
          Send Test Quote
        </Button>
        <Button type="button" variant="outline" onClick={handleBackToDashboard} className="flex-1 border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>


      <Dialog open={testQuoteDialogOpen} onOpenChange={setTestQuoteDialogOpen}>
        <DialogContent aria-describedby="send-test-quote-description">
          <DialogHeader>
            <DialogTitle>Send Test Quote</DialogTitle>
            <DialogDescription id="send-test-quote-description">
              Send a cloned test quote to an internal test recipient. Real customer quote status and customer email are not changed.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="test_recipient_email">Test recipient email</FieldLabel>
            <Input id="test_recipient_email" type="email" value={testRecipientEmail} onChange={(event) => setTestRecipientEmail(event.target.value)} placeholder="tester@example.com" />
          </Field>
          {testQuoteResult && (
            <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
              <p className="font-semibold text-amber-950">Test quote sent successfully.</p>
              <a className="block text-[#2d3a47] underline" href={`/admin/quotes/${testQuoteResult.quote_id}`}>View test quote in admin</a>
              {testQuoteResult.approval_link && <a className="block break-all text-[#2d3a47] underline" href={testQuoteResult.approval_link} target="_blank" rel="noreferrer">Open test approval link</a>}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Close</Button></DialogClose>
            <Button type="button" onClick={handleSendTestQuote} disabled={sendingTestQuote} className="bg-[#2d3a47] text-white hover:bg-[#2d3a47]/90">
              {sendingTestQuote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Test Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quote Option Editor Dialog */}
      <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl" aria-describedby="quote-option-editor-description">
          <DialogHeader>
            <DialogTitle>{optionForm.id ? 'Edit Quote Option' : 'Add Quote Option'}</DialogTitle>
            <DialogDescription id="quote-option-editor-description">
              Adjust option labels, utility assumptions, discounts, and individual pricing fields for manual adjustments.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="option_label">Option Label</FieldLabel>
              <Input id="option_label" value={optionForm.option_label} onChange={(e) => setOptionForm({ ...optionForm, option_label: e.target.value })} placeholder="Option A: With Generator + Water Service" />
            </Field>
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="option_description">Option Description</FieldLabel>
              <Textarea id="option_description" value={optionForm.option_description} onChange={(e) => setOptionForm({ ...optionForm, option_description: e.target.value })} rows={3} placeholder="Describe what is included in this option." />
            </Field>
            <div className="md:col-span-2 flex flex-wrap gap-4 rounded-lg bg-[#f8f7f5] p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d3a47]">
                <Checkbox checked={optionForm.has_power} onCheckedChange={(checked) => setOptionForm({ ...optionForm, has_power: !!checked })} />
                Power available
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d3a47]">
                <Checkbox checked={optionForm.has_water} onCheckedChange={(checked) => setOptionForm({ ...optionForm, has_water: !!checked })} />
                Water available
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-[#2d3a47]">
                <Checkbox checked={optionForm.is_recommended} onCheckedChange={(checked) => setOptionForm({ ...optionForm, is_recommended: !!checked })} />
                Recommended option
              </label>
            </div>
            {[
              ['base_price', 'Base Price'],
              ['travel_fee', 'Travel Fee'],
              ['utility_fee', 'Utility Fee'],
              ['after_hours_fee', 'After Hours Fee'],
              ['cleaning_fee', 'Cleaning Fee'],
              ['damage_waiver_fee', 'Damage Waiver'],
              ['rush_booking_fee', 'Rush Booking Fee'],
              ['discount_amount', 'Discount'],
            ].map(([field, label]) => (
              <Field key={field}>
                <FieldLabel htmlFor={`option_${field}`}>{label}</FieldLabel>
                <Input
                  id={`option_${field}`}
                  type="number"
                  step="0.01"
                  value={optionForm[field as keyof QuoteOptionForm] as number}
                  onChange={(e) => setOptionForm({ ...optionForm, [field]: parseFloat(e.target.value) || 0 })}
                />
              </Field>
            ))}
            <div className="md:col-span-2 grid gap-2 rounded-lg bg-[#2d3a47]/5 p-4 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4"><span>Pretax Total</span><strong className="whitespace-nowrap">{formatCurrency(calculatedOptionPricing.pretax_total)}</strong></div>
              <div className="flex justify-between gap-4"><span>Michigan Sales Tax ({(calculatedOptionPricing.tax_rate * 100).toFixed(0)}%)</span><strong className="whitespace-nowrap">{formatCurrency(calculatedOptionPricing.sales_tax_amount)}</strong></div>
              <div className="flex justify-between gap-4"><span>Total Including Tax</span><strong className="whitespace-nowrap">{formatCurrency(calculatedOptionPricing.total_price)}</strong></div>
              <div className="flex justify-between gap-4"><span>Deposit ({calculatedOptionPricing.deposit_percentage.toFixed(0)}%)</span><strong className="whitespace-nowrap">{formatCurrency(calculatedOptionPricing.deposit_amount)}</strong></div>
              <div className="flex justify-between gap-4 sm:col-span-2"><span>Balance Due</span><strong className="whitespace-nowrap">{formatCurrency(calculatedOptionPricing.final_balance)}</strong></div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={saveOption} disabled={savingOption} className="bg-[#2d3a47] text-white hover:bg-[#2d3a47]/90">
              {savingOption && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Option
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Preview Dialog */}
      <Dialog open={emailPreviewOpen} onOpenChange={setEmailPreviewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl" aria-describedby="quote-email-preview-description">
          <DialogHeader>
            <DialogTitle>Quote Email Preview</DialogTitle>
            <DialogDescription id="quote-email-preview-description">
              Review the customer email content before sending. Previewing does not create an approval token or send email.
            </DialogDescription>
          </DialogHeader>

          {emailPreview && (
            <div className="space-y-4">
              <div className="grid gap-3 rounded-lg border border-[#ded2c4]/60 bg-[#f6f4f1] p-4 text-sm text-[#2d3a47] md:grid-cols-2">
                <div>
                  <p className="font-semibold">Recipient</p>
                  <p className="break-all">{emailPreview.to}</p>
                </div>
                <div>
                  <p className="font-semibold">Subject</p>
                  <p>{emailPreview.subject}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-[#2d3a47]">Rendered HTML Email</h3>
                <iframe
                  title="Rendered quote email preview"
                  srcDoc={emailPreview.html}
                  sandbox=""
                  className="h-[520px] w-full rounded-lg border border-[#ded2c4]/70 bg-white"
                />
              </div>

              <details className="rounded-lg border border-[#ded2c4]/70 bg-white p-4">
                <summary className="cursor-pointer font-semibold text-[#2d3a47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d3a47]/50 focus-visible:ring-offset-2">
                  Plain text preview
                </summary>
                <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-[#2d3a47]/5 p-3 text-sm text-[#1f2933]">
                  {emailPreview.text}
                </pre>
              </details>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-[#ded2c4]/70 text-[#2d3a47] hover:bg-[#ded2c4]/20 focus-visible:ring-[#2d3a47]/50">
                Close
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => setConfirmDialog({
                open: true,
                title: 'Send Quote Email',
                description: softDateHolds.length > 0
                  ? 'A soft hold exists on this date. Confirm that you reviewed it and still want to send this quote.'
                  : 'Send this customer-visible quote email now?',
                action: () => handleSendQuoteEmail(softDateHolds.length > 0),
              })}
              disabled={sendingQuote}
              className="bg-[#2d3a47] text-white hover:bg-[#2d3a47]/90 focus-visible:ring-[#2d3a47]/50"
            >
              {sendingQuote ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Quote Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (confirmDialog?.action) {
                  await confirmDialog.action();
                }
                setConfirmDialog(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
