import { z } from "zod/v4";
import { authAll, Event } from "../../event";
import { User } from "@shadowtalk/database";
import { assert } from "../../assert";

const zodSchema = z.object({
  user_ids: z.array(z.uuid("Invalid ID")),
});

type CurrentEvent = Event<
  z.infer<typeof zodSchema>,
  {
    users: Omit<User, 'password' | 'salt'>[]; // yeah don't send sensitive shit
  },
  {
    message: string;
  }
>;

export default {
  allowedAuthentication: authAll(),
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, operations, emit) => {
    const users = await database.getUsers(data.user_ids);

    for (const user of users) {
      delete user.password;
      delete user.salt;
    }

    // you would ask why i put this here
    // it's just because this is an incredibly sensitive shit, and I don't want to accidently leak data if i change the lines above
    for (const user of users) {
      assert(user.password === undefined, "User password should not be defined here");
      assert(user.salt === undefined, "User Salt should not be defined here");
    }

    return emit.reply({ users });
  }
} as CurrentEvent;