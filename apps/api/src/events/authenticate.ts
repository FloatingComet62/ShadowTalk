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
        login.call({ data, database, emit });
        break;
      }
      case "register": {
        register.call({ data, database, emit });
        break;
      }
      case "token": {
        token.call({ data, database, emit });
        break;
      }
      case "logout": {
        logout.call({ data, database, emit });
        break;
      }
    }
  }
} as Event;

function login() {
  const user = this.database.user.searchUser((_, user) =>
    user.name === this.data.name && user.password === this.data.password
  )[0];
  if (!user) {
    return this.emit.error({ message: "Invalid username or password" });
  }
  const token = this.database.token.createToken({ user_id: user.id });
  this.emit.reply({ token, user: { id: user.id, name: user.name } });
}
function register() {
  const existing_user = this.database.user.searchUser((_, user) => user.name === this.data.name)
  if (existing_user.length > 0) {
    return this.emit.error({ message: "Username taken" });
  }
}
function token() {
  const token = this.database.token.getToken(this.data.token);
  if (!token) {
    return this.emit.error({ message: "Invalid token" });
  }
  const user = this.database.user.getUser(token.user_id);
  if (!user) {
    return this.emit.error({ message: "User not found" });
  }
  this.emit.reply({ token: this.data.token, user: { id: user.id, name: user.name } });
}
function logout() {
  const token = this.database.token.getToken(this.data.token);
  if (!token) {
    return this.emit.error({ message: "Invalid token" });
  }
  this.database.token.deleteToken(this.data.token);
  this.emit.reply({ message: "Logged out successfully" });
}