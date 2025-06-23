import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  template: `
<style>
  :host ::ng-deep {
    color: #fff;
    padding: 2rem;
    display: block;
    height: inherit;
    width: 30vw;
  }
  .title {
    font-size: 2rem;
  }
</style>
<div class="title">ShadowTalk</div>
<div class="pinned">

</div>
<div class="others"></div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.Emulated,
})
export class SidebarComponent {}
