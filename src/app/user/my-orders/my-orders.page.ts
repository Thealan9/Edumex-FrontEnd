import { Component, OnInit } from '@angular/core';
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
  standalone: false
})
export class MyOrdersPage implements OnInit {
  orders: any[] = [];
  selectedOrder: any = null;
  expandedItemId: number | null = null;

  statusLabels: any = {
    'paid': 'Preparando en Bodega',
    'shipped': 'Entregado a Paquetería',
    'in_transit': 'En camino a tu domicilio',
    'delivered': '¡Entregado con éxito!'
  };

  constructor(private http: HttpClient, private toastCtrl: ToastController) {}

  ngOnInit() {
    this.loadMyOrders();
  }

  loadMyOrders() {
    this.http.get<any[]>(`${environment.apiUrl}/user/my-orders`).subscribe(res => {
      this.orders = res;
    });
  }

  getCodesForItem(ebookId: number) {
    return this.selectedOrder.ebook_purchases.filter((p: any) => p.ebook_id === ebookId);
  }

  toggleEbookCodes(itemId: number) {
    this.expandedItemId = this.expandedItemId === itemId ? null : itemId;
  }

  getItemData(item: any) {
    return item.book ? item.book : item.ebook;
  }

  getStatusStep(status: string): number {
    const steps: any = { 'paid': 1, 'shipped': 2, 'in_transit': 3, 'delivered': 4 };
    return steps[status] || 1;
  }

  viewDetail(order: any) {
    this.selectedOrder = order;
    this.expandedItemId = null;
  }

  closeDetail() {
    this.selectedOrder = null;
  }

  getPlatformIcon(platform: string): string {
    const icons: any = {
      'Amazon Kindle': 'logo-amazon',
      'Google Play Libros': 'logo-google-playstore',
      'Apple Books': 'logo-apple',
      'Propia': 'globe-outline'
    };
    return icons[platform] || 'cloud-download-outline';
  }

  async copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    const toast = await this.toastCtrl.create({
      message: 'Código copiado al portapapeles',
      duration: 1000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}
