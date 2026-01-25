import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCallsComponent } from './admin-calls.component';

describe('AdminCallsComponent', () => {
  let component: AdminCallsComponent;
  let fixture: ComponentFixture<AdminCallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCallsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
