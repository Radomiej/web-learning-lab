import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base='http://127.0.0.1:5190';
const reportPath=new URL('../docs/submission-e2e.json',import.meta.url),report=JSON.parse(readFileSync(reportPath));
const password=readFileSync(new URL('../../lab-admin/data/local-access.txt',import.meta.url),'utf8').match(/Hasło: (.+)/)?.[1];
const login=await fetch(`${base}/api/login`,{method:'POST',headers:{origin:base,'Content-Type':'application/json'},body:JSON.stringify({password})});
if(!login.ok)throw Error('Admin authentication failed');
const cookie=login.headers.get('set-cookie').split(';')[0];
for(const result of report.results){
 const response=await fetch(`${base}/api/submissions/${result.submissionId}`,{headers:{cookie}});
 if(!response.ok)throw Error('Submission missing after restart');
 const saved=await response.json(),digest=createHash('sha256').update(JSON.stringify({files:saved.files,assignment:saved.assignment})).digest('hex');
 if(process.argv.includes('--snapshot'))result.persistedDigest=digest;
 else {if(!result.persistedDigest||result.persistedDigest!==digest)throw Error('Archived snapshot changed after restart');result.restartVerified=true;}
}
writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({submissions:report.results.length,mode:process.argv.includes('--snapshot')?'snapshot':'restart-verified',exactFilesAndTeacherKey:true}));
