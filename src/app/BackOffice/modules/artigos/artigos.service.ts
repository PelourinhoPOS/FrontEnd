import { Injectable, Injector } from '@angular/core';
import { Artigo } from '../../models/artigo';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ArtigosService extends BaseService<Artigo>{

  constructor(protected override injector: Injector ) { 
    super(injector, 'artigo', 'http://localhost:9000/api/artigos', 'Artigo');
  }
}
