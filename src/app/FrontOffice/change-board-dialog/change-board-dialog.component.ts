import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import Localbase from 'localbase';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

let db = new Localbase('BigJson')

export interface DialogData {
  id: string,
  name: string,
  capacity: number,
  number: number,
  occupy: number,
}

@Component({
  selector: 'app-change-board-dialog',
  templateUrl: './change-board-dialog.component.html',
  styleUrls: ['./change-board-dialog.component.scss']
})
export class ChangeBoardDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ChangeBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private fb: FormBuilder, private router: Router,
    private cookieService: CookieService) { }

  Form = this.fb.group({
    name: new FormControl('', [Validators.required]),
    number: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
  }

  updateBoard(id) {
    db.collection('mainBoards').doc({ id: this.data.id }).update({
      name: this.data.name,
      number: this.data.number,
      capacity: this.data.capacity,
      occupy: this.data.occupy,
    }).then(() => {
      window.location.reload();
    })
  }

  deleteBoard(id) {
    db.collection('mainBoards').doc({ id: this.data.id }).delete().then(() => {
      window.location.reload();
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  increase() {
    this.data.capacity += 2;
    if (this.data.capacity > 12) {
      this.data.capacity = 12;
    }
  }

  decrease() {
    this.data.capacity -= 2;
    if (this.data.capacity < 2) {
      this.data.capacity = 2;
    }
  }

  increaseOccupy() {
    this.data.occupy++;
    if (this.data.occupy > this.data.capacity) {
      this.data.occupy = this.data.capacity;
    }
  }

  decreaseOccupy() {
    this.data.occupy--;
    if (this.data.occupy < 0) {
      this.data.occupy = 0;
    }
  }

  onSelect() {
    this.router.navigate(['/food&drinks', this.data.id]);
    this.cookieService.set('boardId', this.data.id);
    this.onNoClick();
  }

  // Verify if it sends the id
  // print() {
  //   console.log(this.data.id)
  // }

}
