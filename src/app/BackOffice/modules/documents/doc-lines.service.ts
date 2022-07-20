import { Injectable, Injector } from '@angular/core';
import { DocLines } from '../../models/doc_lines';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class DocLinesService extends BaseService<DocLines> {

  constructor(protected override injector: Injector) {
    super(injector, 'doc_line', 'http://localhost:9000/api/doclines', 'Fatura');
  }
}
