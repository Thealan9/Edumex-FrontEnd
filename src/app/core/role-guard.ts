import { Injectable } from '@angular/core';
import { CanMatch, Route, Router, UrlTree } from '@angular/router';
import { Auth } from './auth';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanMatch {

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  canMatch(route: Route): Observable<boolean | UrlTree> {
    const allowedRoles = route.data?.['roles'] as string[];

    if (!allowedRoles) return of(true);

    return from(this.auth.getUser()).pipe(
      map(user => {
        if (!user) return this.router.createUrlTree(['/login']);

        if (!allowedRoles.includes(user.role)) {
          if(user.role === 'admin') return this.router.createUrlTree(['/admin']);
          if(user.role === 'warehouseman') return this.router.createUrlTree(['/warehouseman']);
          return this.router.createUrlTree(['/home']);
        }
        return true;
      })
    );
  }
}
