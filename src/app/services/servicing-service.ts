import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

/* ===== REQUEST MODELS ===== */
export interface ServiceItemRequest {
  stockId: number;
  quantityUsed: number;
}

export interface LabourRequest {
  labourDescription: string;
  amount: number;
}

export interface ServicingRequest {
  vehicleId: number;
  serviceDate: string;
  remarks: string;
  totalCost: number;
  insuranceClaim: boolean;
  insuranceCompanyId?: number;

  itemsUsed: {
    stockId: number;
    quantityUsed: number;
  }[];

  labour: {
    labourDescription: string;
    amount: number;
  }[];
}

export interface Vehicle {
  vehicleNo: string;
  model: string;
  customer: {
    id: number;
    customerName: string;
  };
}

/* ===== RESPONSE MODELS ===== */
export interface ServiceRecord {
  id?: number;
  serviceDate: string;
  totalCost: number;
  remarks: string;
  insuranceClaim: boolean;
  insuranceCompanyId: number;
  customer: {
    id: number;
    customerName: string;
  };

  vehicle: {
    id: number;
    vehicleNo: string;
    model: string;
  };

  itemsUsed: {
    id?: number;
    quantityUsed: number;
    stock?: {
      id: number;
      itemName: string;
      price: number;
    };
  }[];

  labour: {
    id?: number;
    labourDescription: string;
    amount: number;
  }[];
}


export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class ServicePageApi {
  
  private baseUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private getHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token') || ''
      : '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  /** ✅ Get all servicing (paginated) */
  getAll(
    page = 0,
    size = 10,
    search = ''
  ): Observable<ApiResponse<PageResponse<ServiceRecord>>> {
    const params: any = { page, size };
    if (search.trim()) params.search = search.trim();

    return this.http.get<ApiResponse<PageResponse<ServiceRecord>>>(
      `${this.baseUrl}/services`,
      { headers: this.getHeaders(), params }
    );
  }

  getVehicles(): Observable<ApiResponse<Vehicle[]>> {
    return this.http.get<ApiResponse<Vehicle[]>>(
      `${this.baseUrl}/vehicles`,
      {
        headers: this.getHeaders()
      });
  }

  /** ✅ Add servicing */
  addService(payload: ServicingRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/services`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  updateService(id: number, service: ServicingRequest): Observable<any> {
    return this.http.put(`${this.baseUrl}/services/${id}`, service, {
      headers: this.getHeaders()
    });
  }

  /** ✅ Delete servicing */
  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/services/${id}`, {
      headers: this.getHeaders()
    });
  }

  /** ✅ Generate bill PDF for a service */
  generateBill(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/services/${id}/bill`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }
}
