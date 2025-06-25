import { z } from "zod/v4";
import { authLoggedIn, Event } from "../../event";
import { assert } from "../../assert";
import { Message } from "@shadowtalk/database";

const zodSchema = z.object({
  channel_id: z.uuid(),
  bottom_pagination: z.number(),
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    messages: Message[];
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
    return emit.reply({ messages: await database.getMessagesByChannelIdPagination(data.channel_id, data.bottom_pagination, 50) });
  }
} as CurrentEvent;