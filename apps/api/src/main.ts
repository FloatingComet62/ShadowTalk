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
  const context = require.context('./events', false, /\.ts$/);
  context.keys().forEach((key) => {
    const event = context(key) as Event;
    const event_name = key.replace('./', '').replace('.ts', '');
    const eventLogger = socketLogger.addWorkspace(event_name);

    socket.on(
      event_name,
      (data) => handler(
        eventLogger,
        event,
        data,
        {
          reply: (data) => {
            eventLogger.info('Reply data:', data);
            socket.emit(event_name + '.reply', JSON.stringify(data));
          },
          error: (data) => {
            eventLogger.warn('Error data:', data);
            socket.emit(event_name + '.error', JSON.stringify(data));
          }
        }
      )
    );
  });
}

io.on('connection', (socket) => {
  globalLogger.info('New client connected:', socket.id);
  const logger = globalLogger.addWorkspace(socket.id);
  auth[socket.id] = AuthenticationType.None;

  socket.on('authenticate', (data) => {
    logger.addWorkspace('authenticate').info(JSON.stringify(data));
    auth[socket.id] = AuthenticationType.User; // Simulate authentication
    socket.emit('authenticate.reply', { success: true, message: 'Authenticated successfully' });
  });

  iterateEvents(socket, logger, async (eventLogger, event, data, emit) => {
    eventLogger.info(data);
    if (!auth[socket.id] || !event.allowedAuthentication.includes(auth[socket.id])) {
      return emit.error({ message: 'Unauthorized' });
    }

    const result = event.zodSchema.safeParse(data);
    if (!result.success) {
      return emit.error({ message: result.error.message });
    }

    await event.handler(result.data, emit);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
    delete auth[socket.id];
  });
});

server.listen(process.env.PORT, () => {
  globalLogger.info('Listening on', process.env.PORT);
});
server.on('error', (err) => globalLogger.error('Server error:', err.message));
