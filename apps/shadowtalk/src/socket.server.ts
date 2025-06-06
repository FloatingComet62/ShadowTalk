// socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Singleton service across the app
})
export class SocketService {
  private socket?: Socket;
  private initialised = false;

  initConnection(): void {
    if (this.initialised) {
      return; // Prevent re-initialization
    }
    this.socket = io(`http://localhost:${process.env["NX_API_PORT"]}`);
    this.initialised = true;
  }

  emit(event: string, data: any): void {
    if (!this.socket) {
      return;
    }
    this.socket.emit(event, data);
  }

  listen<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (!this.socket) {
        return;
      }
      this.socket.on(event, (data: T) => {
        subscriber.next(data);
      });
    });
  }

  disconnect(): void {
    if (!this.socket) {
      return;
    }
    this.socket.disconnect();
    this.socket = undefined; // Clear the socket reference
  }
}
