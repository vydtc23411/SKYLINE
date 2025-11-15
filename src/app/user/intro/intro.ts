import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../shared/header/header';
import { FooterComponent } from '../shared/footer/footer';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './intro.html',
  styleUrl: './intro.css',
})
export class Intro {
  teamMembers = [
    { name: 'Trịnh Thị Thùy Trang', image: 'assets/img/intro/thuytrang.png' },
    { name: 'Phạm Thị Hoài Thương', image: 'assets/img/intro/hoaithuong.png' },
    { name: 'Đào Thị Cẩm Vy', image: 'assets/img/intro/camvy.png', featured: true },
    { name: 'Trần Thị Thiên Thảo', image: 'assets/img/intro/thienthao.png' },
    { name: 'Nguyễn Ngọc Tường Vy', image: 'assets/img/intro/tuongvy.png' }
  ];

  currentSlide = 0;

  nextSlide() {
    if (this.currentSlide < this.teamMembers.length - 3) {
      this.currentSlide++;
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }
}
