import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.testN8nConnection();
    setTimeout(() => {
      this.router.navigate(['/results']);
    }, 8000);
  }

  private testN8nConnection(): void {
    const url = '/webhook-test/generate-recipes';

    const body = {
      message: 'Hallo n8n'
    };

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