import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private apiUrl = `${environment.apiUrl}/purchase`;

  constructor(private http: HttpClient) {}

  getLocations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/locations`);
  }

  addItem(item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, item);
  }

  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`);
  }
}
