import { z } from "zod/v4";
import { authAll, Event } from "../../event";
import { User } from "@shadowtalk/database";
import { assert } from "../../assert";

const zodSchema = z.object({
  user_id: z.string().min(1, "User ID must not be empty"),
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    user: Omit<User, 'id' | 'password' | 'salt'>; // yeah don't send sensitive shit
  },
  {
    message: string;
  }
>;

export default {
  allowedAuthentication: authAll(),
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, operations, emit) => {
    const user = await database.getUser(data.user_id);
    if (!user) {
      return emit.error({ message: "User not found" });
    }

    delete user.password;
    delete user.id;
    delete user.salt;

    // you would ask why i put this here
    // it's just because this is an incredibly sensitive shit, and I don't want to accidently leak data if i change the lines above
    assert(user.password === undefined, "User password should not be defined here");
    assert(user.id === undefined, "User ID should not be defined here");
    assert(user.salt === undefined, "User Salt should not be defined here");

    return emit.reply({ user });
  }
} as CurrentEvent;