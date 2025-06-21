import { z } from "zod/v4";
import { AuthenticationType, Event } from "../../event";
import { assert } from "../../assert";
import { Message } from "@shadowtalk/database";

const zodSchema = z.object({
  channel_id: z.string().min(1, "Channel ID must not be empty"),
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    messages: Message[]
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
    return emit.reply({
      messages: await database.getUnreadMessagesByUserIdAndChannelId(data.channel_id, userId)
    });
  }
} as CurrentEvent;