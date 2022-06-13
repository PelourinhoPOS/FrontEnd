import { Component, OnInit, Inject } from '@angular/core';
import { PaymentMethodsService } from 'src/app/BackOffice/modules/payment-methods/payment-methods.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  paymentMethod: string;
}

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {

  constructor(private PaymentMethodsService: PaymentMethodsService, public dialogRef: MatDialogRef<PaymentMethodsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  public methods;
  public paymentMethod;

  getPaymentMethods() {
    this.PaymentMethodsService.getDataOffline().subscribe(
      data => {
        this.methods = data;
      });
  }

  getMethod(name){
    this.paymentMethod = name;
    this.onClose();
  }

  onClose() {
    this.dialogRef.close(this.paymentMethod);
  }

  ngOnInit(): void {
    this.getPaymentMethods();
  }

}
