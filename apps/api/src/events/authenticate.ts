import { z } from "zod/v4";
import { AuthenticationType, Event } from "../types";
import { assert } from "../types";

const zodSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("login"), name: z.string(), password: z.string() }),
  z.object({ type: z.literal("register"), name: z.string(), password: z.string() }),
  z.object({ type: z.literal("token"), token: z.string() }),
  z.object({ type: z.literal("logout"), token: z.string() }),
]);

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
    switch (data.type) {
      case "login": {
        login([data, database, operations, emit]);
        break;
      }
      case "register": {
        register([data, database, operations, emit]);
        break;
      }
      case "token": {
        token([data, database, operations, emit]);
        break;
      }
      case "logout": {
        logout([data, database, operations, emit]);
        break;
      }
    }
  }
} as CurrentEvent;

function login([data, database, operations, emit]: Parameters<CurrentEvent["handler"]>) {
  assert(data.type === "login", "Login handler called with wrong data type");
  const user = database.validateUserPassword(data.name, data.password);
  if (!user) {
    return emit.error({ message: "Invalid username or password" });
  }
  const token = database.createToken(user.id);
  operations.markSocketAsUser();
  emit.reply({ token, user: { id: user.id, name: user.name } });
}
function register([data, database, operations, emit]: Parameters<CurrentEvent["handler"]>) {
  assert(data.type === "register", "Register handler called with wrong data type");
  const existing_user = database.doesUserExist(data.name);
  if (existing_user) {
    return emit.error({ message: "Username taken" });
  }
  const userId = database.createUser({ name: data.name, password: data.password });
  const token = database.createToken(userId);
  operations.markSocketAsUser();
  return emit.reply({ token, user: { id: userId, name: data.name } });
}
function token([data, database, operations, emit]: Parameters<CurrentEvent["handler"]>) {
  assert(data.type === "token", "Token handler called with wrong data type");
  const token = database.getToken(data.token);
  if (!token) {
    return emit.error({ message: "Invalid token" });
  }
  const user = database.getUser(token.user_id);
  if (!user) {
    return emit.error({ message: "Invalid Token" });
  }
  operations.markSocketAsUser();
  emit.reply({ token: data.token, user: { id: user.id, name: user.name } });
}
function logout([data, database, operations, emit]: Parameters<CurrentEvent["handler"]>) {
  assert(data.type === "logout", "Logout handler called with wrong data type");
  const token = database.getToken(data.token);
  if (!token) {
    return emit.error({ message: "Invalid token" });
  }
  database.deleteToken(data.token);
  operations.markSocketAsNone();
  emit.reply({ message: "Logged out successfully" });
}