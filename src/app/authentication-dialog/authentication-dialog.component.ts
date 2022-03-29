import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';

export interface DialogData {
  password: string;
  userName: string;
  funcao: string;
  avatar: string;
}

@Component({
  selector: 'app-authentication-dialog',
  templateUrl: './authentication-dialog.component.html',
  styleUrls: ['./authentication-dialog.component.scss']
})
export class AuthenticationDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AuthenticationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public resultado: Array<number> = [];
  public i: number = 0;
  public maxLenght: number = 4;

  @ViewChild('input') private input: any;

  addNumber(nbr: number) {
    if (this.data.password.length < this.maxLenght) {
      this.data.password += nbr
    }
  }

  reset() {
    this.data.password = "";
  }

  delete() {
    const str = this.data.password;
    const str2 = str.slice(0, -1);
    console.log(str2)
    this.data.password = str2
  }

  ngOnInit(): void {

  }

}