import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { PaymentMethod } from '../../models/paymentMethods';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService extends BaseService<PaymentMethod> {

  constructor(protected override injector: Injector) {
    super(injector, 'paymentMethods', 'http://localhost:9000/api/payments', 'Metodos de Pagamento');
  }
}
