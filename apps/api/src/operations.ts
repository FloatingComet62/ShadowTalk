import { Socket } from "socket.io";
import { AuthenticationType, Operations } from "./types";

export function generateOperations(
  socket: Socket,
  auth: Record<string, AuthenticationType>
): Operations {
  return {
    markSocketAsUser: () => {
      auth[socket.id] = AuthenticationType.User;
    },
    markSocketAsNone: () => {
      auth[socket.id] = AuthenticationType.None;
    },
  };
}