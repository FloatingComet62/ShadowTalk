import { z } from "zod/v4";
import { authLoggedIn, Event } from "../../event";
import { assert } from "../../assert";

const zodSchema = z.object({
  message_content: z.string(),
  channel_id: z.uuid("Invalid ID"),
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    sent: boolean
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

    await database.createMessage({
      channel_id: data.channel_id,
      content: data.message_content,
      sender_id: userId,
      read_by: [userId],
    });
    operations.broadcast(data.message_content, data.channel_id, channel.members);

    return emit.reply({ sent: true });
  }
} as CurrentEvent;