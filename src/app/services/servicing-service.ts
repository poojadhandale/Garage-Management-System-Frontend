import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


export interface ServiceRecord {
  id?: number;
  customer: {
    id?: number;
    customerName: string;
    email: string;
    phone: string;
    vehicleNo: string;
  };
  serviceDate: string;
  totalCost: number;
  remarks: string;
  stocks: {
    id?: number;
    stockId: number;
    price: number;
    stockName: string;
    quantityUsed: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class ServicePageApi {
  
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

    /** ✅ Get all servicing */
  getAll(): Observable<ServiceRecord[]> {
    return this.http
       .get<any>(`${this.baseUrl}/services`, { headers: this.getHeaders() })
      .pipe(map((res) => res?.data || []));
  }

  /** ✅ Add servicing */
   addService(servicing: ServiceRecord): Observable<any> {
     return this.http.post(`${this.baseUrl}/services`, servicing, {
       headers: this.getHeaders(),
     });
   }
 
   /** ✅ Update servicing */
   updateService(id: number, servicing: ServiceRecord): Observable<any> {
     return this.http.put(`${this.baseUrl}/services/${id}`, servicing, {
       headers: this.getHeaders(),
     });
   }
 
   /** ✅ Delete customer */
   deleteService(id: number): Observable<any> {
     return this.http.delete(`${this.baseUrl}/services/${id}`, {
       headers: this.getHeaders(),
     });
   }

 /** ✅ download Bill */
   downloadBill(id: number): Observable<any> {
     return this.http.post(`${this.baseUrl}/download/${id}`, {
       headers: this.getHeaders(),
     });
   }
 
}
