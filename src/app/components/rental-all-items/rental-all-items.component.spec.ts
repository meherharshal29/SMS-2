import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RentalAllItemsComponent } from './rental-all-items.component';

describe('RentalAllItemsComponent', () => {
  let component: RentalAllItemsComponent;
  let fixture: ComponentFixture<RentalAllItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalAllItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RentalAllItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
