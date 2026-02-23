import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceCompany } from './insurance-company';

describe('InsuranceCompany', () => {
  let component: InsuranceCompany;
  let fixture: ComponentFixture<InsuranceCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsuranceCompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuranceCompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
