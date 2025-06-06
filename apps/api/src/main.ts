import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Logger } from '@shadowtalk/logging';
import path from 'path';
import { readdirSync } from 'fs';
import { AuthenticationType, Event } from './types';
import { Log } from '@shadowtalk/logging';

const app = express();
const server = createServer(app);
const globalLogger = Logger(['api']);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity; adjust as needed
  }
});

const JS_FILE = (file) => file.endsWith('.js') && !file.startsWith('index');
const auth = {};

// read events from the 'events' directory
const folderPath = path.join(__dirname, 'events');
function iterateEvents(
  socket: Socket,
  socketLogger: Log,
  handler: (
    eventLogger: Log,
    event: Event,
    data,
    emit: {
      reply: (data) => void,
      error: (data) => void
    },
  ) => void
) {
  const commandFiles = readdirSync(folderPath).filter(JS_FILE);
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const event = require(filePath).default as Event;
    const event_name = file.replace('.ts', '');
    const eventLogger = socketLogger.addWorkspace(event_name);

    socket.on(
      event_name,
      (data) => handler(
        eventLogger,
        event,
        data,
        {
          reply: (data) => {
            eventLogger.info(`Reply data: ${JSON.stringify(data)}`);
            socket.emit(event_name + '.reply', data)
          },
          error: (data) => {
            eventLogger.warn(`Error data: ${JSON.stringify(data)}`);
            socket.emit(event_name + '.error', data)
          }
        }
      )
    );
  }
}

io.on('connection', (socket) => {
  globalLogger.info(`New client connected: ${socket.id}`);
  const logger = globalLogger.addWorkspace(socket.id);
  auth[socket.id] = AuthenticationType.None;

  socket.on('authenticate', (data) => {
    logger.addWorkspace('authenticate').info(`${data}`);
    auth[socket.id] = AuthenticationType.User; // Simulate authentication
    socket.emit('authenticate.reply', { success: true, message: 'Authenticated successfully' });
  });

  iterateEvents(socket, logger, async (eventLogger, event, data, emit) => {
    eventLogger.info(`${data}`);
    if (!auth[socket.id] || !event.allowedAuthentication.includes(auth[socket.id])) {
      eventLogger.warn(`Unauthorized`);
      return emit.error({ message: 'Unauthorized' });
    }

    const result = event.zodSchema.safeParse(data);
    if (!result.success) {
      eventLogger.error(`Validation error: ${result.error.message}`);
      return emit.error({ message: result.error.message });
    }

    await event.handler(result.data, emit);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
    delete auth[socket.id];
  });
});

server.listen(process.env.PORT, () => {
  globalLogger.info(`Listening on ${process.env.PORT}`);
});
server.on('error', (err) => globalLogger.error(`Server error: ${err.message}`));
