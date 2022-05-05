import { Component, OnInit, Inject } from '@angular/core';
import { authenticationService } from './authentication-dialog.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import Localbase from 'localbase';

let db = new Localbase('pos')

export interface DialogData {
  password: string;
  userName: string;
  funcao: string;
  avatar: string;
  id: string;
}

@Component({
  selector: 'app-authentication-dialog',
  templateUrl: './authentication-dialog.component.html',
  styleUrls: ['./authentication-dialog.component.scss']
})

export class AuthenticationDialogComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<AuthenticationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private _router: Router, private toastr: ToastrService,
    private cookie: CookieService, private authService: authenticationService
  ) { }

  public resultado: Array<number> = [];
  public i: number = 0;
  public maxLenght: number = 6;
  public userPassword

  onNoClick(): void {
    this.dialogRef.close();
  }

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
    this.getPassword(this.data.id)
  }

  getPassword(id) {
    db.collection('empregado').doc({ id: id }).get().then(user => {
      this.userPassword = user.password
    });
  }

  verifyPassword() {
    if (this.data.password == this.userPassword) {
      this.cookie.set('user', this.data.id);
      this.cookie.set('userName', this.data.userName);
      this.cookie.set('funcao', this.data.funcao);
      this.cookie.set('avatar', this.data.avatar);
      this.dialogRef.close(this.data);
      this._router.navigate(['/board']);
      this.authService.startStopWatch();
    } else {
      this.data.password = "";
      this.toastr.error('Incorrect Password!');
    }
  }

}