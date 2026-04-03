import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { finalize } from 'rxjs';
import { AlertComponent } from 'src/app/components/alert/alert.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone:false
})
export class ResetPasswordPage implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  token: string = '';
  email: string = '';

  showPassword = false;
  passwordType = 'password';

  focusedField: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];

      if (!this.token || !this.email) {
        this.showAlert('Enlace inválido o incompleto.', 'error');
        this.router.navigate(['/login']);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.passwordType = this.showPassword ? 'text' : 'password';
  }

  resetPassword() {
    if (this.form.invalid) return;

    if (this.form.value.password !== this.form.value.password_confirmation) {
      this.showAlert('Las contraseñas no coinciden.', 'warning');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      token: this.token,
      email: this.email,
      password: this.form.value.password,
      password_confirmation: this.form.value.password_confirmation
    };

    this.http.post(`${environment.apiUrl}/reset-password`, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.showAlert('Contraseña actualizada con éxito.', 'success');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: () => {
          this.showAlert('El enlace expiró o es inválido. Solicita uno nuevo.', 'error');
        }
      });
  }

  async showAlert(message: string, type: 'success' | 'error' | 'warning') {
    const modal = await this.modalCtrl.create({
      component: AlertComponent,
      componentProps: { message, type },
      cssClass: 'small-alert-modal'
    });
    await modal.present();
    setTimeout(() => modal.dismiss(), 3000);
  }
}
