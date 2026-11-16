import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const files={state:'src/lib/state.tsx',client:'src/lib/api-core.ts',server:'backend/src/server.ts',handlers:'backend/src/handlers.ts',service:'backend/src/agent-service.ts',answer:'src/components/Answer.tsx'};
const read=p=>readFileSync(resolve(root,p),'utf8');
const svg=read('scripts/workflow-template.svg'),puml=read('scripts/workflow-template.puml');
const labels=[...svg.matchAll(/<text[^>]*>(\d+)\. ([^<]+)<\/text>/g)].map(m=>[Number(m[1]),m[2].replaceAll('&amp;','&').replaceAll('&gt;','>')]);
if(labels.length!==16||labels.some(([n],i)=>n!==i+1))throw Error('UML must contain exactly 16 consecutive interactions');
const umlLabels=puml.split('\n').filter(line=>/\s(?:->|-->)\s/.test(line)).map(line=>line.split(':').slice(1).join(':').trim());
if(umlLabels.length!==16||umlLabels.some((title,i)=>title!==labels[i][1]))throw Error('SVG and PlantUML must share all 16 interaction labels');
const definitions=[
 ['state','const trimmed = prompt.trim()',5,'Trim the native input and lock immediately.','The provider is mounted above Expo Router screens, so navigation preserves the lab. Server validation repeats these constraints.'],
 ['client',"const response = await fetch(base + '/api/agent/stream'",5,'Post JSON using expo/fetch.','The public base URL changes for web, emulator and physical devices. The Claude key never enters the Expo dependency graph.'],
 ['handlers','const prompt = validatePrompt(body)',3,'Validate untrusted JSON on the server.','The HTTP adapter enforces explicit CORS and a 32 KiB body limit before handlers validate content type and a trimmed 1–4000 character prompt.'],
 ['server','const response=await',3,'Route the request to the Node SDK service.','A separate Node process can run the CLI-backed Agent SDK while the Expo client remains native. This server boundary is the same for web and devices.'],
 ['service','const conversation = queryFn(',6,'Invoke the actual TypeScript Agent SDK.','The SDK owns the Claude transport and CLI runtime. This source is the application call boundary, not an implementation of the SDK’s internal network request.'],
 ['service','for await (const message of conversation)',4,'Consume the SDK async iterator.','The SDK returns model and lifecycle messages to this application loop. Tools, skills, MCP, plugins and sessions are disabled through explicit options.'],
 ['service','yield { type, summary, data }',3,'Project SDK messages into public contracts.','Only selected text, system subtype and final result fields leave the server. Exact API-key occurrences are redacted before summary truncation.'],
 ['handlers','const sendEvent =',3,'Encode UTF-8 Server-Sent Events.','Heartbeats, request cancellation, reader cancellation and the three-minute deadline clean up stream execution.'],
 ['state','setMessages(previous=>',2,'Append a timestamped native timeline row.','The display stops at 500 rows, while every final result is still processed independently. Each row can expand to syntax-colored JSON.'],
 ['service','function resultData(',8,'Normalize final SDK result fields.','Non-success subtypes remain failures. Answer, turns, duration, cost and error flag are the complete public result.'],
 ['client',"if (event === 'message')",3,'Validate a ResultMessage received over SSE.','The final result uses the same message event as progress. Missing final results and prematurely closed transports fail explicitly.'],
 ['answer','export function Answer',6,'Render the answer as native text and colored code.','There is no raw HTML insertion or WebView. Markdown headings, bold text, safe HTTP(S) links and code fences map to native components; other markup remains text.'],
 ['client',"if (event === 'done')",4,'Require both final result and done.','Completion cannot override the final is_error flag. The incremental parser handles split Unicode, CRLF, comments and multiple frames.'],
 ['handlers',"} catch { sendEvent('error'",2,'Emit a safe SSE error without done.','Simple-mode provider failures return 502. Raw exceptions, filesystem paths and environment values are not sent to clients.'],
 ['state','}catch(err)',2,'Show an error and accessible notice.','Controls restore in finally. Native cancellation, disconnects and the client deadline abort owned work.'],
 ['handlers',"if (!config.apiKeyConfigured) { sendEvent",2,'Reject missing credentials before calling the SDK.','Simple mode returns 503. Invalid inputs return validation status before streaming starts. Neither path makes a paid model call.']
];
const steps=definitions.map(([key,marker,count,text,explanation],i)=>{
  const source=files[key],content=read(source),lines=content.split(/\r?\n/);
  // Match source across formatter line breaks without depending on quote style.
  const positions=[];let normalized='';
  for(let at=0;at<content.length;at++)if(!/[\s"'()]/.test(content[at])){normalized+=content[at];positions.push(at);}
  const found=normalized.indexOf(marker.replace(/[\s"'()]/g,''));
  if(found<0)throw Error(`Missing source marker ${source}: ${marker}`);
  const at=content.slice(0,positions[found]).split(/\r?\n/).length-1;
  const selected=lines.slice(at,at+Math.max(count,10));
  const indent=Math.min(...selected.filter(line=>line.trim()).map(line=>line.search(/\S/)));
  return {number:i+1,title:labels[i][1],source,language:source.endsWith('tsx')?'tsx':'typescript',text,explanation,code:selected.map(line=>line.slice(indent)).join('\n')};
});
mkdirSync(resolve(root,'src/lesson'),{recursive:true});mkdirSync(resolve(root,'public'),{recursive:true});
writeFileSync(resolve(root,'src/lesson/workflow.json'),JSON.stringify(steps,null,2)+'\n');
writeFileSync(resolve(root,'src/lesson/diagram.ts'),`export const workflowSvg=${JSON.stringify(svg)};\nexport const workflowPuml=${JSON.stringify(puml)};\n`);
writeFileSync(resolve(root,'public/workflow.svg'),svg);writeFileSync(resolve(root,'public/workflow.puml'),puml);
console.log('Generated 16 matching source cards, SVG and PlantUML.');
