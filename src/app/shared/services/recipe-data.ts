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

  setIngredients(ingredients: Ingredient[]): void {
    this.ingredients = [...ingredients];
  }

  getIngredients(): Ingredient[] {
    return [...this.ingredients];
  }

  setPortionCount(portionCount: number): void {
    this.portionCount = portionCount;
  }

  getPortionCount(): number {
    return this.portionCount;
  }

  setPreferences(preferences: RecipePreferences): void {
    this.preferences = { ...preferences };
  }

  getPreferences(): RecipePreferences {
    return { ...this.preferences };
  }

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