import { z } from "zod/v4";
import { authAll, Event } from "../../event";

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
  allowedAuthentication: authAll(),
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, operations, emit) => {
    const user = await database.validateUserPassword(data.name, data.password);
    if (!user) {
      return emit.error({ message: "Invalid username or password" });
    }
    const token = await database.createToken(user.id);
    await operations.markSocketAsUser(user.id);
    return emit.reply({ token, user: { id: user.id, name: user.name } });
  }
} as CurrentEvent;