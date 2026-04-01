import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminDashboardResponse } from 'src/app/interfaces/admin/admin-dashboard.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminDashboard {
  private API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<AdminDashboardResponse>(`${this.API}/admin/dashboard`);
  }


}
