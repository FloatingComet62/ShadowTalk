import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddChannelComponent } from "./add_channel.component";
import { EventInteracter, EventInteracterBuilder, SocketService } from '../socket.server';
import { ChannelComponent } from './channel.component';

type Channel = {
  id: string;
  name: string;
  members: string[]; // user ids
  pfp?: string;
};
type User = {
  id: string;
  name: string;
  pfp?: string;
}
type GetChannelEventInteracter = EventInteracter<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {},
  { channels: Channel[]; },
  { message: string; }
>;

type UserMultiInfoEventInteracter = EventInteracter<
  { user_ids: string[] },
  { users: User[]; },
  { message: string; }
>;

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, AddChannelComponent, ChannelComponent],
  template: `
<style>
  :host ::ng-deep {
    color: #fff;
    padding: 2vw;
    display: flex;
    flex-direction: column;
    gap: 4vw;
    height: inherit;
    width: 30vw;
  }
  .title {
    font-size: 2vw;
    margin-bottom: 2vw;
  }
  .pinned {
    display: flex;
    flex-direction: column;
    gap: 1vw;
  }
  .others {
    display: grid;
    /** a grid with 4 columns */
    grid-template-columns: repeat(4, 1fr);
    gap: 1vw;
  }
</style>
<div class="title">ShadowTalk</div>
<div class="pinned">
</div>
<div class="others">
  @for (channel of channels; track channel.id) {
    <app-channel [id]="channel.id" [name]="channel.name" (Click)="ChannelClick.emit($event)"></app-channel>

  }
  <app-add-channel (Click)="AddChannelClick.emit()"></app-add-channel>
</div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.Emulated,
})
export class SidebarComponent implements OnInit, OnDestroy, OnChanges {
  private channelGet?: GetChannelEventInteracter;
  private membersGet?: UserMultiInfoEventInteracter;

  @Input({ required: true }) authenticated!: boolean;
  @Output() AddChannelClick = new EventEmitter<void>();
  @Output() ChannelClick = new EventEmitter<string>();

  channels: Channel[] = [];
  members: string[] = []; // user ids of members in all channels

  constructor(private socketService: SocketService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.socketService.initConnection();
    this.channelGet = new EventInteracterBuilder<GetChannelEventInteracter>(this.socketService, 'channel.all')
      .onMessage((data) => {
        this.channels = data.channels;
        this.members = this.channels
          .flatMap(channel => channel.members)
          .filter((id) => id != localStorage.getItem("user_id"));
        this.membersGet?.emit({ user_ids: this.members });
        this.cdr.detectChanges();
      })
      .onError((error) => console.error('Get channel error:', error))
      .build();
    this.membersGet = new EventInteracterBuilder<UserMultiInfoEventInteracter>(this.socketService, 'user.multi_info')
      .onMessage((data) => {
        for (const item of data.users) {
          localStorage.setItem(`user_name_${item.id}`, item.name);
          localStorage.setItem(`user_id_${item.name}`, item.id);
        }
      })
      .onError((error) => console.error('Get members multi info error:', error))
      .build();
  }

  ngOnDestroy(): void {
    this.channelGet?.disconnect();
  }

  refreshChannels(): void {
    this.channelGet?.emit({});
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authenticated'] && this.authenticated) {
      this.refreshChannels();
    }
  }
}
