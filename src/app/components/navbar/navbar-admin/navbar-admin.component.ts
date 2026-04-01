import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { map, Observable } from 'rxjs';
import { Auth } from 'src/app/core/auth';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-navbar-admin',
  templateUrl: './navbar-admin.component.html',
  styleUrls: ['./navbar-admin.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
})
export class NavbarAdminComponent {
  isMobile$: Observable<boolean>;
  isCollapsed = false;

  constructor(
    private modalCtrl: ModalController,
    private auth: Auth,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isMobile$ = this.breakpointObserver
      .observe(['(max-width: 1023.98px)'])
      .pipe(map(result => result.matches));
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }



  logout() {
    this.auth.logoutApi().subscribe({
      next: async () => {
        await this.auth.logout();
        this.auth.clearUser();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: async () => {
        await this.auth.logout();
        this.auth.clearUser();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
    });
  }
}
