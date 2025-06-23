import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-input',
  imports: [CommonModule],
  template: `
<style>
  :host ::ng-deep {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #101010;
    border-radius: 1vw;
  }
  input {
    margin-left: 1vw;
    height: 3vw;
    width: 100%;
    padding: 1vw;
    font-size: 1.5vw;
    border-radius: 0.5vw;
    border: none;
    background-color: #00000000;
    color: #fff;
    outline: none;
  }
  .send_button {
    all: unset;
    background-color: #144D37;
    padding: 1vw;
    border-radius: 1vw;
    scale: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .send_button:hover {
    background-color: #0f3c2b;
    cursor: pointer;
  }
</style>
<input type="text" placeholder="Type your message here...">
<button class="send_button">
  <svg width="64px" height="64px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#fff"><path d="M22.1525 3.55321L11.1772 21.0044L9.50686 12.4078L2.00002 7.89795L22.1525 3.55321Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.45557 12.4436L22.1524 3.55321" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
</button>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class MessageInputComponent {}
