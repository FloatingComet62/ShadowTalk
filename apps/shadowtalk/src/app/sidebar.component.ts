import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddChannelComponent } from "./add_channel.component";

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, AddChannelComponent],
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
  <app-add-channel [OnClick]="AddChannelClick"></app-add-channel>
</div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.Emulated,
})
export class SidebarComponent {
  @Input({ required: true })
  AddChannelClick!: () => void;
}
