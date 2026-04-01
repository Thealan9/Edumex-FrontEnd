import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { User } from 'src/app/interfaces/admin/user.model';
import {Users} from "../../../services/users";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: false
})
export class EditComponent  implements OnInit {
  @Input() user!: User;

  loading = true;
  error: boolean = false;
  isSubmitting = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    last_name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email]],
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
    if(this.user){
      this.form.patchValue({
        name: this.user.name,
        last_name: this.user.last_name,
        email: this.user.email,
      });
      this.loading = false;
    }else{
      this.loading = false;
      this.error = true;
    }
  }

  save() {
    if (this.form.invalid) return;
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const data = {
      ...this.form.getRawValue(),
      role: this.user.role
    } as Partial<User>;

    this.adminUsers.updateUser(this.user.id!, data)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {this.close(true),this.showAlert(res.message, 'success')},
        error: (err) => {
          if (err.status === 409 || err.status === 422) {
            this.showAlert(err.error.message, 'warning');
          } else {
            this.showAlert('Oops, ocurrió un error!', 'error');
          }
        },
      });
  }

  async showAlert(
    message: string,
    type: 'success' | 'error' | 'warning'
  ) {
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
