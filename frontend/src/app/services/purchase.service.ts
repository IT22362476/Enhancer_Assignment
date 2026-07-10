import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private apiUrl = 'http://localhost:5078/api/purchase';

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
