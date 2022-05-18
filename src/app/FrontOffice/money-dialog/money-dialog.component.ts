import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

export interface DialogData {
  value: number;
  split: Array<any>;
}

@Component({
  selector: 'app-money-dialog',
  templateUrl: './money-dialog.component.html',
  styleUrls: ['./money-dialog.component.scss']
})
export class MoneyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MoneyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public toastr: ToastrService) { }

  public price: number = 0;
  public totalchange: number = 0;
  public splitchange: number = 0;
  public change: number = 0;
  public changetotal: number = 0;

  onNoClick(): void {

    // if (this.data.split[1] === 0) {
    //   this.data.split[0] = 0;
    // } else this.data.split[1] = this.data.split[1] - 1;

    if (this.data.split[0] === this.price && this.data.split[1] != 0) {
      this.data.split[1] = this.data.split[1] - 1
      this.dialogRef.close();
    } else {
      this.toastr. warning('There is money missing!');
    }
  }

  getChange() {
    const round = (num, places) => {
      return +parseFloat(num).toFixed(places);
    };

    this.totalchange = round((this.price - this.data.value) * -1, 2);
    this.splitchange = round((this.price - this.data.split[0]) * -1, 2);

    if (this.splitchange < 0) {
      this.change = this.splitchange * -1;
      console.log(this.change);
      this.splitchange = 0;
    }

    if (this.totalchange < 0) {
      this.changetotal = this.totalchange * -1;
      this.totalchange = 0;
    }
  }

  addNumber(nbr: number) {
    this.price += nbr
    this.getChange();
  }

  reset() {
    this.price = 0;
    this.totalchange = 0;
    this.splitchange = 0;
    this.change = 0;
  }

  insertTotal() {
    this.price = this.data.split[0];
  }

  ngOnInit(): void {
  }

}
