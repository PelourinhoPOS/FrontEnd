import { TestBed } from '@angular/core/testing';

import { DocProductsService } from './doc-products.service';

describe('DocProductsService', () => {
  let service: DocProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
