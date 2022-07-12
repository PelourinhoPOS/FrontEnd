import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

@Component({
  selector: 'app-virtual-keyboard',
  templateUrl: './virtual-keyboard.component.html',
  styleUrls: ['./virtual-keyboard.component.scss']
})
export class VirtualKeyboardComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    //console.log(this.data);
  }

  value = "";
  keyboard!: Keyboard;
  dataLength = 0;
  backSpacePressed = false;

  
  ngAfterViewInit() {
    if (this.data) {

      if (this.data[1] === 'text') {
        this.keyboard = new Keyboard({
          onChange: input => this.onChange(input),
          onKeyPress: (button: string) => this.onKeyPress(button)
        });
      } else {
        this.keyboard = new Keyboard({
          onChange: input => this.onChange(input),
          onKeyPress: (button: string) => this.onKeyPress(button),// ,
          layout: {
            default: ["1 2 3", "4 5 6", "7 8 9", "{shift} 0 .", "{bksp}"],
            shift: ["+ / #", "$ % ^", "& * (", "{shift} ) -", "{bksp}"]
          },
          theme: "hg-theme-default hg-layout-numeric numeric-theme"
        });
      }

      if (this.data[2]) {
        this.value = this.data[2];
      }

      if (this.data[3]) {
        this.dataLength = this.data[3];
      }

    }

  }

  onChange = (input: string) => {

    if (this.dataLength == 0) {
      this.value = input;
    } else {
      if (this.value.length < this.dataLength) {
        this.value = input;
      }
    }
    // console.log("Input changed", input);
  };

  onKeyPress = (button: string) => {
    // console.log("Button pressed", button);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === "{shift}" || button === "{lock}") this.handleShift();

    if (button === "{bksp}") {
      if (this.data[1] !== 'text') {
        this.value = this.value.substr(0, this.value.length - 1);
      }
    }
  };

  onInputChange = (event: any) => {
    this.keyboard.setInput(event.target.value);
  };

  handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";

    this.keyboard.setOptions({
      layoutName: shiftToggle
    });

  };

}
