import { z } from "zod/v4";
import { AuthenticationType, Event } from "../types";

const zodSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("login"), name: z.string(), password: z.string() }),
  z.object({ type: z.literal("register"), name: z.string(), password: z.string() }),
  z.object({ type: z.literal("token"), token: z.string() }),
  z.object({ type: z.literal("logout"), token: z.string() }),
]);

export default {
  allowedAuthentication: [
    AuthenticationType.None,
    AuthenticationType.User,
  ],
  zodSchema,
  handler: async (data: z.infer<typeof zodSchema>, database, emit) => {
    switch (data.type) {
      case "login": {
        login([data, database, emit]);
        break;
      }
      case "register": {
        register([data, database, emit]);
        break;
      }
      case "token": {
        token([data, database, emit]);
        break;
      }
      case "logout": {
        logout([data, database, emit]);
        break;
      }
    }
  }
} as Event;

function login([data, database, emit]: Parameters<Event["handler"]>) {
  const user = database.validateUserPassword(data.name, data.password);
  if (!user) {
    return emit.error({ message: "Invalid username or password" });
  }
  const token = database.getToken(user.id);
  emit.reply({ token, user: { id: user.id, name: user.name } });
}
function register([data, database, emit]: Parameters<Event["handler"]>) {
  const existing_user = database.doesUserExist(data.name);
  if (existing_user) {
    return emit.error({ message: "Username taken" });
  }
  const userId = database.createUser({ name: data.name, password: data.password });
  const token = database.createToken(userId);
  return emit.reply({ token, user: { id: userId, name: data.name } });
}
function token([data, database, emit]: Parameters<Event["handler"]>) {
  const token = database.getToken(data.token);
  if (!token) {
    return emit.error({ message: "Invalid token" });
  }
  const user = database.getUser(token.user_id);
  if (!user) {
    return emit.error({ message: "Invalid Token" });
  }
  emit.reply({ token: data.token, user: { id: user.id, name: user.name } });
}
function logout([data, database, emit]: Parameters<Event["handler"]>) {
  const token = database.getToken(data.token);
  if (!token) {
    return emit.error({ message: "Invalid token" });
  }
  database.deleteToken(data.token);
  emit.reply({ message: "Logged out successfully" });
}