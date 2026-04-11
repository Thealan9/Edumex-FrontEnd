import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  // IMPORTANTE: Se añadió ReactiveFormsModule aquí
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class CartComponent implements OnInit {
  savedAddresses: any[] = [];
  selectedAddressId: number | null = null;
  showNewAddressForm: boolean = false;

  // Convertido a FormGroup
  addressForm!: FormGroup;

  paymentMethod: 'stripe' | 'paypal' | null = null;
  isProcessing = false;
  stripeInstance: any;
  cardElement: any;

  constructor(
    private modalCtrl: ModalController,
    public cartService: Cart,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadAddresses();
  }

  // Se definen las validaciones
  initForm() {
    this.addressForm = this.fb.group({
      recipient_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      recipient_phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      postal_code: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      state: ['', [Validators.required, Validators.maxLength(50)]],
      municipality: ['', [Validators.required, Validators.maxLength(100)]],
      locality: ['', [Validators.required, Validators.maxLength(100)]],
      neighborhood: ['', [Validators.required, Validators.maxLength(100)]],
      street: ['', [Validators.required, Validators.maxLength(100)]],
      external_number: ['', [Validators.maxLength(20)]],
      internal_number: ['', [Validators.maxLength(20)]],
      references: ['', [Validators.required, Validators.maxLength(255)]],
      is_default: [false],
      is_sn: [false]
    });
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

  // Validación simplificada gracias a Reactive Forms
  isOrderReady() {
    if (!this.cartService.hasPhysicalItems()) return true;

    if (this.showNewAddressForm) {
      const hasValidNumber = !!this.addressForm.get('external_number')?.value || this.addressForm.get('is_sn')?.value;
      return this.addressForm.valid && hasValidNumber;
    }

    return this.selectedAddressId !== null;
  }

  // Control de deshabilitado de S/N integrado al FormGroup
  toggleSN() {
    const isSn = this.addressForm.get('is_sn')?.value;
    const extControl = this.addressForm.get('external_number');

    if (isSn) {
      extControl?.setValue('');
      extControl?.disable();
    } else {
      extControl?.enable();
    }
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

    let addressData = null;
    if (hasPhysical && this.showNewAddressForm) {
      // Usamos getRawValue() para incluir campos deshabilitados (como el external_number)
      addressData = { ...this.addressForm.getRawValue() };
      if (addressData.is_sn) {
        addressData.external_number = 'S/N';
      }
    }

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
