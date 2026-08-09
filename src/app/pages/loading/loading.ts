import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RecipeData } from '../../shared/services/recipe-data';
import { GenerateRecipesResponse } from '../../shared/interfaces/generated-recipe';
import { forkJoin, timer } from 'rxjs';
import { FirebaseRecipes } from '../../shared/services/firebase-recipes';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements OnInit {
  animationFinished = false;
  errorTitle = signal('');
  errorMessage = signal('');

  constructor(
    private router: Router,
    private http: HttpClient,
    private recipeData: RecipeData,
    private firebaseRecipes: FirebaseRecipes
  ) { }

  ngOnInit(): void {
    this.testN8nConnection();
  }

  private testN8nConnection(): void {
    const url = '/webhook/generate-recipes';
    const preferences = this.recipeData.getPreferences();

    const body = {
      ingredients: this.recipeData.getIngredients().map((ingredient) => ({
        name: ingredient.name,
        amount: Number(ingredient.amount),
        unit: ingredient.unit,
      })),
      portionCount: this.recipeData.getPortionCount(),
      cookCount: preferences.helperCount,
      cookingTime: preferences.cookingTime,
      cuisine: preferences.cuisine,
      diet: preferences.diet,
    };



    forkJoin({
      response: this.http.post<GenerateRecipesResponse>(url, body),
      minimumLoadingTime: timer(7000),
    }).subscribe({
      next: async ({ response }) => {
        if (!response?.recipes || response.recipes.length !== 3) {
          this.errorTitle.set('Oops! Something is missing...');
          this.errorMessage.set(
            'We could not create three suitable recipes. Please adjust your ingredients and try again.'
          );
          return;
        }

        try {
          const recipeIds = await this.firebaseRecipes.saveRecipes(
            response.recipes
          );

          const savedRecipes = response.recipes.map((recipe, index) => ({
            ...recipe,
            id: recipeIds[index],
            likes: 0,
          }));

          this.recipeData.setGeneratedRecipes(savedRecipes);
          this.router.navigate(['/results']);
        } catch (error) {
          console.error('Fehler beim Speichern in Firebase:', error);

          this.errorTitle.set('Oops! Saving failed...');
          this.errorMessage.set(
            'Your recipes were generated, but could not be saved. Please try again.'
          );
        }
      },
    });
  }

  onAnimationEnd(): void {
    this.animationFinished = true;
  }

  /**
 * Starts the recipe request again without clearing the form data.
 */
  retryRequest(): void {
    this.errorTitle.set('');
    this.errorMessage.set('');
    this.testN8nConnection();
  }

  /**
   * Closes the error flow and returns to the ingredient form.
   */
  dismissError(): void {
    this.backToIngredients();
  }

  /**
   * Returns to the ingredient form without deleting its data.
   */
  backToIngredients(): void {
    this.router.navigate(['/generate-recipe']);
  }
}