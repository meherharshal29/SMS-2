import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPromptModalComponent } from './auth-prompt-modal.component';

describe('AuthPromptModalComponent', () => {
  let component: AuthPromptModalComponent;
  let fixture: ComponentFixture<AuthPromptModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthPromptModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthPromptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
