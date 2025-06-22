import { z } from "zod/v4";
import { authLoggedIn, Event } from "../../event";
import { assert } from "../../assert";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const zodSchema = z.object({
  message_id: z.string().refine((val) => {
    const parts = val.split('_');
    return (
      parts.length === 2 &&
      uuidRegex.test(parts[0]) &&
      uuidRegex.test(parts[1])
    )
  }, "Invalid message ID"),
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