import { Injectable } from '@angular/core';
import { GeneratedRecipe } from '../interfaces/generated-recipe';

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  isEditing: boolean;
  editAmount?: string;
  editUnit?: string;
  isDropdownOpen?: boolean;
}

export interface RecipePreferences {
  cookingTime: string;
  cuisine: string;
  diet: string;
  helperCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class RecipeData {
  private ingredients: Ingredient[] = [];
  private generatedRecipes: GeneratedRecipe[] = [];
  private portionCount = 2;
  private selectedRecipe: GeneratedRecipe | null = null;

  private preferences: RecipePreferences = {
    cookingTime: '',
    cuisine: '',
    diet: '',
    helperCount: 1,
  };

  /**
 * Stores the recipes returned by n8n.
 */
  setGeneratedRecipes(recipes: GeneratedRecipe[]): void {
    this.generatedRecipes = [...recipes];
  }

  /**
   * Returns the currently generated recipes.
   */
  getGeneratedRecipes(): GeneratedRecipe[] {
    return [...this.generatedRecipes];
  }

  /**
 * Stores a copy of the provided ingredient list.
 *
 */
  setIngredients(ingredients: Ingredient[]): void {
    this.ingredients = [...ingredients];
  }

  /**
 * Returns a copy of the currently stored ingredients.
 */
  getIngredients(): Ingredient[] {
    return [...this.ingredients];
  }

  /**
 * Stores the selected number of portions.
 */
  setPortionCount(portionCount: number): void {
    this.portionCount = portionCount;
  }

  /**
 * Returns the selected number of portions.
 */
  getPortionCount(): number {
    return this.portionCount;
  }

  /**
 * Stores a copy of the selected recipe preferences.
 */
  setPreferences(preferences: RecipePreferences): void {
    this.preferences = { ...preferences };
  }

  /**
 * Returns a copy of the stored recipe preferences.
 *
 */
  getPreferences(): RecipePreferences {
    return { ...this.preferences };
  }

  /**
 * Checks whether enough ingredients have been entered.
 */
  hasEnoughIngredients(): boolean {
    return this.ingredients.length >= 3;
  }

  /**
 * Stores the recipe selected on the results page.
 */
  setSelectedRecipe(recipe: GeneratedRecipe): void {
    this.selectedRecipe = recipe;
  }

  /**
   * Returns the currently selected recipe.
   */
  getSelectedRecipe(): GeneratedRecipe | null {
    return this.selectedRecipe;
  }

  /**
 * Clears all recipe data and restores the default values.
 */
  clear(): void {
    this.ingredients = [];
    this.portionCount = 2;

    this.preferences = {
      cookingTime: '',
      cuisine: '',
      diet: '',
      helperCount: 1,
    };
    this.generatedRecipes = [];
    this.selectedRecipe = null;
  }
}