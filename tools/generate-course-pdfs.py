"""Generate language-specific student handouts from the shared v3 curriculum."""
from pathlib import Path
import json,html,shutil,subprocess,re
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,Flowable,Preformatted
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from PIL import Image
root=Path(__file__).resolve().parents[1]
source=root/'docs/course-v3/materials.json'
if not source.exists():source=root/'docs/course-v3-materials.json'
data=json.loads(source.read_text())
fontroot=Path('/usr/share/fonts/truetype/dejavu')
for name,file in [('Lab','DejaVuSans.ttf'),('LabBold','DejaVuSans-Bold.ttf'),('LabMono','DejaVuSansMono.ttf')]:pdfmetrics.registerFont(TTFont(name,str(fontroot/file)))
pdfmetrics.registerFontFamily('Lab',normal='Lab',bold='LabBold',italic='Lab',boldItalic='LabBold')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleLab',fontName='LabBold',fontSize=21,leading=27,textColor=colors.HexColor('#16364a'),spaceAfter=15))
styles.add(ParagraphStyle(name='H2Lab',fontName='LabBold',fontSize=12,leading=17,textColor=colors.HexColor('#176d68'),spaceBefore=12,spaceAfter=5))
styles.add(ParagraphStyle(name='BodyLab',fontName='Lab',fontSize=9.4,leading=14,spaceAfter=7))
styles.add(ParagraphStyle(name='SmallLab',fontName='Lab',fontSize=8,leading=11,spaceAfter=4))
styles.add(ParagraphStyle(name='CodeLab',fontName='LabMono',fontSize=8.4,leading=12,backColor=colors.HexColor('#fff0c3'),borderPadding=10,spaceBefore=9,spaceAfter=12))
def p(text,style='BodyLab'):return Paragraph(html.escape(text),styles[style])
manifest=json.loads((root/'shared/lab-game-v2/assets/manifest.json').read_text())
def sprite(key):
 a=next(a for a in manifest['assets'] if a['key']==key);f=a['frame'];im=Image.open(root/'public/game-assets'/a['source']);return ImageReader(im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])))
class Diagram(Flowable):
 def __init__(self,kind):super().__init__();self.kind=kind;self.width=500;self.height=184
 def draw(self):
  c=self.canv;c.setFillColor(colors.HexColor('#eaf3e2'));c.roundRect(0,0,500,174,9,fill=1,stroke=0)
  def text(x,y,t,size=10):c.setFillColor(colors.HexColor('#234b42'));c.setFont('Lab',size);c.drawString(x,y,t)
  def asset(key,x,y,s=40):c.drawImage(sprite(key),x-s/2,y-s/2,s,s,mask='auto')
  def arrow(x1,y1,x2,y2):c.setStrokeColor(colors.HexColor('#b78629'));c.setLineWidth(2);c.line(x1,y1,x2,y2);c.line(x2,y2,x2-7,y2+5);c.line(x2,y2,x2-7,y2-5)
  if self.kind=='scene':
   c.setFillColor(colors.HexColor('#c9ddb2'));c.roundRect(15,15,300,144,7,fill=1,stroke=0)
   for x in range(35,300,30):c.setStrokeColor(colors.HexColor('#aac895'));c.line(x,15,x,159)
   for y in range(35,150,30):c.line(15,y,315,y)
   asset('player',105,85,42);asset('chest',245,85,42)
   text(40,140,'Cała scena: mapa i obiekty',11);text(68,50,'Player (100,150)',8);text(200,50,'Chest (240,150)',8)
   asset('player',401,118,48);text(337,70,'GameObject: Player');text(337,49,'Transform: pozycja');text(337,28,'Sprite: wygląd')
  elif self.kind=='input':
   asset('player',90,90);asset('player',400,90);arrow(125,90,367,90);text(125,140,'D / strzałka w prawo → ruch',12);text(45,40,'start (100,100)');text(325,40,'po 0.5 s: (160,100)');text(150,17,'getDirection() zachowuje kierunek')
  elif self.kind=='collisions':
   asset('player',174,88,48);c.setStrokeColor(colors.HexColor('#ed9441'));c.rect(158,72,32,32,fill=0);c.setFillColor(colors.HexColor('#65927b'));c.rect(190,24,20,128,fill=1,stroke=0);arrow(100,88,145,88);text(20,145,'Wygląd ściany + collider = przeszkoda',11);text(250,110,'Ściana: środek x=200');text(250,88,'Lewa krawędź x=190');text(250,65,'Gracz: połowa szerokości 16');text(250,42,'Stop: x=190−16=174')
  elif self.kind=='enemy-ai':
   asset('slime',100,86);asset('player',400,86);arrow(134,86,364,86);text(100,145,'Kierunek = pozycja gracza − pozycja wroga',11);text(50,38,'Slime: x=100');text(330,38,'Player: x=300');text(135,17,'60 px/s × 1 s → Slime x=160')
  else:
   asset('player',70,85);asset('fireball',242,85,24);asset('slime',421,85);arrow(110,85,216,85);arrow(267,85,380,85);text(120,143,'Space → pocisk → trafienie',12);text(345,116,'HP: 3 → 2',11);text(110,38,'HP=0 → przeciwnik znika');text(110,17,'Kontakt wroga → obrażenia gracza')
