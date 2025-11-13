import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../shared/sidebar/sidebar';
import { AdminHeader } from '../shared/header/admin-header/admin-header';

interface Airline {
  airlineCode: string;
  airlineName: string;
  country: string;
  hotline: string;
  commissionRate: number;
  status: string;
  notes?: string;
  id?: number;
}

@Component({
  selector: 'app-airline-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebarComponent,
    AdminHeader
  ],
  templateUrl: './airline-management.html',
  styleUrls: ['./airline-management.css']
})
export class AirlineManagement implements OnInit {
  activeTab: string = 'list';
  showDeleteConfirm = false;
  airlineToDeleteId: string | null = null;
  showViewModal = false;
  airlineToView: Airline | null = null;
  searchTerm: string = '';
  selectedAirline: string = 'all';
  airlines: Airline[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;

  emptyFormAirline: Airline = {
    airlineCode: '',
    airlineName: '',
    country: '',
    hotline: '',
    commissionRate: 0,
    status: 'Đang hợp tác'
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadAirlinesData();
  }

  loadAirlinesData(): void {
    this.http.get<Airline[]>('assets/data/airlines.json').subscribe((data) => {
      this.airlines = data;
    });
  }

  // Lọc danh sách hãng bay
  get filteredAirlines(): Airline[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.airlines
      .filter(f => this.selectedAirline === 'all' || f.status === this.selectedAirline)
      .filter(f => {
        if (!term) return true;
        const combined = `${f.airlineCode} ${f.airlineName} ${f.country}`.toLowerCase();
        return combined.includes(term);
      });
  }

  // Lọc và phân trang
  get paginatedFlights(): Airline[] {
    if (this.filteredAirlines.length === 0) {
      return [];  // Trả về mảng rỗng nếu không có dữ liệu
    }
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAirlines.slice(start, end);
  }

  // Tổng số trang
  get totalPages(): number {
    return Math.ceil(this.filteredAirlines.length / this.itemsPerPage);
  }

  get isFormInvalid(): boolean {
    const f = this.emptyFormAirline;
    return !f.airlineCode.trim() || !f.airlineName.trim() || !f.country.trim() || !f.hotline.trim();
  }

  // Thay đổi tìm kiếm
  onSearchChange(newValue: string): void {
    this.searchTerm = newValue;
    this.currentPage = 1;
  }

  // Thay đổi lọc
  onAirlineChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      this.selectedAirline = selectElement.value;
      this.currentPage = 1;
    }
  }
  // Chuyển đến trang tiếp theo
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Chuyển đến trang trước
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  viewAirline(airline: Airline) {
    this.airlineToView = JSON.parse(JSON.stringify(airline)); // Tạo bản sao để tránh thay đổi dữ liệu gốc
    this.showViewModal = true; // Hiển thị modal xem chi tiết hãng bay
  }

  editAirline(airline: Airline) {
    this.airlineToView = null; // Đặt lại airlineToView vì đang sửa, không cần thông tin xem
    this.emptyFormAirline = JSON.parse(JSON.stringify(airline)); // Copy dữ liệu vào form chỉnh sửa
    this.activeTab = 'form'; // Chuyển sang tab form để chỉnh sửa
  }

  promptDelete(airlineCode: string) {
    this.airlineToDeleteId = airlineCode; // Lưu mã hãng bay cần xóa
    this.showDeleteConfirm = true; // Hiển thị modal xác nhận xóa
  }

  confirmDelete() {
    if (this.airlineToDeleteId !== null) {
      this.airlines = this.airlines.filter(a => a.airlineCode !== this.airlineToDeleteId); // Xóa hãng bay khỏi danh sách
    }
    this.cancelDelete(); // Đóng modal xác nhận
  }

  cancelDelete() {
    this.airlineToDeleteId = null; // Đặt lại giá trị airlineToDeleteId
    this.showDeleteConfirm = false; // Ẩn modal xác nhận xóa
  }

  closeViewModal() {
    this.showViewModal = false;  // Đặt trạng thái hiển thị modal về false
    this.airlineToView = null;   // Xóa thông tin hãng bay đang xem
  }

  cancelForm() {
    this.emptyFormAirline = { ...this.emptyFormAirline }; // Đặt lại form về giá trị ban đầu
    this.activeTab = 'list'; // Quay lại tab danh sách
  }

  // Thêm một hãng bay mới vào danh sách  
  addAirline() {
    this.emptyFormAirline.airlineCode = this.emptyFormAirline.airlineCode.toUpperCase();
    this.airlines.push({ ...this.emptyFormAirline });
    this.airlines.sort((a, b) => a.airlineCode.localeCompare(b.airlineCode));
    this.cancelForm();
  }

  // Cập nhật thông tin hãng bay
  updateAirline() {
    const index = this.airlines.findIndex(a => a.airlineCode === this.emptyFormAirline.airlineCode);
    if (index !== -1) {
      this.airlines[index] = { ...this.emptyFormAirline };
      this.cancelForm();
    } else {
      alert('Lỗi: Không tìm thấy hãng bay để cập nhật.');
    }
  }

  // Chuyển sang tab form để thêm hãng bay mới
  navigateToAddForm() {
    this.emptyFormAirline = { ...this.emptyFormAirline };
    this.activeTab = 'form';
  }

  // Chuyển giữa các tab
  switchTab(tab: string) {
    this.activeTab = tab;  // Cập nhật giá trị activeTab để chuyển tab
    if (tab === 'form') {
      this.emptyFormAirline = { ...this.emptyFormAirline }; // Đặt lại form về giá trị ban đầu khi chuyển sang tab form
    }
  }
}
