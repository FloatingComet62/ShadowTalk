import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blank',
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
    justify-content: space-between;
  }
  .body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    gap: 2vw;
    font-size: 2.5vw;
    padding: 2vw;
  }
</style>
<div class="top_padding"></div>
<div class="body">
  Choose a channel to view the messages
</div>
<div class="bottom_padding"></div>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class AddChannelComponent {}