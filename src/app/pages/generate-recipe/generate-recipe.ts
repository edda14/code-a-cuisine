import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OnlyNumbersDirective } from '../../shared/directives/only-numbers';
import { RouterLink } from '@angular/router';
import { RecipeData } from './../../shared/services/recipe-data';
import { Router } from '@angular/router';
interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  isEditing: boolean;
  editAmount?: string;
  editUnit?: string;
  isDropdownOpen?: boolean;
}

@Component({
  selector: 'app-generate-recipe',
  imports: [FormsModule, OnlyNumbersDirective, RouterLink],
  templateUrl: './generate-recipe.html',
  styleUrl: './generate-recipe.scss',
})

export class GenerateRecipe implements OnInit {
  private http = inject(HttpClient);
  ingredientInput = '';
  servingSize = '';
  servingUnit = 'gram';
  isDropdownOpen = false;
  allIngredients: string[] = [];
  addedIngredients: Ingredient[] = [];
  filteredIngredients: string[] = [];
  constructor(private recipeData: RecipeData,
    private router: Router
  ) { }
  loadStatus = 'Noch nicht geladen';
  @HostListener('document:click', ['$event'])

  /**
   * Closes all unit dropdowns when the user clicks outside them.
   */
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;
    const clickedInsideDropdown = clickedElement.closest('.dropdown');
    if (!clickedInsideDropdown) {
      this.isDropdownOpen = false;
      this.addedIngredients.forEach((ingredient) => {
        ingredient.isDropdownOpen = false;
      });
    }
  }

  /**
 * Restores saved ingredients and loads the autocomplete data.
 */
  ngOnInit(): void {
    this.addedIngredients = this.recipeData.getIngredients();
    this.loadStatus = 'Wird geladen …';
    this.http
      .get<string[]>('/assets/data/ingredients.json')
      .subscribe({
        next: (data) => {
          this.allIngredients = data;
          this.loadStatus = `Erfolgreich geladen: ${data.length}`;
        },
        error: (error) => {
          this.loadStatus = `Fehler: ${error.status} ${error.statusText}`;
        },
      });
  }

  /**
 * Filters autocomplete suggestions using the current input.
 */
  filterIngredients(): void {
    const searchTerm = this.ingredientInput.trim().toLowerCase();
    if (searchTerm.length < 2) {
      this.filteredIngredients = [];
      return;
    }
    this.filteredIngredients = this.allIngredients
      .filter((ingredient) =>
        ingredient.toLowerCase().startsWith(searchTerm)
      )
      .slice(0, 3);
  }

  /**
 * Selects an ingredient from the autocomplete suggestions.
 *
 */
  selectIngredient(ingredient: string): void {
    this.ingredientInput = ingredient;
    this.filteredIngredients = [];
  }

  /**
 * Removes invalid characters from the ingredient input.
 */
  sanitizeIngredientInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cleanedValue = input.value
      .replace(/[^\p{L}\s-]/gu, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s+/, '');
    this.ingredientInput = cleanedValue;
    input.value = cleanedValue;
    this.filterIngredients();
  }

  /**
 * Removes non-numeric characters from the serving amount.
 */
  filterServingSize(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.servingSize = input.value.replace(/\D/g, '');
  }

  /**
 * Opens or closes the serving-unit dropdown.
 */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
 * Selects a serving unit and closes its dropdown.
 */
  selectServingUnit(unit: string): void {
    this.servingUnit = unit;
    this.isDropdownOpen = false;
  }

  /**
 * Adds a valid and unique ingredient to the ingredient list.
 */
  addIngredient(): void {
    const name = this.ingredientInput.trim();
    const amount = this.servingSize.trim();
    if (this.cannotAddIngredient(name, amount)) {
      return;
    }
    this.addedIngredients.push({
      name,
      amount,
      unit: this.servingUnit,
      isEditing: false,
    });
    this.resetIngredientForm();
  }

  /**
   * Checks whether an ingredient cannot be added.
   */
  private cannotAddIngredient(
    name: string,
    amount: string
  ): boolean {
    if (!name || !amount) {
      return true;
    }

    return this.addedIngredients.some(
      (ingredient) =>
        ingredient.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Resets all ingredient input fields.
   */
  private resetIngredientForm(): void {
    this.ingredientInput = '';
    this.servingSize = '';
    this.servingUnit = 'gram';
    this.filteredIngredients = [];
  }
  removeIngredient(index: number): void {
    this.addedIngredients.splice(index, 1);
  }

  /**
 * Starts or finishes editing an ingredient.
 */
  toggleEditIngredient(index: number): void {
    const ingredient = this.addedIngredients[index];
    if (ingredient.isEditing) {
      this.saveIngredientChanges(ingredient);
    } else {
      this.prepareIngredientEdit(ingredient);
    }
    ingredient.isEditing = !ingredient.isEditing;
  }

  /**
   * Copies the current values into the edit fields.
   */
  private prepareIngredientEdit(ingredient: Ingredient): void {
    ingredient.editAmount = ingredient.amount;
    ingredient.editUnit = ingredient.unit;
  }

  /**
   * Applies valid edited values to an ingredient.
   */
  private saveIngredientChanges(ingredient: Ingredient): void {
    if (ingredient.editAmount?.trim()) {
      ingredient.amount = ingredient.editAmount;
    }
    if (ingredient.editUnit) {
      ingredient.unit = ingredient.editUnit;
    }
  }

  /**
   * Opens or closes an ingredient's unit dropdown.
   */
  toggleEditDropdown(index: number): void {
    const ingredient = this.addedIngredients[index];

    ingredient.isDropdownOpen = !ingredient.isDropdownOpen;
  }

  /**
   * Selects a unit while editing an ingredient.
   */
  selectEditUnit(index: number, unit: string): void {
    const ingredient = this.addedIngredients[index];

    ingredient.editUnit = unit;
    ingredient.isDropdownOpen = false;
  }

  /**
   * Saves the ingredients and opens the preferences page.
   */
  goToPreferences(): void {
    this.recipeData.setIngredients(this.addedIngredients);
    this.router.navigate(['/preferences']);
  }
}