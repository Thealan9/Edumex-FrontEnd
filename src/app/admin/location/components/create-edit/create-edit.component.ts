import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AdminLocation, Location } from 'src/app/admin/services/admin-location';
import { AlertComponent } from 'src/app/components/alert/alert.component';
@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss'],
  standalone:false
})
export class CreateEditComponent  implements OnInit {
  @Input() data?: Location;

  isEdit = false;
  isSubmitting = false;

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(50)]],
    max_capacity: [0, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private adminLocations: AdminLocation
  ) {}

  ngOnInit() {
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue(this.data);
      this.form.get('code')?.disable();
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const payload = this.form.getRawValue() as Location;

    const request = this.isEdit
      ? this.adminLocations.updateLocation(this.data!.id!, payload)
      : this.adminLocations.storeLocation(payload);

    request.pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          this.showAlert(res.message, 'success');
          this.close(true);
        },
        error: (err) => {
          this.showAlert(err.error?.message || 'Error al guardar el estante', 'warning');
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

  close(refresh = false) {
    this.modalCtrl.dismiss({ refresh });
  }
}
