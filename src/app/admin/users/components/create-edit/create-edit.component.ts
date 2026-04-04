import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AdminUsers } from 'src/app/admin/services/admin-users';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { User } from 'src/app/interfaces/admin/user.model';

const RFC_PATTERN = /^([A-ZÑ&]{3,4})([0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1]))([A-Z\d]{3})$/;
@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss'],
  standalone:false
})
export class CreateEditComponent  implements OnInit {
  @Input() data?: User;

  isEdit = false;
  isSubmitting = false;

  form = this.fb.group({
    name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required,Validators.minLength(10),Validators.maxLength(10)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['user', [Validators.required]],
    customer_type: ['individual', [Validators.required]],
    institution_name: [''],
    tax_id: ['',[Validators.pattern(RFC_PATTERN)]],
    address: [''],
    postal_code: [''],
    active: [true]
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private userService: AdminUsers,
  ) {}

  ngOnInit() {
    this.form.get('role')?.valueChanges.subscribe(role => {
      const phoneControl = this.form.get('phone');
      if (role !== 'user') {
        this.form.get('customer_type')?.setValue('individual');
        phoneControl?.clearValidators();
      } else {
        phoneControl?.setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(10)]);
      }
      phoneControl?.updateValueAndValidity();
    });

    this.form.get('customer_type')?.valueChanges.subscribe(type => {
      const taxControl = this.form.get('tax_id');
      const instNameControl = this.form.get('institution_name');
      const addressControl = this.form.get('address');
      const pcControl = this.form.get('postal_code');

      if (type === 'institutional') {
        taxControl?.setValidators([Validators.required, Validators.pattern(RFC_PATTERN), Validators.minLength(12), Validators.maxLength(12)]);
        instNameControl?.setValidators([Validators.required]);
        addressControl?.setValidators([Validators.required]);
        pcControl?.setValidators([Validators.required]);
      } else {
        taxControl?.reset('');
        taxControl?.clearValidators();
        instNameControl?.reset('');
        instNameControl?.clearValidators();
        addressControl?.reset('');
        addressControl?.clearValidators();
        pcControl?.reset('');
        pcControl?.clearValidators();
      }
      taxControl?.updateValueAndValidity();
      instNameControl?.updateValueAndValidity();
      addressControl?.updateValueAndValidity();
      pcControl?.updateValueAndValidity();
    });
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue(this.data);

      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();

      this.form.get('role')?.disable();
      this.form.get('customer_type')?.disable();
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const rawData = this.form.getRawValue();
    const payload: any = { ...rawData };

    if (payload.role !== 'user') {
      payload.phone = "0000000000";
    }

    if (this.isEdit) {
      if (!payload.password) {
        delete payload.password;
      }
      this.userService.updateUser(this.data!.id!, payload)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (res) => { this.showAlert(res.message, 'success'); this.close(true); },
          error: (err) => this.handleError(err)
        });
    } else {
      this.userService.createUser(payload)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (res) => { this.showAlert(res.message, 'success'); this.close(true); },
          error: (err) => this.handleError(err)
        });
    }
  }

  private handleError(err: any) {
    const message = err.error?.message || 'Error en el servidor';
    this.showAlert(message, 'warning');
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
