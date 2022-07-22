import { Component, OnInit } from '@angular/core';
import { AuthenticationDialogComponent } from '../authentication-dialog/authentication-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { UsersService } from 'src/app/BackOffice/modules/users/users.service';
import { User } from 'src/app/BackOffice/models/user';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
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
  public subscriptionData!: Subscription; //subscription to refresh data

  constructor(public dialog: MatDialog, private usersService: UsersService, private cookie: CookieService, private _router: Router) { }

  openDialog(name: string, funcao: string, image: string, id: string): void {
    const dialogRef = this.dialog.open(AuthenticationDialogComponent, {
      width: '100%',
      height: '85%',
      panelClass: 'app-full-bleed-dialog',
      data: { password: this.password = "", name: name, function: funcao, avatar: image, id: id },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.password = result;
      console.log(this.password)
    });
  }

  public userData: User = {
    id: 1,
    address: "Rua da liberdade",
    name: "Teste Admin",
    phone: 9100000000,
    function: "Admin",
    sessionEnded: new Date(),
    sessionStarted: new Date(),
    active: true,
    nif: 272533030,
    password: 1234,
    avatar: 'https://media-exp1.licdn.com/dms/image/C4E03AQGrZ_EMwgu-lw/profile-displayphoto-shrink_400_400/0/1643915772499?e=1655942400&v=beta&t=toXdH3f00wdysaFtOWM771Eiv0iw2escR3B81xAUPfc',
    synchronized: false
  }


  async register(empregado: User) {
    await this.usersService.register(empregado);
  }

  // addUser() {
  //   db.collection('empregado').add({
  //     id: 2,
  //     name: 'Paulo Sousa',
  //     password: '6996',
  //     funcao: 'Admin',
  //     avatar: 'https://media-exp1.licdn.com/dms/image/C4E03AQGrZ_EMwgu-lw/profile-displayphoto-shrink_400_400/0/1643915772499?e=1655942400&v=beta&t=toXdH3f00wdysaFtOWM771Eiv0iw2escR3B81xAUPfc'
  //   });
  // }

  getUsers() {
    // db.collection('empregado').get().then(users => {
    //   this.user = users
    // });
    this.usersService.getDataOffline().subscribe(data => {
      this.user = data
    });
    console.log(this.user);
  }

  isAuthenticated() {
    if (this.cookie.get('userId')) {
      this._router.navigate(['/board']);
    }
  }

  ngOnDestroy(): void {
    this.subscriptionData.unsubscribe();
  }

  ngOnInit(): void {
    this.todayDate = this.date.format('LL');
    this.hourNow = this.date.format('LTS');
    this.register(this.userData);
    this.isAuthenticated();
    this.getUsers();
    this.subscriptionData = this.usersService.refreshData.subscribe(() => {
      // this.listAPIdata();
      this.getUsers();
      // this.listAllData();
    });
  }
}