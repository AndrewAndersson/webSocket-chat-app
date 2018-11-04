import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { WebsocketService } from '../../websocket';
import { IMessage } from '../../models/IMessage';
import { WS } from '../../models/websocket.events';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  private messages$: Observable<IMessage[]>;
  private counter$: Observable<number>;
  private texts$: Observable<string[]>;

  public form: FormGroup;

  constructor(private fb: FormBuilder, private wsService: WebsocketService) {
  }

  ngOnInit() {
      this.form = this.fb.group({
          text: [null, [
              Validators.required
          ]]
      });

      // get messages
      this.messages$ = this.wsService.on<IMessage[]>(WS.ON.MESSAGES);

      // get counter
      this.counter$ = this.wsService.on<number>(WS.ON.COUNTER);

      // get texts
      this.texts$ = this.wsService.on<string[]>(WS.ON.UPDATE_TEXTS);
  }

  public sendText(): void {
      if (this.form.valid) {
          this.wsService.send(WS.SEND.SEND_TEXT, this.form.value.text);
          this.form.reset();
      }
  }

  public removeText(index: number): void {
      this.wsService.send(WS.SEND.REMOVE_TEXT, index);
  }
}
