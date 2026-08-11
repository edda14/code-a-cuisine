import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GeneratedRecipe } from '../../shared/interfaces/generated-recipe';
import { RecipeData } from '../../shared/services/recipe-data';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results implements OnInit {
  recipes: GeneratedRecipe[] = [];

  constructor(
    private recipeData: RecipeData,
    private router: Router
  ) { }

  /**
   * Loads the generated recipes or redirects to the recipe form.
   */
  ngOnInit(): void {
    this.recipes = this.recipeData.getGeneratedRecipes();
    if (this.recipes.length !== 3) {
      this.router.navigate(['/generate-recipe']);
    }
  }

  /**
 * Stores the selected recipe and opens its detail page.
 */
  openRecipe(recipe: GeneratedRecipe): void {
    this.recipeData.setSelectedRecipe(recipe);
    this.router.navigate(['/recipe']);
  }

  /**
   * Clears the current recipe session and opens the ingredient form.
   */
  startNewRecipe(): void {
    this.recipeData.clear();
    this.router.navigate(['/generate-recipe']);
  }
}
