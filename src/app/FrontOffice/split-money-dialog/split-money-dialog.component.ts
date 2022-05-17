import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  split: number;
  value: number;
  person: number;
}

@Component({
  selector: 'app-split-money-dialog',
  templateUrl: './split-money-dialog.component.html',
  styleUrls: ['./split-money-dialog.component.scss']
})
export class SplitMoneyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SplitMoneyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  public person: number = 1;
  public split;

  increase() {
    this.person++;
    if (this.person > this.person) {
      this.person = this.person;
    }
  }

  decrease() {
    this.person--;
    if (this.person < 1) {
      this.person = 1;
    }
  }

  splitMoney() {
    const round = (num, places) => {
      return +parseFloat(num).toFixed(places);
    };
    this.split = round(this.data.value / this.person, 2);
    this.dialogRef.close([this.split, this.person]);
  }

  ngOnInit(): void {
  }

}
