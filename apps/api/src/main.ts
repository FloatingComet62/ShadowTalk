import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Logger } from '@shadowtalk/logging';
import path from 'path';
import { readdirSync } from 'fs';
import { AuthenticationType, Event } from './types';
import { z } from 'zod/v4';

const app = express();
const server = createServer(app);
const logger = Logger(['api']);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity; adjust as needed
  }
});

const JS_FILE = (file) => file.endsWith('.js') && !file.startsWith('index');
const auth = {};

// read events from the 'events' directory
const folderPath = path.join(__dirname, 'events');
function iterateEvents(socket: Socket, handler: (event: Event, event_name: string, data: any) => void) {
  const commandFiles = readdirSync(folderPath).filter(JS_FILE);
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const event = require(filePath).default as Event;
    const event_name = file.replace('.ts', '');
    socket.on(event_name, (data) => handler(event, event_name, data));
  }
}

io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  auth[socket.id] = AuthenticationType.None;

  socket.on('authenticate', (data) => {
    logger.info(`Authentication request from ${socket.id}: ${data}`);
    auth[socket.id] = AuthenticationType.User; // Simulate authentication
    socket.emit('authenticated', { success: true, message: 'Authenticated successfully' });
  });

  iterateEvents(socket, async (event, event_name, data) => {
    logger.info(`Event received: ${event_name} from ${socket.id}`);
    if (!auth[socket.id] || !event.allowedAuthentication.includes(auth[socket.id])) {
      logger.warn(`Unauthorized access attempt by ${socket.id} for event ${event_name}`);
      socket.emit('error', { message: 'Unauthorized' });
      return;
    }

    const result = event.zodSchema.safeParse(data)
    if (!result.success) {
      logger.error(`Error handling event ${event_name}: ${result.error.message}`);
      socket.emit('error', { message: result.error.message });
      return;
    }

    await event.handler(socket, result.data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    delete auth[socket.id];
  });
});

server.listen(process.env.PORT, () => {
  logger.info(`Listening on ${process.env.PORT}`);
});
server.on('error', logger.error);
