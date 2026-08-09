import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GeneratedRecipe } from '../../shared/interfaces/generated-recipe';
import { RecipeData } from '../../shared/services/recipe-data';
import { FirebaseRecipes } from '../../shared/services/firebase-recipes';

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

constructor(
  private recipeData: RecipeData,
  private router: Router,
  private firebaseRecipes: FirebaseRecipes
) {}

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

  this.recipe = selectedRecipe;
  this.likeCount.set(selectedRecipe.likes ?? 0);

  if (!selectedRecipe.id) {
    return;
  }

  this.isLiking.set(true);

  try {
    const hasLiked =
      await this.firebaseRecipes.hasLikedRecipe(
        selectedRecipe.id
      );

    this.hasLiked.set(hasLiked);
  } catch (error) {
    console.error(
      'Fehler beim Laden des Like-Status:',
      error
    );
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
 * Adds or removes the like for the selected recipe.
 */
async likeRecipe(): Promise<void> {
  if (!this.recipe?.id || this.isLiking()) {
    return;
  }

  this.isLiking.set(true);

  try {
    const result =
      await this.firebaseRecipes.toggleRecipeLike(
        this.recipe.id
      );

    this.likeCount.set(result.likeCount);
    this.hasLiked.set(result.hasLiked);
    this.recipe.likes = result.likeCount;
  } catch (error) {
    console.error(
      'Fehler beim Ändern des Likes:',
      error
    );
  } finally {
    this.isLiking.set(false);
  }
}
}