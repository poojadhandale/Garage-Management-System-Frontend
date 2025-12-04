import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServicePageApi, ServiceRecord } from '../../services/servicing-service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CustomerService } from '../../services/customer-service';
import { Service } from '../../services/stock-service';

@Component({
  selector: 'app-servicing',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './servicing.html',
  styleUrl: './servicing.css',
})

export class ServicingComponent implements OnInit {

  username: string | null = null;

  services: ServiceRecord[] = [];
  paginatedServices: ServiceRecord[] = [];
  loading = false;
  showModal = false;
  editMode = false;

  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  currentYear = new Date().getFullYear();

  customers: any[] = [];
  stocks: any[] = [];
  vehicleSearch: string = '';
  stockSearch: string = '';
  filteredCustomers: any[] = [];
  filteredStocks: any[] = [];
  grandTotal: number = 0;

  // service form object  
  currentService: ServiceRecord = {
    customer: { customerName: '', email: '', phone: '', vehicleNo: '' },
    serviceDate: '',
    totalCost: 0,
    remarks: '',
    stocks: []
  };

  constructor(
    public router: Router,
    private api: ServicePageApi,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private customerService: CustomerService,
    private stockService: Service,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      this.username = this.getFormattedUsername();
      this.loadServices();
      this.loadCustomersStockList();
    }
  }

  getFormattedUsername(): string {
    const userData = localStorage.getItem('user');
    if (!userData) return 'User';
    const name = JSON.parse(userData).username || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  loadServices(): void {
    this.loading = true;
    this.api.getAll().subscribe({
      next: (data: ServiceRecord[]) => {
        console.log('✅ Servicing:', data);
        this.services = data;
        this.loading = false;
        this.updatePaginatedServicing
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCustomersStockList() {
    this.customerService.getCustomers().subscribe({
      next: (res: any) => {
        console.log("Loaded Customers:", res);
        this.customers = res;
      }
    });
    this.stockService.getStocks().subscribe({
      next: (res: any) => {
        console.log("Loaded Stocks:", res);
        this.stocks = res;
      }
    });
  }

  selectCustomer(c: any) {
    this.currentService.customer = {
      id: c.id,
      customerName: c.customerName,
      email: c.email,
      phone: c.phone,
      vehicleNo: c.vehicleNo
    };

    this.vehicleSearch = c.vehicleNo;
    this.filteredCustomers = [];
  }

  filterStock() {
    const term = this.stockSearch.toLowerCase().trim();

    if (!term) {
      this.filteredStocks = [];
      return;
    }

    this.filteredStocks = this.stocks.filter(
      (s) => s.itemName.toLowerCase().includes(term)
    );

    console.log("Filtered List:", this.filteredStocks);
  }

  filterVehicle() {
    const term = this.vehicleSearch.toLowerCase().trim();

    if (!term) {
      this.filteredCustomers = [];
      return;
    }

    this.filteredCustomers = this.customers.filter(
      (c) => c.vehicleNo.toLowerCase().includes(term)
    );

    console.log("Filtered List:", this.filteredCustomers);
  }

  filteredServices(): ServiceRecord[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.services;
    return this.services.filter(
      (s) =>
        s.customer.customerName.toLowerCase().includes(term) ||
        s.customer.vehicleNo.toLowerCase().includes(term) ||
        s.remarks.toLowerCase().includes(term)
    );
  }

  updatePaginatedServicing(): void {
    const term = this.searchTerm.toLowerCase().trim();
    let filtered = this.services;
    if (term) {
      filtered = this.services.filter(
        (s) =>
          s.customer.customerName.toLowerCase().includes(term) ||
          s.customer.vehicleNo.toLowerCase().includes(term) ||
          s.remarks.toLowerCase().includes(term)
      );
    }
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedServices = filtered.slice(start, end);
    this.cdr.detectChanges(); // ensure UI sync
  }

  getVisiblePages(): number[] {
    const visibleCount = 5;
    const start = Math.floor((this.currentPage - 1) / visibleCount) * visibleCount + 1;
    const end = Math.min(start + visibleCount - 1, this.totalPages);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }


  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedServicing();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedServicing();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedServicing();
    }
  }

  openModal(record?: ServiceRecord) {
    this.editMode = !!record;
    this.showModal = true;

    if (record) {
      this.currentService = JSON.parse(JSON.stringify(record));
    } else {
      this.currentService = {
        customer: { customerName: '', email: '', phone: '', vehicleNo: '' },
        serviceDate: '',
        totalCost: 0,
        remarks: '',
        stocks: []
      };
    }
  }

  closeModal() {
    this.zone.run(() => (this.showModal = false));
  }

  saveService() {
    const apiCall = this.editMode
      ? this.api.updateService(this.currentService.id!, this.currentService)
      : this.api.addService(this.currentService);

    apiCall.subscribe({
      next: () => {
        this.toastr.success(this.editMode ? 'Service Updated!' : 'Service Added!');
        this.closeModal();
        this.loadServices();
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error('Something went wrong.');
      },
    });
    this.closeModal();
    this.loadServices();
  }

  /** ✅ Delete */
  deleteService(record: ServiceRecord) {
    if (!record.id) return;
    if (!confirm('Delete this service record?')) return;

    this.api.deleteService(record.id).subscribe({
      next: () => {
        this.toastr.success('Service deleted');
        this.loadServices();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.toastr.error('Failed to delete customer.');
      },
    });
  }

  /** ✅ Logout */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      sessionStorage.clear();
    }
    this.router.navigate(['/login']);
  }

  selectStock(s: any) {

    const existing = this.currentService.stocks.find(
      item => item.stockId === s.id
    );

    if (existing) {
      existing.quantityUsed += 1;
    } else {
      this.currentService.stocks.push({
        stockId: s.id,
        stockName: s.itemName,
        quantityUsed: 1,
        price: s.price
      });
    }

    this.stockSearch = "";
    this.filteredStocks = [];
    this.calculateTotal();
  }

  updateQty(index: number, change: number) {
    const item = this.currentService.stocks[index];

    item.quantityUsed += change;

    if (item.quantityUsed <= 0) {
      this.currentService.stocks.splice(index, 1);
    }

    this.calculateTotal();
  }

  removeStock(index: number) {
    this.currentService.stocks.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.grandTotal = this.currentService.stocks
      .reduce((sum, item) => sum + item.price * item.quantityUsed, 0);

    this.currentService.totalCost = this.grandTotal;
  }


  downloadBill() {
    if (!this.currentService.id) {
      alert("Please save service first!");
      return;
    }

    this.api.downloadBill(this.currentService.id).subscribe({
      next: (blob: Blob | MediaSource) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `service-bill-${this.currentService.id}.pdf`;
        a.click();
      },
      error: () => alert("Bill download failed!")
    });
  }
}

