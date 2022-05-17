import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyDialogComponent } from './money-dialog.component';

describe('MoneyDialogComponent', () => {
  let component: MoneyDialogComponent;
  let fixture: ComponentFixture<MoneyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoneyDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoneyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
