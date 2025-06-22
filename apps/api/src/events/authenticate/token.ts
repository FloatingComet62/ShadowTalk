import { z } from "zod/v4";
import { authAll, Event } from "../../event";

const zodSchema = z.object({ token: z.uuid("Invalid Token") });

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    token: string,
    user: { id: string, name: string },
  } | { message: string },
  {
    message: string;
  }
>;

export default {
  allowedAuthentication: authAll(),
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, operations, emit) => {
    const token = await database.getToken(data.token);
    if (!token) {
      return emit.error({ message: "Invalid token" });
    }
    const user = await database.getUser(token.user_id);
    if (!user) {
      return emit.error({ message: "Invalid Token" });
    }
    await operations.markSocketAsUser(user.id);
    return emit.reply({ token: data.token, user: { id: user.id, name: user.name } });
  }
} as CurrentEvent;