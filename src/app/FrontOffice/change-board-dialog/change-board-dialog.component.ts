import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Mesa } from 'src/app/BackOffice/models/mesa';
import { MesasService } from 'src/app/BackOffice/modules/boards/mesas.service';
import { ToastrService } from 'ngx-toastr';
import { DeleteModalComponent } from 'src/app/BackOffice/shared/components/delete-modal/delete-modal.component';

export interface DialogData {
  id: string,
  name: string,
  capacity: number,
  number: number,
}

@Component({
  selector: 'app-change-board-dialog',
  templateUrl: './change-board-dialog.component.html',
  styleUrls: ['./change-board-dialog.component.scss']
})
export class ChangeBoardDialogComponent implements OnInit {

  constructor(public mesaService: MesasService, public dialogRef: MatDialogRef<ChangeBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private fb: FormBuilder, private router: Router,
    private cookieService: CookieService, private toastr: ToastrService, public dialog: MatDialog) { }

  Form = this.fb.group({
    name: new FormControl('', [Validators.required]),
    number: new FormControl('', [Validators.required]),
  })

  ngOnInit(): void {
    
  }

  updateBoard(id) {
    let mesa : Mesa = {
      id: id,
      name: this.data.name,
      capacity: this.data.capacity,
      number: this.data.number,
    }

    this.mesaService.update(mesa).then(() => {
      this.toastr.success('Mesa atualizada com sucesso')
    }).catch((err) => {
      err
    });

    this.onNoClick();
  }

  deleteBoard(id) {
    let mesa : any = {
      id: id,
      name: this.data.name,
    }
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      height: '30%',
      width: '50%',
      data: { values: mesa }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.mesaService.delete(mesa).then(() => {
          this.toastr.success('Mesa eliminada com sucesso')
        }).catch((err) => {
          err
        });
      }
    });

    this.onNoClick();
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
