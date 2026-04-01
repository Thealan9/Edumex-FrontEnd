import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { EditComponent } from './components/edit/edit.component';
import { Auth } from 'src/app/core/auth';
import {ChangePasswordComponent} from "./components/change-password/change-password.component";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {AddressComponent} from "./components/address/address.component";


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {
  user: any;
  addresses: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private auth: Auth,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data['user'];
    this.loadAddresses();
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

  async openAddressModal(address?: any) {
    const modal = await this.modalCtrl.create({
      component: AddressComponent,
      componentProps: {
        address: address || null
      },
      cssClass: 'address-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.loadAddresses();
    }
  }

  loadAddresses() {
    this.http.get<any[]>(`${environment.apiUrl}/user/addresses`).subscribe(res => {
      this.addresses = res;
    });
  }

  deleteAddress(id: number) {
    this.http.delete(`${environment.apiUrl}/user/addresses/${id}`).subscribe(() => {
      this.loadAddresses();
    });
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
