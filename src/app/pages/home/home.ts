import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { RecipeData } from '../../shared/services/recipe-data';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  constructor(private recipeData: RecipeData) { }

  /**
   * Starts the application with an empty recipe session.
   */
  ngOnInit(): void {
    this.recipeData.clear();
  }
}
