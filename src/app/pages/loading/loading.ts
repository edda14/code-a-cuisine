import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})

export class Loading {
  constructor(private router: Router) { }
  animationFinished = false;

  onAnimationEnd(): void {
    this.animationFinished = true;
    console.log('Animation ist fertig');
    // this.router.navigate(['/recipe', recipeId]);
  }
}
