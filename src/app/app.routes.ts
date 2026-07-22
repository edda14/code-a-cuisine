import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { GenerateRecipe } from './pages/generate-recipe/generate-recipe';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
    {
    path: 'generate-recipe',
    component: GenerateRecipe,
  },
];