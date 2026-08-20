import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RecipeData } from '../../shared/services/recipe-data';
import { GeneratedRecipe, GenerateRecipesResponse } from '../../shared/interfaces/generated-recipe';
import { forkJoin, timer } from 'rxjs';
import { FirebaseRecipes } from '../../shared/services/firebase-recipes';

interface RecipeRequestBody {
  ingredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
  portionCount: number;
  cookCount: number;
  cookingTime: string;
  cuisine: string;
  diet: string;
}

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
  conflictingIngredients = signal<string[]>([]);

  constructor(
    private router: Router,
    private http: HttpClient,
    private recipeData: RecipeData,
    private firebaseRecipes: FirebaseRecipes
  ) { }

  /**
 * Starts the recipe-generation request when the component initializes.
 */
  ngOnInit(): void {
    this.testN8nConnection();
  }

  /**
 * Sends the recipe data to n8n and waits for the animation.
 */
  private testN8nConnection(): void {
    const body = this.createRecipeRequestBody();
    forkJoin({
      response: this.http.post<GenerateRecipesResponse>(
        'https://julsino.app.n8n.cloud/webhook/generate-recipes',
        body
      ),
      minimumLoadingTime: timer(7000),
    }).subscribe({
      next: ({ response }) => {
        void this.handleRecipeResponse(response);
      },
      error: (error) => {
        this.handleRequestError(error);
      },
    });
  }

  /**
   * Creates the request body for the n8n workflow.
   */
  private createRecipeRequestBody(): RecipeRequestBody {
    const preferences = this.recipeData.getPreferences();
    return {
      ingredients: this.recipeData
        .getIngredients()
        .map((ingredient) => ({
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
  }

  /**
   * Validates and stores the generated recipes.
   */
  private async handleRecipeResponse(
    response: GenerateRecipesResponse
  ): Promise<void> {
    if (!response?.recipes || response.recipes.length !== 3) {
      this.showMissingRecipesError();
      return;
    }
    try {
      await this.saveRecipesAndOpenResults(response.recipes);
    } catch (error) {
      this.handleSavingError(error);
    }
  }

  /**
   * Saves recipes and opens the results page.
   */
  private async saveRecipesAndOpenResults(
    recipes: GeneratedRecipe[]
  ): Promise<void> {
    const ids = await this.firebaseRecipes.saveRecipes(recipes);
    const savedRecipes = recipes.map((recipe, index) => ({
      ...recipe,
      id: ids[index],
      likes: 0,
    }));
    this.recipeData.setGeneratedRecipes(savedRecipes);
    this.router.navigate(['/results']);
  }

  /**
   * Displays an error when n8n did not return three recipes.
   */
  private showMissingRecipesError(): void {
    this.setError(
      'Oops! Something is missing...',
      'We could not create three suitable recipes. Please adjust your ingredients and try again.'
    );
  }

  /**
   * Handles a Firebase saving error.
   */
  private handleSavingError(error: unknown): void {
    console.error('Fehler beim Speichern in Firebase:', error);
    this.setError(
      'Oops! Saving failed...',
      'Your recipes were generated, but could not be saved. Please try again.'
    );
  }


  /**
   * Handles unsuccessful n8n requests.
   */
  private handleRequestError(error: unknown): void {
    console.error('Fehler bei n8n:', error);
    if (!(error instanceof HttpErrorResponse)) {
      this.showGenericRequestError();
      return;
    }
    if (error.status === 429) {
      this.showLimitError(error);
      return;
    }
    if (error.status === 422) {
      this.showDietConflictError(error);
      return;
    }
    this.showGenericRequestError();
  }

  /**
   * Displays ingredients that conflict with the selected diet.
   */
  private showDietConflictError(error: HttpErrorResponse): void {
    const ingredients = error.error?.conflictingIngredients;
    const conflicts = Array.isArray(ingredients)
      ? ingredients
      : [];

    this.setError(
      'Diet preference conflict',
      'These ingredients do not match your selected diet:'
    );

    this.conflictingIngredients.set(conflicts);
    this.recipeData.setConflictingIngredients(conflicts);
  }

  /**
   * Displays a generic request error.
   */
  private showGenericRequestError(): void {
    this.setError(
      'Oops! Something went wrong...',
      'We could not generate your recipes right now. Please try again.'
    );
  }

  /**
   * Displays the appropriate daily-limit message.
   */
  private showLimitError(error: HttpErrorResponse): void {
    const isIpLimit =
      error.error?.error === 'IP_LIMIT_REACHED';

    const message = isIpLimit
      ? 'You have already generated 3 recipes today. Please try again tomorrow.'
      : 'The daily recipe generation limit has been reached. Please try again tomorrow.';

    this.setError('Daily limit reached', message);
  }

  /**
   * Updates the error-dialog content.
   */
  private setError(title: string, message: string): void {
    this.conflictingIngredients.set([]);
    this.recipeData.clearConflictingIngredients();
    this.errorTitle.set(title);
    this.errorMessage.set(message);
  }

  /**
 * Marks the loading animation as completed.
 */
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