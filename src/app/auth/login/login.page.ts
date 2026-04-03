import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { Auth } from 'src/app/core/auth';
import {Cart} from "../../user/services/cart";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  isSubmitting = false;
  showPassword = false;
  passwordType = 'password';

  // Para animaciones de foco
  focusedField: string = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private modalCtrl: ModalController,
    private cart: Cart
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {}

  async ionViewWillEnter() {
    const token = await this.auth.getToken();
    if (token) this.router.navigateByUrl('/home', { replaceUrl: true });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.passwordType = this.showPassword ? 'text' : 'password';
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const { email, password } = this.form.value;

    this.auth.login({ email, password })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res) => {
          this.cart.sanitizeCartForUser(res.user.customer_type);
          const role = res.user.role;
          if (role === 'admin') this.router.navigateByUrl('/admin', { replaceUrl: true });
          else if (role === 'warehouseman') this.router.navigateByUrl('/warehouseman', { replaceUrl: true });
          else this.router.navigateByUrl('/home', { replaceUrl: true });
        },
        error: (err) => {
          const msg = err.status === 401 ? 'Credenciales inválidas.' : 'Error de conexión.';
          this.showAlert(msg, err.status === 401 ? 'warning' : 'error');
        },
      });
  }

  async showAlert(message: string, type: 'success' | 'error' | 'warning') {
    const modal = await this.modalCtrl.create({
      component: AlertComponent,
      componentProps: { message, type },
      cssClass: 'small-alert-modal',
      backdropDismiss: true
    });
    await modal.present();
    setTimeout(() => modal.dismiss(), 3000);
  }
}
