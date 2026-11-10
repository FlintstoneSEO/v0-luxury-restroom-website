"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowRight, Calculator, Check, Clock3, Info, RotateCcw, Save, SlidersHorizontal, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { calculateQuotePrice, formatCurrency } from '@/lib/pricing-engine';
import { PRICING_FIELDS, PRICING_SECTIONS, formatSetting, validatePricingSettings, type SettingDefinition, type SettingKey } from '@/lib/pricing/settings';
import type { PricingSettings } from '@/lib/types/quote';

const SCENARIOS = [
  { label: '2–10 PM', start: '14:00', end: '22:00' },
  { label: 'Noon–10 PM', start: '12:00', end: '22:00' },
  { label: '4–11 PM', start: '16:00', end: '23:00' },
  { label: '2–11 PM', start: '14:00', end: '23:00' },
  { label: '2–10:30 PM', start: '14:00', end: '22:30' },
  { label: '4 PM–1 AM', start: '16:00', end: '01:00' },
];
function futureDate() {
  const date = new Date(); date.setDate(date.getDate() + 30);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function toDraft(settings: PricingSettings): Record<string, string> {
  return Object.fromEntries(PRICING_FIELDS.map(field => [field.key, String(settings[field.key] ?? '')]));
}

export default function PricingSettingsEditor({ initialSettings, loadError }: { initialSettings: PricingSettings; loadError?: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSettings);
  const [draft, setDraft] = useState(() => toDraft(initialSettings));
  const [review, setReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [sample, setSample] = useState({ guests: '100', miles: '15', start: '14:00', end: '22:00', date: futureDate(), power: true, water: true });
  const values = useMemo(() => Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim() === '' ? NaN : Number(value)])) as unknown as PricingSettings, [draft]);
  const errors = validatePricingSettings(values);
  const invalid = Object.keys(errors).length > 0;
  const changed = PRICING_FIELDS.filter(field => values[field.key] !== saved[field.key]);
  const dirty = changed.length > 0;


  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const navigate = (event: MouseEvent) => {
      const link = (event.target as Element).closest('a');
      if (!link || link.target === '_blank' || link.getAttribute('href')?.startsWith('#') || event.ctrlKey || event.metaKey) return;
      if (!window.confirm('Leave this page and discard your unsaved pricing changes?')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', navigate, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', navigate, true); };
  }, [dirty]);

  const preview = useMemo(() => {
    if (Object.keys(validatePricingSettings(values)).length) return { error: 'Correct the highlighted settings to calculate a preview.' };
    if (!sample.guests || !Number.isInteger(Number(sample.guests)) || Number(sample.guests) < 1 || sample.miles.trim() === '' || !Number.isFinite(Number(sample.miles)) || Number(sample.miles) < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(sample.date) || !sample.start || !sample.end || sample.start === sample.end) return { error: 'Enter a guest count, miles, event date, and different start and end times.' };
    try {
      return { result: calculateQuotePrice(Number(sample.guests), Number(sample.miles), sample.power, sample.water, sample.end, sample.date, values, sample.start) };
    } catch (error) { return { error: error instanceof Error ? error.message : 'Check the example event.' }; }
  }, [values, sample]);

  function update(key: SettingKey, value: string) { setDraft(previous => ({ ...previous, [key]: value })); setMessage(''); }
  function reset() { setDraft(toDraft(saved)); setMessage('Unsaved changes discarded.'); setSaveError(false); }
  function tryProposal() {
    setDraft(previous => ({ ...previous, event_time_policy_enabled: '1', extra_hours_enabled: '1', included_event_hours: '8', additional_event_hourly_rate: '100', after_hours_hourly_rate: '75', after_hours_cutoff_hour: '22', stack_hourly_charges: '1' }));
    setSaveError(false); setMessage('Hourly proposal loaded into your draft. Review rounding and the charge limit before saving. Guest prices and other fees are unchanged.');
  }
  function openReview() {

    if (invalid) { document.getElementById(`pricing-${Object.keys(errors)[0]}`)?.focus(); return; }
    setReview(true);
  }
  async function save() {
    if (saving || invalid || loadError) return;
    setSaving(true); setMessage(''); setSaveError(false);
    try {
      const response = await fetch('/api/admin/pricing', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: Object.fromEntries(changed.map(field => [field.key, values[field.key]])) }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) throw new Error(body.error || 'Pricing could not be saved. Your changes are still here.');
      setSaved({ ...values }); setReview(false); setMessage('Pricing saved. New quotes and explicit revisions will use these rules.'); router.refresh();
    } catch (error) { setSaveError(true); setMessage(error instanceof Error ? error.message : 'Unable to save. Please try again.'); }
    finally { setSaving(false); }
  }

  function fieldControl(field: SettingDefinition) {
    const id = `pricing-${field.key}`;
    const error = errors[field.key];
    const showError = Boolean(error);
    return <div className="pricing-field" key={field.key}>
      <label htmlFor={id}>{field.label}</label>
      {field.options ? <select id={id} value={draft[field.key]} onChange={event => update(field.key, event.target.value)} aria-invalid={showError} aria-describedby={`${id}-help`}>
        {!field.options.some(([value]) => String(value) === draft[field.key]) && <option value={draft[field.key]}>Choose a valid option</option>}
        {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select> : field.unit === 'time' ? <select id={id} value={draft[field.key]} onChange={event => update(field.key, event.target.value)} aria-invalid={showError} aria-describedby={`${id}-help`}>
        {(!Number.isInteger(values[field.key]) || Number(values[field.key]) > 23 || Number(values[field.key]) < 0) && <option value={draft[field.key]}>Choose a valid time (saved: {draft[field.key]})</option>}
        {Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{formatSetting(field, hour)}</option>)}
      </select> : <div className="pricing-input-wrap"><input id={id} type="number" min="0" max={field.max ?? 1000000} step={field.integer ? '1' : '0.01'} value={draft[field.key]} onChange={event => update(field.key, event.target.value)} aria-invalid={showError} aria-describedby={`${id}-help`} /><span aria-hidden="true">{field.unit}</span></div>}
      <p id={`${id}-help`} className={showError ? 'pricing-field-error' : 'pricing-help'}>{showError ? error : field.help}</p>
    </div>;
  }
  const result = preview.result;
  const reasons = result?.details.service_review_reasons as string[] | undefined;
  return <div className="pricing-workspace">
    <header className="pricing-heading"><div><p className="pricing-kicker">BUSINESS CONFIGURATION</p><h1>Pricing &amp; settings</h1><p>Shape your pricing. See exactly how it adds up.</p></div><span className="pricing-state" data-dirty={dirty}><span />{invalid ? 'Needs attention' : dirty ? 'Unsaved changes' : 'Saved pricing'}</span></header>
    <div className="pricing-impact"><Info aria-hidden="true" /><p>Changes apply to new quotes and explicit financial revisions. Existing sent, approved, signed, and paid quotes keep their saved totals.</p></div>
    {loadError && <div className="pricing-error" role="alert">{loadError} <Button variant="outline" onClick={() => window.location.reload()}>Reload pricing</Button></div>}
    {invalid && !loadError && <div className="pricing-error" role="alert"><TriangleAlert size={18} aria-hidden="true"/><span>A pricing setting needs attention before a preview can be calculated. <a href={`#pricing-${Object.keys(errors)[0]}`}>Review the highlighted field</a>.</span></div>}
    <nav className="pricing-section-nav" aria-label="Pricing sections">{PRICING_SECTIONS.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}<a className="pricing-preview-jump" href="#quote-preview"><Calculator size={16} aria-hidden="true"/>Preview quote</a></nav>
    <div className="pricing-columns">
      <fieldset className="pricing-editor" disabled={Boolean(loadError) || saving}><legend className="sr-only">Pricing policy</legend>
        {PRICING_SECTIONS.map((section, index) => <section className="pricing-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-heading`}>
          <div className="pricing-section-heading"><span className="pricing-section-number">{String(index + 1).padStart(2, '0')}</span><div><h2 id={`${section.id}-heading`}>{section.title}</h2><p>{section.description}</p></div></div>
          {section.id === 'event-hours' && <div className="pricing-proposal"><Clock3 aria-hidden="true"/><div><strong>Explore the 8-hour proposal</strong><p>8 hours included · $100 per extra hour · $75 per hour after 10 PM.</p><button type="button" onClick={tryProposal}>Try these hourly rules <ArrowRight size={15} aria-hidden="true"/></button></div></div>}
          <div className="pricing-field-grid">{section.fields.map(fieldControl)}</div>
          {section.id === 'event-hours' && !values.event_time_policy_enabled && <p className="pricing-rule-note"><Info size={16} aria-hidden="true"/>Extra event hours are off while the current end-time calculation is selected.</p>}
        </section>)}
      </fieldset>
      <aside className="pricing-preview" id="quote-preview" aria-labelledby="preview-heading">
        <div className="pricing-preview-title"><span><Calculator size={20} aria-hidden="true"/>QUOTE SANDBOX</span><span>Live preview</span></div>
        <div className="pricing-preview-body"><h2 id="preview-heading">Try an event</h2><p className="pricing-help">Uses your unsaved choices. No quote is created.</p>
          <div className="pricing-scenarios" aria-label="Example event windows">{SCENARIOS.map(scenario => <button type="button" key={scenario.label} aria-pressed={sample.start === scenario.start && sample.end === scenario.end} onClick={() => setSample(previous => ({ ...previous, start: scenario.start, end: scenario.end }))}>{scenario.label}</button>)}</div>
          <div className="pricing-sample-grid">
            <label>Guests<input type="number" min="1" step="1" value={sample.guests} onChange={event => setSample({ ...sample, guests: event.target.value })}/></label>
            <label>Delivery miles<input type="number" min="0" step="0.1" value={sample.miles} onChange={event => setSample({ ...sample, miles: event.target.value })}/></label>
            <label>Guest-use start<input type="time" value={sample.start} onChange={event => setSample({ ...sample, start: event.target.value })}/></label>
            <label>Guest-use end<input type="time" value={sample.end} onChange={event => setSample({ ...sample, end: event.target.value })}/></label>
            <label className="pricing-sample-date">Event date<input type="date" value={sample.date} onChange={event => setSample({ ...sample, date: event.target.value })}/></label>
          </div>
          {sample.end < sample.start && <p className="pricing-overnight"><Clock3 size={14} aria-hidden="true"/>Ends the following day</p>}
          <div className="pricing-checks"><label><input type="checkbox" checked={sample.power} onChange={event => setSample({ ...sample, power: event.target.checked })}/>Power available</label><label><input type="checkbox" checked={sample.water} onChange={event => setSample({ ...sample, water: event.target.checked })}/>Water available</label></div>
          {preview.error || loadError ? <div className="pricing-error" role="status"><TriangleAlert size={18} aria-hidden="true"/>{loadError ? 'Preview unavailable until saved pricing loads.' : preview.error}</div> : result && <>
            <div className="pricing-duration"><span>{Number(result.details.event_hours).toLocaleString('en-US', { maximumFractionDigits: 2 })} hours of guest use</span><span>{sample.guests} guests</span></div>
            <dl className="pricing-lines">{result.line_items.filter(item => item.code === 'base_rental' || item.total > 0).map(item => <div key={item.code}><dt>{item.label}{['extra_hours', 'after_hours'].includes(item.code) && <small>{Number(item.quantity.toFixed(2))} {item.quantity === 1 ? 'hr' : 'hrs'} × {formatCurrency(item.unit_price)}</small>}</dt><dd>{formatCurrency(item.total)}</dd></div>)}
              <div className="pricing-subtotal"><dt>Subtotal</dt><dd>{formatCurrency(result.subtotal)}</dd></div><div><dt>Sales tax ({values.sales_tax_percentage}%)</dt><dd>{formatCurrency(result.sales_tax_amount)}</dd></div>
            </dl>
            <div className="pricing-total"><span>Example total<strong>{formatCurrency(result.total_price)}</strong></span><span>USD</span></div>
            <dl className="pricing-payment"><div><dt>Deposit · {result.deposit_percentage}%</dt><dd>{formatCurrency(result.deposit_amount)}</dd></div><div><dt>Remaining balance</dt><dd>{formatCurrency(result.final_balance)}</dd></div></dl>
            {reasons && reasons.length > 0 && <div className="pricing-review-notice"><strong><TriangleAlert size={16} aria-hidden="true"/>Service review suggested</strong>{reasons.map(reason => <p key={reason}>{reason}</p>)}<p>Additional service is quoted separately.</p></div>}
          </>}
        </div>
      </aside>
    </div>
    <footer className="pricing-savebar"><div><strong><SlidersHorizontal size={17} aria-hidden="true"/>{invalid ? 'Review the highlighted settings' : dirty ? `${changed.length} unsaved ${changed.length === 1 ? 'change' : 'changes'}` : 'Your pricing is up to date'}</strong><p>{dirty ? 'Preview first. Review before saving.' : 'Edit a rate or rule to try a new calculation.'}</p></div><div className="pricing-save-actions"><Button type="button" variant="outline" disabled={!dirty || saving || Boolean(loadError)} onClick={reset}><RotateCcw size={16} aria-hidden="true"/>Reset</Button><Button type="button" disabled={!dirty || saving || Boolean(loadError)} onClick={openReview}><Save size={16} aria-hidden="true"/>Review changes</Button><a href="#quote-preview" aria-label="Jump to quote preview"><ArrowDown size={14} aria-hidden="true"/><span>Preview{result && !loadError && <small>{formatCurrency(result.total_price)}</small>}</span></a></div></footer>
    {message && <p className={saveError ? 'pricing-error' : 'pricing-save-message'} role={saveError ? 'alert' : 'status'}>{!saveError && <Check size={17} aria-hidden="true"/>}{message}</p>}
    <Dialog open={review} onOpenChange={open => { if (!saving) setReview(open); }}><DialogContent className="pricing-review-dialog" showCloseButton={!saving}><DialogHeader><DialogTitle>Review pricing changes</DialogTitle><DialogDescription>These choices affect new quotes and explicit revisions. Existing saved quotes are not automatically repriced.</DialogDescription></DialogHeader><div className="pricing-diff"><table><caption className="sr-only">Current and proposed pricing settings</caption><thead><tr><th scope="col">Setting</th><th scope="col">Current</th><th scope="col">New</th></tr></thead><tbody>{changed.map(field => <tr key={field.key}><th scope="row">{field.label}</th><td>{formatSetting(field, saved[field.key])}</td><td>{formatSetting(field, values[field.key])}</td></tr>)}</tbody></table></div>{saveError && <p className="pricing-error" role="alert">{message}</p>}<DialogFooter><Button variant="outline" disabled={saving} onClick={() => setReview(false)}>Keep editing</Button><Button disabled={saving || invalid} onClick={save}>{saving ? 'Saving…' : 'Save pricing rules'}</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
