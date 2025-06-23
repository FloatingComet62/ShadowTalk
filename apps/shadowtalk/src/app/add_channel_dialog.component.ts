import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel-dialog',
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
    justify-content: center;
    align-items: center;
  }
  input {
    margin-left: 1vw;
    height: 3vw;
    width: 40%;
    padding: 1vw;
    font-size: 1.5vw;
    border-radius: 0.5vw;
    border: none;
    background-color: #101010;
    color: #fff;
    outline: none;
    margin-bottom: 1vw;
  }
  .title {
    font-size: 3vw;
    color: #fff;
    margin-bottom: 4vw;
  }
  button {
    all: unset;
    background-color: #144D37;
    padding: 1vw;
    border-radius: 1vw;
    scale: 0.8;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5vw;
  }
  button:hover {
    background-color: #0f3c2b;
    cursor: pointer;
  }
</style>
<div class="title">Create a new channel</div>
<input type="text" placeholder="Channel name" />
<button>Create Channel</button>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class AddChannelDialogComponent {}
