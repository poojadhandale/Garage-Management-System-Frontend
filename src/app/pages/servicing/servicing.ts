import { HttpClientModule } from '@angular/common/http';
import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import {
  ServicePageApi,
  ServiceRecord
} from '../../services/servicing-service';

import { Stock, Service as StockService } from '../../services/stock-service';

@Component({
  selector: 'app-servicing',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './servicing.html',
  styleUrl: './servicing.css'
})
export class ServicingComponent implements OnInit {

  /* ===== TABLE ===== */
  services: ServiceRecord[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  /* ===== UI ===== */
  username: string | null = null;
  showModal = false;
  loading = true;
  searchTerm = '';
  

  /* ===== LOOKUPS ===== */
  vehicles: any[] = [];
  stocks: Stock[] = [];
  filteredVehicles: any[] = [];
  filteredStocks: Stock[] = [];
  customerSearch = '';
  selectedVehicle: any;
  selectedCustomer: any;
  editingServiceId?: number;
  vehicleSearch = '';
  stockSearch = '';
  showStockDropdown = false;
  /* ===== GST ===== */
  gstPercentage = 18;
  subTotal = 0;
  gstAmount = 0;
  grandTotal = 0;

  /* ===== FORM STATE ===== */
  currentService = {
    serviceDate: '',
    remarks: '',
    itemsUsed: [] as {
      stockId: number;
      price: number;
      quantityUsed: number;
    }[],
    labour: [] as {
      labourDescription: string;
      amount: number;
    }[],
    totalCost: 0
  };
  visiblePages: number[] = [];

  newLabourDesc = '';
  newLabourAmount = 0;

  currentYear = new Date().getFullYear();
  editMode = false;


  constructor(
    private api: ServicePageApi,
    private stockService: StockService,
    private toastr: ToastrService,
    public router: Router,
    private eRef: ElementRef,
    
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.username = this.getFormattedUsername();
    Promise.resolve().then(() => {
    this.getServices();
    this.loadLookups();
    });
  }
}

  getFormattedUsername(): string {
    const userData = localStorage.getItem('user');
    if (!userData) return 'User';
    const name = JSON.parse(userData).username || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /* ===== LOAD ===== */
  getServices(): void {
    this.loading = true; 
    this.api.getAll(
      this.currentPage,
      this.pageSize,
      this.searchTerm
    ).subscribe({
      next: (res) => {
        this.services = res.data.content;
        this.totalPages = res.data.totalPages;
        this.totalElements = res.data.totalElements;
         this.visiblePages = Array.from({ length: this.totalPages }, (_, i) => i);
        this.loading = false;
        if (res.message) {
          this.toastr.success(res.message);
        }
    },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Failed to load services');
      }
    });
  }


  loadLookups(): void {
    this.api.getVehicles().subscribe(res => {
      this.vehicles = res.data || [];
    });

    this.stockService.getStocks().subscribe(res => {
      this.stocks = res.data.content || [];
    });
  }

  /* ===== VEHICLE SEARCH ===== */
  filterVehicle(): void {
    const term = this.vehicleSearch.toLowerCase();
    this.filteredVehicles = this.vehicles.filter(v =>
      v.vehicleNo.toLowerCase().includes(term)
    );
  }

  selectVehicle(v: any): void {
    this.selectedVehicle = v;
    this.selectedCustomer = v.customer;
    this.vehicleSearch = v.vehicleNo;
    this.filteredVehicles = [];
  }

  /* ===== STOCK ===== */
  filterStock(): void {
    const term = this.stockSearch.trim().toLowerCase();

    if (term.length > 0) {
      this.filteredStocks = this.stocks.filter(s =>
        s.itemName.toLowerCase().includes(term)
      );
      this.showStockDropdown = this.filteredStocks.length > 0;
    } else {
      this.filteredStocks = [];
      this.showStockDropdown = false;
    }
  }

  selectStock(s: Stock): void {
    const existing = this.currentService.itemsUsed.find(i => i.stockId === s.id);

    if (existing) {
      existing.quantityUsed++;
    } else {
      this.currentService.itemsUsed.push({
        stockId: s.id!,
        price: s.price,
        quantityUsed: 1
      });
    }

    this.stockSearch = '';           // clear input
    this.filteredStocks = [];        // clear list
    this.showStockDropdown = false;  // hide dropdown

    this.calculateTotals();
  }

  /* ===== TOTAL CALCULATION (FIXED) ===== */
  calculateTotals(): void {
    const itemTotal = this.currentService.itemsUsed.reduce(
      (sum, i) => sum + i.price * i.quantityUsed,
      0
    );

    const labourTotal = this.currentService.labour.reduce(
      (sum, l) => sum + l.amount,
      0
    );

    this.subTotal = itemTotal + labourTotal;
    this.gstAmount = (this.subTotal * this.gstPercentage) / 100;
    this.grandTotal = this.subTotal + this.gstAmount;
    this.currentService.totalCost = this.grandTotal;
  }

