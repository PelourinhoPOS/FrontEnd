import { Component, OnInit } from '@angular/core';
import { AuthenticationDialogComponent } from '../authentication-dialog/authentication-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { UsersService } from 'src/app/BackOffice/modules/users/users.service';
import { User } from 'src/app/BackOffice/models/user';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/BackOffice/models/cliente';
import { ClientesService } from 'src/app/BackOffice/modules/clientes/clientes.service';
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

  constructor(public dialog: MatDialog, private usersService: UsersService, private clientService: ClientesService, private cookie: CookieService, private _router: Router) { }

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

  registerDefaultsUsers() {
    let admin: User = {
      id: 1,
      address: "Rua da liberdade",
      name: "Admin",
      phone: 9100000000,
      function: "Admin",
      sessionEnded: new Date(),
      sessionStarted: new Date(),
      active: true,
      nif: 272533030,
      password: 1234,
      avatar: './assets/images/admin.png',
      synchronized: false
    }

    let user: User = {
      id: 2,
      address: "Rua da liberdade",
      name: "Guest",
      phone: 9100001000,
      function: "Empregado",
      sessionEnded: new Date(),
      sessionStarted: new Date(),
      active: true,
      nif: 272530030,
      password: 1234,
      avatar: './assets/images/guest.png',
      synchronized: false
    }

    this.usersService.getDataOffline().subscribe(data => {
      if (data.length === 0) {
        this.usersService.register(admin);
        this.usersService.register(user);
      }
    });
  }

  registerDefaultClient() {
    let cliente: Cliente = {
      id: 1,
      name: 'Consumidor Final',
      phone: 999999999,
      nif: 999999999,
      address: 'Consumidor Final',
      postalCode: '9999-999',
      parish: 'Consumidor Final',
      county: 'Consumidor Final',
      lastUpdate: Date.now().toString(),
      registerDate: Date.now().toString(),
      synchronized: false
    }

    this.clientService.getDataOffline().subscribe(data => {
      if (data.length === 0) {
        this.clientService.register(cliente);
      }
    });
  }

  getUsers() {
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
    this.registerDefaultsUsers();
    this.registerDefaultClient();
    this.isAuthenticated();
    this.getUsers();
    this.subscriptionData = this.usersService.refreshData.subscribe(() => {
      // this.listAPIdata();
      this.getUsers();
      // this.listAllData();
    });
  }
}