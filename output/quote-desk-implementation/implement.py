from pathlib import Path
root=Path.cwd()
p=root/'components/admin/quote-detail-editor.tsx'
s=p.read_text(encoding='utf-8')
s=s.replace('useState, useEffect, useCallback','useState, useEffect, useCallback, useRef')
s=s.replace("import { Field, FieldLabel }", "import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';\nimport { QuoteDeskSummary } from '@/components/admin/quote-desk-summary';\nimport { formatAdminStatus } from '@/lib/quotes/status';\nimport { FileText, FileCheck, WalletCards } from 'lucide-react';\nimport { Field, FieldLabel }")
s=s.replace('  const [saving, setSaving]', '''  const [deskTab, setDeskTab] = useState('event');
  const [savedForm, setSavedForm] = useState(form);
  const saveInFlight = useRef(false);
  const confirmInFlight = useRef(false);
  const [confirming, setConfirming] = useState(false);
  const dirtyCount = (Object.keys(form) as (keyof typeof form)[]).filter(key => form[key] !== savedForm[key]).length;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirtyCount) event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirtyCount]);
  const [saving, setSaving]''')
start=s.index('    setForm(prev => ({',s.index('const applyQuoteToForm'))
end=s.index('    }));',start)+len('    }));')
chunk=s[start:end].replace('setForm(prev => ({\n      ...prev,','const nextForm = {\n      ...form,').replace('    }));','    };\n    setForm(nextForm);\n    setSavedForm(nextForm);')
s=s[:start]+chunk+s[end:]
s=s.replace('  const handleSave = async () => {','  const handleSave = async () => {\n    if (saveInFlight.current) return;\n    saveInFlight.current = true;')
s=s.replace('      setSaving(false);','      saveInFlight.current = false;\n      setSaving(false);')
s=s.replace("  const handleBackToDashboard = () => {", "  const handleBackToDashboard = () => {\n    if (dirtyCount && !window.confirm('Discard unsaved quote changes and return to quotes?')) return;")
names=['Customer Information','Event Details','Pricing','Quote Options','Workflow Status','Agreement Tracking','Deposit Tracking','Customer Activity','Notes','Actions']
positions=[s.index('{/* '+name+' */}')-6 for name in names]
dialog=s.index('      <Dialog open={testQuoteDialogOpen}')
sections={name:s[positions[i]:positions[i+1] if i+1<len(names) else dialog] for i,name in enumerate(names)}
actions=sections['Actions']; extra=actions.index('        <Button type="button" variant="outline" onClick={() => setTestQuoteDialogOpen')
mainactions=actions[actions.index('        <Button'):extra]
extras=actions[extra:actions.rindex('      </div>')]
event=sections['Event Details']
import re
fields={}
for id in ['distance_miles','zip_code']:
 pattern=r'          <Field>\s*<FieldLabel htmlFor="'+id+r'"[\s\S]*?          </Field>'
 match=re.search(pattern,event); assert match,id
 fields[id]=match.group(); event=event.replace(match.group(),'')
event=event.replace('grid-cols-1 md:grid-cols-2 lg:grid-cols-4','desk-event-grid').replace('className="md:col-span-2"','className="desk-address"').replace('className="flex items-center gap-2 md:col-span-2"','className="desk-utilities"').replace('className="md:col-span-2 lg:col-span-4"','className="desk-event-notes"')
event=event.replace('Additional Notes (from customer)','Customer event notes (submitted by customer)')
additional='''<details className="desk-additional"><summary>Additional event details &amp; same-date requests</summary><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">'''+''.join(fields.values())+'''</div>{!quote.is_test_quote && sameDateQuotes.length > 0 && <SameDateRequestsPanel currentQuoteId={quote.id} quotes={sameDateQuotes} />}</details>'''
header='''    <div className="quote-desk">
      <button type="button" onClick={handleBackToDashboard} className="desk-back"><ArrowLeft aria-hidden="true" size={17} />Back to quotes</button>
      <h1 className="desk-title">Quote Desk</h1>
      <div className="desk-masthead"><strong className="desk-number">{quote.quote_number || quote.id.slice(0, 8)}</strong><div className="desk-identity"><strong>{form.customer_name}</strong><span>{form.event_type} · {form.event_date ? new Date(form.event_date + 'T12:00:00').toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}) : 'Date not set'} · {form.city}, {form.state}</span></div><div className="desk-total"><span>Total (USD)</span><strong>{formatCurrency(calculatedPricing.total_price)}</strong></div></div>
      <div className="desk-status-strip" aria-label="Saved workflow states">{[{label:'Quote',value:quote.status,Icon:FileText,family:'quote' as const},{label:'Agreement',value:quote.agreement_status,Icon:FileCheck,family:'agreement' as const},{label:'Deposit',value:quote.deposit_status,Icon:WalletCards,family:'deposit' as const}].map(({label,value,Icon,family}) => <div key={label}><Icon aria-hidden="true"/><strong>{label}</strong><span data-status={value}>{formatAdminStatus(value,family)}</span></div>)}</div>
      {quote.is_test_quote && <p role="status" className="desk-test">TEST QUOTE · Actions affect this test record only.</p>}
'''
messages=s[s.index('      {/* Messages */}'):positions[0]].replace('<div\n          className=', '<div role={message.type === \'error\' ? \'alert\' : \'status\'}\n          className=')
tabs='''<div className="desk-workspace"><Tabs value={deskTab} onValueChange={setDeskTab} className="desk-tabs"><TabsList aria-label="Quote workspace"><TabsTrigger value="event">Event</TabsTrigger><TabsTrigger value="pricing">Pricing &amp; options</TabsTrigger><TabsTrigger value="payments">Agreements &amp; payments</TabsTrigger><TabsTrigger value="activity">Activity &amp; notes</TabsTrigger></TabsList>'''
for key,body in [('event',sections['Customer Information']+event+additional),('pricing',sections['Pricing']+sections['Quote Options']),('payments',sections['Workflow Status']+sections['Agreement Tracking']+sections['Deposit Tracking']),('activity',sections['Customer Activity']+sections['Notes']+'<div className="flex flex-wrap gap-3">'+extras+'</div>')]:
 tabs+='<TabsContent value="'+key+'" forceMount>'+body+'</TabsContent>'
