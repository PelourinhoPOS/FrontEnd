import { Component, OnInit } from '@angular/core';
import { AuthenticationDialogComponent } from '../authentication-dialog/authentication-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})

export class AuthenticationComponent implements OnInit {
  public password: string = "";

  constructor(public dialog: MatDialog) { }

  openDialog(): void {
    const dialogRef = this.dialog.open(AuthenticationDialogComponent, {
      width: '1080px',
      height: '85%',
      panelClass: 'app-full-bleed-dialog',
      data: { password: this.password = "" },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.password = result;
      console.log(result)
    });
  }

  myDate = Date.now();


  ngOnInit(): void {
  }

}
