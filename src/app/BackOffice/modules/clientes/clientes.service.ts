import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Cliente } from '../../models/cliente';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ClientesService extends BaseService<Cliente> {

  constructor(protected override injector: Injector, protected override http: HttpClient) {
    super(injector, 'cliente', 'http://localhost:9000/api/clientes', 'Cliente');
  }

}
