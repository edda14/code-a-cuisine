import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RecipeData } from '../../shared/services/recipe-data';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements OnInit {
  animationFinished = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private recipeData: RecipeData
  ) { }

  ngOnInit(): void {
    console.log('Zutaten:', this.recipeData.getIngredients());
    console.log('Portionen:', this.recipeData.getPortionCount());
    console.log('Preferences:', this.recipeData.getPreferences());

    this.testN8nConnection();

    setTimeout(() => {
      this.router.navigate(['/results']);
    }, 8000);
  }

  private testN8nConnection(): void {
    const url = '/webhook-test/generate-recipes';
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

    // console.log('JSON für n8n:', body);

    this.http.post<{ message: string }>(url, body).subscribe({
      next: (response) => {
        console.log('Antwort von n8n:', response);
      },
      error: (error) => {
        console.error('Fehler bei n8n:', error);
      }
    });
  }

  onAnimationEnd(): void {
    this.animationFinished = true;
    console.log('Animation ist fertig');
  }
}