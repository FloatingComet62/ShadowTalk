import { z } from "zod/v4";
import { Token, User, ConnectionInterface } from "@shadowtalk/database"

export enum AuthenticationType {
  None,
  User,
}

export interface Event {
  allowedAuthentication: AuthenticationType[];
  zodSchema: z.ZodSchema,
  handler: (
    data,
    database: ConnectionInterface,
    emit: {
      reply: (data) => void,
      error: (data) => void
    }
  ) => Promise<void>;
}