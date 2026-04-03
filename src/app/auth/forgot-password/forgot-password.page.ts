import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { finalize } from 'rxjs';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false
})
export class ForgotPasswordPage implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  focusedField: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  sendResetLink() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const email = this.form.value.email;

    this.http.post(`${environment.apiUrl}/forgot-password`, { email })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.showAlert('Te hemos enviado un enlace al correo electrónico para restablecer tu contraseña.', 'success');
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          // Generalmente un 422 o 400 si el correo no existe
          this.showAlert('No pudimos encontrar un usuario con ese correo electrónico.', 'error');
        }
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
