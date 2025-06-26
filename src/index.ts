import express from 'express';
import cors from 'cors';
// import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import {  router } from './routes/routes.js';
import { web_router } from './routes/web_routes.js'
import { starterMiddleware } from './middleware/starter.middleware.js';
import { WebSocketServer } from 'ws';
import * as pty from 'node-pty'
import http from 'http';
import * as stream from 'stream'
import * as k8s from '@kubernetes/client-node'; 

const kubeclient = new k8s.KubeConfig();
// kubeclient.loadFromFile(kubeconfigPath);


kubeclient.loadFromDefault()

const k8sExec = new k8s.Exec(kubeclient)


const app = express();

// Midleware
app.use(morgan("combined"));

// I don't test any one is better
app.use(express.json());
//app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true}));
app.use(cors());
app.use(starterMiddleware);

// Routes
app.use("/api", router);

app.use("/", web_router);
// app.get('/systembanner', (req, res) => {
//   res.send('Hello world from TypeScript!');
// });

// Testing 
// app.use("/api", testing_router);


// Error handling middleware
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({error: "Internal Server Error"});
});


app.get('/', (req, res) => {
  res.send('Hello world from TypeScript!');
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket server
const server1 = http.createServer();
const wss = new WebSocketServer({server:  server1});

wss.on('connection', (ws) => {
  // Spawn a shell
  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 160,
    rows: 48,
    cwd: process.env.HOME,
    env: process.env
  });

  // Send shell output to the client 
  shell.onData((data) => {
    ws.send(data)
  })

  // Receive input from the client 
  ws.on('message', (msg: string) => {
    shell.write(msg);
  })

  ws.on('close', () => {
    shell.kill()
  })

})

server1.listen(8888)

// ai websocket
const ai_server = http.createServer()

const secondaryWSS = new WebSocketServer({ server: ai_server });

secondaryWSS.on('connection', (ws) => {
  // Spawn a shell
  const shell = pty.spawn('bash', ['-c', 'kubectl-ai --model gemini-2.0-flash; exec bash'], {
    name: 'xterm-color',
    cols: 160,
    rows: 48,
    cwd: process.env.HOME,
    env: process.env
  });

  // Send shell output to the client 
  shell.onData((data) => {
    ws.send(data)
  })

  // Receive input from the client 
  ws.on('message', (msg: string) => {
    shell.write(msg);
  })

  ws.on('close', () => {
    shell.kill()
  })

})

ai_server.listen(9999);


const k8s_wss = new WebSocketServer({ server });

k8s_wss.on('connection', async (ws, req) => {
  // Suppose URL: /ws/pod/:namespace/:pod/shell/:container
  const urlParts = req.url!.split('/');
  const namespace = urlParts[3];
  const pod = urlParts[4];
  const container = urlParts[6];

  const stdinStream = new stream.PassThrough();
  const stdoutStream = new stream.PassThrough();

  // Send pod output to browser
  stdoutStream.on('data', (chunk) => {
    ws.send(chunk.toString());
  });

  // Receive input from browser
  ws.on('message', (data) => {
    stdinStream.write(data);
  });

  ws.on('close', () => {
    stdinStream.end();
    stdoutStream.end();
  });
  const shells = [
  ['/bin/bash', '-l'],
  ['/bin/sh', '-l'],
  ['/bin/zsh', '-l'],
  ['/bin/ash', '-l'],
  ['/bin/dash', '-l'],
  ['/bin/csh', '-l'],
  ['/bin/tcsh', '-l'],
];



  try {
  tryShells(namespace, pod, container, shells, k8sExec, stdoutStream, stdoutStream, stdinStream, true);

  } catch (err) {
    ws.send('Error: ' + (err as Error).message);
    ws.close();
  }
});

async function tryShells(namespace, pod, container, shells, k8sExec, stdout, stderr, stdin, tty) {
  for (const command of shells) {
    try {
      // Try to exec into the shell
      await k8sExec.exec(namespace, pod, container, command, stdout, stderr, stdin, tty);
      return; // Success!
    } catch (err: any) {
      console.error('Exec error:', err);
    }
  }
  throw new Error('No supported shell found in container');
}