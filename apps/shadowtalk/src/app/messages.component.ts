import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageComponent } from "./message.component";
import { InputComponent } from "./input.component";

@Component({
  selector: 'app-messages',
  imports: [CommonModule, MessageComponent, InputComponent],
  template: `
<style>
  :host ::ng-deep {
    margin: 1rem;
    background-color: #202020;
    width: 70vw;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .messages {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    font-size: 1.5rem;
    padding: 2rem;
  }
</style>
<div class="top_padding"></div>
<div class="messages">
  <app-message content="Hello"></app-message>
  <app-message content="How are ya" [self_message]="true"></app-message>
  <app-message content="I am good"></app-message>
  <app-input></app-input>
</div>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class MessagesComponent {}
