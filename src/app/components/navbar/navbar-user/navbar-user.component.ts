import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController, MenuController } from '@ionic/angular';
import { map, Observable } from 'rxjs';
import { Auth } from 'src/app/core/auth';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Cart } from 'src/app/user/services/cart';
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import {CartComponent} from "../../cart/cart.component";

@Component({
  selector: 'app-navbar-user',
  templateUrl: './navbar-user.component.html',
  styleUrls: ['./navbar-user.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule, FormsModule]
})
export class NavbarUserComponent implements OnInit {
  user: any = null;
  isMobile$: Observable<boolean>;
  isCollapsed = false;

  cartItems$: Observable<any[]>;
  cartItemsCount$: Observable<number>;

  constructor(
    private modalCtrl: ModalController,
    private auth: Auth,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public menuCtrl: MenuController,
    public cartService: Cart,
    private http: HttpClient
  ) {
    this.isMobile$ = this.breakpointObserver
      .observe(['(max-width: 1023px)'])
      .pipe(map(result => result.matches));
    this.cartItems$ = this.cartService.cart$;
    this.cartItemsCount$ = this.cartService.cart$.pipe(map(items => items.length));
  }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.cartService.loadDiscountRules();
      } else {
        this.cartService.discountRules = [];
      }
    });
  }

  updateQuantity(item: any, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty > 0) {
      this.cartService.updateQuantity(item.book.id, newQty, item.buy_type, item.book.type);
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: any) {
    this.cartService.removeFromCart(item.book.id, item.buy_type, item.book.type);
  }

  async openCart() {
    await this.menuCtrl.enable(true, 'cart-menu');
    await this.menuCtrl.open('cart-menu');
  }

  async closeCart() {
    await this.menuCtrl.close('cart-menu');
  }

  async openCheckoutModal() {
    await this.closeCart();
    const modal = await this.modalCtrl.create({
      component: CartComponent,
      cssClass: 'book-modal',
      backdropDismiss: false
    });
    await modal.present();
  }

  logout() {
    this.auth.logoutApi().subscribe({
      next: async () => {
        await this.auth.logout();
        this.auth.clearUser();
        this.router.navigateByUrl('/home', {replaceUrl: true});
      },
      error: async () => {
        await this.auth.logout();
        this.auth.clearUser();
        this.router.navigateByUrl('/home', {replaceUrl: true});
      },
    });
  }
}
