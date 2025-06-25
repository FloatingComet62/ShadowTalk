import { Socket } from "socket.io";
import { AuthenticationType } from "./event";
import Keyv from "keyv";
import { Ratelimiter } from "./ratelimiter";

export type Operations = {
  markSocketAsUser: (user_id: string) => Promise<void>;
  markSocketAsNone: () => Promise<void>;
  getUserId?: () => Promise<string | undefined>;
  broadcast: (message_content: string, channel_id: string, members: string[]) => Promise<void>;
}

export type AuthData = {
  type: AuthenticationType.User;
  userId: string;
} | {
  type: AuthenticationType.None;
}

export function generateOperations(
  socket: Socket,
  socketConnetionIds: Set<string>,
  auth: Keyv<AuthData>,
  ratelimiter: Ratelimiter,
): Operations {
  return {
    markSocketAsUser: async (user_id: string) => {
      ratelimiter.addUserAuthentication(socket.id, user_id);
      await auth.set(socket.id, {
        type: AuthenticationType.User,
        userId: user_id,
      });
    },
    markSocketAsNone: async () => {
      ratelimiter.removeUserAuthentication(socket.id);
      await auth.set(socket.id, {
        type: AuthenticationType.None,
      });
    },
    getUserId: async () => {
      const authData = await auth.get(socket.id);
      if (!authData || authData.type === AuthenticationType.None) {
        return undefined;
      }
      return authData.userId;
    },
    broadcast: async (message_content: string, channel_id: string, members: string[]) => {
      for (const socketId of socketConnetionIds) {
        const authData = await auth.get(socketId);
        if (authData.type !== AuthenticationType.User || !members.includes(authData.userId)) {
          continue;
        }
        const socketToEmit = socket.to(socketId);
        if (!socketToEmit) {
          continue;
        }
        socketToEmit.emit("message", {
          content: message_content,
          channel_id: channel_id,
        });
      }
    }
  };
}