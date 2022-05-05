import { Component, OnInit } from '@angular/core';
import Localbase from 'localbase';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BoardDialogComponent } from '../board-dialog/board-dialog.component';
import { ChangeBoardDialogComponent } from '../change-board-dialog/change-board-dialog.component';

let db = new Localbase('BigJson')

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

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getBoards();
  }

  openDialog() {
    this.dialog.open(BoardDialogComponent, {
      width: '800px',
      height: '400px',
    });
  }

  openUpdateDialog(id) {
    db.collection('mainBoards').doc({ id }).get().then(board => {
      this.dialog.open(ChangeBoardDialogComponent, {
        width: '540px',
        height: '480px',
        data: {
          id: board.id,
          name: board.name,
          capacity: board.capacity,
          number: board.number,
          occupy: board.occupy,
        }
      });
    })
  }

  onDragEnded(event, id) {
    this.position = event.source.getRootElement().getBoundingClientRect();

    db.collection('mainBoards').doc({ id: id }).update({
      position: {
        bottom: this.position.bottom,
        height: this.position.height,
        left: this.position.left,
        right: this.position.right,
        top: this.position.top,
        width: this.position.width,
        x: this.position.x,
        y: this.position.y,
      }
    })
    // this.p
  }

  getBoards() {
    db.collection('mainBoards').get().then(boards => {
      this.boards = boards;
    })
  }

  deleteCollection() {
    db.collection('mainBoards').delete().then(() => {
      window.location.reload();
    })
  }
}