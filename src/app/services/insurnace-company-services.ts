import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface InsuranceCompany {
  id?: number;
  companyName: string;
  contactNumber: string;
  email: string;
  active: boolean;
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

@Injectable({ providedIn: 'root' })
export class InsurnaceCompanyServices {
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
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  getAll(
    page: number = 0,
    size: number = 10,
    searchTerm: string = ''
  ): Observable<ApiResponse<PageResponse<InsuranceCompany>>> {
   const params: any = {
      page,
      size
    };
    if (searchTerm && searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    return this.http.get<ApiResponse<PageResponse<InsuranceCompany>>>(
       `${this.baseUrl}/insurance-companies`, {
      headers: this.getHeaders(),
      params
    }
  );
  }

  add(company: InsuranceCompany): Observable<any> {
    return this.http.post(`${this.baseUrl}/insurance-companies`, company, {
      headers: this.getHeaders()
    });
  }

  update(id: number, company: InsuranceCompany): Observable<any> {
    return this.http.put(`${this.baseUrl}/insurance-companies/${id}`, company, {
      headers: this.getHeaders()
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/insurance-companies/${id}`, {
      headers: this.getHeaders()
    });
  }
}

