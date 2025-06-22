import { z } from "zod/v4";
import { authLoggedIn, Event } from "../../event";
import { assert } from "../../assert";

const zodSchema = z.object({
  name: z.string().min(1, "Channel name must not be empty"),
  members: z.string().array().min(1, "At least one member must be specified"),
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    channel_id: string;
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
    return emit.reply({ channel_id: await database.createChannel({
      name: data.name,
      members: [...data.members, userId], // Add the creator to the channel
    }) });
  }
} as CurrentEvent;