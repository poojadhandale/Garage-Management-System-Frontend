import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Stock {
  id?: number;
  itemName: string;
  category: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class Service {
  private baseUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

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

  getStocks(): Observable<Stock[]> {
    return this.http
      .get<any>(`${this.baseUrl}/stocks`, { headers: this.getHeaders() })
      .pipe(map((res) => res?.data || []));
  }

  addStock(stock: Stock): Observable<any> {
    return this.http.post(`${this.baseUrl}/stocks`, stock, {
      headers: this.getHeaders(),
    });
  }

  updateStock(id: number, stock: Stock): Observable<any> {
    return this.http.put(`${this.baseUrl}/stocks/${id}`, stock, {
      headers: this.getHeaders(),
    });
  }

  deleteStock(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/stocks/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
