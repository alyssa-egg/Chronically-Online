import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.dirname(new URL(import.meta.url).pathname);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep) || !['/index.html','/src/app.js','/src/game.js','/src/style.css'].includes(pathname === '/' ? '/index.html' : pathname)) { res.writeHead(404); return res.end('Not found'); }
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)],'X-Content-Type-Options':'nosniff'}); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 3000),'0.0.0.0',()=>console.log('LoreDial listening on port ' + (process.env.PORT || 3000)));
