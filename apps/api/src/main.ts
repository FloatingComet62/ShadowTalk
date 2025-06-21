import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Logger } from '@shadowtalk/logging';
import Database from '@shadowtalk/database';
import { AuthenticationType, Event } from './types';
import { generateOperations } from './operations';
import { Log } from '@shadowtalk/logging';
import { assert } from './assert';

Database.createUserTable();
Database.createTokenTable();

const app = express();
const server = createServer(app);
const globalLogger = Logger(['api']);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity; adjust as needed
  }
});

const auth = {};

// ./file.ts -> file
// ./nested/file.ts -> nested.file
// ./nested/another/file.ts -> nested.another.file
// ./nested/index.ts -> nested
export function convertNameToEvent(name: string): string {
  assert(name != "./index.ts", "Invalid event name: ./index.ts, the resulting event name would be empty");

  const parts = name.split('/');
  const fileName = parts[parts.length - 1].replace('.ts', '');
  const pathParts = parts.slice(1, -1).join('.');
  if (fileName === 'index') {
    return pathParts ? `${pathParts}` : '';
  }
  return pathParts ? `${pathParts}.${fileName}` : fileName;
}

// read events from the 'events' directory
const context = require.context('./events', true, /\.ts$/);
const events = context.keys().map((key) => {
  const event = context(key) as Event<unknown, unknown, unknown>;
  const event_name = convertNameToEvent(key);
  console.log(key, event_name);
  const eventLogger = globalLogger.addWorkspace(event_name);
  return { event, event_name, eventLogger };
});

function iterateEvents<T, R, E>(
  socket: Socket,
  handler: (
    eventLogger: Log,
    event: Event<T, R, E>,
    data,
    emit: {
      reply: (data) => void,
      error: (data) => void
    },
  ) => void
) {
  events.forEach(({ event, eventLogger, event_name }) => {
    socket.on(event_name, (data) =>
      handler(eventLogger, event, data, {
        reply: (data) => {
          eventLogger.info('Reply data:', data);
          socket.emit(event_name + '.reply', JSON.stringify(data));
        },
        error: (data) => {
          eventLogger.warn('Error data:', data);
          socket.emit(event_name + '.error', JSON.stringify(data));
        }
      })
    );
  });
}

io.on('connection', (socket) => {
  globalLogger.info('New client connected:', socket.id);
  const logger = globalLogger.addWorkspace(socket.id);
  auth[socket.id] = AuthenticationType.None;

  iterateEvents(socket, async (eventLogger, event, data, emit) => {
    eventLogger.info(data);
    if (!event.allowedAuthentication.includes(auth[socket.id] ?? AuthenticationType.None)) {
      return emit.error({ message: 'Unauthorized' });
    }

    const result = event.zodSchema.safeParse(data);
    if (!result.success) {
      return emit.error({ message: result.error.message });
    }

    await event.handler(result.data, Database, generateOperations(socket, auth), emit);
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
  globalLogger.info('Shutting down server...');
  server.close(() => {
    globalLogger.info('Server closed');
    process.exit(0);
  });
});
