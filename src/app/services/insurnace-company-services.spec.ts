import { TestBed } from '@angular/core/testing';

import { InsurnaceCompanyServices } from './insurnace-company-services';

describe('InsurnaceCompanyServices', () => {
  let service: InsurnaceCompanyServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InsurnaceCompanyServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
