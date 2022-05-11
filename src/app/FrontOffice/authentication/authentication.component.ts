import { Component, OnInit } from '@angular/core';
import { AuthenticationDialogComponent } from '../authentication-dialog/authentication-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { EmpregadosService } from 'src/app/BackOffice/modules/empregados/empregados.service';
import { Empregado } from 'src/app/BackOffice/models/empregado';
import { Subscription } from 'rxjs';

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

  constructor(public dialog: MatDialog, private empregadosService: EmpregadosService) { }

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

  public empregado: Empregado = {
    name: "Teste Admin",
    phone: 9100000000,
    function: "Admin",
    id: 0,
    password: '1234',
    avatar: 'https://media-exp1.licdn.com/dms/image/C4E03AQGrZ_EMwgu-lw/profile-displayphoto-shrink_400_400/0/1643915772499?e=1655942400&v=beta&t=toXdH3f00wdysaFtOWM771Eiv0iw2escR3B81xAUPfc',
    synchronized: false
  }

  ngOnInit(): void {
    this.todayDate = this.date.format('LL');
    this.hourNow = this.date.format('LTS');
    //this.register(this.empregado);
    this.getUsers();

    this.subscriptionData = this.empregadosService.refreshData.subscribe(() => {
      // this.listAPIdata();
      this.getUsers();
      // this.listAllData();
    });
  }

  async register(empregado: Empregado) {
    await this.empregadosService.register(empregado);
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
    this.empregadosService.getDataOffline().subscribe(data => {
      this.user = data
    });
    console.log(this.user);
  }

  ngOnDestroy(): void {
    this.subscriptionData.unsubscribe();
  }

}
