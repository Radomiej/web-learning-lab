// Intentional labelled TEST submissions through the real public API and teacher API.
import {randomUUID} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {generateAssignment} from '../shared/assignments/generator.js';
const base=process.env.SMOKE_LAB_ORIGIN||'https://web-learning-lab.vercel.app';
const admin='http://127.0.0.1:5190';
async function post(path,body,token){const response=await fetch(`${base}${path}`,{method:'POST',headers:{origin:base,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});const data=await response.json();if(!response.ok)throw Error(`${path}: HTTP ${response.status} ${data.message||''}`);return {status:response.status,data};}
const password=readFileSync(new URL('../../lab-admin/data/local-access.txt',import.meta.url),'utf8').match(/Hasło: (.+)/)?.[1];
const login=await fetch(`${admin}/api/login`,{method:'POST',headers:{origin:admin,'Content-Type':'application/json'},body:JSON.stringify({password})});
if(!login.ok)throw Error(`Admin login HTTP ${login.status}`);
const cookie=login.headers.get('set-cookie').split(';')[0];
const results=[];
for(const templateId of ['course-quiz-html-text','js-lesson-fetch']){
 const descriptor={generatorVersion:'2',templateId,seed:`TEST-E2E-${randomUUID().slice(0,8)}`,difficulty:'standard',index:0};
 const reference=generateAssignment(descriptor),machineId=randomUUID(),sessionId=randomUUID(),submissionId=randomUUID();
 await post('/api/assignments',descriptor);
 const {data:session}=await post('/api/telemetry/session',{machineId,sessionId});
 const message={submissionId,eventId:submissionId,appId:'www-lab',machineId,sessionId,studentId:'TEST-SYSTEM-WWW',studentName:'TEST odbioru oddań',sentAt:Date.now(),assignment:descriptor,files:reference.referenceFiles};
 const accepted=await post('/api/submissions',message,session.token);
 if(accepted.status!==202||accepted.data.status!=='broker_accepted')throw Error('No broker receipt');
 // Same identity and snapshot must not create a duplicate in the archive.
 await post('/api/submissions',message,session.token);
 let saved;
 for(let i=0;i<40;i++){const response=await fetch(`${admin}/api/submissions/${submissionId}`,{headers:{cookie}});if(response.ok){saved=await response.json();break;}await new Promise(resolve=>setTimeout(resolve,250));}
 if(!saved)throw Error(`Submission ${submissionId} accepted by broker but missing in Lab Admin`);
 if(JSON.stringify(saved.files)!==JSON.stringify(message.files))throw Error('Files changed in transit');
 if(JSON.stringify(saved.assignment.referenceFiles)!==JSON.stringify(reference.referenceFiles))throw Error('Teacher key changed in transit');
 results.push({submissionId,templateId,accepted:202,archived:true,exactFiles:true,teacherKey:true});
}
const listing=await (await fetch(`${admin}/api/submissions`,{headers:{cookie}})).json();
for(const result of results)if(listing.submissions.filter(s=>s.submissionId===result.submissionId).length!==1)throw Error('Retry duplicated submission');
const report={origin:base,time:new Date().toISOString(),results,quizArchive:listing.quizArchive};
writeFileSync(new URL('../docs/submission-e2e.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
