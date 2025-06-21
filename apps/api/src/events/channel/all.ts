import { z } from "zod/v4";
import { AuthenticationType, Event } from "../../event";
import { assert } from "../../assert";
import { Channel } from "@shadowtalk/database";

const zodSchema = z.object({});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    channels: Channel[];
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
    const userId = await operations.getUserId();
    assert(!!userId, "User ID must be defined");
    return emit.reply({ channels: await database.getChannelsByUserId(userId) });
  }
} as CurrentEvent;