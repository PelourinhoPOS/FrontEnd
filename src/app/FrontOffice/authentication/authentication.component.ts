import { Component, OnInit } from '@angular/core';
import { AuthenticationDialogComponent } from '../authentication-dialog/authentication-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import Localbase from 'localbase'

let db = new Localbase('pos');

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})

export class AuthenticationComponent implements OnInit {

  public date: moment.Moment = moment().locale('EN');
  public todayDate: string = "";
  public hourNow: string = "";
  public user
  public password: string = "";

  constructor(public dialog: MatDialog) { }

  openDialog(name: string, funcao: string, image: string, id: string): void {
    const dialogRef = this.dialog.open(AuthenticationDialogComponent, {
      width: '100%',
      height: '85%',
      panelClass: 'app-full-bleed-dialog',
      data: { password: this.password = "", userName: name, funcao: funcao, avatar: image, id: id },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.password = result;
      console.log(this.password)
    });
  }

  ngOnInit(): void {
    this.todayDate = this.date.format('LL');
    this.hourNow = this.date.format('LTS');
    this.getUsers();
  }

  addUser() {
    db.collection('empregados').add({
      id: this.user.length + 1,
      nome: 'Paulo Sousa',
      password: '6996',
      funcao: 'Admin',
      avatar: 'https://media-exp1.licdn.com/dms/image/C4E03AQGrZ_EMwgu-lw/profile-displayphoto-shrink_400_400/0/1643915772499?e=1655942400&v=beta&t=toXdH3f00wdysaFtOWM771Eiv0iw2escR3B81xAUPfc'
    });
  }

  getUsers() {
    db.collection('empregado').get().then(empregados => {
      this.user = empregados
    });
  }
}
