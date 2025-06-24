import Keyv from "keyv";
import { Socket } from "socket.io";

// a penalty is a request that came in too fast, (currrentRequestTimestamp - lastRequestTimestamp) < PENALTY_TRIGGER => if true, then add a penalty
const PENALTY_TRIGGER = 1000;
// if the number of penalties is greater than this, then the user is blocked for a certain amount of time
const PENALTY_LIMIT = 25;

type RatelimiterData = {
  lastRequestTimestamp: Date;
  numberOfPenalties: number;
  socketId: string;
  userId: string | null;
  blockedUntil?: Date;
};


export class Ratelimiter {
  private ratelimiter: Keyv<RatelimiterData>;
  /// you might be asking why is the blockedUntil data repeated? well it's because if the user reconnects the socket id changes but the authentication will remain the same
  private blockedUsers: Keyv<Date>;

  constructor() {
    this.ratelimiter = new Keyv<RatelimiterData>();
    this.blockedUsers = new Keyv<Date>();
  }

  async addSocketConnection(socketId: string) {
    this.ratelimiter.set(socketId, {
      lastRequestTimestamp: new Date(),
      numberOfPenalties: 0,
      socketId,
      userId: null
    });
  }

  async addUserAuthentication(socketId: string, userId: string) {
    const data = await this.ratelimiter.get(socketId);
    data.userId = userId;
    await this.ratelimiter.set(socketId, data);
  }

  async removeUserAuthentication(socketId: string) {
    const data = await this.ratelimiter.get(socketId);
    data.userId = null;
    await this.ratelimiter.set(socketId, data);
  }

  async removeSocketConnection(socketId: string) {
    await this.ratelimiter.delete(socketId);
  }

  async isBlocked(userId: string): Promise<boolean> {
    const blockedUntil = await this.blockedUsers.get(userId);
    if (!blockedUntil) {
      return false;
    }
    if (new Date() < blockedUntil) {
      return true;
    }
    await this.blockedUsers.delete(userId);
  }

  // If returned true, don't respond to the request
  async receiveRequest(socket: Socket, socketId: string): Promise<boolean> {
    const data = await this.ratelimiter.get(socketId);
    if (!data) {
      return false;
    }
    if (data.blockedUntil && new Date() < data.blockedUntil) {
      // User is blocked, do not process the request
      return true;
    }

    const currentTimestamp = new Date();
    const timeSinceLastRequest = currentTimestamp.getTime() - data.lastRequestTimestamp.getTime();

    data.lastRequestTimestamp = currentTimestamp;
    
    if (timeSinceLastRequest >= PENALTY_TRIGGER) {
      // Decrease penalties if time since last request is sufficient
      data.numberOfPenalties = Math.max(0, data.numberOfPenalties - 1);
      return false;
    }

    data.numberOfPenalties += 1;
    if (data.numberOfPenalties <= PENALTY_LIMIT) {
      return false;
    }

    if (!data.userId) {
      // just disconnect the socket if the user is not authenticated
      socket.disconnect();
      this.removeSocketConnection(socketId);
      return true;
    }
    // Block the user for 1 minute
    const blockedUntil = new Date(currentTimestamp.getTime() + 60000);
    await this.blockedUsers.set(data.userId, blockedUntil);
    data.numberOfPenalties = 0;
    data.blockedUntil = blockedUntil;
    return true;
  }
}