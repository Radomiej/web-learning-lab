"""Import the user-provided course and conformance definitions, without prose drift."""
import json
import re
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
text = Path(sys.argv[1]).read_text(encoding='utf-8')
out = ROOT / 'shared/lab-game-v2'
chapters = []
pattern = r'^#### (\d{2})\. (.+?) — (g2d\.[\w.-]+)\s*$'
matches = list(re.finditer(pattern, text, re.M))
for i, match in enumerate(matches):
    block = text[match.end():matches[i+1].start() if i+1<len(matches) else text.index('### Opcjonalne rozszerzenia', match.end())]
    objective = re.search(r'\*\*Cele:\*\* (.+)',block).group(1)
    tasks=[]
    headers=list(re.finditer(r'^##### (.+?) — (.+)$',block,re.M))
    for j, header in enumerate(headers):
        taskblock=block[header.end():headers[j+1].start() if j+1<len(headers) else len(block)]
        taskid=re.search(r'ID: `([^`]+)`',taskblock).group(1)
        prompt=re.search(r'\*\*Polecenie:\*\* (.+)',taskblock).group(1)
        tasks.append({'id':taskid,'mode':taskid.rsplit('.',1)[1],'title':header.group(2),'prompt':prompt,'objective':re.search(r'\*\*Cel zadania:\*\* (.+)',taskblock).group(1),'criteria':re.findall(r'^\d+\. (.+)$',taskblock,re.M)})
    chapters.append({'id':match.group(3),'order':int(match.group(1)),'title':match.group(2),'objectives':[objective],'tasks':tasks,'prerequisites':[] if not chapters else [chapters[-1]['id']]})
assert len(chapters)==24 and sum(len(c['tasks']) for c in chapters)==72
(out/'course').mkdir(parents=True,exist_ok=True)
(out/'course/manifest.json').write_text(json.dumps({'engineApiVersion':2,'contentVersion':2,'chapters':chapters},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(out/'course/manifest.js').write_text('export const courseManifest = '+json.dumps({'engineApiVersion':2,'contentVersion':2,'chapters':chapters},ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
cases=[]
matches=list(re.finditer(r'^### (C\d{2})\. (.+)$',text,re.M))
for i,match in enumerate(matches):
    block=text[match.end():matches[i+1].start() if i+1<len(matches) else text.index('## 18.',match.end())]
    payloads=re.findall(r'```json\s*\n(.*?)\n```',block,re.S)
    cases.append({'id':match.group(1),'title':match.group(2),'area':re.search(r'Obszar: `([^`]+)`',block).group(1),'initial':json.loads(payloads[0]),'steps':re.findall(r'^\d+\. (.+)$',block,re.M),'expected':json.loads(payloads[-1]),'status':'definition'})
assert len(cases)==43
(out/'conformance').mkdir(parents=True,exist_ok=True)
(out/'conformance/scenarios.json').write_text(json.dumps({'tolerance':1e-6,'scenarios':cases},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Imported 24 chapters, 72 tasks and 43 conformance definitions; these are not execution results')