tabs+='''</Tabs><QuoteDeskSummary quote={quote} form={form} pricing={calculatedPricing} otherBookingOwnsDate={otherBookingOwnsDate} fallbackDistance={fallbackDistance} distanceMessage={distanceMessage} financiallyLocked={financiallyLocked} onReviewPricing={() => setDeskTab('pricing')} /></div>'''
footer='''<footer className="desk-action-bar"><p role="status">{saving ? 'Saving changes…' : dirtyCount ? `${dirtyCount} unsaved ${dirtyCount === 1 ? 'change' : 'changes'}` : 'All changes saved'}</p><div className="desk-main-actions">'''+mainactions+'''<small>Preview and confirm before sending</small></div></footer>'''
footer=footer.replace('disabled={saving}','disabled={saving || confirming}').replace('disabled={previewingQuoteEmail}','disabled={previewingQuoteEmail || saving || confirming}').replace('disabled={sendingQuote ||','disabled={saving || confirming || sendingQuote ||')
s=s[:s.index('    <div className="space-y-6">',s.index('const quoteDetailsChanged'))]+header+messages+tabs+footer+s[dialog:]
s=s.replace('onOpenChange={(open) => !open && setConfirmDialog(null)}','onOpenChange={(open) => !open && !confirmInFlight.current && setConfirmDialog(null)}')
s=s.replace('<AlertDialogCancel>Cancel</AlertDialogCancel>','<AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>')
s=s.replace('''onClick={async () => {
                if (confirmDialog?.action) {
                  await confirmDialog.action();
                }
                setConfirmDialog(null);
              }}''','''disabled={confirming}
              onClick={async (event) => {
                event.preventDefault();
                if (confirmInFlight.current) return;
                confirmInFlight.current = true;
                setConfirming(true);
                try { await confirmDialog?.action(); setConfirmDialog(null); }
                finally { confirmInFlight.current = false; setConfirming(false); }
              }}''')
p.write_text(s,encoding='utf-8')
p=root/'components/admin/admin-shell.tsx';s=p.read_text(encoding='utf-8');s=s.replace('className="admin-typography min-h-screen bg-[#f6f3ef] text-charcoal"','className={cn("admin-typography min-h-screen bg-[#f6f3ef] text-charcoal", pathname.startsWith("/admin/quotes/") && "quote-desk-route")}');s=s.replace('<AdminBreadcrumbs pathname={pathname} />','{!pathname.startsWith("/admin/quotes/") && <AdminBreadcrumbs pathname={pathname} />}');s=s.replace('<span className="mt-3 block text-xs text-[#dfc591]">Operations</span>','{pathname.startsWith("/admin/quotes/") && <span className="desk-brand-subtitle">EVENTS &amp; AMENITIES</span>}\n            <span className="mt-3 block text-xs text-[#dfc591]">Operations</span>');p.write_text(s,encoding='utf-8')
p=root/'app/admin/layout.tsx';s=p.read_text(encoding='utf-8').replace("import './operations.css';","import './operations.css';\nimport './quote-desk.css';");p.write_text(s,encoding='utf-8')
