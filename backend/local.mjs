import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {handle} from './worker.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dataDir=path.resolve(root,'..','WEBSITE_DATA');
fs.mkdirSync(dataDir,{recursive:true});
const db=new DatabaseSync(path.join(dataDir,'rsvp.sqlite'));
db.exec(fs.readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
const DB = { prepare(sql) { return { bind(...args) { return {
  first: async () => db.prepare(sql).get(...args),
  run: async () => ({meta: {changes: Number(db.prepare(sql).run(...args).changes)}})
}; } }; } };
const publicFiles=new Set(['index.html','styles.css','day.css','day.js','app.js','rsvp.css','rsvp.js','rsvp-config.js','assets/couple.jpeg','assets/church.jpg','assets/villa.jpg']);
const server=http.createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://127.0.0.1:4173');
    if(url.pathname.startsWith('/api/')) {
      let size=0;const chunks=[];
      for await(const chunk of req){size+=chunk.length;if(size>12000){res.writeHead(413);res.end();return;}chunks.push(chunk);}
      const request=new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
      const response=await handle(request,{DB,ALLOWED_ORIGINS:'http://127.0.0.1:4173,http://localhost:4173'});
      res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;
    }
    const file=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
    if(!publicFiles.has(file)){res.writeHead(404);res.end();return;}
    const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpeg':'image/jpeg','.jpg':'image/jpeg'};
    res.writeHead(200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(root,file)));
  } catch {res.writeHead(500);res.end('Unavailable');}
});
server.listen(4173,'127.0.0.1',()=>console.log('RSVP preview: http://127.0.0.1:4173/#rsvp'));
