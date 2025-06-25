import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel',
  imports: [CommonModule],
  template: `
<style>
  .container {
    all: unset;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 0.5vw;
    width: 5vw;
    height: 5vw;
    background-color: #1a1a1a;
    border-radius: 1vw;
    padding: 1vw;
  }
  .container:hover {
    background-color: #333333;
    cursor: pointer;
  }
  .text {
    font-size: 0.8vw;
  }
</style>
<button class="container" (aria-label)="'Channel - ' + name" (click)="onClickTrigger()">
  <svg width="80px" height="80px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2fff/svg" color="#ffffff"><path d="M17 12.5C17.2761 12.5 17.5 12.2761 17.5 12C17.5 11.7239 17.2761 11.5 17 11.5C16.7239 11.5 16.5 11.7239 16.5 12C16.5 12.2761 16.7239 12.5 17 12.5Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 12.5C12.2761 12.5 12.5 12.2761 12.5 12C12.5 11.7239 12.2761 11.5 12 11.5C11.7239 11.5 11.5 11.7239 11.5 12C11.5 12.2761 11.7239 12.5 12 12.5Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 12.5C7.27614 12.5 7.5 12.2761 7.5 12C7.5 11.7239 7.27614 11.5 7 11.5C6.72386 11.5 6.5 11.7239 6.5 12C6.5 12.2761 6.72386 12.5 7 12.5Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
  <div class="text">{{ name }}</div>
</button>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ChannelComponent {
  @Input({ required: true }) id!: string;
  @Input({ required: true }) name!: string;
  @Output() Click = new EventEmitter<string>();

  onClickTrigger() {
    this.Click.emit(this.id);
  }
}
