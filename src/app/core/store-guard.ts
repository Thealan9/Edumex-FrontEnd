import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from './auth';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class storeGuard implements CanActivate {

  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {

    return from(this.auth.getUser()).pipe(
      map(user => {
        if (user) {
          if (user.role === 'admin') {
            return this.router.createUrlTree(['/admin']);
          }
          if (user.role === 'warehouseman') {
            return this.router.createUrlTree(['/warehouseman']);
          }
        }

        return true;
      })
    );
  }
}
