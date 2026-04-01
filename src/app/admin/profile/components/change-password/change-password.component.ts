import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AdminUsers } from 'src/app/admin/services/admin-users';
import { AlertComponent } from 'src/app/components/alert/alert.component';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: false
})
export class ChangePasswordComponent implements OnInit {
  @Input() userId!: number;
  isSubmitting = false;
  loading = false;

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  constructor(
    private fb: FormBuilder,
    private userService: AdminUsers,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.loading = false;
  }

  save() {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.loading = true;

    const payload = {
      password: this.form.get('password')?.value
    };

    this.userService.updatePassword(this.userId, payload)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.loading = false;
      }))
      .subscribe({
        next: (res) => {
          this.close(true);
          this.showAlert(res.message, 'success');
        },
        error: (err) => {
          if (err.status === 409 || err.status === 422) {
            this.showAlert(err.error.message, 'warning');
          } else {
            this.showAlert('Oops, ocurrió un error!', 'error');
          }
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

  close(refresh = false) {
    this.modalCtrl.dismiss({ refresh });
  }
}
