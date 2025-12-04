import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Servicing } from './servicing';

describe('Servicing', () => {
  let component: Servicing;
  let fixture: ComponentFixture<Servicing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servicing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Servicing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
