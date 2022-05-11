import { Component, OnInit, Inject } from '@angular/core';
import { authenticationService } from './authentication-dialog.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { EmpregadosService } from 'src/app/BackOffice/modules/empregados/empregados.service';


export interface DialogData {
  password: string;
  name: string;
  function: string;
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
    private empregadosService: EmpregadosService,
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
    this.empregadosService.getDataOffline().subscribe((data) => {
      this.userPassword = data.find(x => x.id == id).password
    })
  }

  verifyPassword() {
    if (this.data.password == this.userPassword) {
      this.cookie.set('userId', this.data.id);
      this.cookie.set('role', this.data.function);
      this.dialogRef.close(this.data);
      this._router.navigate(['/board']);
      this.authService.startStopWatch();
    } else {
      this.data.password = "";
      this.toastr.error('Incorrect Password!');
    }
  }

  joinDashboard() {
    if (this.data.password == this.userPassword && (this.data.function === 'Admin' || this.data.function === 'Gerente')) {
      this.cookie.set('userId', this.data.id);
      this.cookie.set('role', this.data.function);
      this.dialogRef.close(this.data);
      this._router.navigate(['/backoffice']);
      this.authService.startStopWatch();
    } else {
      this.data.password = "";
      this.toastr.error('Incorrect Password!');
    }
  }
}