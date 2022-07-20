import { TestBed } from '@angular/core/testing';

import { DocLinesService } from './doc-lines.service';

describe('DocLinesService', () => {
  let service: DocLinesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocLinesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
