import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface DashboardSummary {
  totalCustomers: number;
  totalServices: number;
  totalStocks: number;
  monthlyRevenue: number;
}

export interface MonthlyCount {
  months: string[];
  counts: number[];
}

export interface MonthlyRevenue {
  months: string[];
  revenue: number[];
}

export interface StockUsage {
  labels: string[];
  usage: number[];
}

export interface RecentService {
  customerName: string;
  vehicleNo: string;
  date: string;
  totalCost: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private base = 'http://localhost:8080/api/dashboard';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/summary`, {
      headers: this.getHeaders(),
    });
  }

  getMonthlyServiceCount(): Observable<MonthlyCount> {
    return this.http.get<MonthlyCount>(
      `${this.base}/monthly-service-count`,
      { headers: this.getHeaders() }
    );
  }

  getMonthlyRevenue(): Observable<MonthlyRevenue> {
    return this.http.get<MonthlyRevenue>(
      `${this.base}/monthly-revenue`,
      { headers: this.getHeaders() }
    );
  }

  getStockUsage(): Observable<StockUsage> {
    return this.http.get<StockUsage>(`${this.base}/stock-usage`, {
      headers: this.getHeaders(),
    });
  }

  getRecentServices(limit: number = 8): Observable<RecentService[]> {
    return this.http.get<RecentService[]>(
      `${this.base}/recent-services?limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }
}
