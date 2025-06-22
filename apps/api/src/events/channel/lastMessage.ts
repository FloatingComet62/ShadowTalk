import { z } from "zod/v4";
import { authLoggedIn, Event } from "../../event";
import { assert } from "../../assert";
import { Message } from "@shadowtalk/database";

const zodSchema = z.object({
  channel_id: z.string().min(1, "Channel ID must not be empty"),
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    message: Message
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
      return emit.error({ message: "User not part of the channel" });
    }
    const messages = await database.getMessagesByChannelIdPagination(channel.id, 0, 1);
    if (messages.length === 0) {
      return emit.error({ message: "No messages found in the channel" }); // If no messages are found, then in the frontend say something like "Start a conversation"
    }
    return emit.reply({ message: messages[0] });
  }
} as CurrentEvent;