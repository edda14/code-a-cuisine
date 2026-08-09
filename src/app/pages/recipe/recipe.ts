import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GeneratedRecipe } from '../../shared/interfaces/generated-recipe';
import { RecipeData } from '../../shared/services/recipe-data';

@Component({
  selector: 'app-recipe',
  imports: [RouterLink],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe implements OnInit {
  recipe: GeneratedRecipe | null = null;

  constructor(
    private recipeData: RecipeData,
    private router: Router
  ) { }

  /**
   * Loads the selected recipe or returns to the results page.
   */
  ngOnInit(): void {
    const selectedRecipe = this.recipeData.getSelectedRecipe();

    if (!selectedRecipe) {
      this.router.navigate(['/results']);
      return;
    }

    this.recipe = selectedRecipe;
  }

  /**
  * Returns the cooking-time category of the selected recipe.
  */
  getCookingTimeLabel(): string {
    if (!this.recipe) {
      return '';
    }

    if (this.recipe.cookingTimeMinutes <= 20) {
      return 'Quick';
    }

    if (this.recipe.cookingTimeMinutes <= 45) {
      return 'Medium';
    }

    return 'Complex';
  }

  /**
   * Clears the current recipe session and opens the ingredient form.
   */
  startNewRecipe(): void {
    this.recipeData.clear();
    this.router.navigate(['/generate-recipe']);
  }
}