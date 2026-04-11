import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  standalone: false
})
export class AddressComponent implements OnInit {
  @Input() address: any;

  form!: FormGroup;
  isEdit = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {
    if (this.address) {
      this.isEdit = true;
      this.form.patchValue({
        ...this.address,
        is_sn: this.address.external_number === 'S/N'
      });
      this.toggleSN();
    }
  }

  initForm() {
    this.form = this.fb.group({
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
      references: ['', [Validators.required,Validators.maxLength(255)]],
      is_default: [true],
      is_sn: [false]
    });
  }

  toggleSN() {
    const isSn = this.form.get('is_sn')?.value;
    const extControl = this.form.get('external_number');

    if (isSn) {
      extControl?.setValue('');
      extControl?.disable();
    } else {
      extControl?.enable();
    }
  }

  isFormValid() {
    const hasValidExt = !!this.form.get('external_number')?.value || this.form.get('is_sn')?.value;
    return this.form.valid && hasValidExt;
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (!this.isFormValid()) return;

    const addressData = { ...this.form.getRawValue() };
    if (addressData.is_sn) {
      addressData.external_number = 'S/N';
    }

    const url = `${environment.apiUrl}/user/addresses`;
    const request = this.isEdit
      ? this.http.put(`${url}/${this.address.id}`, addressData)
      : this.http.post(url, addressData);

    request.subscribe({
      next: () => {
        this.modalCtrl.dismiss({ refresh: true });
      },
      error: (err) => console.error('Error al guardar dirección', err)
    });
  }
}
