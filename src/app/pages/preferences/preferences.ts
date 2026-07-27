import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
  
})
export class Preferences {
portionCount = 2;
helperCount = 1;
selectedCookingTime = '';
selectedCuisine = '';
selectedDiet = '';

increasePortions(): void {
  if (this.portionCount < 12) {
    this.portionCount++;
  }
}

decreasePortions(): void {
  if (this.portionCount > 1) {
    this.portionCount--;
  }
}

increaseHelpers(): void {
  if (this.helperCount < 3) {
    this.helperCount++;
  }
}

decreaseHelpers(): void {
  if (this.helperCount > 1) {
    this.helperCount--;
  }
}

isFormValid(): boolean {
  return (
    this.selectedCookingTime !== '' &&
    this.selectedCuisine !== '' &&
    this.selectedDiet !== ''
  );
}
}
