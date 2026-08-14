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
  ingredientError = '';
  activeSuggestionIndex = -1;
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
    this.activeSuggestionIndex = -1;
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

  sanitizeIngredientInput(event: Event): void {
    this.ingredientError = '';

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
 * Handles keyboard navigation within the ingredient suggestions.
 */
  handleSuggestionKeydown(event: KeyboardEvent): void {
    if (!this.filteredIngredients.length) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectNextSuggestion();
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectPreviousSuggestion();
    }
    if (event.key === 'Enter') {
      this.selectActiveSuggestion(event);
    }
  }

  /**
 * Highlights the next ingredient suggestion.
 */
  private selectNextSuggestion(): void {
    const lastIndex = this.filteredIngredients.length - 1;

    this.activeSuggestionIndex =
      this.activeSuggestionIndex >= lastIndex
        ? 0
        : this.activeSuggestionIndex + 1;
  }

  /**
   * Highlights the previous ingredient suggestion.
   */
  private selectPreviousSuggestion(): void {
    const lastIndex = this.filteredIngredients.length - 1;

    this.activeSuggestionIndex =
      this.activeSuggestionIndex <= 0
        ? lastIndex
        : this.activeSuggestionIndex - 1;
  }

  /**
   * Selects the currently highlighted suggestion.
   */
  private selectActiveSuggestion(event: KeyboardEvent): void {
    if (this.activeSuggestionIndex < 0) {
      return;
    }

    event.preventDefault();

    const ingredient =
      this.filteredIngredients[this.activeSuggestionIndex];

    this.selectIngredient(ingredient);
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
  * Validates and adds the entered ingredient.
  */
  addIngredient(): void {
    const name = this.ingredientInput.trim();
    const amount = this.servingSize.trim();

    this.ingredientError = '';

    if (this.cannotAddIngredient(name, amount)) {
      return;
    }

    this.addIngredientToList(name, amount);
    this.resetIngredientForm();
  }

  /**
   * Adds an ingredient to the ingredient list.
   */
  private addIngredientToList(
    name: string,
    amount: string
  ): void {
    this.addedIngredients.push({
      name,
      amount,
      unit: this.servingUnit,
      isEditing: false,
    });
  }

  /**
 * Checks whether an ingredient can be added.
 */
  private cannotAddIngredient(
    name: string,
    amount: string
  ): boolean {
    if (!name && !amount) {
      return this.rejectIngredient(
        'Please enter an ingredient and a serving size.'
      );
    }
    if (!name) {
      return this.rejectIngredient('Please enter an ingredient.');
    }
    if (!amount) {
      return this.rejectIngredient('Please enter a serving size.');
    }
    return this.hasIngredientValidationError(name);
  }

  /**
   * Checks the ingredient name and duplicate entries.
   */
  private hasIngredientValidationError(name: string): boolean {
    if (!this.isIngredientInputValid(name)) {
      return this.rejectIngredient(
        'Please enter a valid ingredient.'
      );
    }
    return this.checkDuplicateIngredient(name);
  }

  /**
 * Checks whether an ingredient conflicts with the selected diet.
 */
isIngredientConflicting(name: string): boolean {
  return this.recipeData.isIngredientConflicting(name);
}

  /**
   * Clears the ingredient input fields.
   */
  private resetIngredientForm(): void {
    this.ingredientInput = '';
    this.servingSize = '';
    this.servingUnit = 'gram';
    this.filteredIngredients = [];
    this.ingredientError = '';
  }

  /**
 * Checks whether an ingredient has already been added.
 */
  private checkDuplicateIngredient(name: string): boolean {
    const alreadyExists = this.addedIngredients.some(
      (ingredient) =>
        ingredient.name.toLowerCase() === name.toLowerCase()
    );

    return alreadyExists
      ? this.rejectIngredient('This ingredient is already in your list.')
      : false;
  }

  /**
   * Stores an ingredient validation message.
   */
  private rejectIngredient(message: string): boolean {
    this.ingredientError = message;
    return true;
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

  /**
 * Removes an ingredient from the ingredient list.
 */
  removeIngredient(index: number): void {
    this.addedIngredients.splice(index, 1);
  }

  /**
 * Checks the basic format of a freely entered ingredient.
 */
  private isIngredientInputValid(name: string): boolean {
    return (
      name.length >= 2 &&
      /\p{L}/u.test(name) &&
      !/^(.)\1+$/u.test(name)
    );
  }
}