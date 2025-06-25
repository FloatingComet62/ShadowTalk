import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SidebarComponent } from './sidebar.component';
import { EventInteracter, EventInteracterBuilder, SocketService } from '../socket.server';
import { AddChannelDialogComponent } from './add_channel_dialog.component';
import { MessagesComponent } from './messages.component';
import { CommonModule } from '@angular/common';

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

type Screens = 'add-channel-dialog' | 'messages' | 'blank';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, MessagesComponent, AddChannelDialogComponent, CommonModule],
  template: `
<style>
  :host {
    background-color: #101010;
    display: flex;
    height: inherit;
  }
</style>
<app-sidebar
  [authenticated]="isAuthenticated"
  (ChannelClick)="ChannelClick($event)"
  (AddChannelClick)="addChannelClick()"
></app-sidebar>
<app-channel-dialog *ngIf="screen === 'add-channel-dialog'" (addChannelClick)="ChannelCreated()"></app-channel-dialog>
<app-messages *ngIf="screen === 'messages'" [authenticated]="isAuthenticated" [channel_id]="channel_id"></app-messages>
<div *ngIf="screen === 'blank'" style="flex: 1; display: flex; justify-content: center; align-items: center; color: white;">
  <h1>Welcome to ShadowTalk!</h1>
</div>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'shadowtalk';
  private tokenAuth?: TokenAuthInteractor;
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  isAuthenticated = false;
  screen: Screens = 'blank';
  channel_id = '';

  constructor(private socketService: SocketService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.socketService.initConnection();
    this.tokenAuth = new EventInteracterBuilder<TokenAuthInteractor>(this.socketService, 'authenticate.token')
      .onMessage((data) => {
        this.isAuthenticated = true;
        if ('message' in data) {
          return;
        }
        console.log('Authenticated')
        localStorage.setItem('user_id', data.user.id)
        localStorage.setItem('user_name', data.user.name);
        localStorage.setItem('token', data.token)
        this.cdr.detectChanges();
      })
      .onError((error) => console.error('Token auth error:', error))
      .build();

    this.tokenAuth.emit({
      token: "e841d223-fb05-456e-b648-ddf5e4f591cf",
    })
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.tokenAuth?.disconnect();
  }

  addChannelClick(): void {
    this.screen = 'add-channel-dialog';
    this.cdr.detectChanges();
  }

  ChannelCreated(): void {
    this.screen = 'blank';
    this.sidebar.refreshChannels();
    this.cdr.detectChanges();
  }

  ChannelClick(channel_id: string): void {
    console.log('Channel clicked:', channel_id);
    this.channel_id = channel_id;
    this.screen = 'messages';
    this.cdr.detectChanges();
  }
}
