import { Socket } from "socket.io";
import { AuthenticationType } from "./event";

export type Operations = {
  markSocketAsUser: (user_id: string) => void;
  markSocketAsNone: () => void;
  getUserId?: () => string | undefined;
  broadcast: (message_content: string, channel_id: string, members: string[]) => void;
}

export type AuthData = {
  type: AuthenticationType.User;
  userId: string;
} | {
  type: AuthenticationType.None;
}

export function generateOperations(
  socket: Socket,
  auth: Record<string, AuthData>
): Operations {
  return {
    markSocketAsUser: (user_id: string) => {
      auth[socket.id] = {
        type: AuthenticationType.User,
        userId: user_id,
      }
    },
    markSocketAsNone: () => {
      auth[socket.id] = {
        type: AuthenticationType.None,
      }
    },
    getUserId: () => {
      const authData = auth[socket.id];
      if (!authData || authData.type === AuthenticationType.None) {
        return undefined;
      }
      return authData.userId;
    },
    broadcast: (message_content: string, channel_id: string, members: string[]) => {
      const activeSockets = Object.keys(auth).filter(socketId => {
        const authData = auth[socketId];
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