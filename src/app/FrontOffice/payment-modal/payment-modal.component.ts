import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import Localbase from 'localbase';
import { CookieService } from 'ngx-cookie-service';

let db = new Localbase('BigJson')

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss']
})
export class PaymentModalComponent implements OnInit {


  constructor(public dialogRef: MatDialogRef<PaymentModalComponent>, private cookieService: CookieService) { }

  public id
  public items
  public new
  public quantity
  public total
  public totalIva
  todo = [];
  done = [];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  getBoard() {
    this.id = Number(this.cookieService.get('boardId'))
  }

  getItems() {
    db.collection('mainBoards').doc({ id: this.id }).get().then(board => {
      board.cart.forEach(item => {
        this.items = item.product
        this.quantity = item.quantity
        this.todo.push(this.items)
      })
    })
  }

  totalPrice() {

    const round = (num, places) => {
      return +(parseFloat(num).toFixed(places));
    }

    let total = 0
    this.todo.forEach(item => {
      total += item.price * this.quantity
    })
    this.getIva();
    this.total = round(total + this.totalIva, 2);
  }

  getIva() {
    let iva = 0;
    this.todo.forEach(item => {
      iva += item.iva * item.price;
    });
    this.totalIva = parseFloat(iva.toFixed(2));
  }

  changeRight() {
    this.done = this.todo
    this.todo = []
  }

  changeLeft() {
    this.todo = this.done
    this.done = []
  }

  ngOnInit(): void {
    this.getBoard()
    this.getItems()
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
