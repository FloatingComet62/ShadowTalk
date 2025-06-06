import { z } from "zod/v4";

export enum AuthenticationType {
  None,
  User,
  Admin,
}

export interface Event {
  allowedAuthentication: AuthenticationType[];
  zodSchema: z.ZodSchema,
  handler: (
    data,
    emit: {
      reply: (data) => void,
      error: (data) => void
    }
  ) => Promise<void>;
}