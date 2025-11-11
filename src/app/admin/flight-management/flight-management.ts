import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../shared/sidebar/sidebar';

interface Flight {
  id: number;
  flightCode: string;
  airline: string;
  departure: string;
  destination: string;
  takeoffTime: {
    hour: string;
    minute: string;
    day: string;
    month: string;
    year: string;
  };
  landingTime: {
    hour: string;
    minute: string;
    day: string;
    month: string;
    year: string;
  };
  notes: string;
}

@Component({
  selector: 'app-flight-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebarComponent
  ],
  templateUrl: './flight-management.html',
  styleUrls: ['./flight-management.css']
})
export class FlightManagement {
  // Trạng thái của component
  activeTab: string = 'list';
  showDeleteConfirm = false;
  flightToDeleteId: number | null = null;
  showViewModal = false;
  flightToView: Flight | null = null;
  searchTerm: string = '';
  selectedAirline: string = 'all';

  flights: Flight[] = [
    { id: 101, flightCode: 'VJ130', airline: 'Vietjet Air', departure: 'Nội Bài (HAN)', destination: 'Cam Ranh (CXR)', takeoffTime: { hour: '06', minute: '15', day: '10', month: '11', year: '2025' }, landingTime: { hour: '08', minute: '10', day: '10', month: '11', year: '2025' }, notes: 'Chuyến bay sáng sớm' },
    { id: 102, flightCode: 'VN245', airline: 'Vietnam Airlines', departure: 'Đà Nẵng (DAD)', destination: 'Tân Sơn Nhất (SGN)', takeoffTime: { hour: '09', minute: '00', day: '10', month: '11', year: '2025' }, landingTime: { hour: '10', minute: '15', day: '10', month: '11', year: '2025' }, notes: '' },
    { id: 103, flightCode: 'QH102', airline: 'Bamboo Airways', departure: 'Tân Sơn Nhất (SGN)', destination: 'Phú Quốc (PQC)', takeoffTime: { hour: '14', minute: '30', day: '11', month: '11', year: '2025' }, landingTime: { hour: '15', minute: '30', day: '11', month: '11', year: '2025' }, notes: 'Phục vụ đồ ăn nhẹ' },
    { id: 104, flightCode: 'BL550', airline: 'Pacific Airlines', departure: 'Cát Bi (HPH)', destination: 'Đà Lạt (DLI)', takeoffTime: { hour: '17', minute: '00', day: '12', month: '11', year: '2025' }, landingTime: { hour: '18', minute: '50', day: '12', month: '11', year: '2025' }, notes: '' },
    { id: 105, flightCode: 'VU321', airline: 'Vietravel Airlines', departure: 'Phú Bài (HUI)', destination: 'Nội Bài (HAN)', takeoffTime: { hour: '20', minute: '45', day: '13', month: '11', year: '2025' }, landingTime: { hour: '21', minute: '55', day: '13', month: '11', year: '2025' }, notes: 'Chuyến bay tối' }
  ];

  emptyFormFlight: Flight = {
    id: 0,
    flightCode: '',
    airline: '',
    departure: '',
    destination: '',
    takeoffTime: { hour: '00', minute: '00', day: '01', month: '01', year: '2025' },
    landingTime: { hour: '00', minute: '00', day: '01', month: '01', year: '2025' },
    notes: ''
  };

  formFlight: Flight = { ...this.emptyFormFlight };

  // Lọc danh sách chuyến bay để hiển thị ra bảng
  get filteredFlights(): Flight[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.flights
      .filter(f => this.selectedAirline === 'all' || f.airline === this.selectedAirline)
      .filter(f => {
        if (!term) return true;
        const combined = `${f.id} ${f.flightCode} ${f.departure} ${f.destination}`.toLowerCase();
        return combined.includes(term);
      });
  }

  // Lấy danh sách hãng bay duy nhất để đưa vào <select> filter
  get uniqueAirlines(): string[] {
    const set = new Set(this.flights.map(f => f.airline));
    return Array.from(set);
  }

  // Kiểm tra
  get isFormInvalid(): boolean {
    const f = this.formFlight;
    return !f.flightCode.trim() ||
      !f.departure.trim() ||
      !f.airline.trim() ||
      !f.destination.trim();
  }

  // --- Methods (Hàm xử lý sự kiện) ---

  // Chuyển tab
  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'form') {
      this.formFlight = { ...this.emptyFormFlight };
    }
  }

  // Nút "Thêm" ở tab list
  navigateToAddForm() {
    this.formFlight = { ...this.emptyFormFlight };
    this.activeTab = 'form';
  }

  // Nút "Xem" (con mắt)
  viewFlight(flight: Flight) {
    this.flightToView = JSON.parse(JSON.stringify(flight)); // Tạo bản sao
    this.showViewModal = true;
  }

  // Đóng modal xem chi tiết
  closeViewModal() {
    this.showViewModal = false;
    this.flightToView = null;
  }

  // Nút "Sửa" (cây bút)
  editFlight(flight: Flight) {
    this.flightToView = null;
    this.formFlight = JSON.parse(JSON.stringify(flight)); // Copy dữ liệu vào form
    this.activeTab = 'form'; // Chuyển sang tab form
  }

  // Nút "Xóa" (thùng rác)
  promptDelete(id: number) {
    this.flightToDeleteId = id;
    this.showDeleteConfirm = true;
  }

  // Nút "Xóa" trong modal xác nhận
  confirmDelete() {
    if (this.flightToDeleteId !== null) {
      this.flights = this.flights.filter(f => f.id !== this.flightToDeleteId);
    }
    this.cancelDelete();
  }

  // Nút "Hủy" trong modal xác nhận
  cancelDelete() {
    this.flightToDeleteId = null;
    this.showDeleteConfirm = false;
  }

  // Nút "Lưu" trong form
  addFlight() {
    // Tạo ID mới
    this.formFlight.id = this.flights.length ? Math.max(...this.flights.map(f => f.id)) + 1 : 1;
    this.flights.push({ ...this.formFlight });
    this.flights.sort((a, b) => a.id - b.id);
    this.cancelForm();
  }

  // Nút "Chỉnh sửa" trong form
  updateFlight() {
    const index = this.flights.findIndex(f => f.id === this.formFlight.id);
    if (index !== -1) {
      this.flights[index] = { ...this.formFlight };
      this.cancelForm();
    } else {
      alert('Lỗi: Không tìm thấy chuyến bay để cập nhật.');
    }
  }

  // Nút "Hủy" trong form
  cancelForm() {
    this.formFlight = { ...this.emptyFormFlight };
    this.activeTab = 'list';
  }
}