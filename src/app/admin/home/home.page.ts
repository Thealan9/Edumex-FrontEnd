import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { CreateOrderComponent } from "./components/create-order/create-order.component";
import { CreateOutputComponent } from "./components/create-output/create-output.component";

interface DashboardData {
  stats: {
    today_sales: number;
    ebooks_count_today: number;
    individual_books_today: number;
    packages_today: number;
    critical_stock_count: number;
    total_discounts_applied: number;
  };
  charts: {
    weekly: any[];
    top_books: any[];
    sources: {
      physical: number;
      digital: number;
    };
  };
  alerts: any[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  data: DashboardData | null = null;
  loading: boolean = true;

  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public pieChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } }
  };

  private destroy$ = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.http.get<DashboardData>(`${environment.apiUrl}/admin/dashboard-stats`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.data = res;
          this.prepareCharts(res.charts);
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  prepareCharts(charts: any) {
    this.lineChartData = {
      labels: charts.weekly.map((d: any) => d.date),
      datasets: [{
        data: charts.weekly.map((d: any) => d.daily_total),
        borderColor: '#181848',
        backgroundColor: 'rgba(24, 24, 72, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    };

    this.barChartData = {
      labels: charts.top_books.map((b: any) => b.title),
      datasets: [{
        data: charts.top_books.map((b: any) => b.total_sold),
        backgroundColor: '#ffc107',
        borderRadius: 8
      }]
    };

    this.pieChartData = {
      labels: ['Físico', 'Digital'],
      datasets: [{
        data: [charts.sources.physical, charts.sources.digital],
        backgroundColor: ['#181848', '#ffc107'],
        hoverOffset: 4
      }]
    };
  }

  async openCreateOrderModal() {
    const modal = await this.modalCtrl.create({
      component: CreateOrderComponent,
      cssClass: 'book-modal'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) this.loadDashboardData();
  }

  async openCreateOutputModal() {
    const modal = await this.modalCtrl.create({
      component: CreateOutputComponent,
      cssClass: 'book-modal'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) this.loadDashboardData();
  }

  ionViewWillLeave() {
    this.destroy$.next();
    this.destroy$.complete();
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
