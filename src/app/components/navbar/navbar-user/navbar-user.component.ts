import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { map, Observable } from 'rxjs';
import { Auth } from 'src/app/core/auth';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MenuController } from '@ionic/angular';
import { Cart } from 'src/app/user/services/cart';
import {AlertComponent} from "../../alert/alert.component";
import {FormsModule} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import { environment } from 'src/environments/environment';

declare var Stripe: any;
declare var paypal: any;

@Component({
  selector: 'app-navbar-user',
  templateUrl: './navbar-user.component.html',
  styleUrls: ['./navbar-user.component.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule,FormsModule]
})
export class NavbarUserComponent implements OnInit {
  user: any = null;
  isMobile$: Observable<boolean>;
  isCollapsed = false;

  cartItems$: Observable<any[]>;
  cartItemsCount$: Observable<number>;

  savedAddresses: any[] = [];
  selectedAddressId: number | null = null;
  showNewAddressForm: boolean = false;

  isAddressCollapsed = false;

  addressForm = {
    recipient_name: '',
    recipient_phone: '',
    postal_code: '',
    state: '',
    municipality: '',
    locality: '',
    neighborhood: '',
    street: '',
    external_number: '',
    internal_number: '',
    references: '',
    is_default: false
  };

  paymentMethod: 'stripe' | 'paypal' | null = null;
  isProcessing = false;
  stripeInstance: any;
  cardElement: any;

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
        this.loadAddresses();
        this.cartService.loadDiscountRules();
      } else {
        this.savedAddresses = [];
        this.selectedAddressId = null;
        this.cartService.discountRules = [];
      }
    });
  }
  isOrderReady() {
    if (!this.cartService.hasPhysicalItems()) {
      return true;
    }
    if (this.showNewAddressForm) {
      return this.addressForm.recipient_name &&
        this.addressForm.street &&
        this.addressForm.locality &&
        this.addressForm.postal_code;
    }
    return this.selectedAddressId !== null;
  }
  loadAddresses() {
    this.http.get(`${environment.apiUrl}/user/addresses`).subscribe((res: any) => {
      this.savedAddresses = res;
      if (this.savedAddresses.length > 0) {
        const def = this.savedAddresses.find(a => a.is_default);
        this.selectedAddressId = def ? def.id : this.savedAddresses[0].id;
      } else {
        this.showNewAddressForm = true;
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
  get shippingCost(): number {
    return this.cartService.shippingCost;
  }
  get finalTotal(): number {
    return this.cartService.finalTotal;
  }
  get totalSavings(): number {
    return this.cartService.totalSavings;
  }

  async initStripe() {
    this.paymentMethod = 'stripe';

    setTimeout(() => {
      const el = document.getElementById('card-element');
      console.log('¿Existe el elemento?:', !!el);

      if (!el) return;

      if (typeof Stripe === 'undefined') {
        return;
      }

      if (!this.stripeInstance) {
        this.stripeInstance = Stripe('pk_test_51TEvhyAr3NQ3whjmDWmVbfNOf5KMFhvDOP9q4bAvEddoFASLF0EJEWV2ImqAh45RdPfCvVz54ftSm4DaYbn4A34D00dFNZa5A3');
      }

      const elements = this.stripeInstance.elements();

      if (this.cardElement) {
        this.cardElement.destroy();
      }

      this.cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1e293b',
          }
        }
      });

      this.cardElement.mount('#card-element');
    }, 200);
  }

  initPayPal() {
    const container = document.getElementById('paypal-button-container');
    if (container) {
      container.innerHTML = '';
    }

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: this.finalTotal.toFixed(2).toString() } // Asegura 2 decimales
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        this.isProcessing = true;
        const order = await actions.order.capture();
        this.processFinalCheckout('paypal', order.id);
      },
      onError: (err: any) => {
        this.showAlert('Hubo un error con PayPal', 'warning');
        this.isProcessing = false;
      }
    }).render('#paypal-button-container');
  }
  async processStripePayment() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const { token, error } = await this.stripeInstance.createToken(this.cardElement);

    if (error) {
      this.showAlert(error.message, 'warning');
      this.isProcessing = false;
      return;
    }

    this.processFinalCheckout('tarjeta', token.id);
  }

  processFinalCheckout(method: 'tarjeta' | 'paypal', referenceId: string) {
    const hasPhysical = this.cartService.hasPhysicalItems();
    const addressId = hasPhysical ? (this.showNewAddressForm ? null : this.selectedAddressId) : null;
    const addressData = hasPhysical ? (this.showNewAddressForm ? this.addressForm : null) : null;

    this.cartService.checkout(addressId, addressData, method, referenceId).subscribe({
      next: async (res) => {
        this.isProcessing = false;
        await this.closeCart();
        this.resetAddressForm();
        this.showAlert('¡Gracias por tu compra!', 'success');
        this.router.navigate(['/home/pedidos']);
      },
      error: (err) => {
        this.isProcessing = false;
        this.showAlert(err.error?.message || 'Error al procesar el pago', 'warning');
      }
    });
  }

  async openCart() {
    await this.menuCtrl.enable(true, 'cart-menu');
    await this.menuCtrl.open('cart-menu');
  }

  async closeCart() {
    await this.menuCtrl.close('cart-menu');
  }

  resetAddressForm() {
    this.addressForm = {
      recipient_name: '',
      recipient_phone: '',
      postal_code: '',
      state: '',
      municipality: '',
      locality: '',
      neighborhood: '',
      street: '',
      external_number: '',
      internal_number: '',
      references: '',
      is_default: true
    };
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

  async showAlert(message: string, type: 'success' | 'error' | 'warning') {
    const modal = await this.modalCtrl.create({
      component: AlertComponent,
      componentProps: { message, type },
      cssClass: 'small-alert-modal',
      backdropDismiss: false,
    });
    await modal.present();
  }
}
