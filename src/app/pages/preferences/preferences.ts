import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { RecipeData } from '../../shared/services/recipe-data';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
  
})

export class Preferences implements OnInit {
  constructor(
  private recipeData: RecipeData,
  private router: Router
) {}
portionCount = 2;
helperCount = 1;
selectedCookingTime = '';
selectedCuisine = '';
selectedDiet = '';

/**
 * Speichert die ausgewählten Rezeptpräferenzen
 * und navigiert anschließend zur Loading-Seite.
 */
goToLoading(): void {
  if (!this.isFormValid()) {
    return;
  }

  this.recipeData.setPortionCount(this.portionCount);

  this.recipeData.setPreferences({
    cookingTime: this.selectedCookingTime,
    cuisine: this.selectedCuisine,
    diet: this.selectedDiet,
    helperCount: this.helperCount,
  });

  this.router.navigate(['/loading']);
}

increasePortions(): void {
  if (this.portionCount < 12) {
    this.portionCount++;
  }
}

decreasePortions(): void {
  if (this.portionCount > 1) {
    this.portionCount--;
  }
}

increaseHelpers(): void {
  if (this.helperCount < 3) {
    this.helperCount++;
  }
}

decreaseHelpers(): void {
  if (this.helperCount > 1) {
    this.helperCount--;
  }
}

isFormValid(): boolean {
  return (
    this.selectedCookingTime !== '' &&
    this.selectedCuisine !== '' &&
    this.selectedDiet !== ''
  );
}

ngOnInit(): void {
  if (!this.recipeData.hasEnoughIngredients()) {
    this.router.navigate(['/generate-recipe']);
  }
}
}
