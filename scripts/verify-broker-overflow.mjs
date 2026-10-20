import {randomUUID} from 'node:crypto';
import {createRabbitPublisher} from '../server/telemetry/rabbitPublisher.js';
const name=`test-submission-overflow-${randomUUID()}`;
const base=process.env.RABBITMQ_HTTP_URL,headers={'Content-Type':'application/json',Authorization:`Basic ${Buffer.from(`${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}`).toString('base64')}`};
const url=new URL(`/api/queues/%2F/${name}`,base);
try{
 const setup=await fetch(url,{method:'PUT',headers,body:JSON.stringify({durable:true,auto_delete:false,arguments:{'x-max-length-bytes':1024,'x-overflow':'reject-publish','x-expires':60000}})});
 if(!setup.ok)throw Error('Cannot create isolated test queue '+setup.status+' '+await setup.text());
 const publish=createRabbitPublisher({fetchImpl:async(url,options)=>{const body=JSON.parse(options.body);body.routing_key=name;return fetch(url,{...options,body:JSON.stringify(body)});}});
 await publish({kind:'submission',eventId:randomUUID(),test:'x'.repeat(600)});
 let rejected=false;try{await publish({kind:'submission',eventId:randomUUID(),test:'y'.repeat(600)});}catch{rejected=true;}
 if(!rejected)throw Error('Publisher falsely accepts rejected messages');
 const messages=await (await fetch(new URL(`/api/queues/%2F/${name}/get`,base),{method:'POST',headers,body:JSON.stringify({count:1,ackmode:'ack_requeue_false',encoding:'auto',truncate:2048})})).json();
 if(messages.length!==1||JSON.parse(messages[0].payload).test!=='x'.repeat(600))throw Error('Old message lost on overflow');
 console.log(JSON.stringify({overflowRejected:true,oldMessagesPreserved:true,testQueueOnly:true}));
}finally{await fetch(url,{method:'DELETE',headers});}
