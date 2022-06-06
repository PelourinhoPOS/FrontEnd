import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Zone } from '../../models/zone';
import { BaseService } from '../../services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ZonasService extends BaseService<Zone> {

  constructor(protected override injector: Injector, protected override http: HttpClient) {
    super(injector, 'zone', 'http://localhost:9000/api/zones', 'Zona');
  }
}
