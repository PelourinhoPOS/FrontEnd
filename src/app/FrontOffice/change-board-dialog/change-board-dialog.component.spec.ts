import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeBoardDialogComponent } from './change-board-dialog.component';

describe('ChangeBoardDialogComponent', () => {
  let component: ChangeBoardDialogComponent;
  let fixture: ComponentFixture<ChangeBoardDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeBoardDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeBoardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
