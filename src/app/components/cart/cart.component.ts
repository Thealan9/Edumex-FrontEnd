import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Cart } from 'src/app/user/services/cart';
import { AlertComponent } from 'src/app/components/alert/alert.component';

declare var Stripe: any;
declare var paypal: any;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CartComponent implements OnInit {
  savedAddresses: any[] = [];
  selectedAddressId: number | null = null;
  showNewAddressForm: boolean = false;

  addressForm = {
    recipient_name: '', recipient_phone: '', postal_code: '',
    state: '', municipality: '', locality: '', neighborhood: '',
    street: '', external_number: '', internal_number: '',
    references: '', is_default: false
  };

  paymentMethod: 'stripe' | 'paypal' | null = null;
  isProcessing = false;
  stripeInstance: any;
  cardElement: any;

  constructor(
    private modalCtrl: ModalController,
    public cartService: Cart,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAddresses();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  loadAddresses() {
    this.http.get(`${environment.apiUrl}/user/addresses`).subscribe((res: any) => {
      this.savedAddresses = res;
      if (this.savedAddresses.length > 0) {
        const def = this.savedAddresses.find((a: any) => a.is_default);
        this.selectedAddressId = def ? def.id : this.savedAddresses[0].id;
      } else {
        this.showNewAddressForm = true;
      }
    });
  }

  isOrderReady() {
    if (!this.cartService.hasPhysicalItems()) return true;
    if (this.showNewAddressForm) {
      return this.addressForm.recipient_name && this.addressForm.street &&
        this.addressForm.locality && this.addressForm.postal_code;
    }
    return this.selectedAddressId !== null;
  }

  async initStripe() {
    this.paymentMethod = 'stripe';
    setTimeout(() => {
      const el = document.getElementById('card-element-modal');
      if (!el || typeof Stripe === 'undefined') return;

      if (!this.stripeInstance) {
        this.stripeInstance = Stripe('pk_test_51TEvhyAr3NQ3whjmDWmVbfNOf5KMFhvDOP9q4bAvEddoFASLF0EJEWV2ImqAh45RdPfCvVz54ftSm4DaYbn4A34D00dFNZa5A3');
      }

      const elements = this.stripeInstance.elements();
      if (this.cardElement) this.cardElement.destroy();

      this.cardElement = elements.create('card', {
        style: { base: { fontSize: '16px', color: '#1e293b' } }
      });
      this.cardElement.mount('#card-element-modal');
    }, 400);
  }

  initPayPal() {
    this.paymentMethod = 'paypal';
    setTimeout(() => {
      const container = document.getElementById('paypal-button-container-modal');
      if (container) container.innerHTML = '';

      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: this.cartService.finalTotal.toFixed(2).toString() } }]
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
      }).render('#paypal-button-container-modal');
    }, 200);
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
        this.closeModal();
        this.showAlert('¡Gracias por tu compra!', 'success');
        this.router.navigate(['/home/pedidos']);
      },
      error: (err) => {
        this.isProcessing = false;
        this.showAlert(err.error?.message || 'Error al procesar el pago', 'warning');
      }
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
