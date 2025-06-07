import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Logger } from '@shadowtalk/logging';
import Database from '@shadowtalk/database';
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

const auth = {};

// read events from the 'events' directory
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

  iterateEvents(socket, logger, async (eventLogger, event, data, emit) => {
    eventLogger.info(data);
    if (!event.allowedAuthentication.includes(auth[socket.id] ?? AuthenticationType.None)) {
      return emit.error({ message: 'Unauthorized' });
    }

    const result = event.zodSchema.safeParse(data);
    if (!result.success) {
      return emit.error({ message: result.error.message });
    }

    await event.handler(result.data, Database, emit);
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

process.on('SIGINT', () => {
  Database.connection.save();
  globalLogger.info('Shutting down server...');
  server.close(() => {
    globalLogger.info('Server closed');
    process.exit(0);
  });
});
