// Local preview of the actual static export, with Expo Router deep-link fallback.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.puml':'text/plain; charset=utf-8','.png':'image/png','.ico':'image/x-icon'};
createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method||'')){res.writeHead(405);res.end();return;}
  try{
    const pathname=decodeURIComponent(new URL(req.url||'/','http://localhost').pathname);
    let path=resolve(root,'.'+pathname);
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const found=await stat(path).then(info=>info.isFile()).catch(()=>false);
    if(!found){if(extname(path)){res.writeHead(404);res.end();return;}path=resolve(root,'index.html');}
    const content=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:content);
  }catch{res.writeHead(404);res.end('Run npm run build first.');}
}).listen(5100,'127.0.0.1',()=>console.log('Export preview: http://localhost:5100 (run the API separately)'));
