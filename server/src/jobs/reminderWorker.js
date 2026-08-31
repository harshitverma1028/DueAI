import {Queue,Worker} from 'bullmq';
import {redis} from '../config/redis.js';
import {processReminders} from '../services/reminderService.js';

let queue=null;
export function startReminderWorker(){
 if(redis){
  queue=new Queue('DueAI-reminders',{connection:redis});
  new Worker('DueAI-reminders',async()=>processReminders(),{connection:redis});
  queue.add('reminder-sweep',{}, {repeat:{every:60*60*1000},removeOnComplete:100,removeOnFail:100}).catch(console.error);
  console.log('[Jobs] BullMQ reminder worker started');
 } else {
  setInterval(()=>processReminders().catch(console.error),60*60*1000);
  console.log('[Jobs] Redis unavailable; reminder interval fallback started');
 }
 processReminders().catch(console.error);
}
