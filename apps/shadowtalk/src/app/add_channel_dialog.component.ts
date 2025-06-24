import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventInteracter, EventInteracterBuilder, SocketService } from '../socket.server';

type CreateChannelEventInteractor = EventInteracter<
  { name: string; members: string[] },
  { channel_id: string },
  { message: string }
>;

@Component({
  selector: 'app-channel-dialog',
  imports: [CommonModule],
  template: `
<style>
  :host ::ng-deep {
    margin: 1vw;
    background-color: #202020;
    width: 70vw;
    border-radius: 1vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  input {
    margin-left: 1vw;
    height: 3vw;
    width: 40%;
    padding: 1vw;
    font-size: 1.5vw;
    border-radius: 0.5vw;
    border: none;
    background-color: #101010;
    color: #fff;
    outline: none;
    margin-bottom: 1vw;
  }
  .title {
    font-size: 3vw;
    color: #fff;
    margin-bottom: 4vw;
  }
  button {
    all: unset;
    background-color: #144D37;
    padding: 1vw;
    border-radius: 1vw;
    scale: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5vw;
  }
  button:hover {
    background-color: #0f3c2b;
    cursor: pointer;
  }
</style>
<div class="title">Create a new channel</div>
<input type="text" placeholder="Channel name" />
<button (click)="createChannelClicked()">Create Channel</button>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class AddChannelDialogComponent implements OnInit, OnDestroy {
  private channelCreate?: CreateChannelEventInteractor;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.initConnection();
    this.channelCreate = new EventInteracterBuilder<CreateChannelEventInteractor>(this.socketService, 'channel.create')
      .onMessage((data) => console.log('Channel created:', data))
      .onError((error) => console.error('Channel creation error:', error))
      .build();
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
    this.channelCreate?.disconnect();
  }

  createChannelClicked(): void {
    this.channelCreate?.emit({
      name: "test",
      members: ["e8ff0b96-de8c-4ffe-a00d-2b6660ac47c3"],
    })
  }
}
