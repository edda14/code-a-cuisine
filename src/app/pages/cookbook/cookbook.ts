import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GeneratedRecipe } from '../../shared/interfaces/generated-recipe';
import { FirebaseRecipes } from '../../shared/services/firebase-recipes';
import { Router } from '@angular/router';
import { RecipeData } from '../../shared/services/recipe-data';

@Component({
  selector: 'app-cookbook',
  imports: [RouterLink],
  templateUrl: './cookbook.html',
  styleUrl: './cookbook.scss',
})
export class Cookbook implements OnInit {
  mostLikedRecipes = signal<GeneratedRecipe[]>([]);
  isLoading = signal(true);
  hasLoadingError = signal(false);

  constructor(
    private firebaseRecipes: FirebaseRecipes,
    private recipeData: RecipeData,
    private router: Router
  ) { }

  /**
   * Loads the most-liked recipes when the cookbook opens.
   */
  async ngOnInit(): Promise<void> {
    try {
      const recipes =
        await this.firebaseRecipes.getMostLikedRecipes();
      this.mostLikedRecipes.set(recipes);
    } catch (error) {
      console.error('Fehler beim Laden der Rezepte:', error);
      this.hasLoadingError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Opens the selected cookbook recipe.
   */
  openRecipe(recipe: GeneratedRecipe): void {
    this.recipeData.setSelectedRecipe(recipe);
    this.router.navigate(['/recipe']);
  }

  /**
   * Clears the previous recipe request and opens the ingredient form.
   */
  startNewRecipe(): void {
    this.recipeData.clear();
    this.router.navigate(['/generate-recipe']);
  }
}
