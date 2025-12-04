import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Customer {
  id?: number;
  customerName: string;
  email: string;
  phone: string;
  vehicleNo: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
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

  /** ✅ Get all customers */
  getCustomers(): Observable<Customer[]> {
    return this.http
      .get<any>(`${this.baseUrl}/customers`, { headers: this.getHeaders() })
      .pipe(map((res) => res?.data || []));
  }

  /** ✅ Add customer */
  addCustomer(customer: Customer): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers`, customer, {
      headers: this.getHeaders(),
    });
  }

  /** ✅ Update customer */
  updateCustomer(id: number, customer: Customer): Observable<any> {
    return this.http.put(`${this.baseUrl}/customers/${id}`, customer, {
      headers: this.getHeaders(),
    });
  }

  /** ✅ Delete customer */
  deleteCustomer(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/customers/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
