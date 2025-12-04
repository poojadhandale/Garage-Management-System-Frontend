import {
  CommonModule,
  isPlatformBrowser,
} from '@angular/common';
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
import { Service, Stock } from '../../services/stock-service';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './stocks.html',
  styleUrls: ['./stocks.css'],
})
export class StocksComponent implements OnInit {
  stocks: Stock[] = [];
  paginatedStocks: Stock[] = [];
  currentStock: Stock = { itemName: '', category: '', quantity: 0, price: 0 };
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
    private api: Service,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      this.username = this.getFormattedUsername();
      this.getStocks(); // ← call directly, no timeout
    }

  }

  getFormattedUsername(): string {
    const userData = localStorage.getItem('user');
    if (!userData) return 'User';
    const name = JSON.parse(userData).username || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /** ✅ Fetch all stocks */
  getStocks(): void {
    this.loading = true;
    this.api.getStocks().subscribe({
      next: (data: Stock[]) => {
        console.log('✅ Stock data received:', data);
        this.stocks = data;
        this.loading = false;
        this.updatePaginatedStocks();
        this.cdr.detectChanges(); // <-- force refresh view
      },
      error: (err: any) => {
        console.error('Error fetching stocks:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }


  /** ✅ Search Filter */
  filteredStocks(): Stock[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.stocks;
    return this.stocks.filter(
      (s) =>
        s.itemName.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
    );
  }

  /** ✅ Pagination */
  updatePaginatedStocks(): void {
    const term = this.searchTerm.toLowerCase().trim();
    let filtered = this.stocks;
    if (term) {
      filtered = this.stocks.filter(
        (s) =>
          s.itemName.toLowerCase().includes(term) ||
          s.category.toLowerCase().includes(term)
      );
    }
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedStocks = filtered.slice(start, end);
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
    this.updatePaginatedStocks();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedStocks();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedStocks();
    }
  }

  /** ✅ Modal Controls */
  openModal(stock?: Stock): void {
    this.zone.run(() => {
      this.showModal = true;
      this.editMode = !!stock;
      this.currentStock = stock
        ? { ...stock }
        : { itemName: '', category: '', quantity: 0, price: 0 };
    });
  }

  closeModal(): void {
    this.zone.run(() => (this.showModal = false));
  }

  /** ✅ Save / Update Stock */
  saveStock(): void {
    const apiCall = this.editMode
      ? this.api.updateStock(this.currentStock.id!, this.currentStock)
      : this.api.addStock(this.currentStock);

    apiCall.subscribe({
      next: (res: any) => {
        this.toastr.success(
          res.message || (this.editMode ? 'Stock updated!' : 'Stock added!')
        );
        this.zone.run(() => {
          this.getStocks();
          this.closeModal();
        });
      },
      error: (err) => {
        console.error('API Error:', err);
        this.toastr.error('Something went wrong.');
      },
    });
  }

  /** ✅ Edit Stock */
  editStock(stock: Stock): void {
    this.openModal(stock);
  }

  /** ✅ Delete Stock */
  deleteStock(stock: Stock): void {
    if (stock.id && confirm(`Delete "${stock.itemName}"?`)) {
      this.api.deleteStock(stock.id).subscribe({
        next: () => {
          this.toastr.success('Stock deleted!');
          this.zone.run(() => this.getStocks());
        },
        error: (err: any) => {
          console.error('Delete error:', err);
          this.toastr.error('Failed to delete stock');
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
