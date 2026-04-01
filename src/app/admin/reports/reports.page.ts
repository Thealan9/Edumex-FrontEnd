import { Component, OnInit } from '@angular/core';
import { AdminReports, InventoryReportItem, FinancialReportItem } from '../services/admin-reports';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: false
})
export class ReportsPage implements OnInit {
  reportData: InventoryReportItem[] = [];
  financialData: FinancialReportItem[] = [];
  totalesFinancieros: any = null;

  activeTab: string = 'inventory';
  periodo: string = '';
  loading: boolean = false;

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      x: { stacked: false },
      y: { beginAtZero: true }
    }
  };

  constructor(private reportsService: AdminReports) {}

  ngOnInit() {
    this.loadCurrentTab();
  }

  loadCurrentTab() {
    if (this.activeTab === 'inventory') {
      this.loadInventoryReport();
    } else {
      this.loadFinancialReport();
    }
  }

  loadInventoryReport() {
    this.loading = true;
    this.reportsService.getInventoryReport(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (res) => {
          this.reportData = res.data;
          this.periodo = res.periodo;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  loadFinancialReport() {
    this.loading = true;
    this.reportsService.getFinancialReport(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (res) => {
          this.financialData = res.data;
          this.totalesFinancieros = res.totales;
          this.periodo = res.periodo;
          this.preparePerformanceChart(res.totales);
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  preparePerformanceChart(totales: any) {
    this.barChartData = {
      labels: [this.periodo],
      datasets: [
        { data: [totales.ingresos_totales], label: 'Ventas ($)', backgroundColor: '#181848' },
        { data: [totales.inversion_compras], label: 'Inversión ($)', backgroundColor: '#ef4444' },
        { data: [totales.utilidad_neta], label: 'Utilidad ($)', backgroundColor: '#10b981' }
      ]
    };
  }

  onFilterChange() {
    this.loadCurrentTab();
  }

  segmentChanged(event: any) {
    this.activeTab = event.detail.value;
    this.loadCurrentTab();
  }

  async exportToPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFillColor(24, 24, 72);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUMEX', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SISTEMA DE CONTROL EDITORIAL Y LOGÍSTICO', 14, 28);
    doc.setFontSize(12);
    doc.text(this.periodo.toUpperCase(), pageWidth - 60, 25);
    doc.setTextColor(24, 24, 72);
    doc.setFontSize(14);
    const subTitle = this.activeTab === 'inventory' ? 'MOVIMIENTOS DE INVENTARIO' : 'RENDIMIENTO FINANCIERO';
    doc.text(subTitle, 14, 55);

    if (this.activeTab === 'inventory') {
      autoTable(doc, {
        startY: 65,
        head: [['ISBN', 'LIBRO', 'TIPO', 'INICIAL', 'ENT.', 'SAL.', 'FINAL']],
        body: this.reportData.map(i => [i.isbn, i.titulo, i.tipo, i.stock_inicial, i.entradas, i.salidas, i.stock_final]),
        headStyles: { fillColor: [24, 24, 72] }
      });
    } else {
      // --- NUEVO: RESUMEN FINANCIERO EN EL PDF ---
      doc.setFontSize(10);
      doc.text(`Venta Bruta: $${this.totalesFinancieros.venta_bruta.toFixed(2)}`, 14, 65);
      doc.setTextColor(220, 38, 38); // Rojo
      doc.text(`Descuentos: -$${this.totalesFinancieros.descuentos_totales.toFixed(2)}`, 14, 72);
      doc.setTextColor(24, 24, 72); // Navy
      doc.text(`Ingresos Netos: $${this.totalesFinancieros.ingresos_totales.toFixed(2)}`, 14, 79);

      doc.text(`Inversión del Mes: $${this.totalesFinancieros.inversion_compras.toFixed(2)}`, 100, 65);
      doc.text(`Inversión Recuperada: ${this.totalesFinancieros.porcentaje_recuperacion.toFixed(1)}%`, 100, 72);

      doc.setTextColor(16, 185, 129); // Verde
      doc.setFont('helvetica', 'bold');
      doc.text(`Ganancia mensual: $${this.totalesFinancieros.utilidad_neta.toFixed(2)}`, 100, 79);
      doc.setFont('helvetica', 'normal');

      autoTable(doc, {
        startY: 85,
        head: [['PRODUCTO', 'VOL. (F/D)', 'VENTA NETA', 'UTILIDAD']],
        body: this.financialData.map(i => [
          i.titulo,
          `${i.unidades_fisicas}F / ${i.unidades_digitales}E`,
          `$${i.total_neto}`,
          `$${i.ganancia_bruta_item}`
        ]),
        headStyles: { fillColor: [48, 72, 120] }
      });
    }

    const finalY = (doc as any).lastAutoTable.finalY + 30;
    doc.setDrawColor(200);
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.text('Reporte EDUMEX', pageWidth / 2, 285, { align: 'center' });

    doc.save(`EDUMEX_${this.activeTab}_${this.periodo.replace(' ', '_')}.pdf`);
  }
}
