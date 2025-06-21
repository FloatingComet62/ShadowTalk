import { Socket } from "socket.io";
import { AuthenticationType } from "./event";
import Keyv from "keyv";

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
  auth: Keyv<AuthData>
): Operations {
  return {
    markSocketAsUser: async (user_id: string) => {
      await auth.set(socket.id, {
        type: AuthenticationType.User,
        userId: user_id,
      });
    },
    markSocketAsNone: async () => {
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
      const activeSockets = Object.keys(auth).filter(async (socketId) => {
        const authData = await auth.get(socketId);
        return authData.type === AuthenticationType.User && members.includes(authData.userId);
      });
      for (const socketId of activeSockets) {
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