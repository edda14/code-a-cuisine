import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Categorie } from './categorie';

describe('Categorie', () => {
  let component: Categorie;
  let fixture: ComponentFixture<Categorie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categorie],
    }).compileComponents();

    fixture = TestBed.createComponent(Categorie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
