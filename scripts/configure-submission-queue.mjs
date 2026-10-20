// Add a dedicated submission queue. Never delete or modify the telemetry queue.
const name='lab.submissions.v1',args={'x-message-ttl':365*86400000,'x-max-length-bytes':500*1024*1024,'x-overflow':'reject-publish'};
const headers={'Content-Type':'application/json',Authorization:`Basic ${Buffer.from(`${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}`).toString('base64')}`};
const url=new URL(`/api/queues/%2F/${name}`,process.env.RABBITMQ_HTTP_URL);
const response=await fetch(url,{method:'PUT',headers,body:JSON.stringify({durable:true,auto_delete:false,arguments:args}),signal:AbortSignal.timeout(10000)});
if(!response.ok)throw Error(`Queue setup HTTP ${response.status}; existing incompatible queue must be migrated without deletion.`);
const queue=await (await fetch(url,{headers})).json();
console.log(JSON.stringify({queue:queue.name,durable:queue.durable,arguments:queue.arguments,consumers:queue.consumers}));
