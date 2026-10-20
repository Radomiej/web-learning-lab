// Print broker metadata only. Never print credentials or message payloads.
const env=process.env;
const base=new URL(env.RABBITMQ_HTTP_URL);
const headers={Authorization:`Basic ${Buffer.from(`${env.RABBITMQ_USERNAME}:${env.RABBITMQ_PASSWORD}`).toString('base64')}`};
const queueName=process.argv[2]||'java-lab.activity';
if(!['java-lab.activity','lab.submissions.v1'].includes(queueName))throw Error('Unknown queue');
const response=await fetch(new URL(`/api/queues/%2F/${queueName}`,base),{headers,signal:AbortSignal.timeout(10000)});
if(!response.ok)throw Error(`Broker metadata HTTP ${response.status}`);
const queue=await response.json();
console.log(JSON.stringify({name:queue.name,durable:queue.durable,autoDelete:queue.auto_delete,arguments:queue.arguments,policy:queue.policy,effectivePolicy:queue.effective_policy_definition,consumers:queue.consumers,messages:queue.messages,messagesReady:queue.messages_ready,messagesUnacknowledged:queue.messages_unacknowledged},null,2));
