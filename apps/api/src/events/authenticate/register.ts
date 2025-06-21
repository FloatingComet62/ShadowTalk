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
    const existing_user = database.doesUserExist(data.name);
    if (existing_user) {
      return emit.error({ message: "Username taken" });
    }
    const userId = database.createUser({ name: data.name, password: data.password });
    const token = database.createToken(userId);
    operations.markSocketAsUser(userId);
    return emit.reply({ token, user: { id: userId, name: data.name } });
  }
} as CurrentEvent;