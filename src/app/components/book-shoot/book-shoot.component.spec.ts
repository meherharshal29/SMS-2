import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookShootComponent } from './book-shoot.component';

describe('BookShootComponent', () => {
  let component: BookShootComponent;
  let fixture: ComponentFixture<BookShootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookShootComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookShootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
