import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message',
  imports: [CommonModule],
  template: `
<style>
  :host ::ng-deep {
    display: flex;
    justify-content: space-between;
  }
  :host.self_message {
    flex-direction: row-reverse;
  }
  .content {
    padding: 1rem;
    background-color: #101010;
    color: #fff;
    border-radius: 1rem;
  }
  :host.self_message .content {
    background-color: #144D37;
  }
</style>
<div class="content">
{{ content }}
</div>
<div class="director"></div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MessageComponent {
  @Input({ required: true })
  content = '';

  @Input()
  @HostBinding('class.self_message')
  self_message = false;
}
