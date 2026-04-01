import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Auth } from "../../core/auth";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { finalize } from "rxjs";
import { AlertComponent } from "../../components/alert/alert.component";
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const RFC_PATTERN = /^([A-ZÑ&]{3,4})([0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1]))([A-Z\d]{3})$/;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  isSubmitting = false;
  showPassword = false;
  passwordType = 'password';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private router: Router,
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['user'], // Siempre será user para registro público
      customer_type: ['individual', [Validators.required]],
      institution_name: [''],
      tax_id: ['', [Validators.pattern(RFC_PATTERN)]],
      address: [''],
      postal_code: [''],
      active: [true]
    });
  }

  ngOnInit() {
    this.setupInstitutionalValidators();
  }

  setupInstitutionalValidators() {
    this.form.get('customer_type')?.valueChanges.subscribe(type => {
      const fields = ['tax_id', 'institution_name', 'address', 'postal_code'];
      fields.forEach(field => {
        const control = this.form.get(field);
        if (type === 'institutional') {
          control?.setValidators(field === 'tax_id' ? [Validators.required, Validators.pattern(RFC_PATTERN)] : [Validators.required]);
        } else {
          control?.clearValidators();
          control?.reset('');
        }
        control?.updateValueAndValidity();
      });
    });
  }

  onRfcInput(event: any) {
    const val = event.target.value.toUpperCase();
    this.form.get('tax_id')?.setValue(val, { emitEvent: false });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
    this.passwordType = this.showPassword ? 'text' : 'password';
  }

  register() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.form.value;

    this.http.post(`${environment.apiUrl}/register`, payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (res: any) => {
          this.showAlert('¡Cuenta creada! Ya puedes iniciar sesión.', 'success');
          this.router.navigateByUrl('/login');
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al crear la cuenta.';
          this.showAlert(msg, 'error');
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
  }
}
