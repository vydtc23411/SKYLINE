import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../shared/header/header';
import { FooterComponent } from '../shared/footer/footer';

interface Deal {
  image: string;
  label: string;
  date: string;
  details: string;
  target: string;
  applyTime: string;
  promoCode: string;
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
export class Promotion implements OnInit { 
  selectedDeal: Deal | null = null;
  sections: Section[] = [];
  copyStatusMessage: string | null = null; 

  ngOnInit(): void { 
    this.loadPromotions();
  }

  // Tải dữ liệu từ file JSON (assets/data/promotion.json)
  async loadPromotions() {
    try {
      const response = await fetch('assets/data/promotion.json');
      const data: Section[] = await response.json();
      
      this.sections = data.map(section => ({
        ...section,
        visibleCount: 3,
        expanded: false
      }));

    } catch (error) {
      console.error('Lỗi khi tải khuyến mãi từ JSON:', error);
      // Giả định tải thất bại, sections sẽ là mảng rỗng
    }
  }

  // Hàm sao chép mã khuyến mãi
  copyCode(code: string) {
    const el = document.createElement('textarea');
    el.value = code;
    document.body.appendChild(el);
    el.select();
    try {
        // Dùng document.execCommand('copy')
        document.execCommand('copy');
        this.copyStatusMessage = '✅ Đã sao chép mã khuyến mãi!';
    } catch (err) {
        this.copyStatusMessage = 'Lỗi: Không thể sao chép.';
    }
    document.body.removeChild(el);

    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
        this.copyStatusMessage = null;
    }, 3000);
  }

  // --- Các hàm logic hiển thị và cuộn trang ---
  toggleSection(index: number) {
    const section = this.sections[index];
    if (section.expanded) {
      section.visibleCount = 3;
    } else {
      section.visibleCount = section.items.length;
    }
    section.expanded = !section.expanded;
  }

  getVisibleItems(index: number): Deal[] {
    if (!this.sections[index]) return [];
    return this.sections[index].items.slice(0, this.sections[index].visibleCount);
  }

  hasMoreItems(index: number): boolean {
    if (!this.sections[index]) return false;
    return this.sections[index].visibleCount < this.sections[index].items.length;
  }

  canCollapse(index: number): boolean {
    if (!this.sections[index]) return false;
    return this.sections[index].visibleCount > 3;
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      document.querySelectorAll('.deals-tabs button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick')?.includes(`'${sectionId}'`)) {
            btn.classList.add('active');
        }
      });
    }
  }

  openPopup(deal: Deal) {
    this.selectedDeal = deal;
    this.copyStatusMessage = null; 
  }

  closePopup() {
    this.selectedDeal = null;
  }
}