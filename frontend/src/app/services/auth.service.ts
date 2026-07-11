import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private loggedIn = false;

  constructor(private http: HttpClient) {
    this.loggedIn = !!sessionStorage.getItem('isLoggedIn');
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.success) {
          this.loggedIn = true;
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('userEmail', email);
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  logout(): void {
    this.loggedIn = false;
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
  }
}
