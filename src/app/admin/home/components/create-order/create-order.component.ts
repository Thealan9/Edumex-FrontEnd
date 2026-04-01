import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { PurchaseOrder } from 'src/app/admin/services/purchase-order';
import { finalize } from 'rxjs';
import { AdminUsers } from "../../../services/admin-users";

interface OrderItem {
  book_id: number;
  title: string;
  quantity: number;
  unit_cost: number;
}

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss'],
  standalone: false
})
export class CreateOrderComponent implements OnInit {
  warehousemanId: number | null = null;
  warehousemen: any[] = [];

  supplierName: string = '';
  notes: string = '';
  items: OrderItem[] = [];

  allBooks: Book[] = [];
  filteredBooks: Book[] = []; // <-- Nueva variable para la lista renderizada
  isSubmitting = false;

  constructor(
    private modalCtrl: ModalController,
    private bookService: AdminBooks,
    private poService: PurchaseOrder,
    private userService: AdminUsers
  ) {}

  ngOnInit() {
    this.bookService.getBookNameId().subscribe(res => {
      this.allBooks = Array.isArray(res) ? res : res.data;

      this.filteredBooks = this.allBooks;
    });

    this.userService.loadWarehousemen().subscribe(user => this.warehousemen = user);
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

  addItem(book: Book) {
    // Verificamos si ya existe para no duplicar filas, sino sumar cantidad
    const existingItem = this.items.find(i => i.book_id === book.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.unshift({ // unshift para que aparezca arriba de la tabla
        book_id: book.id!,
        title: book.title,
        quantity: 1,
        unit_cost: 0
      });
    }
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  calculateTotal() {
    return this.items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);
  }

  submitOrder() {
    if (!this.supplierName || this.items.length === 0 || !this.warehousemanId) {
      alert('Por favor complete todos los campos y asigne un responsable.');
      return;
    }
    this.isSubmitting = true;

    const orderData = {
      supplier_name: this.supplierName,
      warehouseman_id: this.warehousemanId,
      notes: this.notes,
      items: this.items
    };

    this.poService.createOrder(orderData)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => this.modalCtrl.dismiss({ success: true }),
        error: (err) => console.error(err)
      });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