  /* ===== LABOUR ===== */
  addLabour(): void {
    if (!this.newLabourDesc || this.newLabourAmount <= 0) return;

    this.currentService.labour.push({
      labourDescription: this.newLabourDesc,
      amount: this.newLabourAmount
    });

    this.newLabourDesc = '';
    this.newLabourAmount = 0;
    this.calculateTotals();
  }

  removeLabour(index: number): void {
    this.currentService.labour.splice(index, 1);
    this.calculateTotals();
  }
  removeItem(index: number): void {
  this.currentService.itemsUsed.splice(index, 1);
  this.calculateTotals(); // if you recalculate totals manually
}

  /* ===== SAVE ===== */
  saveServicing(): void {
    if (!this.selectedVehicle?.id) {
      this.toastr.error('Please select a vehicle');
      return;
    }

    const payload = {
      vehicleId: this.selectedVehicle.id,
      serviceDate: this.currentService.serviceDate,
      remarks: this.currentService.remarks,
      totalCost: this.currentService.totalCost,
      insuranceClaim: false,
      itemsUsed: this.currentService.itemsUsed.map(i => ({
        stockId: i.stockId,
        quantityUsed: i.quantityUsed
      })),
      labour: this.currentService.labour
    };

    const apiCall = this.editMode
      ? this.api.updateService(this.editingServiceId!, payload)
      : this.api.addService(payload);

    apiCall.subscribe({
      next: res => {
        this.toastr.success(res.message || 'Operation successful');
        this.getServices();
        this.closeModal();
      },
      error: () => {
        this.toastr.error('Operation failed');
      }
    });
  }


  /* ===== MODAL ===== */
  openModal(service?: ServiceRecord): void {
    this.showModal = true;
    this.editMode = !!service;

    if (service) {
      // ===== EDIT MODE =====
      this.editingServiceId = service.id;

      this.selectedVehicle = service.vehicle;
      this.selectedCustomer = service.customer;
      this.vehicleSearch = service.vehicle.vehicleNo;

      this.currentService = {
        serviceDate: service.serviceDate,
        remarks: service.remarks,
        itemsUsed: service.itemsUsed
          ?.filter(i => i.stock) // guard
          .map(i => ({
            stockId: i.stock!.id,
            price: i.stock!.price,
            quantityUsed: i.quantityUsed
          })) || [],
        labour: service.labour?.map(l => ({
          labourDescription: l.labourDescription,
          amount: l.amount
        })) || [],
        totalCost: service.totalCost
      };

      this.calculateTotals();

    } else {
      // ===== ADD MODE =====
      this.editingServiceId = undefined;
      this.resetServiceForm();
    }

  }

  resetServiceForm(): void {
    this.selectedVehicle = null;
    this.selectedCustomer = undefined;
    this.vehicleSearch = '';
    this.stockSearch = '';
    this.filteredVehicles = [];
    this.filteredStocks = [];

    this.currentService = {
      serviceDate: '',
      remarks: '',
      itemsUsed: [],
      labour: [],
      totalCost: 0
    };

    this.subTotal = 0;
    this.gstAmount = 0;
    this.grandTotal = 0;
  }

  closeModal(): void {
    this.showModal = false;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    this.currentPage = 0; // reset to first page
    this.getServices();
  }

 getVisiblePages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.getServices();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getServices();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.getServices();
    }
  }

  getStockName(stockId: number): string {
    return this.stocks.find(s => s.id === stockId)?.itemName || '';
  }

  deleteService(service: ServiceRecord): void {
    if (!service.id) return;
    if (confirm(`Delete "${service.vehicle.vehicleNo}"?`)) {
      this.api.deleteService(service.id).subscribe({
        next: () => {
          this.toastr.success('Deleted successfully');
          this.getServices();
        },
        error: () => {
          this.toastr.error('Failed to delete service');
        }
      });
    }
  }
  increaseQty(item: any) {
    item.quantityUsed++;
    this.recalculateTotals();
  }

  decreaseQty(item: any) {
    if (item.quantityUsed > 1) {
      item.quantityUsed--;
      this.recalculateTotals();
    }
  }
  recalculateTotals() {
    this.subTotal = this.currentService.itemsUsed.reduce(
      (sum, item) => sum + item.price * item.quantityUsed,
      0
    );

    const labourTotal = this.currentService.labour.reduce(
      (sum, l) => sum + l.amount,
      0
    );

    this.gstAmount = (this.subTotal * this.gstPercentage) / 100;
    this.grandTotal = this.subTotal + this.gstAmount + labourTotal;
  }

}
