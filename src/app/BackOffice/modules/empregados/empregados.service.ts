import { Injectable, Injector } from '@angular/core';
import { Empregado } from '../../models/empregado';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class EmpregadosService extends BaseService<Empregado>{
  
    constructor(protected override injector: Injector) {
      super(injector, 'empregado', 'http://localhost:9000/api/empregados', 'Empregado');
    }
}
