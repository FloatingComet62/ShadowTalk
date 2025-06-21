import { z } from "zod/v4";
import { AuthenticationType, Event } from "../../types";

const zodSchema = z.object({ token: z.string() });

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
    database.deleteToken(data.token);
    operations.markSocketAsNone();
    return emit.reply({ message: "Logged out successfully" });
  }
} as CurrentEvent;