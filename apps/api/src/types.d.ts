import { Socket } from "socket.io";
import { z } from "zod/v4";

export enum AuthenticationType {
    None,
    User,
    Admin,
}

export interface Event {
    allowedAuthentication: AuthenticationType[];
    zodSchema: z.ZodSchema,
    handler: (socket: Socket, data) => Promise<void>;
}