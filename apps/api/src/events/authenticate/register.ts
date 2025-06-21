import { z } from "zod/v4";
import { AuthenticationType, Event } from "../../event";

const zodSchema = z.object({ name: z.string(), password: z.string(), salt: z.string() });

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
    const existing_user = await database.doesUserExist(data.name);
    if (existing_user) {
      return emit.error({ message: "Username taken" });
    }
    const userId = await database.createUser({ name: data.name, password: data.password, salt: data.salt });
    const token = await database.createToken(userId);
    operations.markSocketAsUser(userId);
    return emit.reply({ token, user: { id: userId, name: data.name } });
  }
} as CurrentEvent;