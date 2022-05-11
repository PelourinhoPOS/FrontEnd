import { Injectable, Injector } from '@angular/core';
import { SubCategories } from '../../models/subcategories';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriesService extends BaseService<SubCategories> {

  constructor(protected override injector: Injector ) { 
    super(injector, 'subcategories', 'http://localhost:9000/api/subcategories', 'SubCategoria');
  }
}
