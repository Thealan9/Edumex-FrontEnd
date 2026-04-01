import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<any> {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  resolve(): Observable<any> {
    return this.auth.yo().pipe(
      catchError(() => {
        this.router.navigateByUrl('/login', { replaceUrl: true });
        return of(null);
      })
    );
  }
}
