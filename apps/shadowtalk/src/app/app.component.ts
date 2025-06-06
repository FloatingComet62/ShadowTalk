import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { SocketService } from '../socket.server';
import { Subscription } from 'rxjs';

@Component({
  imports: [NxWelcomeComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'shadowtalk';
  private messageSub?: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.initConnection();
    this.messageSub = this.socketService.listen<string>('ping.reply').subscribe((msg) => {
      console.log('New message:', msg);
    });
    this.socketService.emit('ping', { hello: 'world' });
  }

  ngOnDestroy() {
    this.messageSub?.unsubscribe();
  }
}
