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
 * Saves the selected recipe preferences and opens the loading page.
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

/**
 * Increases the portion count up to the maximum of twelve.
 */
increasePortions(): void {
  if (this.portionCount < 12) {
    this.portionCount++;
  }
}

/**
 * Decreases the portion count down to the minimum of one.
 */
decreasePortions(): void {
  if (this.portionCount > 1) {
    this.portionCount--;
  }
}

/**
 * Increases the number of cooks up to the maximum of three.
 */
increaseHelpers(): void {
  if (this.helperCount < 3) {
    this.helperCount++;
  }
}

/**
 * Decreases the number of cooks down to the minimum of one.
 */
decreaseHelpers(): void {
  if (this.helperCount > 1) {
    this.helperCount--;
  }
}

/**
 * Checks whether all required preferences have been selected.
 */
isFormValid(): boolean {
  return (
    this.selectedCookingTime !== '' &&
    this.selectedCuisine !== '' &&
    this.selectedDiet !== ''
  );
}

/**
 * Redirects the user when there are not enough saved ingredients.
 */
ngOnInit(): void {
  if (!this.recipeData.hasEnoughIngredients()) {
    this.router.navigate(['/generate-recipe']);
  }
}
}
