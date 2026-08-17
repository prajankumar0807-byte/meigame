import http from 'node:http'; import {app} from './app.js'; import {env} from './config/env.js'; import {attachSockets} from './sockets/index.js';
const server=http.createServer(app); attachSockets(server); server.listen(env.PORT,()=>console.log(`MEIGAME API running on http://localhost:${env.PORT}`));
