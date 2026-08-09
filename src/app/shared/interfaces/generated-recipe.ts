export interface GeneratedIngredient {
  name: string;
  amount: number;
  unit: string;
  providedByUser: boolean;
}

export interface ExtraIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface RecipeDirection {
  step: number;
  title: string;
  description: string;
  assignedCook: number;
  parallelGroup: number;
}

export interface NutritionValues {
  calories: number;
  proteinGrams: number;
  proteinPercent: number;
  carbohydratesGrams: number;
  carbohydratesPercent: number;
  fatGrams: number;
  fatPercent: number;
}

export interface RecipeNutrition {
  perPortion: NutritionValues;
  total: NutritionValues;
}

export interface GeneratedRecipe {
  id?: string;
  likes?: number;

  title: string;
  description: string;
  cuisine: string;
  diet: string;
  cookingTimeMinutes: number;
  portionCount: number;
  cookCount: number;
  ingredientUsagePercent: number;
  ingredients: GeneratedIngredient[];
  extraIngredients: ExtraIngredient[];
  directions: RecipeDirection[];
  nutrition: RecipeNutrition;
}

export interface GenerateRecipesResponse {
  recipes: GeneratedRecipe[];
}