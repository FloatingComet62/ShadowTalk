import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subscription } from 'rxjs';
import { environment } from './environment';

@Injectable({
  providedIn: 'root', // Singleton service across the app
})
export class SocketService {
  private socket?: Socket;

  constructor(public ngZone: NgZone) {}

  initConnection(): void {
    if (this.socket) {
      return; // Prevent re-initialization
    }
    this.ngZone.runOutsideAngular(() => {
      this.socket = io(`http://localhost:${environment.NX_API_PORT}`, {
        transports: ['websocket'],
      });
    })
  }

  emit<T>(event: string, data: T): void {
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

type TOf<X> = X extends EventInteracter<infer T, any, any> ? T : never;
type ROf<X> = X extends EventInteracter<any, infer R, any> ? R : never;
type EOf<X> = X extends EventInteracter<any, any, infer E> ? E : never;

export class EventInteracterBuilder<TInteractor, T = TOf<TInteractor>, R = ROf<TInteractor>, E = EOf<TInteractor>> {
  private messageHandler?: (data: R) => void;
  private errorHandler?: (error: E) => void;
  private eventName: string;

  constructor(private socketService: SocketService, eventName: string) {
    this.eventName = eventName;
  }

  onMessage(messageHandler: (data: R) => void): EventInteracterBuilder<TInteractor> {
    this.messageHandler = messageHandler;
    return this as unknown as EventInteracterBuilder<TInteractor>;
  }
  onError(errorHandler: (error: E) => void): EventInteracterBuilder<TInteractor> {
    this.errorHandler = errorHandler;
    return this as unknown as EventInteracterBuilder<TInteractor>;
  }
  build(): EventInteracter<T, R, E> {
    if (this.messageHandler === undefined) {
      this.messageHandler = () => { return; }
    }
    if (this.errorHandler === undefined) {
      this.errorHandler = () => { return; }
    }
    return new EventInteracter(this.socketService, this.eventName, this.messageHandler, this.errorHandler);
  }
}

export class EventInteracter<T, R, E> {
  private messageSub?: Subscription;
  private errorSub?: Subscription;
  private eventName: string;

  constructor(
    private socketService: SocketService,
    eventName: string,
    messageHandler: (data: R) => void,
    errorHandler: (error: E) => void
  ) {
    this.eventName = eventName;
    this.messageSub = this.socketService.listen<R>(`${this.eventName}.reply`).subscribe((data: R) => {
      this.socketService.ngZone.run(() => messageHandler(data));
    });
    this.errorSub = this.socketService.listen<E>(`${this.eventName}.error`).subscribe((error: E) => {
      this.socketService.ngZone.run(() => errorHandler(error));
    });
  }

  emit(data: T): void {
    this.socketService.emit(this.eventName, data);
  }

  disconnect(): void {
    this.messageSub?.unsubscribe();
    this.errorSub?.unsubscribe();
  }
}