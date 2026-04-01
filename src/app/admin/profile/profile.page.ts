import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { EditComponent } from './components/edit/edit.component';
import { Auth } from 'src/app/core/auth';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user: any;

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private auth: Auth,
  ) {}

  ngOnInit() {
    // this.auth.yo().subscribe({
    //   next: (res) => {
    //     this.user = res;
    //     this.loading = false;
    //     //console.log('Usuario:', res);
    //   },
    //   error: () => {
    //     this.loading = false;
    //   }
    // });
    this.user = this.route.snapshot.data['user'];
  }

  async openEdit() {
    const modal = await this.modalCtrl.create({
      component: EditComponent,
      componentProps: {
        user: this.user,
      },
    });
    modal.onDidDismiss().then((res) => {
      if (res.data && res.data.refresh) {
        this.refreshUserData();
      }
    });

    await modal.present();
  }

  async openChangePassword() {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordComponent,
      componentProps: {
        userId: this.user.id,
      },
    });
    modal.onDidDismiss().then((res) => {
      if (res.data && res.data.refresh) {
        this.refreshUserData();
      }
    });

    await modal.present();
  }

  refreshUserData() {
    this.auth.yo().subscribe({
      next: (res) => {
        this.user = res;
      },
      error: (err) => {
        console.error('Error al actualizar perfil', err);
      },
    });
  }
}
