import { z } from "zod/v4";
import { AuthenticationType, Event } from "../types";

const zodSchema = z.object({
  hello: z.string().refine((val) => val === "world", {
    message: "Hello must be 'world'",
  })
});

export default {
  allowedAuthentication: [
    AuthenticationType.None,
    AuthenticationType.User,
  ],
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, emit) => {
    emit.reply({
      message: `Pong! Received: ${data.hello}`
    })
  }
} as Event;