import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ArtigosService } from 'src/app/BackOffice/modules/artigos/artigos.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MesasService } from 'src/app/BackOffice/modules/mesas/mesas.service';

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
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public ArtigosService: ArtigosService, private fb: FormBuilder) { }

  Form = this.fb.group({
    price: new FormControl('', [Validators.required]),
    quantity: new FormControl('', [Validators.required]),
    promotion: new FormControl('', [Validators.required]),
  })

  public item;
  public quantity;
  public promotion: number = 1;

  getById() {
    this.ArtigosService.getDataOffline().subscribe((data) => {
      this.item = data.find(item => item.id == this.data.id);
      this.getQuantity(this.item.id);
    })
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

  updateProduct(id) {

    this.data.cart.forEach(element => {
      if (element.product.id == id) {
        element.quantity = this.quantity;
        element.product.price = this.item.price;
      }
    });

    const round = (num, places) => {
      return +parseFloat(num).toFixed(places);
    };

    if (this.item.promotion !== undefined ) {
      this.item.price = round(this.item.price - (this.item.price * this.item.promotion / 100), 2);
    } else {
      this.item.price = this.item.price
    }

    this.dialogRef.close(this.item.price);
  }

  ngOnInit(): void {
    this.getById();
  }

}
