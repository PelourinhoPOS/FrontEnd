import { Injectable, Injector } from '@angular/core';
import { DocProducts } from '../../models/doc_products';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class DocProductsService extends BaseService<DocProducts> {

  constructor(protected override injector: Injector) {
    super(injector, 'doc_product', 'http://localhost:9000/api/doc_products', 'Fatura');
  }
}
