import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Mesa } from '../../models/mesa';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class MesasService extends BaseService<Mesa>{

  constructor(protected override injector: Injector, protected override http: HttpClient) { 
    super(injector, 'mesa', 'http://localhost:9000/api/mesas', 'Mesa');
  }
}
