import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeProductDialogComponent } from './change-product-dialog.component';

describe('ChangeProductDialogComponent', () => {
  let component: ChangeProductDialogComponent;
  let fixture: ComponentFixture<ChangeProductDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeProductDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeProductDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
