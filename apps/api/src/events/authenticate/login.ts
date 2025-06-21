import { z } from "zod/v4";
import { AuthenticationType, Event } from "../../types";

const zodSchema = z.object({ name: z.string(), password: z.string() });

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
    const user = database.validateUserPassword(data.name, data.password);
    if (!user) {
      return emit.error({ message: "Invalid username or password" });
    }
    const token = database.createToken(user.id);
    operations.markSocketAsUser(user.id);
    return emit.reply({ token, user: { id: user.id, name: user.name } });
  }
} as CurrentEvent;