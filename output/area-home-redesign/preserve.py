from pathlib import Path
from html.parser import HTMLParser
import json,re,sys
class PageParser(HTMLParser):
 def __init__(self):super().__init__();self.main=False;self.h1=False;self.text=[];self.heading=[];self.links=[];self.canonical=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='main':self.main=True
  if tag=='h1':self.h1=True
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  if tag=='a' and self.main:self.links.append(a.get('href'))
 def handle_endtag(self,tag):
  if tag=='main':self.main=False
  if tag=='h1':self.h1=False
 def handle_data(self,data):
  if self.main:self.text.append(data)
  if self.h1:self.heading.append(data)
def norm(s):return re.sub(r'\s+',' ',s).strip()
rows=[]
for path in Path('content/service-areas').glob('*.json'):
 d=json.loads(path.read_text(encoding='utf-8'))
 if d.get('draft'):continue
 html=Path(sys.argv[1]+'/server/app/service-areas')/(d['slug']+'.html')
 if not html.exists():rows.append({'slug':d['slug'],'missingPage':True});continue
 p=PageParser();p.feed(html.read_text(encoding='utf-8'));text=norm(''.join(p.text));missing=[]
 for field in ['intro','nearby','venueNote','useCases','localOverview','weddingUseCase','privateEventUseCase','corporateFestivalUseCase','constructionLongTermUseCase','setupLogistics','seasonalPlanning','nearbyCommunities','trustNote']:
  values=d.get(field,[]);values=[values] if isinstance(values,str) else values
  for v in values:
   if norm(v) not in text:missing.append({'field':field,'text':v})
 for faq in d['faqs']:
  for v in faq.values():
   if norm(v) not in text:missing.append({'field':'faqs','text':v})
 for field in ['resourceLinks','serviceLinks']:
  for link in d.get(field,[]):
   if link['href'] not in p.links or norm(link['label']) not in text:missing.append({'field':field,'link':link})
 rows.append({'slug':d['slug'],'h1':norm(''.join(p.heading)),'canonical':p.canonical,'missing':missing})
Path('output/area-home-redesign/preservation.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
failures=[r for r in rows if r.get('missing') or r.get('missingPage') or r['h1']!='Luxury Restroom Trailer Rentals in '+json.loads((Path('content/service-areas')/(r['slug']+'.json')).read_text(encoding='utf-8'))['city']+', MI']
print(json.dumps({'cities':len(rows),'failures':failures},indent=2))
sys.exit(bool(failures))
