import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArtigosService } from 'src/app/BackOffice/modules/artigos/artigos.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { VirtualKeyboardComponent } from 'src/app/BackOffice/shared/components/virtual-keyboard/virtual-keyboard.component';
import { MesasService } from 'src/app/BackOffice/modules/boards/mesas.service';
import { Mesa } from 'src/app/BackOffice/models/mesa';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

export interface DialogData {
  id: number,
  cart: Array<any>;
}

@Component({
  selector: 'app-change-product-dialog',
  templateUrl: './change-product-dialog.component.html',
  styleUrls: ['./change-product-dialog.component.scss']
})
export class ChangeProductDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ChangeProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public ArtigosService: ArtigosService, private fb: FormBuilder,
    public dialog: MatDialog, public mesasService: MesasService, public CookieService: CookieService, public toastr: ToastrService,) { }

  Form = this.fb.group({
    price: new FormControl('', [Validators.required]),
    quantity: new FormControl('', [Validators.required]),
    promotion: new FormControl('', [Validators.required]),
  })

  public item;
  public quantity;
  public promotion: number = 1;
  public boardId;
  public total;
  public saveId;
  public cart;
  public modified;

  dialogKeyboard: any;

  openKeyboard(inputName: string, type: string, data: any, maxLength?: number) {
    //verify if type is number or text to open the respective keyboard
    if (type == 'text') { //if text
      this.dialogKeyboard = this.dialog.open(VirtualKeyboardComponent, {
        height: '57%',
        width: '48%',
        data: [inputName, type, data, maxLength]
      });
    } else { //else is number
      this.dialogKeyboard = this.dialog.open(VirtualKeyboardComponent, {
        height: '72%',
        width: '48%',
        data: [inputName, type, data, maxLength]
      });
    }

    this.dialogKeyboard.afterClosed().subscribe((result: any) => {
      //switch to know which input is changed
      switch (result[1][0]) {
        case 'price':
          this.item.price = result[0];
          break;
        case 'quantity':
          this.quantity = result[0];
          break;
        case 'promotion':
          this.item.promotion = result[0];
          break;
      }
    });
  }

  getById() {
    if (this.data.id < 1000000) {
      this.ArtigosService.getDataOffline().subscribe((data) => {
        this.item = data.find(item => item.id == this.data.id);
        this.getQuantity(this.item.id);
      });
    }

    if (this.item === undefined) {
      this.mesasService.getDataOffline().subscribe((data) => {
        this.cart = (data.find(item => item.id == this.CookieService.get('boardId')).cart);
        this.item = (this.cart.find(item => item.product.id == this.data.id).product);
        this.getQuantity(this.item.id);
      });
    }
  }

  getQuantity(item) {
    this.data.cart.forEach(element => {
      if (element.product.id == item) {
        this.quantity = element.quantity;
      }
    });
  }

  clearInputPrice() {
    this.item.price = "";
  }

  clearInputQuantity() {
    this.quantity = "";
  }

  getBoardData() {
    this.mesasService.getDataOffline().subscribe((data) => {
      this.cart = (data.find(item => item.id == this.CookieService.get('boardId')).cart);
    });
  }

  updateProduct(id) {

    this.saveId = id;

    this.data.cart.forEach(element => {
      if (element.product.id == id) {
        element.quantity = this.quantity;

        if (element.product.id == id && this.item.price !== element.product.price) {
          element.quantity = this.quantity;
          element.product.price = this.item.price;
          element.product.id = Date.now();
        }
      }

      for (let i = 0; i < this.cart.length; i++) {
        if (this.cart[i].product.id == id) {
          this.cart[i].quantity = this.quantity;
          if (this.item.price !== this.cart[i].product.price) {
            this.cart[i].quantity = this.quantity;
            this.cart[i].product.price = this.item.price;
            this.cart[i].product.id = Date.now();
          }
        }
      }

      let mesa: Mesa = {
        id: this.CookieService.get('boardId'),
        cart: this.cart
      }

      this.mesasService.update(mesa).then(() => {
        this.toastr.success('Produto atualizado com sucesso')
      }).catch((err) => {
        err
      });


    });

    const round = (num, places) => {
      return +parseFloat(num).toFixed(places);
    };

    if (this.item.promotion !== undefined) {
      this.item.price = round(this.item.price - (this.item.price * this.item.promotion / 100), 2);
    } else {
      this.item.price = this.item.price
    }

    this.dialogRef.close(this.item.price);
  }

  ngOnInit(): void {
    this.getById();
    this.getBoardData();
  }

}
