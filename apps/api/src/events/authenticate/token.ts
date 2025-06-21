import { z } from "zod/v4";
import { AuthenticationType, Event } from "../../types";

const zodSchema = z.object({ type: z.literal("token"), token: z.string() });

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
  allowedAuthentication: [
    AuthenticationType.None,
    AuthenticationType.User,
  ],
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, operations, emit) => {
    const token = database.getToken(data.token);
    if (!token) {
      return emit.error({ message: "Invalid token" });
    }
    const user = database.getUser(token.user_id);
    if (!user) {
      return emit.error({ message: "Invalid Token" });
    }
    operations.markSocketAsUser();
    return emit.reply({ token: data.token, user: { id: user.id, name: user.name } });
  }
} as CurrentEvent;