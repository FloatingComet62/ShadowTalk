import { z } from "zod/v4";
import { authLoggedIn, Event } from "../../event";
import { assert } from "../../assert";

const zodSchema = z.object({
  channel_id: z.uuid(),
  user_id: z.uuid()
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    added: boolean;
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
    const channel = await database.getChannel(data.channel_id);
    if (!channel) {
      return emit.error({ message: "Channel not found" });
    }
    if (!channel.members.includes(userId)) {
      return emit.error({ message: "Channel not found" });
    }
    return emit.reply({ added: await database.addUserToChannel(data.channel_id, data.user_id) });
  }
} as CurrentEvent;