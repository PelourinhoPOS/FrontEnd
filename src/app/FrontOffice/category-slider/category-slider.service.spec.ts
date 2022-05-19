import { TestBed } from '@angular/core/testing';

import { CategorySliderService } from './category-slider.service';

describe('CategorySliderService', () => {
  let service: CategorySliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategorySliderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
