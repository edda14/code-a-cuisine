import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-impressum',
  imports: [],
  templateUrl: './impressum.html',
  styleUrl: './impressum.scss',
})
export class Impressum {
  constructor(private location: Location) {}

  /**
   * Returns to the previously visited page.
   */
  goBack(): void {
    this.location.back();
  }
}