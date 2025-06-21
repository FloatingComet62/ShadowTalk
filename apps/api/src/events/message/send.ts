import { z } from "zod/v4";
import { AuthenticationType, Event } from "../../types";
import { assert } from "../../assert";

const zodSchema = z.object({
  message_content: z.string(),
  channel_id: z.string().min(1, "Channel ID must not be empty"),
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
  allowedAuthentication: [
    AuthenticationType.User,
  ],
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, operations, emit) => {
    const userId = operations.getUserId();
    assert(!!userId, "User ID must be defined");

    const channel = database.getChannel(data.channel_id);
    if (!channel) {
      return emit.error({ message: "Channel not found" });
    }

    database.createMessage({
      channel_id: data.channel_id,
      content: data.message_content,
      sender_id: userId,
      read_by: [userId],
    });
    operations.broadcast(data.message_content, data.channel_id, channel.members);

    return emit.reply({ sent: true });
  }
} as CurrentEvent;