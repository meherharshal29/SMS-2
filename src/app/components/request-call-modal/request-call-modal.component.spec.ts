import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCallModalComponent } from './request-call-modal.component';

describe('RequestCallModalComponent', () => {
  let component: RequestCallModalComponent;
  let fixture: ComponentFixture<RequestCallModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestCallModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestCallModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
