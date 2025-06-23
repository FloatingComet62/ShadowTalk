import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-channel',
  imports: [CommonModule],
  template: `
<style>
  .container {
    /** reset button styles */
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
<button class="container" aria-label="Add Channel" (click)="OnClick()">
  <svg width="80px" height="80px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><path d="M8 12H12M16 12H12M12 12V8M12 12V16" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
  <div class="text">Add Channel</div>
</button>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class AddChannelComponent {
  @Input({ required: true })
  OnClick!: () => void;
}