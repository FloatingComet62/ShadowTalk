import { z } from "zod/v4";
import { authAll, Event } from "../event";

const zodSchema = z.object({
  hello: z.string().refine((val) => val === "world", {
    message: "Hello must be 'world'",
  })
});

type CurrentEvent = Event<z.infer<typeof zodSchema>, { message: string }, { message: string}>;

export default {
  allowedAuthentication: authAll(),
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, operations, emit) => {
    emit.reply({
      message: `Pong! Received: ${data.hello}`
    })
  }
} as CurrentEvent;