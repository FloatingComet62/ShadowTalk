import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from "./message.component";
import { MessageInputComponent } from "./message_input.component";
import { EventInteracter, EventInteracterBuilder, SocketService } from '../socket.server';

type Message = {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  read_by: string[]; // user ids
  timestamp: Date;
}

type MessagesEventInteractor = EventInteracter<
  {
    channel_id: string,
    bottom_pagination: number,
  },
  { messages: Message[]; },
  { message: string; }
>;

@Component({
  selector: 'app-messages',
  imports: [CommonModule, MessageComponent, MessageInputComponent],
  template: `
<style>
  :host ::ng-deep {
    margin: 1vw;
    background-color: #202020;
    width: 70vw;
    border-radius: 1vw;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .messages {
    display: flex;
    flex-direction: column;
    gap: 2vw;
    font-size: 1.5vw;
    padding: 2vw;
  }
</style>
<div class="top_padding"></div>
<div class="messages">
  <app-message
    *ngFor="let message of messages; trackBy: trackByMessageId"
    [content]="message.content"
    [self_message]="message.sender_id === (user_id || 'self')"
  ></app-message>
  <app-message-input (addMessage)="addMessage($event)" [channel_id]="channel_id"></app-message-input>
</div>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class MessagesComponent implements OnInit, OnDestroy, OnChanges {
  private messagesGet?: MessagesEventInteractor;
  messages: Message[] = [];
  user_id = localStorage.getItem('user_id');

  @Input({ required: true }) authenticated!: boolean;
  @Input({ required: true }) channel_id!: string;

  constructor(private socketService: SocketService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.socketService.initConnection();
    this.messagesGet = new EventInteracterBuilder<MessagesEventInteractor>(this.socketService, 'channel.paginatedLoad')
      .onMessage((data) => {
        this.messages = [...this.messages, ...(data.messages.reverse())];
        console.log('Messages loaded: ', this.messages);
        this.cdr.detectChanges();
      })
      .onError((error) => console.error('Channel creation error:', error))
      .build();
    this.user_id = localStorage.getItem('user_id');
    if (this.authenticated) {
      this.loadMessages();
    }
  }

  ngOnDestroy(): void {
    this.messagesGet?.disconnect();
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id
  }

  loadMessages() {
    this.messagesGet?.emit({
      channel_id: this.channel_id,
      bottom_pagination: this.messages.length,
    })
  }

  addMessage(message_content: string): void {
    this.messages.push({
      channel_id: this.channel_id,
      content: message_content,
      id: this.messages.length.toString(),
      read_by: [],
      sender_id: this.user_id ?? 'self',
      timestamp: new Date()
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authenticated'] && this.authenticated) {
      this.user_id = localStorage.getItem('user_id');
      this.loadMessages();
    }
    if (changes['channel_id'] && this.channel_id) {
      this.messages = [];
      this.loadMessages();
    }
  }
}
