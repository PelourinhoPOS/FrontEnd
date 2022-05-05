import { Component, Input, OnInit } from '@angular/core';
import Localbase from 'localbase'
import { MatDialog } from '@angular/material/dialog';
import { KeyboardDialogComponent } from '../keyboard-dialog/keyboard-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ChangeProductDialogComponent } from '../change-product-dialog/change-product-dialog.component';
import { PaymentModalComponent } from '../payment-modal/payment-modal.component';
import { CookieService } from 'ngx-cookie-service';
import { authenticationService } from '../authentication-dialog/authentication-dialog.service';

let db = new Localbase('BigJson')


@Component({
  selector: 'app-food-drinks',
  templateUrl: './food-drinks.component.html',
  styleUrls: ['./food-drinks.component.scss']
})
export class FoodDrinksComponent implements OnInit {
  public item: string;
  public boardId;
  public board;
  public teste;
  public cart = [];
  public total: number;
  public totalIva: number;
  public username: string;
  public avatar: string;
  public time: string;
  public products

  constructor(public dialog: MatDialog, private route: ActivatedRoute,
    private cookie: CookieService, private authService: authenticationService) { }

  openDialog(): void {
    const dialogRef = this.dialog.open(KeyboardDialogComponent, {
      data: { name: this.item },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.item = result;
    });
  }

  openPaymentDialog() {
    const dialogRef = this.dialog.open(PaymentModalComponent, {
      width: '1300px',
      height: '650px',
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getCookies() {
    this.username = this.cookie.get('userName');
    this.avatar = this.cookie.get('avatar');
  }

  openProductDialog(id) {
    this.dialog.open(ChangeProductDialogComponent)
  }

  // addNewProduct() {
  //   db.collection('products').doc({ id: 5 }).update({
  //   })
  // }

  getProducts() {
    db.collection('products').get().then(product => {
      this.products = product;
    })
  }

  getBoard() {
    db.collection('mainBoards').doc({ id: this.boardId }).get().then(board => {
      this.board = board;
      if (this.board.cart) {
        this.cart = this.board.cart;
      }
      this.totalPrice();
    })
  }

  // Verify if Product Data Come by Id

  // getProduct(id) {
  //   console.log(this.products[id]);
  // }

  addProduct(id) {
    this.products.forEach(product => {
      if (product.id == id) {
        this.teste = product;
      }
    });

    this.cart.push({ product: this.teste, quantity: 1 });

    db.collection('mainBoards').doc({ id: this.boardId }).update({
      cart: this.cart,
      total: this.total,
    })
    this.totalPrice();
  }

  removeProduct(id) {
    this.cart.forEach(product => {
      if (product.product.id == id) {
        this.cart.splice(this.cart.indexOf(product), 1);
      }
    });

    db.collection('mainBoards').doc({ id: this.boardId }).update({
      cart: this.cart,
      total: this.total,
    })
  }

  totalPrice() {

    const round = (num, places) => {
      return +(parseFloat(num).toFixed(places));
    }

    let total = 0;
    this.cart.forEach(product => {
      total += product.product.price * product.quantity;
    });
    this.getIva();
    this.total = round(total + this.totalIva, 2);
  }

  getIva() {
    let iva = 0;
    this.cart.forEach(product => {
      iva += product.product.iva * product.product.price;
    });
    this.totalIva = parseFloat(iva.toFixed(2));
  }

  getAuthTime() {
    this.time = this.authService.getTime();
  }

  ngOnInit(): void {
    let id = parseInt(this.route.snapshot.paramMap.get('id'));
    this.boardId = id;
    this.getProducts();
    this.getBoard();
    this.getCookies();
    this.getAuthTime();
  }
}
