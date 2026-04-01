import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminTickets {


    private API = environment.apiUrl;
    private _refresh = new Subject<void>();
    refresh$ = this._refresh.asObservable();

    constructor(private http: HttpClient) {}

    get(){
      return this.http.get<any>(`${this.API}/admin/ticketI`);
    }
    getWarehouseRequests(){
      return this.http.get<any>(`${this.API}/admin/ticket/request-aprob`)
    }
    getWarehouseRequest(id: number){
      return this.http.get<any>(`${this.API}/admin/ticket/${id}/request-aprob`)
    }
    getPackageSolutions(){
      return this.http.get<any>(`${this.API}/admin/ticket-detail/solution`)
    }
    getPackageSolution(id: number){
      return this.http.get<any>(`${this.API}/admin/ticket-detail/${id}/solution`)
    }
    createEntry(data: Partial<any>) {
      return this.http.post<any>(`${this.API}/admin/ticket/entry`, data).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }

    createSale(data: Partial<any>) {
      return this.http.post<any>(`${this.API}/admin/ticket/sale`, data).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }
    createRemoved(data: Partial<any>) {
      return this.http.post<any>(`${this.API}/admin/ticket/removed`, data).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }

    createChange(data: Partial<any>) {
      return this.http.post<any>(`${this.API}/admin/ticket/change`, data).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }

    approvePartial(id:number){
      return this.http.post<any>(`${this.API}/admin/ticket/${id}/accept-partial`,{}).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }

    rejectPartial(id:number){
      return this.http.post<any>(`${this.API}/admin/ticket/${id}/reject-partial`,{}).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }

    solutionDamage(id:number,data: Partial<any>){
      return this.http.post<any>(`${this.API}/admin/ticket-detail/${id}/solution-damage`,data).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }

    solutionMissing(id:number,data: Partial<any>){
      return this.http.post<any>(`${this.API}/admin/ticket-detail/${id}/solution-missing`,data).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }

    solutionOther(id:number,data: Partial<any>){
      return this.http.post<any>(`${this.API}/admin/ticket-detail/${id}/solution-other`,data).pipe(
        tap( ()=> this.triggerRefresh())
      );
    }


    triggerRefresh(){
      this._refresh.next();
    }


}
