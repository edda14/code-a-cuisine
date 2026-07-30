import { TestBed } from '@angular/core/testing';

import { RecipeData } from './recipe-data';

describe('RecipeData', () => {
  let service: RecipeData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecipeData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
