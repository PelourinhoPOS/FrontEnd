import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { animate, animation, style, transition, trigger, useAnimation } from '@angular/animations';

const showAnimation = animation([
  style({ transform: '{{transform}}', opacity: 0 }),
  animate('{{transition}}'),
])

const hideAnimation = animation([
  animate('{{transition}}', style({ transform: '{{transform}}', opacity: 0 }))
])
@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  animations: [
    trigger('panelState', [
      transition('void=> visible', [useAnimation(showAnimation)]),
      transition('visible => void', [useAnimation(hideAnimation)]),
    ]),
  ],
})
export class DrawerComponent implements OnInit {
  appendTo = 'body';
  container: any;

  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onHide: EventEmitter<any> = new EventEmitter();

  @Input() header = '';

  _visible: boolean = false;

  @Input() get visible(): boolean {
    return this._visible;
  }

  set visible(val) {
    this._visible = val;
    this.visibleChange.emit(this._visible);
  }

  @Input() showCloseIcon: boolean = true;

  transformOptions: any = 'translateY(-100%, 0px, 0px)';
  transitionOptions: string = '150ms cubic-bezier(0, 0, 0.2, 1)';

  _position: string = 'right';

  @Input() get position(): string {
    return this._position;
  }

  set position(value: string) {
    this._position = value;
    switch (value) {
      case 'right':
        this.transformOptions = 'translateX(100%, 0px, 0px)';
        break;
    }
  }

  constructor() { }

  hide() {
    this.onHide.emit({});
  }

  close(event: Event) {
    this.hide();
    this.visibleChange.emit(false);
    event.preventDefault();
  }

  onAnimationStart(event: any) {
    switch (event.toState) {
      case 'visible':
        this.container = event.element;
        this.appendContainer();
    }
  }

  onAnimationEnd(event: any) {
    switch (event.toState) {
      case 'void':
        this.hide();
        break;
    }
  }

  appendContainer() {
    document.body.appendChild(this.container);
  }

  ngOnInit(): void {
  }

}
