from pathlib import Path
import re
p=Path('components/admin/quote-detail-editor.tsx')
s=p.read_text(encoding='utf-8').replace('onOpenAutoFocus={() => { dialogReturnFocus.current = document.activeElement as HTMLElement; }} ','')
s=s.replace('<div className="quote-desk">','''<div className="quote-desk" onClickCapture={(event) => {
      const target = event.target as Element;
      const button = target.closest('button');
      if (button && !target.closest('[role="dialog"], [role="alertdialog"]')) dialogReturnFocus.current = button;
    }}>''')
a=s.index('<div className="grid desk-event-grid')
b=s.index('\n        </div>\n      </div>',a)
fields=re.findall(r'<Field(?:\s[^>]*)?>[\s\S]*?</Field>',s[a:b])
assert len(fields)==10,len(fields)
new='<div className="desk-event-grid">'+''.join('<div className="desk-event-row desk-event-row-'+str(i)+'">'+''.join(fields[i*3:i*3+3])+'</div>' for i in range(3))+fields[9]
s=s[:a]+new+s[b:]
p.write_text(s,encoding='utf-8')
p=Path('app/admin/quote-desk.css')
s=p.read_text(encoding='utf-8')+'''
.desk-event-grid { display: flex; flex-direction: column; gap: 15px; }
.desk-event-row { display: grid; gap: 20px; }
.desk-event-row-0 { grid-template-columns: 1fr 1.2fr .63fr; }
.desk-event-row-1 { grid-template-columns: 1.3fr 1.1fr .78fr; }
.desk-event-row-2 { grid-template-columns: .73fr .73fr 1.55fr; }
.desk-event-grid .desk-utilities > div { margin-top: 4px; flex-wrap: wrap; column-gap: 20px; }
.desk-tabs [role=tabpanel] > div:first-child > .grid { grid-template-columns: 1fr 1.04fr .82fr; }
.desk-tabs [role=tablist] { grid-template-columns: .58fr 1.1fr 1.42fr 1.35fr; }
@media(max-width:1250px) { .desk-event-row { grid-template-columns: 1fr 1fr; }.desk-event-row .desk-utilities { grid-column: 1/-1; }.desk-event-grid .desk-utilities > div { margin-top: 0; } }
@media(max-width:600px) { .desk-event-row,.desk-tabs [role=tabpanel] > div:first-child > .grid { grid-template-columns: 1fr; }.desk-tabs [role=tablist] { grid-template-columns: 1fr 1fr; }.desk-additional:not([open]) { float: none; margin: 0 0 10px; } }
'''
p.write_text(s,encoding='utf-8')
