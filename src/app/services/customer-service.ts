import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Vehicle {
  vehicleNo: string;
  model: string;
  customer: {
    id: number;
    customerName: string;
  };
}

export interface Customer {
  id?: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  vehicles: Vehicle[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
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
  getCustomers(
    page: number = 0,
    size: number = 10,
  ): Observable<ApiResponse<PageResponse<Customer>>> {

    const params: any = {
      page,
      size
    };

    return this.http.get<ApiResponse<PageResponse<Customer>>>(
      `${this.baseUrl}/customers`,
      {
        headers: this.getHeaders(),
        params
      }
    );
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
