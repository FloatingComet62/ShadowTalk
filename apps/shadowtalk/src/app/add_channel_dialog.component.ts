import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventInteracter, EventInteracterBuilder, SocketService } from '../socket.server';
import { FormsModule } from '@angular/forms';

type CreateChannelEventInteractor = EventInteracter<
  { name: string; members: string[] },
  { channel_id: string },
  { message: string }
>;

@Component({
  selector: 'app-channel-dialog',
  imports: [CommonModule, FormsModule],
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
    text-align: center;
    margin-left: 1vw;
    height: 3vw;
    border: none;
    width: 40%;
    padding: 1vw;
    font-size: 1.5vw;
    border-radius: 0.5vw;
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
  .users_box {
    width: 60%;
    background-color: #101010;
    padding: 1vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1vw;
    border-radius: 0.5vw;
  }
  .search_text {
    width: 80%;
    font-size: 1vw;
    padding: 0vw;
    background-color: #202020;
  }
  .users {
    width: 80%;
    font-size: 0.8vw;
    text-align: center;
    color: #fff;
    height: 15vh;
    overflow-y: scroll;
    gap: 0.5vw;
  }
  .user {
    all: unset;
    cursor: pointer;
    padding: 0.5vw;
    border-radius: 0.5vw;
    font-size: 0.8vw;
  }
  .user:hover {
    background-color: #202020;
  }
  .selected {
    background-color: #144D37;
  }
  .selected:hover {
    background-color: #0f3c2b;
  }
  .external {
    position: absolute;
    display: none;
  }
</style>
<div class="title">Create a new channel</div>
<input type="text" placeholder="Channel name" #channelNameRef />
<div class="users_box">
  <input type="text" class="search_text" placeholder="Add members (... or UUID)" [(ngModel)]="userSearchQuery" />
  <button (click)="addExternalItem()" class="external_button" *ngIf="isSearchUUID()">Add external UUID</button>
  <div class="users" [class.external]="isSearchUUID()">
    <button (click)="toggleItem(i)" class="user" [class.selected]="(i >= searchLength) || selectedItems[i]" *ngFor="let username of getSearchResults(); let i = index">{{ username }}</button>
  </div>
</div>
<button (click)="createChannelClicked()">Create Channel</button>
  `,
  encapsulation: ViewEncapsulation.Emulated,
})
export class AddChannelDialogComponent implements OnInit, OnDestroy {
  private channelCreate?: CreateChannelEventInteractor;
  @ViewChild('channelNameRef') channelNameRef!: ElementRef<HTMLInputElement>;
  @Output() addChannelClick = new EventEmitter<void>();
  user_id = localStorage.getItem('user_id');
  selectedItems: boolean[] = [];
  userSearchQuery = '';
  searchLength = 0;
  externalUUIDs = new Set<string>();

  @Input({ required: true }) usernames!: string[];

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.initConnection();
    this.channelCreate = new EventInteracterBuilder<CreateChannelEventInteractor>(this.socketService, 'channel.create')
      .onMessage((data) => console.log('Channel created:', data))
      .onError((error) => console.error('Channel creation error:', error))
      .build();
    for (let i = 0; i < this.usernames.length; i++) {
      this.selectedItems.push(false);
    }
  }

  ngOnDestroy(): void {
    this.channelCreate?.disconnect();
  }

  createChannelClicked(): void {
    if (!this.user_id) {
      return;
    }
    this.channelCreate?.emit({
      name: this.channelNameRef.nativeElement.value,
      members: this.getSearchResults(),
    });
    this.channelNameRef.nativeElement.value = '';
    this.addChannelClick.emit();
  }

  toggleItem(idx: number): void {
    if (idx >= this.searchLength) {
      const externalUUIDs = Array.from(this.externalUUIDs.values())
      externalUUIDs.splice(idx - this.searchLength, 1);
      this.externalUUIDs = new Set(externalUUIDs);
      this.selectedItems.splice(idx, 1);
      this.searchLength--;
      return;
    }
    this.selectedItems[idx] = !this.selectedItems[idx];
  }

  getSearchResults(): string[] {
    if (this.userSearchQuery.length == 0) {
      this.searchLength = this.usernames.length;
      return this.usernames.concat(Array.from(this.externalUUIDs));
    }
    const output = this.usernames.filter((username) => username.toLowerCase().includes(this.userSearchQuery.toLowerCase()));
    this.searchLength = output.length;
    return output.concat(Array.from(this.externalUUIDs));
  }

  isUUID(username: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(username);
  }

  isSearchUUID(): boolean {
    return this.userSearchQuery.length > 0 && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(this.userSearchQuery);
  }

  addExternalItem() {
    if (!this.isSearchUUID()) {
      console.log("this shouldn't be ran. YOU, why are you here?")
      return;
    }
    const externalUUID = this.userSearchQuery;
    this.userSearchQuery = '';
    this.externalUUIDs.add(externalUUID);
  }
}
