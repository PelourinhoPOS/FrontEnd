import { Injectable, Injector } from '@angular/core';
import { Categories } from '../../models/categories';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService extends BaseService<Categories> {

  constructor(protected override injector: Injector ) { 
    super(injector, 'categories', 'http://localhost:9000/api/categories', 'Categoria');
  }

}
