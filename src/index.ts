import express from 'express';
import cors from 'cors';
// import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import {  router } from './routes/routes.js';
import { web_router } from './routes/web_routes.js'
import {  testing_router } from './routes/test_routes.js';

import { starterMiddleware } from './middleware/starter.middleware.js';
import { WebSocketServer } from 'ws';
import * as pty from 'node-pty'

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
const wss = new WebSocketServer({server});

wss.on('connection', (ws) => {
  // Spawn a shell
  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
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