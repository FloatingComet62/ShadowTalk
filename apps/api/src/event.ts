import { z } from "zod/v4";
import { ConnectionInterface } from "@shadowtalk/database"
import { Operations } from "./operations";

export enum AuthenticationType {
  None,
  User,
}

export function authAll(): AuthenticationType[] {
  return [AuthenticationType.None, AuthenticationType.User];
}

export function authLoggedIn(): AuthenticationType[] {
  return [AuthenticationType.User];
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