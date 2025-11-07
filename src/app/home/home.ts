import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from '../shared/header/header';
import { FooterComponent } from '../shared/footer/footer';

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  review: string;
  date: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  reviews: Review[] = [];
  displayedReviews: Review[] = [];
  reviewsToShow: number = 3;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Load reviews from JSON
    this.loadReviews();
  }

  loadReviews(): void {
    this.http.get<{ reviews: Review[] }>('assets/data/reviews.json')
      .subscribe({
        next: (data) => {
          this.reviews = data.reviews;
          // Display only first 3 reviews initially
          this.displayedReviews = this.reviews.slice(0, this.reviewsToShow);
        },
        error: (error) => {
          console.error('Error loading reviews:', error);
        }
      });
  }

  loadMoreReviews(): void {
    this.reviewsToShow += 3;
    this.displayedReviews = this.reviews.slice(0, this.reviewsToShow);
  }

  collapseReviews(): void {
    this.reviewsToShow = 3;
    this.displayedReviews = this.reviews.slice(0, this.reviewsToShow);
  }

  hasMoreReviews(): boolean {
    return this.displayedReviews.length < this.reviews.length;
  }

  canCollapse(): boolean {
    return this.displayedReviews.length > 3;
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
