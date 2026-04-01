import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar'; // <-- Importación necesaria
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { Output } from 'src/app/admin/services/output';
import { finalize } from 'rxjs';
import { AdminUsers } from "../../../services/admin-users";

interface OutputItem {
  book_id: number;
  title: string;
  quantity: number;
  location_id: number;
  location_code: string;
  max_available: number;
}

@Component({
  selector: 'app-create-output',
  templateUrl: './create-output.component.html',
  styleUrls: ['./create-output.component.scss'],
  standalone: false
})
export class CreateOutputComponent implements OnInit {
  warehousemanId: number | null = null;
  warehousemen: any[] = [];

  reason: string = '';
  notes: string = '';
  items: OutputItem[] = [];

  allBooks: Book[] = [];
  filteredBooks: Book[] = [];
  isSubmitting = false;

  reasons = [
    'Donación',
    'Daño',
    'Ajuste de Inventario',
    'Otro'
  ];

  selectedBook: Book | null = null;
  availableLocations: any[] = [];
  tempQty: number = 1;
  tempLocationId: number | null = null;

  constructor(
    private modalCtrl: ModalController,
    private bookService: AdminBooks,
    private adminService: Output,
    private userService: AdminUsers,
    private snack: MatSnackBar // <-- Inyectamos el MatSnackBar
  ) {}

  ngOnInit() {
    this.bookService.getBookNameId().subscribe(res => {
      const rawBooks = Array.isArray(res) ? res : res.data;

      this.allBooks = rawBooks.filter((book: any) => {
        const stockTotal = Number(book.inventories_sum_quantity) || 0;
        return stockTotal > 0;
      });

      this.filteredBooks = this.allBooks;
    });

    this.userService.loadWarehousemen().subscribe(user => this.warehousemen = user);
  }
  showToast(message: string, type: 'success' | 'error' | 'warning') {
    this.snack.open(message, '✖', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
    });
  }

  searchBook(event: any) {
    const text = event.target.value?.toLowerCase() || '';

    if (text.trim() === '') {
      this.filteredBooks = this.allBooks;
    } else {
      this.filteredBooks = this.allBooks.filter(b =>
        (b.title && b.title.toLowerCase().includes(text)) ||
        (b.isbn && b.isbn.includes(text))
      );
    }
  }

  get filteredLocations(): any[] {
    if (!this.selectedBook) return [];
    return this.availableLocations.filter(loc =>
      !this.items.some(item => item.book_id === this.selectedBook?.id && item.location_id === loc.id)
    );
  }

  async addItem(book: Book) {
    this.selectedBook = book;
    this.tempLocationId = null;
    this.tempQty = 1;

    this.bookService.getLocationsByBook(book.id!).subscribe(res => {
      this.availableLocations = res.data;
      if(this.availableLocations.length === 0) {
        this.showToast('Este material no tiene existencias registradas en ninguna ubicación.', 'warning');
        this.selectedBook = null;
      }
    });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  confirmAddLocation() {
    const selectedLocId = Number(this.tempLocationId);
    if (!this.selectedBook || !selectedLocId || this.tempQty <= 0) return;

    const loc = this.availableLocations.find(l => Number(l.id) === selectedLocId);
    if (!loc) return;

    if (this.tempQty > loc.current_stock) {
      this.showToast(`Stock insuficiente en el pallet ${loc.code}. Solo hay ${loc.current_stock} disponibles.`, 'error');
      return;
    }

    this.items.unshift({
      book_id: this.selectedBook.id!,
      title: this.selectedBook.title,
      quantity: this.tempQty,
      location_id: loc.id,
      location_code: loc.code,
      max_available: loc.current_stock
    });

    this.selectedBook = null;
    this.tempLocationId = null;
    this.availableLocations = [];
  }

  submitOrder() {
    if (!this.reason || this.items.length === 0 || !this.warehousemanId){
      this.showToast('Por favor complete el motivo, asigne un bodeguero y agregue material.', 'warning');
      return;
    }
    this.isSubmitting = true;

    const orderData = {
      warehouseman_id: this.warehousemanId,
      reason: this.reason,
      notes: this.notes,
      items: this.items
    };

    this.adminService.createOrder(orderData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.showToast('Orden de salida autorizada con éxito.', 'success'); // Opcional: Toast de éxito
          this.modalCtrl.dismiss({ success: true });
        },
        error: (err) => {
          this.showToast('Ocurrió un error al procesar la orden.', 'error'); // Opcional: Toast de error
          console.error(err);
        }
      });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
