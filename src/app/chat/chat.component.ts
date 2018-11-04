import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/websocket';

export class Message {
  constructor(
      public sender: string,
      public content: string,
      public isBroadcast = false,
  ) { }
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('viewer') viewer: ElementRef;

    serverMessages = new Array<Message>();
    clientMessage = '';
    isBroadcast = false;
    sender = '';

    socket$: WebSocketSubject<Message>;

    constructor() {

        this.socket$ = new WebSocketSubject('ws://localhost:3000');

        this.socket$
            .subscribe(
            (message) => this.serverMessages.push(message) && this.scroll(),
            (err) => console.error(err),
            () => console.warn('Completed!')
            );
    }
    ngOnInit() {
    }

    ngAfterViewInit() {
        this.scroll();
    }

    public toggleIsBroadcast() {
        this.isBroadcast = !this.isBroadcast;
    }

    public send() {
        const message = new Message(this.sender, this.clientMessage, this.isBroadcast);

        this.serverMessages.push(message);
        this.socket$.next(message);
        this.clientMessage = '';
        this.scroll();
    }

    public isMine(message: Message) {
        return message && message.sender === this.sender;
    }

    public getSenderInitials(sender: string) {
        return sender && sender.substring(0, 2).toLocaleUpperCase();
    }

    public getSenderColor(sender: string) {
        const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZ';
        const initials = this.getSenderInitials(sender);
        const value = Math.ceil((alpha.indexOf(initials[0]) + alpha.indexOf(initials[1])) * 255 * 255 * 255 / 70);
        return '#' + value.toString(16).padEnd(6, '0');
    }

    private scroll() {
        setTimeout(() => {
            this.scrollToBottom();
        }, 100);
    }

    private getDiff() {
        if (!this.viewer) {
            return -1;
        }

        const nativeElement = this.viewer.nativeElement;
        return nativeElement.scrollHeight - (nativeElement.scrollTop + nativeElement.clientHeight);
    }

    private scrollToBottom(t = 1, b = 0) {
        if (b < 1) {
            b = this.getDiff();
        }
        if (b > 0 && t <= 120) {
            setTimeout(() => {
                const diff = this.easeInOutSin(t / 120) * this.getDiff();
                this.viewer.nativeElement.scrollTop += diff;
                this.scrollToBottom(++t, b);
            }, 1 / 60);
        }
    }

    private easeInOutSin(t) {
        return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
    }
}
