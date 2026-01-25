import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraDetailsComponent } from './camera-details.component';

describe('CameraDetailsComponent', () => {
  let component: CameraDetailsComponent;
  let fixture: ComponentFixture<CameraDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
