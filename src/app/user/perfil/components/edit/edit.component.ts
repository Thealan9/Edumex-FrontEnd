import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { User } from 'src/app/interfaces/admin/user.model';
import { Users } from "../../../services/users";

const RFC_PATTERN = /^([A-ZÑ&]{3,4})([0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1]))([A-Z\d]{3})$/;

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: false
})
export class EditComponent implements OnInit {
  @Input() user!: User;

  loading = true;
  error: boolean = false;
  isSubmitting = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    last_name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    institution_name: [''],
    tax_id: ['', [Validators.pattern(RFC_PATTERN)]],
    address: [''],
    postal_code: ['']
  });

  constructor(
    private fb: FormBuilder,
    private adminUsers: Users,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.loading = true;
    if (this.user) {

      if (this.user.customer_type === 'institutional') {
        this.form.get('tax_id')?.setValidators([Validators.required, Validators.pattern(RFC_PATTERN), Validators.minLength(12), Validators.maxLength(12)]);
        this.form.get('institution_name')?.setValidators([Validators.required]);
        this.form.get('address')?.setValidators([Validators.required]);
        this.form.get('postal_code')?.setValidators([Validators.required]);
      }

      this.form.patchValue({
        name: this.user.name,
        last_name: this.user.last_name,
        email: this.user.email,
        phone: this.user.phone,
        institution_name: this.user.institution_name,
        tax_id: this.user.tax_id,
        address: this.user.address,
        postal_code: this.user.postal_code
      });

      this.loading = false;
    } else {
      this.loading = false;
      this.error = true;
    }
  }

  save() {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const data = {
      ...this.form.getRawValue(),
      role: this.user.role,
      customer_type: this.user.customer_type
    } as Partial<User>;

    this.adminUsers.updateUser(this.user.id!, data)
      .pipe(finalize(() => this.isSubmitting = false))
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
