import { z } from "zod/v4";
import { authLoggedIn, Event } from "../../event";
import { assert } from "../../assert";

const zodSchema = z.object({
  message_id: z.string().min(1, "Message ID must not be empty"),
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    marked: boolean
  },
  {
    message: string;
  }
>;

export default {
  allowedAuthentication: authLoggedIn(),
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, operations, emit) => {
    const userId = await operations.getUserId();
    assert(!!userId, "User ID must be defined");
    await database.markMessageAsRead(data.message_id, userId);
    return emit.reply({ marked: true });
  }
} as CurrentEvent;