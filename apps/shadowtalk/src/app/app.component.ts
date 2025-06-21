import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { EventInteracter, EventInteracterBuilder, SocketService } from '../socket.server';

type PingEventInteractor = EventInteracter<{ hello: string }, { message: string }, { message: string }>;

@Component({
  imports: [NxWelcomeComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'shadowtalk';
  private ping?: PingEventInteractor;

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.initConnection();
    this.ping = (new EventInteracterBuilder(this.socketService, 'ping') as EventInteracterBuilder<PingEventInteractor>)
      .onMessage((data) => console.log('Ping received:', data))
      .onError((error) => console.error('Ping error:', error))
      .build();

    this.ping.emit({ hello: 'world' })
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.ping?.disconnect();
  }
}
