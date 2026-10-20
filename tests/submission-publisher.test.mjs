import test from 'node:test';
import assert from 'node:assert/strict';
import {createRabbitPublisher} from '../server/telemetry/rabbitPublisher.js';
test('submissions use the durable archive queue while activity routing remains compatible',async()=>{
 const messages=[];
 const publish=createRabbitPublisher({env:{RABBITMQ_HTTP_URL:'https://broker.test',RABBITMQ_USERNAME:'test',RABBITMQ_PASSWORD:'test'},fetchImpl:async(_url,options)=>{messages.push(JSON.parse(options.body));return {ok:true,json:async()=>({routed:true})};}});
 await publish({kind:'submission',eventId:'quiz'});await publish({type:'heartbeat',eventId:'activity'});
 assert.equal(messages[0].routing_key,'lab.submissions.v1');assert.equal(messages[0].properties.delivery_mode,2);assert.equal(messages[1].routing_key,'java-lab.activity');
});
