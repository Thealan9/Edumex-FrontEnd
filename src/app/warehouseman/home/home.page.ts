import { Component, OnInit, OnDestroy } from '@angular/core';
import {forkJoin, Subscription} from 'rxjs';
import { ModalController, NavController } from '@ionic/angular';
import { WarehouseInventory, InventoryMovement } from '../services/warehouse-inventory';
import { MovementComponent } from './components/movement/movement.component';
import { Auth } from 'src/app/core/auth';
import {Router} from "@angular/router";
import {CreateMovementComponent} from "./components/create-movement/create-movement.component";
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  recentMovements: any[] = [];
  private refreshSub!: Subscription;
  pendingOrders: any[] = [];
  pendingOutputs: any[] = [];

  allMovements: any[] = [];
  displayMovements: any[] = [];

  showOnlyMine = true;
  currentPage = 1;
  lastPage = 1;
  currentUser: any;

  constructor(
    private warehouseService: WarehouseInventory,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private auth: Auth,
    private router: Router,
  ) {}

  ngOnInit() {
    this.auth.getUser().then(user => {
      this.currentUser = user;
      this.loadRecentMovements();
      this.loadAllPending();
    });
    this.refreshSub = this.warehouseService.refresh$.subscribe(() => {
      this.loadRecentMovements();
      this.loadAllPending();
    });
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
  }

  loadRecentMovements(page: number = 1) {
    const userIdParam = this.showOnlyMine ? this.currentUser?.id : undefined;

    this.warehouseService.getMyMovements(page, userIdParam).subscribe({
      next: (res) => {
        this.displayMovements = res.data;

        this.currentPage = res.current_page;
        this.lastPage = res.last_page;
      },
      error: (err) => console.error('Error cargando movimientos', err)
    });
  }
  toggleFilter() {
    this.currentPage = 1;
    this.loadRecentMovements(1);
  }

  applyLocalFilter() {
    if (this.showOnlyMine) {
      const userId = this.auth.currentUserValue?.id;
      this.displayMovements = this.allMovements.filter(m => m.user_id === userId);
    } else {
      this.displayMovements = this.allMovements;
    }
  }

  changePage(next: boolean) {
    const targetPage = next ? this.currentPage + 1 : this.currentPage - 1;
    this.loadRecentMovements(targetPage);
  }


  loadAllPending() {
    this.warehouseService.getPendingPurchases().subscribe({
      next: (res) => {
        this.pendingOrders = res;
      },
      error: (err) => console.error('Error en compras:', err)
    });

    this.warehouseService.getPendingOutputs().subscribe({
      next: (res) => {
        this.pendingOutputs = res;
      },
      error: (err) => console.error('Error en salidas:', err)
    });
  }

  async openMovementModal(type: 'input' | 'output') {
    const modal = await this.modalCtrl.create({
      component: CreateMovementComponent,
      componentProps: { type },
      cssClass: 'movement-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.loadRecentMovements();
    }
  }

  logout() {
    this.auth.logoutApi().subscribe({
      next: async () => {
        await this.auth.logout();
        this.auth.clearUser();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: async () => {
        await this.auth.logout();
        this.auth.clearUser();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }

  async receiveBookFromOrder(order: any, item: any, referenceType: 'purchase_order' | 'output_order' = 'purchase_order') {

    const isOutput = referenceType === 'output_order';

    const modal = await this.modalCtrl.create({
      component: MovementComponent,
      componentProps: {
        type: isOutput ? 'output' : 'input',
        pendingOrderData: {
          id: order.id,
          order_number: isOutput ? order.order_number : order.po_number,
          book_id: item.book_id,
          book_title: item.book.title,
          quantity: item.quantity,
          type: referenceType,
          location_id: item.location_id,
          item_id: item.id
        }
      },
      cssClass: 'movement-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.loadAllPending();
    }
  }
}
