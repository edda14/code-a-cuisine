import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GeneratedRecipe } from '../../shared/interfaces/generated-recipe';
import { RecipeData } from '../../shared/services/recipe-data';
import { FirebaseRecipes } from '../../shared/services/firebase-recipes';
import { Location } from '@angular/common';

@Component({
  selector: 'app-recipe',
  imports: [RouterLink],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe implements OnInit {
  likeCount = signal(0);
  hasLiked = signal(false);
  isLiking = signal(false);
  recipe: GeneratedRecipe | null = null;
  ingredientsOpen = true;
  directionsOpen = true;
  showTotalNutrition = false;

  constructor(
    private recipeData: RecipeData,
    private router: Router,
    private firebaseRecipes: FirebaseRecipes,
    private location: Location
  ) { }

  /**
  * Loads the selected recipe and its current like state.
  */
  async ngOnInit(): Promise<void> {
    const selectedRecipe =
      this.recipeData.getSelectedRecipe();

    if (!selectedRecipe) {
      this.router.navigate(['/results']);
      return;
    }

    this.setSelectedRecipe(selectedRecipe);

    if (selectedRecipe.id) {
      await this.loadLikeState(selectedRecipe.id);
    }
  }

  /**
   * Sets the selected recipe and its current like count.
   */
  private setSelectedRecipe(recipe: GeneratedRecipe): void {
    this.recipe = recipe;
    this.likeCount.set(recipe.likes ?? 0);
  }

  /**
   * Loads the current user's like state for a recipe.
   */
  private async loadLikeState(recipeId: string): Promise<void> {
    this.isLiking.set(true);

    try {
      const hasLiked =
        await this.firebaseRecipes.hasLikedRecipe(recipeId);

      this.hasLiked.set(hasLiked);
    } catch (error) {
      console.error('Fehler beim Laden des Like-Status:', error);
    } finally {
      this.isLiking.set(false);
    }
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

  /**
   * Adds or removes the current user's like for the selected recipe.
   */
  async likeRecipe(): Promise<void> {
    const recipeId = this.recipe?.id;
    if (!recipeId || this.isLiking()) {
      return;
    }
    this.isLiking.set(true);
    try {
      const result =
        await this.firebaseRecipes.toggleRecipeLike(recipeId);
      this.applyLikeResult(result);
    } catch (error) {
      console.error('Fehler beim Ändern des Likes:', error);
    } finally {
      this.isLiking.set(false);
    }
  }

  /**
   * Applies the updated like state to the selected recipe.
   */
  private applyLikeResult(
    result: { likeCount: number; hasLiked: boolean }
  ): void {
    this.likeCount.set(result.likeCount);
    this.hasLiked.set(result.hasLiked);

    if (this.recipe) {
      this.recipe.likes = result.likeCount;
    }
  }

  /**
   * Returns to the page from which the recipe was opened.
   */
  goBack(): void {
    this.location.back();
  }

  /**
 * Opens or closes the ingredient section.
 */
  toggleIngredients(): void {
    this.ingredientsOpen = !this.ingredientsOpen;
  }

  /**
   * Opens or closes the directions section.
   */
  toggleDirections(): void {
    this.directionsOpen = !this.directionsOpen;
  }

  /**
 * Switches between per-portion and total nutrition values.
 */
toggleNutritionView(): void {
  this.showTotalNutrition = !this.showTotalNutrition;
}
}