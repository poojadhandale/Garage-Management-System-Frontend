import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  DashboardService,
  DashboardSummary,
  RecentService,
} from '../../services/dashboard-service';
import Chart from 'chart.js/auto';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  username: string | null = null;

  summary: DashboardSummary | null = null;
  recent: RecentService[] = [];

  loading = true;

  chartServiceCount!: Chart;
  chartRevenue!: Chart;
  chartStock!: Chart;

   currentYear = new Date().getFullYear();
   
  @ViewChild('serviceCountCanvas') serviceCountCanvas!: ElementRef;
  @ViewChild('revenueCanvas') revenueCanvas!: ElementRef;
  @ViewChild('stockCanvas') stockCanvas!: ElementRef;

  constructor(
    public router: Router,
    private svc: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const name = JSON.parse(userData).username;
        this.username = name.charAt(0).toUpperCase() + name.slice(1);
      }
      this.loadAll();
    }
  }

  ngAfterViewInit(): void {}

  loadAll() {
    this.loading = true;

    Promise.all([
      this.svc.getSummary().toPromise(),
      this.svc.getMonthlyServiceCount().toPromise(),
      this.svc.getMonthlyRevenue().toPromise(),
      this.svc.getStockUsage().toPromise(),
      this.svc.getRecentServices().toPromise(),
    ])
      .then(([summary, svcCount, revenue, stockUsage, recent]) => {
        this.zone.run(() => {
          this.summary = summary ?? null;
          this.recent = recent ?? [];

          setTimeout(() => {
            if (svcCount) this.initServiceCountChart(svcCount);
            if (revenue) this.initRevenueChart(revenue);
            if (stockUsage) this.initStockChart(stockUsage);
          }, 100);
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
      .catch((err) => {
        console.error('Dashboard load error', err);
        this.zone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      });
  }

  initServiceCountChart(data?: { months: string[]; counts: number[] }) {
    if (!data) return;
    const ctx = this.serviceCountCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartServiceCount?.destroy();

    this.chartServiceCount = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.months,
        datasets: [
          {
            label: 'Services',
            data: data.counts,
            fill: true,
            tension: 0.3,
            backgroundColor: 'rgba(59,154,225,0.12)',
            borderColor: '#3b9ae1',
            pointRadius: 4,
            pointBackgroundColor: '#205295',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  initRevenueChart(data?: { months: string[]; revenue: number[] }) {
    if (!data) return;
    const ctx = this.revenueCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartRevenue?.destroy();

    this.chartRevenue = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.months,
        datasets: [
          {
            label: 'Revenue',
            data: data.revenue,
            backgroundColor: '#205295',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  initStockChart(data?: { labels: string[]; usage: number[] }) {
    if (!data) return;
    const ctx = this.stockCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chartStock?.destroy();

    this.chartStock = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.usage,
            backgroundColor: [
              '#3b9ae1',
              '#205295',
              '#ffb703',
              '#e63946',
              '#7ac142',
              '#8e44ad',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  fmt(v: number) {
    return new Intl.NumberFormat('en-IN').format(v);
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
