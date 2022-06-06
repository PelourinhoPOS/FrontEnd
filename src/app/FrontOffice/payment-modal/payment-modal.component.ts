import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MesasService } from 'src/app/BackOffice/modules/boards/mesas.service';
import { MatDialog } from '@angular/material/dialog';
import { CustomerDialogComponent } from '../customer-dialog/customer-dialog.component';
import { CreateClientModalComponent } from 'src/app/BackOffice/modules/clientes/clientes.component';
import { SplitMoneyDialogComponent } from 'src/app/FrontOffice/split-money-dialog/split-money-dialog.component';
import { ClientesService } from 'src/app/BackOffice/modules/clientes/clientes.service';
import { ToastrService } from 'ngx-toastr';
import { MoneyDialogComponent } from '../money-dialog/money-dialog.component';
import { PaymentMethodsComponent } from '../payment-methods/payment-methods.component';
import { Mesa } from 'src/app/BackOffice/models/mesa';

export interface DialogData {
  value: number;
  split: number;
}

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
})
export class PaymentModalComponent implements OnInit {
  constructor(
    private mesasService: MesasService,
    private cookieService: CookieService,
    public dialog: MatDialog,
    private clientesService: ClientesService,
    private toastr: ToastrService
  ) { }

  public id;
  public new;
  public total;
  public eachtotal: number = 0;
  public totalIva;
  public todo = [];
  public done = [];
  public productid;
  public selectedID;
  public clickedIndex: number = -1;
  public clickedIndexJ: number = -1;
  public number: number = 0;
  public name: string;
  public splited;
  public split;
  public teste;
  public result;
  public iva;

  openDialog(): void {
    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      width: '1300px',
      height: '660px',
      data: { name: this.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.name = result;
    });
  }

  createUser(): void {
    const dialogRef = this.dialog.open(CreateClientModalComponent, {
      width: '780px',
    });
    dialogRef.afterClosed().subscribe(cliente => {
      if (cliente) {
        this.clientesService.register(cliente)
      }
    });
  }

  splitDialog(): void {
    if (this.done.length > 0) {
      const dialogRef = this.dialog.open(SplitMoneyDialogComponent, {
        width: '600px',
        height: '450px',
        data: {
          value: this.eachtotal
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.splited = result;
        this.split = this.eachtotal / this.splited[1];
      });
    } else {
      this.toastr.warning('No products to split!');
    }
  }

  payment(): void {
    if (this.done.length > 0) {
      const dialogRef = this.dialog.open(MoneyDialogComponent, {
        width: '700px',
        height: '550px',
        data: {
          value: this.eachtotal,
          split: this.splited,
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        this.result = result;

        if (this.result >= 0) {
          this.refreshItems();
          this.done = [];
          this.eachtotal = 0;
        }

        if (this.result.length > 0) {
          if (this.result[1] === 0) {
            this.refreshItems();
            this.done = [];
            this.eachtotal = 0;
          }
        }
      });
    } else {
      this.toastr.warning('No products to pay!');
    }
  }

  paymentMethods() {
    const dialogRef = this.dialog.open(PaymentMethodsComponent, {
      width: '700px',
      height: '550px',
    });
  }

  changeClick1() {
      this.clickedIndexJ = -1;
    }

  changeClick2() {
      this.clickedIndex = -1;
    }

  getId(id) {
      this.productid = id;
    }

  receiveDone() {
      this.getId(this.productid);
      this.todo.filter((item) => {
        if (item.product.id === this.productid) {
          if (item.quantity > 0) {
            item.quantity -= 1;
            this.done.push(item);
            this.totalPrice();
            this.eachPrice();
          } else {
            this.todo.splice(this.todo.indexOf(item), 1);
            this.totalPrice();
            this.eachPrice();
          }
          // this.done.push(item);
          // this.todo.splice(this.todo.indexOf(item), 1);
          // this.totalPrice();
          // this.eachPrice();
        }
      });
      this.splited = null;
      this.clickedIndex = -1;
    }

  receiveTodo() {
      this.getId(this.productid);
      this.done.filter((item) => {
        if (item.product.id === this.productid) {
          this.todo.push(item);
          this.done.splice(this.done.indexOf(item), 1);
          this.totalPrice();
          this.eachPrice();
        }
      });
      this.splited = null;
      this.clickedIndexJ = -1;
    }

  getBoard() {
      this.id = Number(this.cookieService.get('boardId'));
    }

  getItems() {
      this.mesasService.getDataOffline().subscribe((data: any) => {
        this.teste = data.find(x => x.id === this.id);
        this.teste.cart.forEach((item) => {
          this.iva = item.product.price * item.product.iva
          this.iva = parseFloat(this.iva.toFixed(2));
          this.todo.push(item);
          this.totalPrice();
        });
      })
    }

  refreshItems() {

      let mesa: Mesa = {
        id: this.id,
        cart: this.todo,
      };

      this.mesasService.update(mesa)
    }

  totalPrice() {
      const round = (num, places) => {
        return +parseFloat(num).toFixed(places);
      };

      let total = 0;
      this.todo.forEach((item) => {
        total += (item.product.price * item.quantity * item.product.iva) + item.product.price * item.quantity;
      });
      this.total = round(total, 2);
    }

  eachPrice() {
      const round = (num, places) => {
        return +parseFloat(num).toFixed(places);
      };

      let total = 0;
      this.done.forEach((item) => {
        total += (item.product.price * item.quantity * item.product.iva) + item.product.price * item.quantity;
      });
      this.eachtotal = round(total, 2);
    }

  getIva() {
      let iva = 0;
      this.todo.forEach((item) => {
        iva += item.iva * item.price;
      });
      this.done.forEach((item) => {
        iva += item.iva * item.price;
      });
      this.totalIva = parseFloat(iva.toFixed(2));
    }

  changeRight() {
      if(this.todo.length > 0) {
        this.done = this.todo.concat(this.done);
    this.todo = [];
  }
    this.total = 0;
this.eachPrice();
  }

changeLeft() {
  if (this.done.length > 0) {
    this.todo = this.done.concat(this.todo);
    this.done = [];
  }
  this.totalPrice();
  this.eachtotal = 0;
}

getInvoice() {
  let divData = document.getElementById('invoice');
  let buttonData = document.getElementById('button');

  this.number++;

  if (this.number === 1) {
    divData.style.backgroundColor = 'rgb(255, 229, 180)';
    buttonData.style.backgroundColor = 'rgb(255, 229, 180)';
  } else if (this.number === 2) {
    divData.style.backgroundColor = 'white';
    buttonData.style.backgroundColor = 'white';
    this.number = 0;
  }
}

ngOnInit(): void {
  this.getBoard();
  this.getItems();
}
}
