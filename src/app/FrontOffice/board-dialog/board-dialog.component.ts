import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Localbase from 'localbase';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MesasService } from 'src/app/BackOffice/modules/boards/mesas.service';
import { Mesa } from 'src/app/BackOffice/models/mesa';

@Component({
  selector: 'app-board-dialog',
  templateUrl: './board-dialog.component.html',
  styleUrls: ['./board-dialog.component.scss']
})
export class BoardDialogComponent implements OnInit {

  public capacity: number = 2;
  public test
  public number = 0;
  public selected = 'square';
  public occupy = 0;

  Form = this.fb.group({
    name: new FormControl('', [Validators.required]),
    number: new FormControl('', [Validators.required]),
  })

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private mesasService: MesasService,  private fb: FormBuilder, private toastr: ToastrService, public dialogRef: MatDialogRef<BoardDialogComponent>) { }

  ngOnInit(): void { this.getBoards() }

  addBoard() {

    let mesa : Mesa = {
      id: Date.now(),
      id_zone: parseInt(this.data),
      name: this.Form.controls["name"].value,
      capacity: this.capacity,
      number: this.number,
      type: this.selected,
      occupy: this.occupy,
      dragPosition: {
        x: 0,
        y: 0
      }
    }

    this.mesasService.register(mesa).then(() => {
      this.toastr.success('Mesa registada com sucesso.');
    }).catch(() => {
      this.toastr.error('Erro ao registar mesa.');
    });

    this.onNoClick();
    
    // db.collection('boards').add({
    //   id: Date.now(),
    //   number: this.number,
    //   name: this.Form.controls["name"].value,
    //   capacity: this.capacity,
    //   type: this.selected,
    //   occupy: this.occupy,
    // }).then(() => {
    //   this.toastr.success('Board created successfully!', 'Success!')
    //   window.location.reload();
    // }).catch(() => {
    //   this.toastr.error('Error creating board!', 'Error!')
    // })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  increase() {
    this.capacity += 2;
    if (this.capacity > 12) {
      this.capacity = 12;
    }
  }

  decrease() {
    this.capacity -= 2;
    if (this.capacity < 2) {
      this.capacity = 2;
    }
  }

  getBoards() {
    this.mesasService.getDataOffline().subscribe(data => {
      this.number = data.length;
    })

    // this.test = db.collection('boards').get().then(boards => {
    //   this.number = (boards.length)
    // })
  }
}
