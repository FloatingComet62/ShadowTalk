import { z } from "zod/v4";
import { ConnectionInterface } from "@shadowtalk/database"

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