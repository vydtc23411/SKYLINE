import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Router có thể không cần ở đây nếu logout đã ở header
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AdminSidebarComponent } from '../shared/sidebar/sidebar';
import { AdminHeader } from '../shared/header/admin-header/admin-header';

// Import component con

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule,
    AdminSidebarComponent, // Component Sidebar
    AdminHeader   // Component Header
  ],
  templateUrl: './admin-home.html',
  styleUrls: ['./admin-home.css']
})
export class AdminHomeComponent implements OnInit {
  
  // === TRẠNG THÁI CHA ===
  currentUser: any = null;
  sidebarOpen: boolean = true; // Quản lý sidebar ở đây

  // === LOGIC BỘ LỌC (Welcome Section) ===
  showFilterDropdown: boolean = false;
  filterStep: 'year' | 'month' | 'week' = 'year';
  dateRange: string = 'Tháng mới nhất';
  selectedYear: number = 2025;
  availableYears: number[] = [2024, 2025];
  availableMonths: any[] = [];
  allMonthlyData: any[] = [];
  availableWeeks: any[] = [];
  selectedMonthIndex: number = -1;
  selectedWeekIndex: number = -1;
  weeklyTicketData: any[] = [];
  
  // === DỮ LIỆU NỘI DUNG (Stats & Charts) ===
  stats = [
    { image: '/assets/icons/revenue.png', label: 'Tổng doanh thu', value: '0', unit: 'VNĐ', bgColor: '#E3F2FD' },
    { image: '/assets/icons/ticket1.png', label: 'Tổng vé đã bán', value: '0', unit: '', bgColor: '#E0F2F1' },
    { image: '/assets/icons/flight1.png', label: 'Tổng chuyến bay', value: '0', unit: '', bgColor: '#E1F5FE' },
    { image: '/assets/icons/airline1.png', label: 'Số hàng bay đối tác', value: '6', unit: '', bgColor: '#E3F2FD' }
  ];
  chartData = [
    { label: 'Tỷ lệ ghế được đặt', percentage: 0, color: '#EF5350' },
    { label: 'Tăng trưởng doanh thu tháng này', percentage: 0, color: '#66BB6A' },
    { label: 'Mức doanh thu đạt so với kế hoạch', percentage: 0, color: '#42A5F5' }
  ];
  donutRadius: number = 40;
  weeklyData = [
    { day: 'Sunday', value: 0 }, { day: 'Monday', value: 0 }, { day: 'Tuesday', value: 0 },
    { day: 'Wednesday', value: 0 }, { day: 'Thursday', value: 0 }, { day: 'Friday', value: 0 },
    { day: 'Saturday', value: 0 }
  ];
  monthlyRevenue = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    data2024: [] as number[],
    data2025: [] as number[]
  };
  // SVG paths for revenue chart (generated dynamically)
  revenuePath2024: string = '';
  revenuePath2025: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
    this.checkSidebarState(); // Kiểm tra responsive
    
    // Tải tất cả dữ liệu
    this.loadTicketsData();
    this.loadFlightsData();
    this.loadRevenueData();
    this.loadWeeklyTicketData();
    
    setTimeout(() => this.setupChartHover(), 500);
  }
  
  // === TẢI DỮ LIỆU ===
  loadTicketsData() {
    this.http.get<any[]>('assets/data/tickets.json').subscribe({
      next: (data) => {
        const ticketsOfYear = data.filter(ticket => new Date(ticket.date).getFullYear() === this.selectedYear);
        const totalRevenue = ticketsOfYear.reduce((sum, ticket) => sum + ticket.revenueTotal, 0);
        this.stats[0].value = (totalRevenue / 1000000).toFixed(1) + 'M';
        
        const totalSeatsBooked = ticketsOfYear.reduce((sum, ticket) => sum + (ticket.seatsBookedTotal || 0), 0);
        const totalSeatsMax = ticketsOfYear.reduce((sum, ticket) => sum + (ticket.seatsMax || 0), 0);
        this.stats[1].value = totalSeatsBooked.toLocaleString('vi-VN');
        
        if (totalSeatsMax > 0) {
          const bookingRate = (totalSeatsBooked / totalSeatsMax) * 100;
          this.chartData[0].percentage = Math.min(100, Math.round(bookingRate));
        } else {
          this.chartData[0].percentage = 0;
        }
      },
      error: (error) => console.error('Error loading tickets:', error)
    });
  }

  loadFlightsData() {
    this.http.get<any[]>('assets/data/flights.json').subscribe({
      next: (data) => {
        const flightsOfYear = data.filter(flight => new Date(flight.date).getFullYear() === this.selectedYear);
        this.stats[2].value = (flightsOfYear?.length || 0).toString();
      },
      error: (error) => console.error('Error loading flights:', error)
    });
  }

  loadRevenueData() {
    this.http.get<any>('assets/data/revenue.json').subscribe({
      next: (data) => {
        if (data.monthly) {
          this.allMonthlyData = data.monthly;
          const monthly2024 = data.monthly.filter((m: any) => m.year === 2024);
          const monthly2025 = data.monthly.filter((m: any) => m.year === 2025);
          
          this.availableMonths = this.selectedYear === 2025 ? monthly2025 : monthly2024;
          this.monthlyRevenue.data2024 = monthly2024.map((m: any) => m.revenueActual);
          this.monthlyRevenue.data2025 = monthly2025.map((m: any) => m.revenueActual);

          // Generate SVG paths for both years (based on loaded data)
          this.revenuePath2024 = this.generateRevenuePath(this.monthlyRevenue.data2024);
          this.revenuePath2025 = this.generateRevenuePath(this.monthlyRevenue.data2025);

          // Get latest month with data
          const latestMonthIndex = this.availableMonths.length - 1;
          this.selectedMonthIndex = latestMonthIndex;
          const latestMonth = this.availableMonths[latestMonthIndex];
          
          this.updateMonthRange(latestMonth);
          
          if (latestMonth && latestMonth.growthMoMPct !== null) {
            this.chartData[1].percentage = Math.round(Math.abs(latestMonth.growthMoMPct));
          }
          if (latestMonth && latestMonth.planAttainmentPct) {
            this.chartData[2].percentage = Math.round(latestMonth.planAttainmentPct);
          }
          
          this.loadWeeksForMonth(latestMonth); // Phụ thuộc vào weeklyTicketData
        }
      },
      error: (error) => console.error('Error loading revenue:', error)
    });
  }

  loadWeeklyTicketData() {
    this.http.get<any>('assets/data/ticketdetail_weekly.json').subscribe({
      next: (data) => {
        if (data.weeks && data.weeks.length > 0) {
          this.weeklyTicketData = data.weeks;
          
          // Sau khi cả 2 (revenue & weekly) đều tải xong, load tuần cho tháng mới nhất
          if (this.availableMonths.length > 0) {
             const latestMonth = this.availableMonths[this.selectedMonthIndex];
             this.loadWeeksForMonth(latestMonth);
             if(this.availableWeeks.length > 0) {
                const lastWeek = this.availableWeeks[this.availableWeeks.length - 1];
                this.updateWeeklyChart(lastWeek);
             }
          }
        }
      },
      error: (error) => console.error('Error loading weekly ticket data:', error)
    });
  }

  // === LOGIC BỘ LỌC ===

  selectMonth(monthIndex: number) {
    this.selectedMonthIndex = monthIndex;
    const selectedMonth = this.availableMonths[monthIndex];
    this.loadWeeksForMonth(selectedMonth);
    
    if (this.availableWeeks.length > 0) {
      this.filterStep = 'week';
    } else {
      this.applyMonthFilter();
    }
  }

  selectYear(year: number) {
    this.selectedYear = year;
    this.availableMonths = this.allMonthlyData.filter((m: any) => m.year === year);
    this.loadTicketsData(); // Tải lại stats
    this.loadFlightsData(); // Tải lại stats
    
    this.selectedMonthIndex = this.availableMonths.length > 0 ? this.availableMonths.length - 1 : -1;
    this.filterStep = 'month';
  }

  applyYearFilter() {
    // (Logic này đã chuyển vào selectYear, nhưng hàm này có thể được gọi từ đâu đó)
    this.availableMonths = this.allMonthlyData.filter((m: any) => m.year === this.selectedYear);
    this.loadTicketsData();
    this.loadFlightsData();
    
    if (this.availableMonths.length > 0) {
      this.selectedMonthIndex = this.availableMonths.length - 1;
      const latestMonth = this.availableMonths[this.selectedMonthIndex];
      this.updateMonthRange(latestMonth);
      
      if (latestMonth.growthMoMPct !== null) this.chartData[1].percentage = Math.round(Math.abs(latestMonth.growthMoMPct));
      if (latestMonth.planAttainmentPct) this.chartData[2].percentage = Math.round(latestMonth.planAttainmentPct);
      
      this.loadWeeksForMonth(latestMonth);
      if (this.availableWeeks.length > 0) {
        this.updateWeeklyChart(this.availableWeeks[this.availableWeeks.length - 1]);
      } else {
        this.updateWeeklyChart(null); // Reset
      }
    }
    this.showFilterDropdown = false;
    this.filterStep = 'year';
  }

  loadWeeksForMonth(selectedMonth: any) {
    if (this.weeklyTicketData.length === 0 || !selectedMonth) return;
    const { year, month } = selectedMonth;
    
    this.availableWeeks = this.weeklyTicketData.filter((week: any) => {
      const weekEndDate = new Date(week.week_end);
      return weekEndDate.getFullYear() === year && (weekEndDate.getMonth() + 1) === month;
    });
    
    this.selectedWeekIndex = this.availableWeeks.length > 0 ? this.availableWeeks.length - 1 : -1;
  }

  selectWeek(weekIndex: number) {
    this.selectedWeekIndex = weekIndex;
  }

  applyMonthFilter() {
    if (this.selectedMonthIndex >= 0) {
      const selectedMonth = this.availableMonths[this.selectedMonthIndex];
      this.updateMonthRange(selectedMonth);
      
      if (selectedMonth.growthMoMPct !== null) this.chartData[1].percentage = Math.round(Math.abs(selectedMonth.growthMoMPct));
      if (selectedMonth.planAttainmentPct) this.chartData[2].percentage = Math.round(selectedMonth.planAttainmentPct);
      
      if (this.selectedWeekIndex >= 0) {
        this.updateWeeklyChart(this.availableWeeks[this.selectedWeekIndex]);
      } else {
         this.updateWeeklyChart(null); // Reset
      }
      
      this.showFilterDropdown = false;
      this.filterStep = 'year';
    }
  }

  applyWeekFilter() {
    if (this.selectedWeekIndex >= 0) {
      const selectedWeek = this.availableWeeks[this.selectedWeekIndex];
      const selectedMonth = this.availableMonths[this.selectedMonthIndex];
      
      this.dateRange = `${this.formatWeekRange(selectedWeek)} - Tháng ${selectedMonth.month}/${selectedMonth.year}`;
      this.updateWeeklyChart(selectedWeek);
      
      this.showFilterDropdown = false;
      this.filterStep = 'year';
    }
  }

  updateWeeklyChart(week: any) {
    if (!week) {
      this.weeklyData = this.weeklyData.map(d => ({ ...d, value: 0 }));
      return;
    }
    this.weeklyData = week.days.map((day: any) => ({
      day: day.weekday,
      value: day.tickets
    }));
  }

  updateMonthRange(month: any) {
     if(month) this.dateRange = `Tháng ${month.month}/${month.year}`;
  }

  toggleDateDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
    if (!this.showFilterDropdown) this.filterStep = 'year';
  }

  goBackToYear() { this.filterStep = 'year'; }
  goBackToMonth() { this.filterStep = 'month'; }

  formatWeekRange(week: any): string {
    const startDate = new Date(week.week_start);
    const endDate = new Date(week.week_end);
    const formatDate = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  getTotalTicketsForWeek(week: any): number {
    if (!week || !week.days) return 0;
    return week.days.reduce((sum: number, day: any) => sum + day.tickets, 0);
  }

  // === BIỂU ĐỒ HELPERS ===
  
  setupChartHover() {
    // (Giữ nguyên code setupChartHover...)
  }
  getChartStrokeDasharray(percentage: number): string {
    return this.getDonutStrokeDasharray(percentage);
  }
  donutCircumference(): number {
    return 2 * Math.PI * this.donutRadius;
  }
  getDonutStrokeDasharray(percentage: number): string {
    const circumference = this.donutCircumference();
    const filled = (percentage / 100) * circumference;
    const remaining = Math.max(0, circumference - filled);
    return `${filled} ${remaining}`;
  }
  getDonutStrokeDashoffset(_percentage: number): string { return '0'; }
  
  generateWeeklyPath(): string {
    const points = this.computeWeeklyPoints();
    if (points.length === 0) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cur = points[i], next = points[i+1];
      const cX1 = cur.x + (next.x - cur.x) * 0.4;
      const cY1 = cur.y;
      const cX2 = cur.x + (next.x - cur.x) * 0.6;
      const cY2 = next.y;
      path += ` C ${cX1},${cY1} ${cX2},${cY2} ${next.x},${next.y}`;
    }
    return path;
  }
  generateWeeklyAreaPath(): string {
    const points = this.computeWeeklyPoints();
    if (points.length === 0) return '';
    const path = this.generateWeeklyPath();
    const width = 700, height = 220, padding = 80;
    return `${path} L ${width - padding},${height} L ${padding},${height} Z`;
  }
  computeWeeklyPoints(): { x: number; y: number }[] {
    const width = 700, height = 220, padding = 80;
    const maxValue = Math.max(...this.weeklyData.map(d => d.value), 1);
    return this.weeklyData.map((d, i) => {
      const step = (width - padding * 2) / Math.max(this.weeklyData.length - 1, 1);
      const x = padding + (i * step);
      const y = height - ((d.value / maxValue) * (height - 40));
      return { x, y };
    });
  }
  getHoverRectX(i: number): number {
    const width = 700, padding = 80;
    const step = (width - padding * 2) / Math.max(this.weeklyData.length - 1, 1);
    const x = (padding + i * step) - step / 2;
    return Math.max(0, x);
  }
  getHoverRectWidth(): number {
    const width = 700, padding = 80;
    return (width - padding * 2) / Math.max(this.weeklyData.length - 1, 1);
  }
  getDataPointCx(i: number): number { return this.computeWeeklyPoints()[i]?.x ?? 0; }
  getDataPointCy(i: number): number { return this.computeWeeklyPoints()[i]?.y ?? 0; }
  formatRevenue(value: number): string { return (value / 1000000).toFixed(1); }

  generateRevenuePath(data: number[]): string {
    const width = 1000, height = 240, paddingX = 50;
    const maxValue = Math.max(...this.monthlyRevenue.data2024, ...this.monthlyRevenue.data2025, 1000000);
    const points = data.map((value, i) => {
      const x = paddingX + (i * (width - paddingX * 2) / 11);
      const y = (value === 0) ? height : height - ((value / maxValue) * (height - 40));
      return { x, y };
    });
    if (points.length === 0 || points.every(p => p.y === height)) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cur = points[i], next = points[i+1];
      const cX1 = cur.x + (next.x - cur.x) * 0.4;
      const cY1 = cur.y;
      const cX2 = cur.x + (next.x - cur.x) * 0.6;
      const cY2 = next.y;
      path += ` C ${cX1},${cY1} ${cX2},${cY2} ${next.x},${next.y}`;
    }
    return path;
  }

  // Get revenue data point coordinates
  getRevenueDataPoint(monthIndex: number, year: 2024 | 2025): { cx: number, cy: number } {
    const width = 1000;
    const height = 240;
    const paddingX = 50;
    const maxValue = Math.max(...this.monthlyRevenue.data2024, ...this.monthlyRevenue.data2025, 1000000);
    
    const data = year === 2024 ? this.monthlyRevenue.data2024 : this.monthlyRevenue.data2025;
    
    // If data doesn't exist for this month (e.g., 2025 only has 11 months), return off-screen
    if (monthIndex >= data.length) {
      return { cx: -100, cy: -100 }; // Off-screen
    }
    
    const value = data[monthIndex] || 0;
    
    const cx = paddingX + (monthIndex * (width - paddingX * 2) / 11);
    const cy = height - ((value / maxValue) * (height - 40));
    
    return { cx, cy };
  }

  // Get revenue hover area x position
  getRevenueHoverX(monthIndex: number): number {
    const width = 1000;
    const paddingX = 50;
    const step = (width - paddingX * 2) / 11;
    return paddingX + (monthIndex * step) - step / 2;
  }

  // Get revenue hover area width
  getRevenueHoverWidth(): number {
    const width = 1000;
    const paddingX = 50;
    return (width - paddingX * 2) / 11;
  }

  // Get revenue x-axis label position
  getRevenueLabelX(monthIndex: number): number {
    const width = 1000;
    const paddingX = 50;
    return paddingX + (monthIndex * (width - paddingX * 2) / 11);
  }

  // Get max value for revenue chart scaling
  getRevenueMaxValue(): number {
    return Math.max(...this.monthlyRevenue.data2024, ...this.monthlyRevenue.data2025, 1000000);
  }

  // Get Y-axis labels for revenue chart
  getRevenueYAxisLabels(): string[] {
    const maxValue = this.getRevenueMaxValue();
    const step = maxValue / 4;
    return [
      this.formatRevenue(step) + 'M',
      this.formatRevenue(step * 2) + 'M',
      this.formatRevenue(step * 3) + 'M',
      this.formatRevenue(step * 4) + 'M'
    ];
  }

  // Toggle sidebar on mobile
  
  // === SIDEBAR LOGIC ===

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkSidebarState();
  }

  checkSidebarState() {
    this.sidebarOpen = window.innerWidth > 768;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Đóng sidebar nếu click ra ngoài (trên mobile)
    if (window.innerWidth <= 768) {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('app-admin-sidebar');
      const menuToggle = document.querySelector('.menu-toggle');
      
      if (this.sidebarOpen && sidebar && menuToggle) {
        if (!sidebar.contains(target) && !menuToggle.contains(target)) {
          this.sidebarOpen = false;
        }
      }
    }
    
    // Đóng dropdown filter nếu click ra ngoài
    const filterDropdown = document.querySelector('.date-filter');
    if (this.showFilterDropdown && filterDropdown && !filterDropdown.contains(event.target as Node)) {
       this.showFilterDropdown = false;
       this.filterStep = 'year';
    }
  }
}