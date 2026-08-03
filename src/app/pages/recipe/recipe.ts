import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recipe',
  imports: [RouterLink],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe { }
