import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  static getFormattedUsername() {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'http://localhost:8080/api/auth'; // base API path

  constructor(private http: HttpClient) { }

  // ✅ Login API call
  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });


    return this.http.post(`${this.baseUrl}/login`, { username, password }, { headers }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          // Save data in localStorage on every login
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user || { username }));
          localStorage.setItem('userData', JSON.stringify(response));
          localStorage.setItem('loginTime', new Date().toISOString());
        }
      })
    );
  }


  // ✅ Logout (clear storage)
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('userData');
  }

  // ✅ Get token (for headers/interceptors)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Check if logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // ✅ Get user info
  getUser(): any {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
}
