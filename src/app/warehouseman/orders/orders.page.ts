import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import {AlertComponent} from "../../components/alert/alert.component";
import {AlertController, ModalController} from "@ionic/angular";
export interface PickingLocation {
  location_id: number;
  location_code: string;
  quantity_to_pick: number;
}

export interface Book {
  id: number;
  title: string;
  units_per_package: number;
}

export interface OrderItem {
  id: number;
  book_id: number;
  quantity: number;
  buy_type: string;
  book: Book;
  picking_locations: PickingLocation[];
}

export interface Order {
  id: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone:false
})
export class OrdersPage implements OnInit, OnDestroy {
  pendingOrders: Order[] = [];
  private pollingSub?: Subscription;

  constructor(private http: HttpClient,private modalCtrl: ModalController,private alertCtrl: AlertController,) {}

  ngOnInit() {
    this.pollingSub = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.http.get<any[]>(`${environment.apiUrl}/warehouseman/pending-despatch`))
      )
      .subscribe({
        next: (res) => {
          this.pendingOrders = res;
        },
        error: (err) => console.error('Error cargando despacho', err)
      });
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }


  async dispatchOrder(orderId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Despachar Pedido Con',
      inputs: [
        { name: 'company', type: 'radio', label: 'FedEx', value: 'FEDX', checked: true },
        { name: 'company', type: 'radio', label: 'DHL Express', value: 'DHL' },
        { name: 'company', type: 'radio', label: 'Estafeta', value: 'ESTA' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Finalizar',
          handler: (companyValue) => {
            const randomTrack = Math.floor(Math.random() * 8999999999 + 1000000000);
            const trackingString = `${randomTrack}`;
            this.http.post(`${environment.apiUrl}/warehouseman/orders/${orderId}/dispatch`, {
              tracking_company: companyValue,
              tracking_number: trackingString
            }).subscribe(() => {
              this.pendingOrders = this.pendingOrders.filter(o => o.id !== orderId);
              this.showAlert('Pedido enviado correctamente', 'success');
            });
          }
        }
      ]
    });
    await alert.present();
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
}