def footer(c,doc):
 c.setFont('Lab',8);c.setFillColor(colors.HexColor('#52697b'));c.drawString(36,22,f'Lab Game 2D • program v3 • {doc.language.upper()}');c.drawRightString(558,22,str(doc.page))
counts={}
for lang in ['java','js']:
 filename=f'kurs-gamedev-{lang}-v3.pdf';path=root/'public/courses'/filename;story=[]
 story+=[p(f'Prosta gra od pierwszych lekcji — {lang.upper()}','TitleLab'),p('24 lekcje. Cel: samodzielnie zbudowana arena z ruchem, walką, rozwojem, interfejsem i restartem.')]
 for chapter in data['manifest']['chapters']:story.append(p(f"{chapter['order']:02}. {chapter['title']}",'SmallLab'))
 story += [Spacer(1,10),p('Każda lekcja: 1. mała zmiana z przykładem; 2. podobny problem samodzielnie; 3. samodzielna rozbudowa. Złoty kolor pokazuje kod odpowiedzialny za zmianę.'),p('Pierwszych pięć lekcji daje ruch, przeszkody, przeciwnika i walkę z HP. Gotowe Health i Weapon rozbudujesz w lekcjach 10 i 11; AI w 14. Poniżej materiały i zadania startowe.'),PageBreak()]
 for chapter in data['lessons']:
  key=chapter['id'][4:];story += [p(f"Lekcja {chapter['order']} · {chapter['title']}",'TitleLab'),p('Czego się nauczysz','H2Lab'),p(' '.join(chapter['objectives'])),Diagram(key),Spacer(1,9)]
  for page in chapter['pages']:story += [p(page['title'],'H2Lab'),p(page['text'])]
  story += [p('Gotowa baza i dalsza nauka','H2Lab'),p(chapter.get('scaffolding',''))]
  if key=='projectiles':story.append(p('Sterowanie: WASD/strzałki; Space: strzał. Celuj zgodnie z ostatnim kierunkiem ruchu. RUN rozpoczyna świeżą próbę. Pokonaj wroga i sprawdź obrażenia gracza.'))
  story.append(PageBreak());story.append(p(f"Lekcja {chapter['order']} · zadania",'TitleLab'))
  for index,task in enumerate(chapter['tasks']):
   story += [p(f"{index+1}. {task.get('learningStage','Samodzielnie')} — {task['title']}",'H2Lab'),p(task['prompt'])]
   if index==0:
    story.append(p('Zmiana, która uruchamia mechanikę:','SmallLab'))
    for change in chapter['changes'][lang]:
     story += [p(change['file'],'SmallLab'),Preformatted(change['text'].strip(),styles['CodeLab'],maxLineLength=83)]
    story.append(p(task.get('solutionExplanation',''),'SmallLab'))
   for criterion in task['criteria']:story.append(p('• '+criterion,'SmallLab'))
  if chapter!=data['lessons'][-1]:story.append(PageBreak())
 doc=SimpleDocTemplate(str(path),pagesize=(595.28,841.89),leftMargin=36,rightMargin=36,topMargin=36,bottomMargin=40);doc.language=lang;doc.build(story,onFirstPage=footer,onLaterPages=footer)
 info=subprocess.check_output(['pdfinfo',str(path)],text=True);count=int(re.search(r'Pages:\s+(\d+)',info).group(1));counts[lang]=count
 prefix=root/'public/courses/previews'/filename[:-4];prefix.mkdir(parents=True,exist_ok=True)
 temp=root/'artifacts/pdf-v3';temp.mkdir(parents=True,exist_ok=True)
 subprocess.run(['pdftoppm','-scale-to','1200','-png',str(path),str(temp/lang)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 for i,image in enumerate(sorted(temp.glob(lang+'-*.png')),1):Image.open(image).save(prefix/f'page-{i}.webp',quality=85)
 print(filename,count)
(root/'public/courses/course-v3-pages.json').write_text(json.dumps(counts)+'\n')
