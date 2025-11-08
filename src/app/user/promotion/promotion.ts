import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header';
import { FooterComponent } from '../shared/footer/footer';

interface Deal {
  image: string;
  label: string;
  date: string;
  details: string;
  target: string;
  applyTime: string;
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
  selectedDeal: Deal | null = null;
  showModal = false;

  sections: Section[] = [
  // ===== Chiến dịch đặc biệt =====
  {
    id: 'special',
    title: 'Chiến dịch đặc biệt',
    icon: 'fa-solid fa-star',
    items: [
      { image: 'assets/img/CDDB_1.jpg', label: 'Xem khuyến mãi', date: '5-15/11/2025', details: 'Giảm đến 40% cho các chuyến bay nội địa và quốc tế.', target: 'Tất cả khách hàng', applyTime: '5/11 – 15/11' },
      { image: 'assets/img/CDDB_2.jpg', label: 'Xem khuyến mãi', date: 'Ưu đãi đến 30%', details: 'Giảm 30% giá phòng khách sạn.', target: 'Thành viên hạng Bạc trở lên', applyTime: '1/11 – 30/11' },
      { image: 'assets/img/CDDB_3.jpg', label: 'Xem khuyến mãi', date: 'Vé máy bay giảm đến 50%', details: 'Ưu đãi cực lớn cho các chặng bay nội địa VietSky.', target: 'Khách hàng mới', applyTime: '10/11 – 20/12' },
      { image: 'assets/img/CDDB_4.jpg', label: 'Xem khuyến mãi', date: 'Sale Tết 2026', details: 'Đặt sớm vé Tết, giảm đến 1 triệu VND', target: 'Tất cả khách hàng', applyTime: '12/11 – 14/12' },
      { image: 'assets/img/CDDB_5.jpg', label: 'Xem khuyến mãi', date: 'Ưu đãi cuối tuần', details: 'Combo vé + khách sạn giảm 15%.', target: 'Tất cả khách hàng', applyTime: '15/11 – 16/11' },
      { image: 'assets/img/CDDB_6.jpg', label: 'Xem khuyến mãi', date: 'Đặc quyền thành viên', details: 'Giảm đến 2.5 triệu đối với thành viên hạng Vàng trở lên', target: 'Tất cả khách hàng', applyTime: 'Tất cả thời gian' },
    ],
    visibleCount: 3,
    expanded: false,
  },

  // ===== Thanh toán & Trả sau =====
  {
    id: 'payment',
    title: 'Thanh toán & Trả sau',
    icon: 'fa-solid fa-credit-card',
    items: [
      { image: 'assets/img/TTTS_1.jpg', label: 'Xem khuyến mãi', date: 'Hoàn tiền 10%', details: 'Hoàn tiền 10% khi thanh toán trên 2 triệu bằng thẻ KBank, tối đa 250k.', target: 'Người dùng thẻ KBank', applyTime: '1/10 – 31/12' },
      { image: 'assets/img/TTTS_2.jpg', label: 'Xem khuyến mãi', date: 'Mua 1 tặng 1', details: 'Ưu đãi mua 1 tặng 1 khi đặt vé trên app, thanh toán qua SeABank.', target: 'Khách hàng dùng thẻ Visa/Master SeABank', applyTime: 'Thứ 6 hàng tuần' },
      { image: 'assets/img/TTTS_3.jpg', label: 'Xem khuyến mãi', date: 'Giảm 1 triệu', details: 'Hoàn 15% hoặc giảm đến 1 triệu cho thanh toán online trên Zalopay.', target: 'Người dùng thẻ SC', applyTime: '1/10 – 30/11' },
      { image: 'assets/img/TTTS_4.jpg', label: 'Xem khuyến mãi', date: 'Giảm 400k', details: 'Hoàn 15% hoặc giảm đến 1 triệu cho thanh toán online trên Zalopay.', target: 'Tất cả khách hàng', applyTime: '1/11 – 30/11' },
      { image: 'assets/img/TTTS_5.jpg', label: 'Xem khuyến mãi', date: 'Giảm đến 450k', details: 'Áp dụng với thanh toán thẻ tín dụng của UOB.', target: 'Khách hàng thẻ tín dụng', applyTime: '1/11 – 30/11' },
      { image: 'assets/img/TTTS_6.jpg', label: 'Xem khuyến mãi', date: 'Giảm 250k', details: 'Áp dụng thanh toán trả sau trên HD Bank.', target: 'Tất cả khách hàng', applyTime: '1/11 – 30/11' },
    ],
    visibleCount: 3,
    expanded: false,
  },

  // ===== Ưu đãi liên quan =====
  {
    id: 'related',
    title: 'Ưu đãi liên quan',
    icon: 'fa-solid fa-tags',
    items: [
      { image: 'assets/img/UDLQ_1.jpg', label: 'Xem khuyến mãi', date: 'Voucher giảm 15%', details: 'Nhận voucher giảm 15% khi đặt vé Vietjet.', target: 'Tất cả khách hàng', applyTime: '5/11 – 30/11' },
      { image: 'assets/img/UDLQ_2.jpg', label: 'Xem khuyến mãi', date: 'Vi vu thả ga', details: 'Giảm 30% khi mua eSIM GoHub quốc tế, áp dụng cho khách đã đặt tour tham quan.', target: 'Khách hàng mới', applyTime: '1/11 – 31/12' },
      { image: 'assets/img/UDLQ_3.jpg', label: 'Xem khuyến mãi', date: 'Giảm 10%', details: 'Vi vu Đông Nam Á với Siêu Du thuyền, giảm đến 1 triệu VND.', target: 'Tất cả khách hàng', applyTime: '1/11 – 30/11' },
      { image: 'assets/img/UDLQ_4.jpg', label: 'Xem khuyến mãi', date: 'Khuyến mãi chớp nhoáng', details: 'Giảm 30% vé máy bay.', target: 'Tất cả khách hàng', applyTime: '12/11 – 14/11' },
      { image: 'assets/img/UDLQ_5.jpg', label: 'Xem khuyến mãi', date: 'Ưu đãi cuối tuần', details: 'Deal đặc biệt từ chuỗi Ascott.', target: 'Tất cả khách hàng', applyTime: '5/11 – 16/11' },
      { image: 'assets/img/UDLQ_6.jpg', label: 'Xem khuyến mãi', date: 'Đặt sớm giảm giá', details: 'Deal đặc biệt từ chuỗi Millennium.', target: 'Tất cả khách hàng', applyTime: '5/11 – 30/11' },
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

  // ✅ Hiện popup
  openPopup(deal: Deal) {
    this.selectedDeal = deal;
  }

  // ✅ Đóng popup
  closePopup() {
    this.selectedDeal = null;
  }
}