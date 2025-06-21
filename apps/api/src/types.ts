import { z } from "zod/v4";
import { ConnectionInterface } from "@shadowtalk/database"
import { Socket } from "socket.io";

export enum AuthenticationType {
  None,
  User,
}

export type Operations = {
  markSocketAsUser: () => void;
  markSocketAsNone: () => void;
}

export interface Event<T, R, E> {
  allowedAuthentication: AuthenticationType[];
  zodSchema: z.ZodSchema,
  handler: (
    data: T,
    database: ConnectionInterface,
    operations: Operations,
    emit: {
      reply: (data: R) => void,
      error: (data: E) => void
    }
  ) => Promise<void>;
}

export function generateOperations(
  socket: Socket,
  auth: Record<string, AuthenticationType>
): Operations {
  return {
    markSocketAsUser: () => {
      auth[socket.id] = AuthenticationType.User;
    },
    markSocketAsNone: () => {
      auth[socket.id] = AuthenticationType.None;
    },
  };
}

export function assert(
  condition: boolean,
  message: string
): asserts condition {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}