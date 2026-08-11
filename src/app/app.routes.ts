import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { GenerateRecipe } from './pages/generate-recipe/generate-recipe';
import { Preferences } from './pages/preferences/preferences';
import { Loading } from './pages/loading/loading';
import { Results } from './pages/results/results';
import { Recipe } from './pages/recipe/recipe';
import { Cookbook } from './pages/cookbook/cookbook';
import { Categorie } from './pages/categorie/categorie';


export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'generate-recipe',
    component: GenerateRecipe,
  },
  {
    path: 'preferences',
    component: Preferences,
  },
  {
    path: 'loading',
    component: Loading,
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./pages/results/results').then((m) => m.Results)
  },
  {
    path: 'recipe',
    component: Recipe,
  },
  {
    path: 'cookbook',
    component: Cookbook,
  },
  {
    path: 'categorie/:cuisine',
    component: Categorie,
  }
];