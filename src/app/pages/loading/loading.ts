import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RecipeData } from '../../shared/services/recipe-data';
import { GenerateRecipesResponse } from '../../shared/interfaces/generated-recipe';
import { forkJoin, timer } from 'rxjs';

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
    private recipeData: RecipeData
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
      next: ({ response }) => {

        if (!response.recipes || response.recipes.length !== 3) {
          this.errorTitle.set('Ups! Not quite enough....');
          this.errorMessage.set('It looks like some ingredient quantitied aren`t sufficient for your selected servings. Please add or adjust quantities and try again.');
          return;
        }


        this.recipeData.setGeneratedRecipes(response.recipes);
        this.router.navigate(['/results']);
      },
      error: (error) => {
        console.error('Fehler bei n8n:', error);

        this.errorTitle.set('Ups! Something went wrong...');
        this.errorMessage.set('We could not generate your recipes right now. Please try again or adjust your ingredients.');
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