import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BoardDialogComponent } from '../board-dialog/board-dialog.component';
import { ChangeBoardDialogComponent } from '../change-board-dialog/change-board-dialog.component';
import { MesasService } from 'src/app/BackOffice/modules/mesas/mesas.service';
import { authenticationService } from '../authentication-dialog/authentication-dialog.service';
import { CookieService } from 'ngx-cookie-service';

export interface DialogData {
  id: string,
  name: string,
  capacity: number,
  number: number,
  occupy: number,
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  public boards
  public self = []
  public position: any = {};
  public boardData;

  public subscriptionData!: Subscription; //subscription to refresh data

  constructor(public dialog: MatDialog, private mesasService: MesasService, public authService: authenticationService, public cookieService: CookieService) { }

  ngOnInit(): void {
    this.getBoards();
    this.subscriptionData = this.mesasService.refreshData.subscribe(() => {
      // this.listAPIdata();
      this.getBoards();
      // this.listAllData();
    });
  }

  openDialog() {
    this.dialog.open(BoardDialogComponent, {
      width: '800px',
      height: '400px',
    });
  }

  openUpdateDialog(id) {
    this.mesasService.getDataOffline().subscribe(data => {
      this.boardData = data.find(x => x.id == id);


    this.dialog.open(ChangeBoardDialogComponent, {
      width: '540px',
      height: '480px',
      data: {
        id: this.boardData.id,
        name: this.boardData.name,
        capacity: this.boardData.capacity,
        number: this.boardData.number,
        occupy: this.boardData.occupy,
      }
    });
  })
  }

  onDragEnded(event, id) {
    this.position = event.source.getRootElement().getBoundingClientRect();

    let position: any = {
      id: id,
      bottom: this.position.bottom,
      height: this.position.height,
      left: this.position.left,
      right: this.position.right,
      top: this.position.top,
      width: this.position.width,
      x: this.position.x,
      y: this.position.y,
    }

    this.mesasService.updateDataOffline(position);

    
    // db.collection('boards').doc({ id: id }).update({
    //   position: {
    //     bottom: this.position.bottom,
    //     height: this.position.height,
    //     left: this.position.left,
    //     right: this.position.right,
    //     top: this.position.top,
    //     width: this.position.width,
    //     x: this.position.x,
    //     y: this.position.y,
    //   }
    // })
    // this.p
  }

  getBoards() {
    this.mesasService.getDataOffline().subscribe(data => {
      this.boards = data
    })
  }

  deleteCollection() {

    this.boards.forEach(board => {
      this.mesasService.deleteDataOffline(board);
    });
    
    //   db.collection('boards').delete().then(() => {
    //     window.location.reload();
    //   })
  }

  logout() {
    this.authService.stopWatch();
    this.cookieService.delete('userId');
    this.cookieService.delete('role');
  }

  ngOnDestroy(): void {
    this.subscriptionData.unsubscribe();
  }
}