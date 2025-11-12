import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  showFilterDropdown: boolean = false;
  sidebarOpen: boolean = false; // For mobile sidebar toggle
  filterStep: 'year' | 'month' | 'week' = 'year'; // Current step in filter
  dateRange: string = 'Tháng mới nhất';
  selectedYear: number = 2025;
  availableYears: number[] = [2024, 2025];
  availableMonths: any[] = [];
  allMonthlyData: any[] = []; // Store all monthly data
  availableWeeks: any[] = []; // Weeks in selected month
  selectedMonthIndex: number = -1;
  selectedWeekIndex: number = -1;
  weeklyTicketData: any[] = []; // Store all weeks data
  
  // Statistics data
  stats = [
    { 
      image: '/assets/icons/revenue.png', 
      label: 'Tổng doanh thu', 
      value: '0', 
      unit: 'VNĐ',
      bgColor: '#E3F2FD'
    },
    { 
      image: '/assets/icons/ticket1.png', 
      label: 'Tổng vé đã bán', 
      value: '0', 
      unit: '',
      bgColor: '#E0F2F1'
    },
    { 
      image: '/assets/icons/flight1.png', 
      label: 'Tổng chuyến bay', 
      value: '0', 
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
    { label: 'Tỷ lệ ghế được đặt', percentage: 0, color: '#EF5350' },
    { label: 'Tăng trưởng doanh thu tháng này', percentage: 0, color: '#66BB6A' },
    { label: 'Mức doanh thu đạt so với kế hoạch', percentage: 0, color: '#42A5F5' }
  ];

  // Donut chart configuration
  donutRadius: number = 40; // keep in sync with SVG r attribute

  // Weekly ticket data
  weeklyData = [
    { day: 'Sunday', value: 0 },
    { day: 'Monday', value: 0 },
    { day: 'Tuesday', value: 0 },
    { day: 'Wednesday', value: 0 },
    { day: 'Thursday', value: 0 },
    { day: 'Friday', value: 0 },
    { day: 'Saturday', value: 0 }
  ];

  // Monthly revenue data
  monthlyRevenue = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    data2024: [] as number[],
    data2025: [] as number[]
  };

  // SVG paths for revenue chart (generated dynamically)
  revenuePath2024: string = '';
  revenuePath2025: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Get current user
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }

    // Set current date
    const now = new Date();
    this.currentDate = now.toLocaleDateString('vi-VN');
    
    // Load data from JSON files
    this.loadTicketsData();
    this.loadFlightsData();
    this.loadRevenueData();
    this.loadWeeklyTicketData();
    
    // Setup chart hover effects
    setTimeout(() => this.setupChartHover(), 500);
  }

  loadTicketsData() {
    this.http.get<any[]>('assets/data/tickets.json').subscribe({
      next: (data) => {
        // Filter tickets by selected year
        const ticketsOfYear = data.filter(ticket => {
          const ticketYear = new Date(ticket.date).getFullYear();
          return ticketYear === this.selectedYear;
        });
        
        // Calculate total revenue from tickets of selected year
        const totalRevenue = ticketsOfYear.reduce((sum, ticket) => sum + ticket.revenueTotal, 0);
        this.stats[0].value = (totalRevenue / 1000000).toFixed(1) + 'M';
        
        // Calculate total seats booked and total seats max from tickets data of selected year
        const totalSeatsBooked = ticketsOfYear.reduce((sum, ticket) => sum + (ticket.seatsBookedTotal || 0), 0);
        const totalSeatsMax = ticketsOfYear.reduce((sum, ticket) => sum + (ticket.seatsMax || 0), 0);
        
        // Update total tickets sold stat
        this.stats[1].value = totalSeatsBooked.toLocaleString('vi-VN');
        
        // Calculate booking rate percentage for donut chart
        if (totalSeatsMax > 0) {
          const bookingRate = (totalSeatsBooked / totalSeatsMax) * 100;
          this.chartData[0].percentage = Math.min(100, Math.round(bookingRate));
        } else {
          this.chartData[0].percentage = 0;
        }
        
        console.log('Year:', this.selectedYear, 'Total revenue:', totalRevenue, 'Total seats booked:', totalSeatsBooked, 'Total seats max:', totalSeatsMax, 'Booking rate:', this.chartData[0].percentage + '%');
      },
      error: (error) => console.error('Error loading tickets:', error)
    });
  }

  loadFlightsData() {
    this.http.get<any[]>('assets/data/flights.json').subscribe({
      next: (data) => {
        // Filter flights by selected year
        const flightsOfYear = data.filter(flight => {
          const flightYear = new Date(flight.date).getFullYear();
          return flightYear === this.selectedYear;
        });
        
        // Calculate total flights of selected year
        const totalFlights = flightsOfYear ? flightsOfYear.length : 0;
        this.stats[2].value = totalFlights.toString();
        
        console.log('Year:', this.selectedYear, 'Total flights:', totalFlights);
      },
      error: (error) => console.error('Error loading flights:', error)
    });
  }

  loadRevenueData() {
    this.http.get<any>('assets/data/revenue.json').subscribe({
      next: (data) => {
        if (data.monthly) {
          // Store all monthly data
          this.allMonthlyData = data.monthly;
          
          // Filter data by year
          const monthly2024 = data.monthly.filter((m: any) => m.year === 2024);
          const monthly2025 = data.monthly.filter((m: any) => m.year === 2025);
          
          // Show all months for both years
          if (this.selectedYear === 2025) {
            this.availableMonths = monthly2025;
          } else {
            this.availableMonths = monthly2024;
          }
          
          // Populate revenue arrays for chart
          this.monthlyRevenue.data2024 = monthly2024.map((m: any) => m.revenueActual);
          this.monthlyRevenue.data2025 = monthly2025.map((m: any) => m.revenueActual);
          
          // Generate SVG paths for both years
          this.revenuePath2024 = this.generateRevenuePath(this.monthlyRevenue.data2024);
          this.revenuePath2025 = this.generateRevenuePath(this.monthlyRevenue.data2025);
          
          // Get latest month with data
          const latestMonthIndex = this.availableMonths.length - 1;
          this.selectedMonthIndex = latestMonthIndex;
          const latestMonth = this.availableMonths[latestMonthIndex];
          
          // Update date range display
          this.updateMonthRange(latestMonth);
          
          // Calculate growth rate for donut chart (tăng trưởng tháng này)
          if (latestMonth && latestMonth.growthMoMPct !== null) {
            // Use absolute value and round
            this.chartData[1].percentage = Math.round(Math.abs(latestMonth.growthMoMPct));
          }
          
          // Calculate plan attainment for donut chart (mức đạt kế hoạch)
          if (latestMonth && latestMonth.planAttainmentPct) {
            this.chartData[2].percentage = Math.round(latestMonth.planAttainmentPct);
          }
          
          // Load weeks for latest month and update weekly chart (for both 2024 and 2025)
          this.loadWeeksForMonth(latestMonth);
          if (this.availableWeeks.length > 0) {
            const lastWeek = this.availableWeeks[this.availableWeeks.length - 1];
            this.updateWeeklyChart(lastWeek);
          }
          
          console.log('Latest month:', latestMonth.month + '/' + latestMonth.year);
          console.log('Growth rate:', this.chartData[1].percentage + '%');
          console.log('Plan attainment:', this.chartData[2].percentage + '%');
        }
      },
      error: (error) => console.error('Error loading revenue:', error)
    });
  }

  loadWeeklyTicketData() {
    this.http.get<any>('assets/data/ticketdetail_weekly.json').subscribe({
      next: (data) => {
        if (data.weeks && data.weeks.length > 0) {
          // Store all weeks data
          this.weeklyTicketData = data.weeks;
          
          // Get the latest week as default
          const latestWeek = data.weeks[data.weeks.length - 1];
          
          // Update weekly data - map từ ticketdetail_weekly.json
          this.weeklyData = latestWeek.days.map((day: any) => ({
            day: day.weekday,
            value: day.tickets
          }));
          
          console.log('Weekly ticket data loaded from ticketdetail_weekly.json');
          console.log('Latest week:', latestWeek.week_start, 'to', latestWeek.week_end);
          console.log('Weekly data:', this.weeklyData);
        }
      },
      error: (error) => console.error('Error loading weekly ticket data:', error)
    });
  }

  selectMonth(monthIndex: number) {
    this.selectedMonthIndex = monthIndex;
    const selectedMonth = this.availableMonths[monthIndex];
    
    // Load weeks for this month (for both 2024 and 2025)
    this.loadWeeksForMonth(selectedMonth);
    
    if (this.availableWeeks.length > 0) {
      // Move to week selection step
      this.filterStep = 'week';
    } else {
      // No weekly data, apply month filter directly
      this.applyMonthFilter();
    }
  }

  selectYear(year: number) {
    this.selectedYear = year;
    
    // Update available months based on selected year - show all months
    this.availableMonths = this.allMonthlyData.filter((m: any) => m.year === year);
    
    // Reload tickets and flights data for the selected year
    this.loadTicketsData();
    this.loadFlightsData();
    
    // Reset to latest month of selected year
    if (this.availableMonths.length > 0) {
      this.selectedMonthIndex = this.availableMonths.length - 1;
    }
    
    // Move to month selection step
    this.filterStep = 'month';
  }

  applyYearFilter() {
    // Update available months based on selected year - show all months
    if (this.selectedYear === 2025) {
      this.availableMonths = this.allMonthlyData.filter((m: any) => m.year === 2025);
    } else {
      this.availableMonths = this.allMonthlyData.filter((m: any) => m.year === this.selectedYear);
    }
    
    // Reload tickets and flights data for the selected year
    this.loadTicketsData();
    this.loadFlightsData();
    
    // Reset to latest month of selected year
    if (this.availableMonths.length > 0) {
      this.selectedMonthIndex = this.availableMonths.length - 1;
      const latestMonth = this.availableMonths[this.selectedMonthIndex];
      
      // Update date range display
      this.updateMonthRange(latestMonth);
      
      // Update donut charts
      if (latestMonth.growthMoMPct !== null) {
        this.chartData[1].percentage = Math.round(Math.abs(latestMonth.growthMoMPct));
      }
      
      if (latestMonth.planAttainmentPct) {
        this.chartData[2].percentage = Math.round(latestMonth.planAttainmentPct);
      }
      
      // Load weeks for both 2024 and 2025
      this.loadWeeksForMonth(latestMonth);
      if (this.availableWeeks.length > 0) {
        const lastWeek = this.availableWeeks[this.availableWeeks.length - 1];
        this.updateWeeklyChart(lastWeek);
      } else {
        // Clear weekly data if no weeks found
        this.weeklyData = [
          { day: 'Sunday', value: 0 },
          { day: 'Monday', value: 0 },
          { day: 'Tuesday', value: 0 },
          { day: 'Wednesday', value: 0 },
          { day: 'Thursday', value: 0 },
          { day: 'Friday', value: 0 },
          { day: 'Saturday', value: 0 }
        ];
      }
    }
    
    // Close dropdown and reset to year step
    this.showFilterDropdown = false;
    this.filterStep = 'year';
    
    console.log('Applied year filter:', this.selectedYear);
  }

  loadWeeksForMonth(selectedMonth: any) {
    if (this.weeklyTicketData.length === 0) return;
    
    const year = selectedMonth.year;
    const month = selectedMonth.month;
    
    // Find all weeks that belong to this month
    // A week belongs to a month if its week_end date is in that month
    this.availableWeeks = this.weeklyTicketData.filter((week: any) => {
      const weekEndDate = new Date(week.week_end);
      return weekEndDate.getFullYear() === year && (weekEndDate.getMonth() + 1) === month;
    });
    
    // Select the last week by default
    if (this.availableWeeks.length > 0) {
      this.selectedWeekIndex = this.availableWeeks.length - 1;
    }
    
    console.log('Available weeks for month', month + '/' + year, ':', this.availableWeeks.length);
  }

  selectWeek(weekIndex: number) {
    this.selectedWeekIndex = weekIndex;
  }

  applyMonthFilter() {
    if (this.selectedMonthIndex >= 0 && this.selectedMonthIndex < this.availableMonths.length) {
      const selectedMonth = this.availableMonths[this.selectedMonthIndex];
      
      // Update date range display
      this.updateMonthRange(selectedMonth);
      
      // Update donut charts with selected month data
      if (selectedMonth.growthMoMPct !== null) {
        this.chartData[1].percentage = Math.round(Math.abs(selectedMonth.growthMoMPct));
      }
      
      if (selectedMonth.planAttainmentPct) {
        this.chartData[2].percentage = Math.round(selectedMonth.planAttainmentPct);
      }
      
      // Update weekly chart with selected week (last week by default)
      if (this.selectedWeekIndex >= 0 && this.selectedWeekIndex < this.availableWeeks.length) {
        this.updateWeeklyChart(this.availableWeeks[this.selectedWeekIndex]);
      }
      
      // Close dropdown and reset to year step
      this.showFilterDropdown = false;
      this.filterStep = 'year';
      
      console.log('Applied month filter:', selectedMonth.month + '/' + selectedMonth.year);
    }
  }

  applyWeekFilter() {
    if (this.selectedWeekIndex >= 0 && this.selectedWeekIndex < this.availableWeeks.length) {
      const selectedWeek = this.availableWeeks[this.selectedWeekIndex];
      const selectedMonth = this.availableMonths[this.selectedMonthIndex];
      
      // Update date range display to show week and month
      this.dateRange = `${this.formatWeekRange(selectedWeek)} - Tháng ${selectedMonth.month}/${selectedMonth.year}`;
      
      // Update weekly chart with selected week
      this.updateWeeklyChart(selectedWeek);
      
      // Close dropdown and reset to year step
      this.showFilterDropdown = false;
      this.filterStep = 'year';
      
      console.log('Applied week filter:', selectedWeek.week_start, 'to', selectedWeek.week_end);
    }
  }

  updateWeeklyChart(week: any) {
    if (!week) return;
    
    // Update weekly data with the selected week
    this.weeklyData = week.days.map((day: any) => ({
      day: day.weekday,
      value: day.tickets
    }));
    
    console.log('Updated weekly chart:', week.week_start, 'to', week.week_end);
    console.log('Weekly data:', this.weeklyData);
  }

  updateMonthRange(month: any) {
    this.dateRange = `Tháng ${month.month}/${month.year}`;
  }

  setupChartHover() {
    // Weekly chart tooltip
    const hoverAreas = document.querySelectorAll('.hover-area');
    const tooltip = document.querySelector('.chart-tooltip') as HTMLElement;
    const tooltipDay = document.querySelector('.tooltip-day') as HTMLElement;
    const tooltipValue = document.querySelector('.tooltip-value') as HTMLElement;

    if (tooltip && tooltipDay && tooltipValue) {
      hoverAreas.forEach((area, index) => {
        area.addEventListener('mouseenter', (e: Event) => {
          if (index < this.weeklyData.length) {
            const dayData = this.weeklyData[index];
            tooltipDay.textContent = dayData.day;
            tooltipValue.textContent = `${dayData.value} vé`;
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
      revenueHoverAreas.forEach((area, index) => {
        area.addEventListener('mouseenter', (e: Event) => {
          if (index < this.monthlyRevenue.labels.length) {
            tooltipMonth.textContent = this.monthlyRevenue.labels[index];
            const val2024 = this.monthlyRevenue.data2024[index] || 0;
            const val2025 = this.monthlyRevenue.data2025[index] || 0;
            value2024.textContent = `${this.formatRevenue(val2024)}M VND`;
            value2025.textContent = `${this.formatRevenue(val2025)}M VND`;
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

  getChartStrokeDasharray(percentage: number): string {
    // Backwards-compatible wrapper to new donut helpers
    return this.getDonutStrokeDasharray(percentage);
  }

  // Donut helpers
  donutCircumference(): number {
    return 2 * Math.PI * this.donutRadius;
  }

  getDonutStrokeDasharray(percentage: number): string {
    const circumference = this.donutCircumference();
    const filled = (percentage / 100) * circumference;
    // return filled + remaining to show the filled arc followed by gap
    const remaining = Math.max(0, circumference - filled);
    return `${filled} ${remaining}`;
  }

  // Optional: return stroke-dashoffset if you want to animate from 0 (not used now)
  getDonutStrokeDashoffset(_percentage: number): string {
    return '0';
  }

  toggleDateDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
    if (!this.showFilterDropdown) {
      this.filterStep = 'year'; // Reset to year step when closing
    }
  }

  goBackToYear() {
    this.filterStep = 'year';
  }

  goBackToMonth() {
    this.filterStep = 'month';
  }

  formatWeekRange(week: any): string {
    const startDate = new Date(week.week_start);
    const endDate = new Date(week.week_end);
    
    const formatDate = (date: Date) => {
      return `${date.getDate()}/${date.getMonth() + 1}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  getTotalTicketsForWeek(week: any): number {
    if (!week || !week.days) return 0;
    return week.days.reduce((sum: number, day: any) => sum + day.tickets, 0);
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/admin-login']);
  }

  // Generate smooth SVG path for weekly data
  generateWeeklyPath(): string {
    const points = this.computeWeeklyPoints();

    if (points.length === 0) return '';

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX1 = current.x + (next.x - current.x) * 0.4;
      const controlY1 = current.y;
      const controlX2 = current.x + (next.x - current.x) * 0.6;
      const controlY2 = next.y;
      path += ` C ${controlX1},${controlY1} ${controlX2},${controlY2} ${next.x},${next.y}`;
    }

    return path;
  }

  // Generate area fill path for weekly data
  generateWeeklyAreaPath(): string {
    const points = this.computeWeeklyPoints();
    if (points.length === 0) return '';

    const path = this.generateWeeklyPath();
    const width = 700;
    const height = 220;
    const padding = 80;
    // use the left and right extremes based on padding
    return `${path} L ${width - padding},${height} L ${padding},${height} Z`;
  }

  // Compute point coordinates used by path, points and hover areas
  computeWeeklyPoints(): { x: number; y: number }[] {
    const width = 700;
    const height = 220;
    const padding = 80;
    const maxValue = Math.max(...this.weeklyData.map(d => d.value), 100);

    return this.weeklyData.map((d, i) => {
      const step = (width - padding * 2) / Math.max(this.weeklyData.length - 1, 1);
      const x = padding + (i * step);
      const y = height - ((d.value / maxValue) * (height - 40));
      return { x, y };
    });
  }

  // Helpers for template bindings
  getHoverRectX(i: number): number {
    const points = this.computeWeeklyPoints();
    const width = 700;
    const padding = 80;
    const step = (width - padding * 2) / Math.max(this.weeklyData.length - 1, 1);
    const x = (points[i]?.x ?? (padding + i * step)) - step / 2;
    return Math.max(0, x);
  }

  getHoverRectWidth(): number {
    const width = 700;
    const padding = 80;
    const step = (width - padding * 2) / Math.max(this.weeklyData.length - 1, 1);
    return step;
  }

  getDataPointCx(i: number): number {
    const points = this.computeWeeklyPoints();
    return points[i]?.x ?? 0;
  }

  getDataPointCy(i: number): number {
    const points = this.computeWeeklyPoints();
    return points[i]?.y ?? 0;
  }

  // Format revenue value for display
  formatRevenue(value: number): string {
    return (value / 1000000).toFixed(1);
  }

  // Generate smooth SVG path for monthly revenue
  generateRevenuePath(data: number[]): string {
    const width = 1000;
    const height = 240;
    const paddingX = 50;
    const maxValue = Math.max(...this.monthlyRevenue.data2024, ...this.monthlyRevenue.data2025, 1000000);
    
    const points = data.map((value, i) => {
      const x = paddingX + (i * (width - paddingX * 2) / 11);
      const y = height - ((value / maxValue) * (height - 40));
      return { x, y };
    });

    if (points.length === 0) return '';
    
    let path = `M ${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX1 = current.x + (next.x - current.x) * 0.4;
      const controlY1 = current.y;
      const controlX2 = current.x + (next.x - current.x) * 0.6;
      const controlY2 = next.y;
      path += ` C ${controlX1},${controlY1} ${controlX2},${controlY2} ${next.x},${next.y}`;
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
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Close sidebar when clicking outside (on mobile)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (this.sidebarOpen && sidebar && menuToggle) {
      if (!sidebar.contains(target) && !menuToggle.contains(target)) {
        this.sidebarOpen = false;
      }
    }
  }
}
