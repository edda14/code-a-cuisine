import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OnlyNumbersDirective } from '../../shared/directives/only-numbers';
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
  imports: [FormsModule, OnlyNumbersDirective],
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
  loadStatus = 'Noch nicht geladen';
  @HostListener('document:click', ['$event'])

  @HostListener('document:click', ['$event'])
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

  ngOnInit(): void {
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
  selectIngredient(ingredient: string): void {
    this.ingredientInput = ingredient;
    this.filteredIngredients = [];
  }

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

  filterServingSize(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.servingSize = input.value.replace(/\D/g, '');
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectServingUnit(unit: string): void {
    this.servingUnit = unit;
    this.isDropdownOpen = false;
  }

  addIngredient(): void {
    const name = this.ingredientInput.trim();
    const amount = this.servingSize.trim();
    if (!name || !amount) {
      return;
    }
    const alreadyExists = this.addedIngredients.some(
      (ingredient) => ingredient.name.toLowerCase() === name.toLowerCase()
    );
    if (alreadyExists) {
      return;
    }
    this.addedIngredients.push({
      name: name,
      amount: amount,
      unit: this.servingUnit,
      isEditing: false,
    });
    this.ingredientInput = '';
    this.servingSize = '';
    this.servingUnit = 'gram';
    this.filteredIngredients = [];
  }

  removeIngredient(index: number): void {
    this.addedIngredients.splice(index, 1);
  }

  toggleEditIngredient(index: number): void {
    const ingredient = this.addedIngredients[index];
    if (!ingredient.isEditing) {
      ingredient.editAmount = ingredient.amount;
      ingredient.editUnit = ingredient.unit;
    } else {
      if (ingredient.editAmount?.trim()) {
        ingredient.amount = ingredient.editAmount;
      }
      if (ingredient.editUnit) {
        ingredient.unit = ingredient.editUnit;
      }
    }
    ingredient.isEditing = !ingredient.isEditing;
  }

  toggleEditDropdown(index: number): void {
    this.addedIngredients[index].isDropdownOpen =
      !this.addedIngredients[index].isDropdownOpen;
  }

  selectEditUnit(index: number, unit: string): void {
    this.addedIngredients[index].editUnit = unit;
    this.addedIngredients[index].isDropdownOpen = false;
  }
}