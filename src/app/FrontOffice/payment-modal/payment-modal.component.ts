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
  public customerResult;

  public docHeader: DocHeader = new DocHeader;
  public docProducts: DocProducts = new DocProducts;
  public docLines: DocLines = new DocLines;

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

    //CREATE HEADER
    this.docHeader.user_id = Number(this.userId);
    this.docHeader.id_payment_method = Number(this.methodId);
    this.docHeader.zone_id = this.zoneId;
    this.docHeader.board_id = Number(this.boardId);
    this.docHeader.date = this.formattedToday,
      this.docHeader.time = this.formattedTime,

      this.docHederService.registerDataOffline(this.docHeader).then((res: DocHeader) => {

        //AFTER HEADER IS CREATED, CREATE LINES
        this.docLines.id_doc_header = res.id;
        this.docLines.subtotal_no_iva = this.totalPriceWithoutIva,
          this.docLines.subtotal_iva = (this.eachtotal - this.totalPriceWithoutIva)

        this.docLinesService.registerDataOffline(this.docLines).then((res: DocLines) => {

          //AFTER LINES ARE CREATED, CREATE PRODUCTS
          let docLineID = res.id;
          let lastID = 0;

          this.docProductsService.getDataOffline().subscribe((res: DocProducts[]) => {

            if (res.length > 0) {
              lastID = res[res.length - 1].id;
            }

            for (let i = 0; i <= this.done.length; i++) {
              let docProducts: DocProducts = new DocProducts;
              docProducts.id = lastID + i + 1;
              docProducts.doc_lines_id = docLineID;
              docProducts.id_article = this.done[i].product.id;
              docProducts.quantity = this.done[i].quantity;
              docProducts.iva_tax_amount = this.done[i].product.iva;
              docProducts.total = (this.done[i].product.price * this.done[i].quantity);

              this.docProductsService.registerDataOffline(docProducts).then(res => {
                if (res) {
                  this.docProductsService.getDataOffline().subscribe((res: DocProducts[]) => {
                    if (res.length > 0) {
                      lastID = res[res.length - 1].id;
                    }
                  });
                }
              }).catch(err => {
                this.toastr.error(err, 'Erro');
              });
            }
          });
        }).catch(err => {
          this.toastr.error(err, 'Erro');
        });
      }).catch(err => {
        this.toastr.error(err, 'Erro');
      });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      width: '1300px',
      height: '660px',
      data: { name: this.name, id: this.id },
    });

    dialogRef.afterClosed().subscribe((result) => {

      this.customerResult = result;

      if (result !== undefined) {
        this.name = this.customerResult[0];
        this.id_customer = this.customerResult[1];
        this.getInvoice();
      }

      if (result === undefined || this.customerResult[0] === undefined && this.customerResult[1] === undefined) {
        this.name = undefined;
        this.id_customer = undefined;

        let divData = document.getElementById('invoice');
        let buttonData = document.getElementById('button');

        if (this.name === undefined) {
          divData.style.backgroundColor = 'white';
          buttonData.style.backgroundColor = 'white';
        }
      }
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
        console.log(this.splited);
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
        console.log(this.result);

        if (this.result >= 0 && this.eachtotal < 100) {
          this.simulateClick();
        }

        if (this.eachtotal > 100 && this.id_customer === undefined) {
          this.toastr.warning('This Invoice Needs To Be Simplified!');
          this.openDialog();
        }

        if (this.eachtotal > 100 && this.id_customer !== undefined) {
          this.simulateClick();
        }

        if (this.result >= 0 && this.eachtotal > 100 && this.id_customer !== undefined) {
          this.simulateClick();
        }

        if (this.result.length > 0) {
          if (this.result[1] === 0) {
            this.simulateClick();
          }
        }
      });
    }
  }

  simulateClick() {
    let element: HTMLElement = document.getElementsByClassName('top2')[0] as HTMLElement;
    element.click();
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
        this.docHeader.id_payment_method = result.id;
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
        if (item.quantity > 0) {
          item.quantity -= 1;
          if (this.done.includes(item) === true) {

          } else {
            this.done.push(item);

          }
          this.totalPrice();
          this.eachPrice();
        }
        if (item.quantity === 0) {
          this.todo.splice(this.todo.indexOf(item), 1);
          this.totalPrice();
          this.eachPrice();
        }
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
    this.splited = undefined;
    this.nif = undefined;
    this.id_customer = undefined;
    this.method = undefined;
  }

  changeLeft() {
    if (this.done.length > 0) {
      this.todo = this.done.concat(this.todo);
      this.done = [];
    }
    this.totalPrice();
    this.eachtotal = 0;
    this.splited = undefined;
    this.nif = undefined;
    this.id_customer = undefined;
    this.method = undefined;
  }

  getInvoice() {
    let divData = document.getElementById('invoice');
    let buttonData = document.getElementById('button');

    if (this.name) {
      divData.style.backgroundColor = 'rgb(255, 229, 180)';
      buttonData.style.backgroundColor = 'rgb(255, 229, 180)';
    } else {
      divData.style.backgroundColor = 'white';
      buttonData.style.backgroundColor = 'white';
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
      this.client = data.find(x => x.id == this.id_customer);
      this.nif = this.client.nif;
      this.address = this.client.address;
      this.docHeader.costumer_id = this.client.id;
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

    if (this.eachtotal > 100 && this.name === 'Consumidor Final') {
      this.toastr.error('Não pode selecionar o consumidor final numa fatura com valor superior a 100€');
    } else {
      if (this.done.length > 0) {
        this.getDate();
        this.getZone();
        this.getClient();
        this.getUser();
        this.getPriceWithoutIva();
      } else {
        this.toastr.error('Nothing To Pay!');
      }

      if (this.done.length > 0 && this.method === undefined) {
        this.toastr.error('Select a Payment Method!');
      }

      if (this.eachtotal > 100 && this.name === undefined) {
        this.toastr.error('Select a Customer!');
      }
    }
  }

  checkItems() {
    if (this.done.length === 0) {
      this.toastr.warning('No Products To Pay!');
    }
  }

  ngOnInit(): void {
    this.getBoard();
    this.getItems();
  }
}
