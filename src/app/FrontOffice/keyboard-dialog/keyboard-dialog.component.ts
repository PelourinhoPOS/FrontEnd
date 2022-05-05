import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import Keyboard from "simple-keyboard";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  item: string;
}

@Component({
  selector: 'app-keyboard-dialog',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './keyboard-dialog.component.html',
  styleUrls: ['./keyboard-dialog.component.scss']
})
export class KeyboardDialogComponent implements OnInit {

  value: string = "";
  keyboard: Keyboard;

  ngAfterViewInit() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button)
    });
  }

  constructor(
    public dialogRef: MatDialogRef<KeyboardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

  onChange = (input: string) => {
    this.value = input;
    console.log("Input changed", input);
    this.data.item = input;
  };

  onKeyPress = (button: string) => {
    console.log("Button pressed", button);

    /**
     * If you want to handle the shift and caps lock buttons
     */
    if (button === "{shift}" || button === "{lock}") this.handleShift();
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
