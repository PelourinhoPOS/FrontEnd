import { Injectable, Injector } from '@angular/core';
import { DocHeader } from '../../models/doc_header';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class DocHeaderService extends BaseService<DocHeader>{

  constructor(protected override injector: Injector) {
    super(injector, 'doc_header', 'http://localhost:9000/api/docheader', 'Fatura');
  }
}
