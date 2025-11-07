import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header';
import { FooterComponent } from '../shared/footer/footer';

interface Deal {
  image: string;
  label: string;
  date: string;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  items: Deal[];
  visibleCount: number;
  expanded: boolean;
}

@Component({
  selector: 'app-promotion',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './promotion.html',
  styleUrl: './promotion.css',
})
export class Promotion {
  sections = [
    {
      id: 'special',
      title: 'Chiến dịch đặc biệt',
      icon: 'fa-solid fa-star',
      items: [
        { image: 'assets/img/CDDB_1.jpg', label: 'Xem khuyến mãi', date: '5 Tháng 11 - 15 Tháng 11 2025' },
        { image: 'assets/img/CDDB_2.jpg', label: 'Xem khuyến mãi', date: 'Ưu đãi đến 30%' },
        { image: 'assets/img/CDDB_3.jpg', label: 'Xem khuyến mãi', date: 'Vé máy bay giảm đến 50%' },
        { image: 'assets/img/CDDB_4.jpg', label: 'Xem khuyến mãi', date: '16 Tháng 10 2025 - 1 Tháng 3 2026' },
        { image: 'assets/img/CDDB_5.jpg', label: 'Xem khuyến mãi', date: '11 Tháng 9 - 31 Tháng 12 2025' },
        { image: 'assets/img/CDDB_6.jpg', label: 'Xem khuyến mãi', date: '14 Tháng 7 - 31 Tháng 12 2025' },
      ],
      visibleCount: 3,
      expanded: false,
    },
    {
      id: 'payment',
      title: 'Thanh toán & Trả sau',
      icon: 'fa-solid fa-credit-card',
      items: [
        { image: 'assets/img/TTTS_1.jpg', label: 'Xem khuyến mãi', date: '5 Tháng 11 - 15 Tháng 11 2025' },
        { image: 'assets/img/TTTS_2.jpg', label: 'Xem khuyến mãi', date: '16 Tháng 5 - 31 Tháng 12' },
        { image: 'assets/img/TTTS_3.jpg', label: 'Xem khuyến mãi', date: '1 Tháng 11 - 30 Tháng 11' },
        { image: 'assets/img/TTTS_4.jpg', label: 'Xem khuyến mãi', date: 'Ưu đãi thẻ tín dụng' },
        { image: 'assets/img/TTTS_5.jpg', label: 'Xem khuyến mãi', date: '15 Tháng 7 - 30 Tháng 11' },
        { image: 'assets/img/TTTS_6.jpg', label: 'Xem khuyến mãi', date: '1 Tháng 3 - 31 Tháng 12' },
      ],
      visibleCount: 3,
      expanded: false,
    },
    {
      id: 'related',
      title: 'Ưu đãi liên quan',
      icon: 'fa-solid fa-gift',
      items: [
        { image: 'assets/img/TTTS_4.jpg', label: 'Xem khuyến mãi', date: 'Ưu đãi thẻ tín dụng' },
        { image: 'assets/img/TTTS_5.jpg', label: 'Xem khuyến mãi', date: '15 Tháng 7 - 30 Tháng 11' },
        { image: 'assets/img/TTTS_6.jpg', label: 'Xem khuyến mãi', date: '1 Tháng 3 - 31 Tháng 12' },
        { image: 'assets/img/CDDB_4.jpg', label: 'Xem khuyến mãi', date: '16 Tháng 10 2025 - 1 Tháng 3 2026' },
        { image: 'assets/img/CDDB_5.jpg', label: 'Xem khuyến mãi', date: '11 Tháng 9 - 31 Tháng 12 2025' },
        { image: 'assets/img/CDDB_6.jpg', label: 'Xem khuyến mãi', date: '14 Tháng 7 - 31 Tháng 12 2025' },
      ],
      visibleCount: 3,
      expanded: false,
    },
  ];

  toggleSection(index: number) {
    const section = this.sections[index];
    if (section.expanded) {
      section.visibleCount = 3;
    } else {
      section.visibleCount = section.items.length;
    }
    section.expanded = !section.expanded;
  }

  getVisibleItems(index: number) {
    return this.sections[index].items.slice(0, this.sections[index].visibleCount);
  }

  hasMoreItems(index: number) {
    return this.sections[index].visibleCount < this.sections[index].items.length;
  }

  canCollapse(index: number) {
    return this.sections[index].visibleCount > 3;
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -120;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }
}