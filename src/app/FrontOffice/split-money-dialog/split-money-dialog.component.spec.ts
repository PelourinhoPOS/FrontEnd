import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitMoneyDialogComponent } from './split-money-dialog.component';

describe('SplitMoneyDialogComponent', () => {
  let component: SplitMoneyDialogComponent;
  let fixture: ComponentFixture<SplitMoneyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitMoneyDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitMoneyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
