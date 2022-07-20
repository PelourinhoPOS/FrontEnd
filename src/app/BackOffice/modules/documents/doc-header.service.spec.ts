import { TestBed } from '@angular/core/testing';

import { DocHeaderService } from './doc-header.service';

describe('DocHeaderService', () => {
  let service: DocHeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocHeaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
