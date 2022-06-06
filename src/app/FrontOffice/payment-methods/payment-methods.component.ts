import { Component, OnInit } from '@angular/core';
import { PaymentMethodsService } from 'src/app/BackOffice/modules/payment-methods/payment-methods.service';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.scss']
})
export class PaymentMethodsComponent implements OnInit {

  constructor(private PaymentMethodsService: PaymentMethodsService) { }

  public methods;

  getPaymentMethods() {
    this.PaymentMethodsService.getDataOffline().subscribe(
      data => {
        this.methods = data;
      });
  }

  ngOnInit(): void {
    this.getPaymentMethods();
  }

}
