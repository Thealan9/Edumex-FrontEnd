import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, finalize } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { AdminLocation, Location } from '../services/admin-location';
import { CreateEditComponent } from './components/create-edit/create-edit.component';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  standalone: false
})
export class LocationPage implements OnInit, OnDestroy {
  allLocations: Location[] = [];
  locations: Location[] = [];

  loading: boolean = false;
  showInactive: boolean = false;

  private refreshSub!: Subscription;

  constructor(
    private adminLocations: AdminLocation,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.refreshSub = this.adminLocations.refresh$.subscribe(() => {
      this.loadLocations();
    });
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  loadLocations(event?: any) {
    this.loading = true;
    this.adminLocations.getLocations().pipe(
      finalize(() => {
        this.loading = false;
        if (event) event.target.complete();
      })
    ).subscribe({
      next: (res) => {
        this.allLocations = res.data;
        this.applyFilter();
      },
      error: () => this.showError('No se pudo cargar la lista de estantes.')
    });
  }

  applyFilter() {
    let filtered = this.showInactive
      ? [...this.allLocations]
      : this.allLocations.filter(loc => loc.active);

    this.locations = filtered.sort((a: any, b: any) => {
      if (a.active && !b.active) return -1;
      if (!a.active && b.active) return 1;
      return 0;
    });
  }

  toggleInactive() {
    this.showInactive = !this.showInactive;
    this.applyFilter();
  }

  async openCreateEdit(location?: Location) {
    const modal = await this.modalCtrl.create({
      component: CreateEditComponent,
      componentProps: { data: location },
      cssClass: 'small-modal'
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.refresh) this.loadLocations();
  }

  async confirmDelete(loc: Location) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar estante?',
      message: `¿Estás seguro de que deseas eliminar el estante ${loc.code}? Esta acción no se puede deshacer.`,
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
            this.deleteLocation(loc.id!);
          }
        }
      ]
    });

    await alert.present();
  }

  private deleteLocation(id: number) {
    this.loading = true;
    this.adminLocations.deleteLocation(id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
      },
      error: () => this.showError('No se pudo eliminar el estante. Es posible que contenga libros asignados.')
    });
  }


  calculatePercent(loc: Location): number {
    if (!loc.max_capacity) return 0;
    const percent = (loc.current_capacity / loc.max_capacity) * 100;
    return Math.min(Math.round(percent), 100);
  }

  getProgressBarClass(loc: Location): string {
    const percent = this.calculatePercent(loc);
    if (percent >= 100) return 'bg-red-600';
    if (percent >= 85) return 'bg-orange-500';
    if (percent >= 50) return 'bg-blue-600';
    return 'bg-emerald-500';
  }

  getCapacityColor(loc: Location): string {
    const percent = this.calculatePercent(loc);
    if (percent >= 100) return 'text-red-600';
    if (percent >= 85) return 'text-orange-600';
    return 'text-blue-700';
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
