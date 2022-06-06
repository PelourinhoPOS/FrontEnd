import { Injectable, Injector } from '@angular/core';
import { User } from '../../models/user';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService extends BaseService<User>{
  
    constructor(protected override injector: Injector) {
      super(injector, 'empregado', 'http://localhost:9000/api/empregados', 'Empregado');
    }
}
