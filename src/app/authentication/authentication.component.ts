import { Component, OnInit } from '@angular/core';
import { AuthenticationDialogComponent } from '../authentication-dialog/authentication-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})

export class AuthenticationComponent implements OnInit {

  date: moment.Moment = moment().locale('PT');
  todayDate: string = "";
  hourNow: string = "";

  public users = [
    { id: 1, nome: "João Pedro", funcao: "Admin", estado: "Ativo", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1024px-User-avatar.svg.png" },
    { id: 20, nome: "Pedro Monteiro", funcao: "Empregado", estado: "Ativo", avatar: "https://thumbs.dreamstime.com/b/male-avatar-icon-flat-style-male-user-icon-cartoon-man-avatar-hipster-vector-stock-91462914.jpg" },
    { id: 42, nome: "Bruno Salvador", funcao: "Empregado", estado: "Ativo", avatar: "https://www.kindpng.com/picc/m/163-1636340_user-avatar-icon-avatar-transparent-user-icon-png.png" },
    { id: 54, nome: "Hugo Meireles", funcao: "Empregado", estado: "Ativo", avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRblGHmIA70kc9T4UJy-AFc0YLcnPpu5kwR2Q&usqp=CAU" },
    { id: 55, nome: "Hugo Meireles", funcao: "Empregado", estado: "Ativo", avatar: "https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/avat-01-512.png" },
    { id: 11, nome: "João Pedro", funcao: "Admin", estado: "Ativo", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1024px-User-avatar.svg.png" },
    { id: 22, nome: "Pedro Monteiro", funcao: "Empregado", estado: "Ativo", avatar: "https://thumbs.dreamstime.com/b/male-avatar-icon-flat-style-male-user-icon-cartoon-man-avatar-hipster-vector-stock-91462914.jpg" },
    { id: 43, nome: "Bruno Salvador", funcao: "Empregado", estado: "Ativo", avatar: "https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/avat-01-512.png" },
    { id: 566, nome: "Hugo Meireles", funcao: "Empregado", estado: "Ativo", avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRblGHmIA70kc9T4UJy-AFc0YLcnPpu5kwR2Q&usqp=CAU" },
    { id: 555, nome: "Hugo Meireles", funcao: "Empregado", estado: "Ativo", avatar: "https://www.kindpng.com/picc/m/163-1636340_user-avatar-icon-avatar-transparent-user-icon-png.png" },
  ];

  public password: string = "";

  constructor(public dialog: MatDialog) { }

  openDialog(name: string, funcao: string, image: string): void {
    const dialogRef = this.dialog.open(AuthenticationDialogComponent, {
      width: '100%',
      height: '85%',
      panelClass: 'app-full-bleed-dialog',
      data: { password: this.password = "", userName: name, funcao: funcao, avatar: image },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.password = result;
      console.log(this.password)
    });
  }

  ngOnInit(): void {
    this.todayDate = this.date.format('LL');
    this.hourNow = this.date.format('LTS');
  }

}
