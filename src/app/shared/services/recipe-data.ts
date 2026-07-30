import { Injectable } from '@angular/core';

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
  private portionCount = 2;

  private preferences: RecipePreferences = {
    cookingTime: '',
    cuisine: '',
    diet: '',
    helperCount: 1,
  };

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

  clear(): void {
    this.ingredients = [];
    this.portionCount = 2;

    this.preferences = {
      cookingTime: '',
      cuisine: '',
      diet: '',
      helperCount: 1,
    };
  }
}