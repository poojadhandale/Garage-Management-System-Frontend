import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Customer, CustomerService, Vehicle } from '../../services/customer-service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css'],
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  currentCustomer: Customer = {
    customerName: '',
    email: '',
    phone: '',
    address: '',
    vehicles: [this.createEmptyVehicle()]
  };
  username: string | null = null;
  showModal = false;
  editMode = false;
  loading = false;
  searchTerm = '';

  currentYear = new Date().getFullYear();

  private createEmptyVehicle(): Vehicle {
    return {
      vehicleNo: '',
      model: '',
      customer: {
        id: 0,
        customerName: ''
      }
    };
  }

  constructor(
    public router: Router,
    private api: CustomerService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = this.getFormattedUsername();
      Promise.resolve().then(() => {
        this.getCustomers();
      });
    }
  }
  getFormattedUsername(): string {
    const userData = localStorage.getItem('user');
    if (!userData) return 'User';
    const name = JSON.parse(userData).username || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /** ✅ Fetch all customers */
  getCustomers(): void {
    this.api.getCustomers(
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.customers = res.data.content;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
          if (res.message) {
            this.toastr.success(res.message);
          }

          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
      }
    });
  }

  /** ✅ Search filter */
  filteredCustomers(): Customer[] {
  const term = this.searchTerm.toLowerCase().trim();
  if (!term) return this.customers;

  return this.customers.filter(c =>
    c.customerName?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.vehicles?.some(v =>
      v.vehicleNo?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term)
    )
  );
}

  onSearch(): void {
     this.currentPage = 0; 
     this.getCustomers();
  }

  getVisiblePages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.getCustomers();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getCustomers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.getCustomers();
    }
  }

  addVehicle(): void {
    this.currentCustomer.vehicles.push(this.createEmptyVehicle());
  }

  removeVehicle(index: number): void {
    if (this.currentCustomer.vehicles.length > 1) {
      this.currentCustomer.vehicles.splice(index, 1);
    }
  }

  /** ✅ Modal controls */
  openModal(customer?: Customer): void {
    this.showModal = true;
    this.editMode = !!customer;

    this.currentCustomer = customer
      ? {
        ...customer,
        vehicles: customer.vehicles?.length
          ? customer.vehicles.map(v => ({
            vehicleNo: v.vehicleNo,
            model: v.model,
            customer: { ...v.customer }
          }))
          : [this.createEmptyVehicle()]
      }
      : {
        customerName: '',
        email: '',
        phone: '',
        address: '',
        vehicles: [this.createEmptyVehicle()]
      };
  }

  closeModal() {
    this.zone.run(() => {
      this.showModal = false;
      this.cdr.detectChanges();
    });
  }

  /** ✅ Add / Update customer */
  saveCustomer(): void {
    const apiCall = this.editMode
      ? this.api.updateCustomer(this.currentCustomer.id!, this.currentCustomer)
      : this.api.addCustomer(this.currentCustomer);

    apiCall.subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Operation successful');
        this.zone.run(() => {
          this.getCustomers();
          this.closeModal();
        });
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error(err.error?.message || 'Something went wrong');
      }
    });
    this.closeModal();
  }


  /** ✅ Edit Customer */
  editCustomer(customer: Customer): void {
    this.openModal(customer);
  }

  /** ✅ Delete */
  deleteCustomer(customer: Customer): void {
    if (!customer.id) return;

    if (confirm(`Delete "${customer.customerName}"?`)) {
      this.api.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.toastr.success('Customer deleted!');
          this.getCustomers(); // just reload page data
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.toastr.error('Failed to delete customer.');
        }
      });
    }
  }


  /** ✅ Logout */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      sessionStorage.clear();
    }
    this.router.navigate(['/login']);
  }
}
