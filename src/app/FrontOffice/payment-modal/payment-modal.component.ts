import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { ZonasService } from 'src/app/BackOffice/modules/boards/zonas.service';
import { UsersService } from 'src/app/BackOffice/modules/users/users.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocHeaderService } from 'src/app/BackOffice/modules/documents/doc-header.service';
import { DocLinesService } from 'src/app/BackOffice/modules/documents/doc-lines.service';
import { DocProductsService } from 'src/app/BackOffice/modules/documents/doc-products.service';
import { DocLines } from 'src/app/BackOffice/models/doc_lines';
import { DocHeader } from 'src/app/BackOffice/models/doc_header';
import { DocProducts } from 'src/app/BackOffice/models/doc_products';

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
    private zonasService: ZonasService,
    private usersService: UsersService,
    private toastr: ToastrService,
    private docHederService: DocHeaderService,
    private docLinesService: DocLinesService,
    private docProductsService: DocProductsService,
  ) { }

  public id;
  public id_customer;
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
  public method;
  public methodId
  public showFiller = false;
  public formattedToday;
  public formattedTime;
  public boardId;
  public boardInfo;
  public zoneName;
  public zoneId;
  public client;
  public nif;
  public address;
  public user;
  public userId;
  public username;
  public totalPriceWithoutIva;

  public DocLinesID;
  public DocLines: DocLines;
  public docHeader: DocHeader;
  public docProducts: DocProducts[] = [];

  public saveLines() {
    this.DocLines = {
      id: null,
      subtotal_no_iva: 0,
      subtotal_iva: 0
    }

    this.docLinesService.registerDataOffline(this.DocLines).then((data: any) => {
      this.DocLinesID = 1;
      this.saveHeader();
    });
  }

  public saveHeader() {
    this.docHeader = {
      id: null,
      id_doc_line: 1,
      id_payment_method: this.methodId,
      user_id: this.userId,
      zone_id: this.zoneId,
      board_id: this.boardId,
      costumer_id: this.id_customer,
      date: this.formattedToday,
      time: this.formattedTime,
    }

    this.docHederService.registerDataOffline(this.docHeader).then(res => {
      if (res) {
        this.toastr.success('Header guardado correctamente');
      }
    });
  }

  public saveProducts() {
    for (let i = 0; i < this.done.length; i++) {
      this.docProducts[i] = {
        doc_lines_id: 1,
        id_article: this.done[i].product.id,
        quantity: this.done[i].quantity,
        iva_tax_amount: this.done[i].product.iva,
        total: (this.done[i].product.price * this.done[i].quantity),
      }
    }

    for (let i = 0; i < this.docProducts.length; i++) {
      console.log(this.docProducts[i]);
      this.docProductsService.registerDataOffline(this.docProducts[i]).then(res => {
        if (res){
          this.toastr.success('Produtos guardados corretamente');
        }
      });
    }
  }

  public updateLines() {
    let DocLines: DocLines = {
      id: 1,
      subtotal_no_iva: this.totalPriceWithoutIva,
      subtotal_iva: (this.eachtotal - this.totalPriceWithoutIva)
    }
    this.docLinesService.updateDataOffline(DocLines).then(res => {
      alert('Pago registrado correctamente');
    });
  }

  public openPDF(): void {
    // let DATA: any = document.getElementById('htmlData');
    // html2canvas(DATA).then((canvas) => {
    //   let fileWidth = 105;
    //   let fileHeight = (canvas.height * fileWidth) / canvas.width;
    //   const FILEURI = canvas.toDataURL('image/png');
    //   let PDF = new jsPDF('p', 'mm', 'a6');
    //   let position = 0;
    //   PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
    //   PDF.save('invoice.pdf');
    // });
     this.saveLines();
    // this.saveHeader();
    this.saveProducts();
    this.updateLines();
}

openDialog(): void {
  const dialogRef = this.dialog.open(CustomerDialogComponent, {
    width: '1300px',
    height: '660px',
    data: { name: this.name, id: this.id },
  });

  dialogRef.afterClosed().subscribe((result) => {
    this.name = result[0];
    this.id_customer = result[1];
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
  if(this.done.length > 0) {
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

resetMethod() {
  this.method = null;
}

payment(): void {
  if(this.done.length > 0) {
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
  if (this.done.length > 0) {
    const dialogRef = this.dialog.open(PaymentMethodsComponent, {
      width: '700px',
      height: '550px',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.method = result.name;
      this.methodId = result.id;
    });
  } else {
    this.toastr.warning('No products to pay!');
  }
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
      if (item.quantity > 1) {
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
  console.log(this.done);
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
  if (this.todo.length > 0) {
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

getZone() {
  this.boardId = this.cookieService.get('boardId');
  this.mesasService.getDataOffline().subscribe((data: any) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id == this.boardId) {
        this.boardInfo = data[i];
      }
    }
    this.zonasService.getDataOffline().subscribe((data: any) => {
      data.find(x => x.id === this.boardInfo.id_zone);
      this.zoneId = data[0].id;
      this.zoneName = data[0].name;
    })
  });
}

getClient() {
  this.clientesService.getDataOffline().subscribe((data: any) => {
    this.client = data.find(x => x.id === this.id);
    this.nif = this.client.nif;
    this.address = this.client.address;
  })
}

getUser() {
  this.userId = this.cookieService.get('userId');

  this.usersService.getDataOffline().subscribe((data: any) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id == this.userId) {
        this.user = data[i];
        this.username = this.user.name;
      }
    }
  });
}

getPriceWithoutIva() {
  let price = 0;
  this.done.forEach((item) => {
    price += item.product.price * item.quantity;
  });
  this.totalPriceWithoutIva = parseFloat(price.toFixed(2));
}

getDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm: any = today.getMonth() + 1;
  let dd: any = today.getDate();
  let hh: any = today.getHours();
  let min: any = today.getMinutes();
  let sec: any = today.getSeconds();

  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  if (hh < 10) hh = '0' + hh;
  if (min < 10) min = '0' + min;
  if (sec < 10) sec = '0' + sec;

  this.formattedToday = dd + '/' + mm + '/' + yyyy;
  this.formattedTime = hh + ':' + min + ':' + sec;
}

verifyCheckout() {
  if (this.done.length > 0) {
    this.getDate();
    this.getZone();
    this.getClient();
    this.getUser();
    this.getPriceWithoutIva();
  } else {
    this.toastr.error('Nothing To Pay!');
  }
}

ngOnInit(): void {
  this.getBoard();
  this.getItems();
}
}
