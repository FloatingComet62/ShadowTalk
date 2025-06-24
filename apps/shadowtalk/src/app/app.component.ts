import { Component, OnDestroy, OnInit } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { EventInteracter, EventInteracterBuilder, SocketService } from '../socket.server';
import { AddChannelDialogComponent } from './add_channel_dialog.component';
import { MessagesComponent } from './messages.component';

type TokenAuthInteractor = EventInteracter<
  { token: string },
  {
    token: string,
    user: { id: string, name: string },
  } | { message: string },
  {
    message: string;
  }
>;

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
  private token_auth?: TokenAuthInteractor;
  showAddChannelDialog = false;

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.initConnection();
    this.token_auth = new EventInteracterBuilder<TokenAuthInteractor>(this.socketService, 'authenticate.token')
      .onMessage((data) => console.log('Token auth received:', data))
      .onError((error) => console.error('Token auth error:', error))
      .build();

    this.token_auth.emit({
      token: "e841d223-fb05-456e-b648-ddf5e4f591cf",
    })
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.token_auth?.disconnect();
  }

  showAddChannelDialogSet() {
    this.showAddChannelDialog = !this.showAddChannelDialog;
  }

  addChannelClick = () => {
    this.showAddChannelDialogSet();
  }
}
