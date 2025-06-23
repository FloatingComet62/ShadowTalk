import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from "./message.component";
import { MessageInputComponent } from "./message_input.component";

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
  <app-message content="Hello"></app-message>
  <app-message content="How are ya" [self_message]="true"></app-message>
  <app-message content="I am good"></app-message>
  <app-message-input></app-message-input>
</div>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class MessagesComponent {}
