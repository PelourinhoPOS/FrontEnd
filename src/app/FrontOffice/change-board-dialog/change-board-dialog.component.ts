import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Mesa } from 'src/app/BackOffice/models/mesa';
import { MesasService } from 'src/app/BackOffice/modules/mesas/mesas.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(public mesaService: MesasService, public dialogRef: MatDialogRef<ChangeBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private fb: FormBuilder, private router: Router,
    private cookieService: CookieService, private toastr: ToastrService) { }

  Form = this.fb.group({
    name: new FormControl('', [Validators.required]),
    number: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    console.log(this.data);
  }



  updateBoard(id) {
    let mesa : Mesa = {
      id: this.data.id,
      name: this.data.name,
      capacity: this.data.capacity,
      number: this.data.number,
      occupy: this.data.occupy
    }

  if(mesa.capacity >= mesa.occupy){

    this.mesaService.updateDataOffline(mesa);
    this.onNoClick();
  }else{
    mesa.occupy = mesa.capacity;
    this.mesaService.updateDataOffline(mesa);
    this.onNoClick();
  }

    // db.collection('boards').doc({ id: this.data.id }).update({
    //   name: this.data.name,
    //   number: this.data.number,
    //   capacity: this.data.capacity,
    //   occupy: this.data.occupy,
    // }).then(() => {
    //   window.location.reload();
    // })
  }

  deleteBoard(id) {
    let mesa: Mesa = {
      id: id,
      name: '',
      capacity: 0,
      number: 0,
      occupy: 0
    };

    this.mesaService.deleteDataOffline(mesa);

    this.onNoClick();
    // db.collection('boards').doc({ id: this.data.id }).delete().then(() => {
    //   window.location.reload();
    // })
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
