import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { Customer, CustomerService } from '../../services/customer-service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrls: ['./customers.css'],
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  paginatedCustomer: Customer[] = [];
  currentCustomer: Customer = { customerName: '', email: '', phone: '', vehicleNo: '' };

  username: string | null = null;
  showModal = false;
  editMode = false;
  loading = false;
  searchTerm = '';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  currentYear = new Date().getFullYear();

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
      const userData = localStorage.getItem('user');
      this.username = this.getFormattedUsername();
      this.getCustomers();
      setTimeout(() => this.cdr.detectChanges(), 0);
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
    this.loading = true;
    this.api.getCustomers().subscribe({
      next: (data: Customer[]) => {
        this.zone.run(() => {
          this.customers = data;
          this.loading = false;
          this.toastr.show("Customer saved successfully!");
          this.updatePaginatedCustomers();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** ✅ Search filter */
  filteredCustomers(): Customer[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.customers;
    return this.customers.filter(
      (c) =>
        c.customerName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.vehicleNo.toLowerCase().includes(term)
    );
  }

  updatePaginatedCustomers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    let filtered = this.customers;
    if (term) {
      filtered = this.customers.filter(
        (c) =>
          c.customerName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.vehicleNo.toLowerCase().includes(term)
      );
    }
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedCustomer = filtered.slice(start, end);
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
    this.updatePaginatedCustomers();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedCustomers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedCustomers();
    }
  }

  /** ✅ Modal controls */
  openModal(customer?: any) {
    this.zone.run(() => {
      this.showModal = true;
      this.editMode = !!customer;

      this.currentCustomer = customer
        ? { ...customer }
        : { customerName: '', email: '', phone: '', vehicleNo: '' };

      this.cdr.detectChanges();
    });
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
        this.toastr.success(
          res.message || (this.editMode ? 'Customer updated!' : 'Customer added!')
        );
        this.zone.run(() => {
          this.getCustomers();
          this.closeModal();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error('Something went wrong.');
      },
    });
    this.closeModal();
  }

  /** ✅ Edit Customer */
  editCustomer(customer: Customer): void {
    this.openModal(customer);
  }

  /** ✅ Delete */
  deleteCustomer(customer: Customer): void {
    if (customer.id && confirm(`Delete "${customer.customerName}"?`)) {
      this.api.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.toastr.success('Customer deleted!');
          this.zone.run(() => this.getCustomers());
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.toastr.error('Failed to delete customer.');
        },
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
