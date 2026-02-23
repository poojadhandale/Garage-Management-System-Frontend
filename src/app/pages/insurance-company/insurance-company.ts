import {
  Component,
  ChangeDetectorRef,
  Inject,
  NgZone,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
 InsuranceCompany, InsurnaceCompanyServices
} from '../../services/insurnace-company-services';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './insurance-company.html',
  styleUrls: ['./insurance-company.css']
})
export class InsuranceComponent implements OnInit {
  companies: InsuranceCompany[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  currentCompany: InsuranceCompany = {
    companyName: '',
    contactNumber: '',
    email: '',
    active: false
  };
  username: string | null = null;
  showModal = false;
  editMode = false;
  loading = false;
  searchTerm = '';

  currentYear = new Date().getFullYear();

  constructor(
    private api: InsurnaceCompanyServices,
    private toastr: ToastrService,
    public router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.username = this.getFormattedUsername();
      Promise.resolve().then(() => {
        this.getCompanies();
      });
    }
  }

  getFormattedUsername(): string {
    const userData = localStorage.getItem('user');
    if (!userData) return 'User';
    const name = JSON.parse(userData).username || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getCompanies(): void {
    this.api.getAll(
      this.currentPage,
      this.pageSize,
      this.searchTerm
    ).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.companies = res.data.content;
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

  onSearch(): void {
    this.currentPage = 0; // reset to first page
    this.getCompanies();
  }

  getVisiblePages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.getCompanies();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getCompanies();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.getCompanies();
    }
  }

  openModal(company?: InsuranceCompany): void {
    this.showModal = true;
    this.editMode = !!company;
    this.currentCompany = company
      ? { ...company }
      : {
        companyName: '',
        contactNumber: '',
        email: '',
        active: false
      };
    this.cdr.detectChanges();
  }

  closeModal() {
    this.zone.run(() => {
      this.showModal = false;
      this.cdr.detectChanges();
    });
  }

  saveCompany(): void {
    const apiCall = this.editMode
      ? this.api.update(this.currentCompany.id!, this.currentCompany)
      : this.api.add(this.currentCompany);

    apiCall.subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Saved successfully');
        this.zone.run(() => {
          this.getCompanies();
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

  deleteCompany(company: InsuranceCompany): void {
    if (!company.id) return;
    if (confirm(`Delete "${company.companyName}"?`)) {
      this.api.delete(company.id).subscribe({
        next: () => {
          this.toastr.success('Deleted');
          this.getCompanies();
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.toastr.error('Failed to delete companies.');
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
