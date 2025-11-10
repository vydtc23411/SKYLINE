import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../shared/sidebar/sidebar';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome implements OnInit {
  currentUser: any = null;
  currentDate: string = '';
  showDateDropdown: boolean = false;
  startDate: string = '';
  endDate: string = '';
  dateRange: string = '17/09/25 - 17/10/25';
  
  // Statistics data
  stats = [
    { 
      image: '/assets/icons/revenue.png', 
      label: 'Tổng doanh thu', 
      value: '75.000.000', 
      unit: 'VNĐ',
      bgColor: '#E3F2FD'
    },
    { 
      image: '/assets/icons/ticket1.png', 
      label: 'Tổng vé đã bán', 
      value: '600', 
      unit: '',
      bgColor: '#E0F2F1'
    },
    { 
      image: '/assets/icons/flight1.png', 
      label: 'Tổng chuyến bay', 
      value: '120', 
      unit: '',
      bgColor: '#E1F5FE'
    },
    { 
      image: '/assets/icons/airline1.png', 
      label: 'Số hàng bay đối tác', 
      value: '6', 
      unit: '',
      bgColor: '#E3F2FD'
    }
  ];

  // Chart data for donut charts
  chartData = [
    { label: 'Tỷ lệ ghế được đặt', percentage: 81, color: '#EF5350' },
    { label: 'Tăng trưởng doanh thu tháng này', percentage: 22, color: '#66BB6A' },
    { label: 'Mức doanh thu đạt so với kế hoạch', percentage: 62, color: '#42A5F5' }
  ];

  // Weekly ticket data
  weeklyData = [
    { day: 'Sunday', value: 320 },
    { day: 'Monday', value: 380 },
    { day: 'Tuesday', value: 456 },
    { day: 'Wednesday', value: 290 },
    { day: 'Thursday', value: 410 },
    { day: 'Friday', value: 370 },
    { day: 'Saturday', value: 480 }
  ];

  // Monthly revenue data
  monthlyRevenue = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    data2024: [4200000, 5800000, 4500000, 6200000, 7000000, 6500000, 5800000, 6000000, 5500000, 6200000, 5900000, 6000000],
    data2025: [5000000, 4500000, 6800000, 5200000, 7500000, 6200000, 5500000, 7200000, 6000000, 6800000, 5200000, 6500000]
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Get current user
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }

    // Set current date
    const now = new Date();
    this.currentDate = now.toLocaleDateString('vi-VN');
    
    // Setup chart hover effects
    setTimeout(() => this.setupChartHover(), 100);
  }

  setupChartHover() {
    // Weekly chart tooltip
    const hoverAreas = document.querySelectorAll('.hover-area');
    const tooltip = document.querySelector('.chart-tooltip') as HTMLElement;
    const tooltipDay = document.querySelector('.tooltip-day') as HTMLElement;
    const tooltipValue = document.querySelector('.tooltip-value') as HTMLElement;

    if (tooltip && tooltipDay && tooltipValue) {
      hoverAreas.forEach((area) => {
        area.addEventListener('mouseenter', (e: Event) => {
          const target = e.target as SVGElement;
          const day = target.getAttribute('data-day');
          const value = target.getAttribute('data-value');
          
          if (day && value) {
            tooltipDay.textContent = day;
            tooltipValue.textContent = `${value} vé`;
            tooltip.style.display = 'block';
          }
        });

        area.addEventListener('mousemove', (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const svgRect = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
          
          if (svgRect) {
            const x = mouseEvent.clientX - svgRect.left;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${mouseEvent.clientY - svgRect.top - 20}px`;
          }
        });

        area.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
      });
    }

    // Revenue chart tooltip
    const revenueHoverAreas = document.querySelectorAll('.revenue-hover-area');
    const revenueTooltip = document.querySelector('.revenue-tooltip') as HTMLElement;
    const tooltipMonth = document.querySelector('.revenue-tooltip-month') as HTMLElement;
    const value2024 = document.querySelector('.value-2024') as HTMLElement;
    const value2025 = document.querySelector('.value-2025') as HTMLElement;

    if (revenueTooltip && tooltipMonth && value2024 && value2025) {
      revenueHoverAreas.forEach((area) => {
        area.addEventListener('mouseenter', (e: Event) => {
          const target = e.target as SVGElement;
          const month = target.getAttribute('data-month');
          const val2024 = target.getAttribute('data-value2024');
          const val2025 = target.getAttribute('data-value2025');
          
          if (month && val2024 && val2025) {
            const monthIndex = parseInt(month) - 1;
            tooltipMonth.textContent = this.monthlyRevenue.labels[monthIndex];
            value2024.textContent = `${val2024}M VND`;
            value2025.textContent = `${val2025}M VND`;
            revenueTooltip.style.display = 'block';
          }
        });

        area.addEventListener('mousemove', (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const svgRect = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
          
          if (svgRect) {
            const x = mouseEvent.clientX - svgRect.left;
            revenueTooltip.style.left = `${x}px`;
            revenueTooltip.style.top = `${mouseEvent.clientY - svgRect.top - 20}px`;
          }
        });

        area.addEventListener('mouseleave', () => {
          revenueTooltip.style.display = 'none';
        });
      });
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/admin-login']);
  }

  getChartStrokeDasharray(percentage: number): string {
    const circumference = 2 * Math.PI * 45;
    const filled = (percentage / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  toggleDateDropdown() {
    this.showDateDropdown = !this.showDateDropdown;
  }

  applyDateFilter() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
      const end = new Date(this.endDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
      this.dateRange = `${start} - ${end}`;
      this.showDateDropdown = false;
      // Here you can add logic to filter data based on date range
    }
  }

  selectQuickFilter(days: number) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    this.startDate = start.toISOString().split('T')[0];
    this.endDate = end.toISOString().split('T')[0];
    
    const startFormatted = start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const endFormatted = end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
    this.dateRange = `${startFormatted} - ${endFormatted}`;
    this.showDateDropdown = false;
  }
}
