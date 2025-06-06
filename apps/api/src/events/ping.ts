import { z } from "zod/v4";
import { AuthenticationType, Event } from "../types";

export default {
  allowedAuthentication: [
    AuthenticationType.None,
    AuthenticationType.User,
    AuthenticationType.Admin
  ],
  zodSchema: z.object({
    hello: z.string().refine((val) => val === "world", {
      message: "Hello must be 'world'",
    })
  }),
  handler: async (socket, data) => {
    socket.emit('pong', {
      message: `Pong! Received: ${data.hello}`
    })
  }
} as Event;