import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { EventInteracter, EventInteracterBuilder, SocketService } from '../socket.server';
import { AddChannelDialogComponent } from './add_channel_dialog.component';
import { MessagesComponent } from './messages.component';

type PingEventInteractor = EventInteracter<{ hello: string }, { message: string }, { message: string }>;

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, MessagesComponent, AddChannelDialogComponent],
  template: `
<style>
  :host {
    background-color: #101010;
    display: flex;
    height: inherit;
  }
</style>
<app-sidebar [AddChannelClick]="addChannelClick"></app-sidebar>
@if (showAddChannelDialog) {
  <app-channel-dialog></app-channel-dialog>
} @else {
  <app-messages></app-messages>
}
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'shadowtalk';
  private ping?: PingEventInteractor;
  showAddChannelDialog = false;

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

  showAddChannelDialogSet() {
    this.showAddChannelDialog = !this.showAddChannelDialog;
  }

  addChannelClick = () => {
    this.showAddChannelDialogSet();
  }
}
