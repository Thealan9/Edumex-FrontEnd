import { Component, inject, OnInit } from '@angular/core';
import { AdminUsers } from '../services/admin-users';
import { User } from 'src/app/interfaces/admin/user.model';
import { Auth } from 'src/app/core/auth';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { ModalController, AlertController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateEditComponent } from "./components/create-edit/create-edit.component";

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: false
})
export class UsersPage implements OnInit {

  users: any[] = [];
  loading = true;
  authUser!: User;

  private snack = inject(MatSnackBar);

  constructor(
    private adminUsers: AdminUsers,
    private auth: Auth,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    const user = await this.auth.getUser();

    if (user) {
      this.authUser = user;
    } else {
      console.warn('No se encontró el usuario');
    }

    this.loadUsers();

    this.adminUsers.refresh$.subscribe(() => {
      this.loadUsers();
    });
  }

  loadUsers() {
    this.loading = true;
    this.adminUsers.getUsers().subscribe({
      next: res => {
        this.users = res;
        this.loading = false;
      },
      error: err => {
        console.error('Error loading users', err);
        this.loading = false;
      }
    });
  }

  canEdit(user: User) {
    return user.id !== this.authUser.id;
  }

  toggleActive(user: User) {
    this.adminUsers.toggleActive(user.id!).subscribe({
      next: (res) => {
        this.showAlert(res.message, 'success');
        this.loadUsers();
      },
      error: (err) => this.showAlert('No se pudo cambiar el estado', 'error')
    });
  }


  async delete(user: User) {
    const userName = user.name ? `a ${user.name}` : 'a este usuario';

    const alert = await this.alertCtrl.create({
      header: '¿Eliminar usuario?',
      message: `¿Estás seguro de que deseas eliminar ${userName}? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'text-slate-500'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'text-red-600 font-bold',
          handler: () => {
            this.executeDelete(user);
          }
        }
      ]
    });

    await alert.present();
  }

  private executeDelete(user: User) {
    this.adminUsers.deleteUser(user.id!).subscribe({
      next: (res) => {
        this.showAlert(res.message, 'success');
        this.loadUsers();
      },
      error: (err) => this.showAlert('No se pudo eliminar el usuario', 'error')
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

  showToast(message: string, type: 'success' | 'error' | 'warning') {
    this.snack.open(message, '✖', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
    });
  }

  async openCreate() {
    const modal = await this.modalCtrl.create({
      component: CreateEditComponent,
      cssClass: 'book-modal'
    });

    modal.onDidDismiss().then((res) => {
    });

    await modal.present();
  }

  async openEdit(user: User) {
    const modal = await this.modalCtrl.create({
      component: CreateEditComponent,
      cssClass: 'book-modal',
      componentProps: {
        data: user
      },
    });
    modal.onDidDismiss().then((res) => {
    });

    await modal.present();
  }

}
