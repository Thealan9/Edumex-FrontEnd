import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Book } from 'src/app/admin/services/admin-books';
import { tap } from 'rxjs/operators';

export interface CartItem {
  book: Book;
  quantity: number;
  buy_type: 'unit' | 'package';
}

export interface VolumeDiscount {
  min_quantity: number;
  max_quantity: number | null;
  discount_percentage: number;
  is_institutional: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class Cart {
  private items: CartItem[] = [];
  private _cart = new BehaviorSubject<CartItem[]>([]);
  cart$ = this._cart.asObservable();
  public discountRules: VolumeDiscount[] = [];
  constructor(private http: HttpClient) {
    this.loadCart();
    this.loadDiscountRules();
  }

  private loadCart() {
    const saved = localStorage.getItem('edumex_cart');
    if (saved) {
      this.items = JSON.parse(saved);
      this._cart.next([...this.items]);
    }
  }

  public sanitizeCartForUser(customerType: string | undefined | null) {
    if (customerType === 'individual') {
      const initialLength = this.items.length;

      this.items = this.items.filter(item => item.buy_type !== 'package');

      if (this.items.length !== initialLength) {
        this.notify();
      }
    }
  }

  public loadDiscountRules() {

    this.http.get<any>(`${environment.apiUrl}/user/discounts`).subscribe({
      next: (res) => {
        this.discountRules = res.data || res;
      },
      error: (err) => {
        console.error('No se pudieron cargar las reglas de descuento', err);
      }
    });
  }

  addToCart(book: Book, buy_type: 'unit' | 'package' = 'unit') {
    const index = this.items.findIndex(i =>
      i.book.id === book.id &&
      i.buy_type === buy_type &&
      i.book.type === book.type
    );

    if (index > -1) {
      this.items[index].quantity += 1;
    } else {
      this.items.push({ book, quantity: 1, buy_type });
    }
    this.notify();
  }

  updateQuantity(bookId: number, quantity: number, buyType: 'unit' | 'package', type: string) {
    const index = this.items.findIndex(i =>
      i.book.id === bookId &&
      i.buy_type === buyType &&
      i.book.type === type
    );

    if (index > -1) {
      if (quantity <= 0) {
        this.removeFromCart(bookId, buyType, type);
      } else {
        this.items[index].quantity = quantity;
        this.notify();
      }
    }
  }

  removeFromCart(bookId: number, buyType: 'unit' | 'package', type: string) {
    this.items = this.items.filter(i =>
      !(i.book.id === bookId && i.buy_type === buyType && i.book.type === type)
    );
    this.notify();
  }

  get subtotal(): number {
    return this.items.reduce((acc, item) => {
      const book = item.book as any;
      const price = item.book.type === 'ebook'
        ? (Number(book.price) || 0)
        : (item.buy_type === 'package' ? (Number(book.price_package) || 0) : (Number(book.price_unit) || 0));

      return acc + (price * item.quantity);
    }, 0);
  }

  get totalSavings(): number {
    let savings = 0;
    this.items.forEach(item => {
      if (item.buy_type === 'unit' && item.book.type === 'physical') {
        const rule = this.discountRules.find(r =>
          item.quantity >= r.min_quantity &&
          (r.max_quantity === null || item.quantity <= r.max_quantity)
        );

        if (rule) {
          const itemPrice = Number(item.book.price_unit) || 0;
          const itemSubtotal = itemPrice * item.quantity;
          savings += itemSubtotal * (rule.discount_percentage / 100);
        }
      }
    });
    return savings;
  }

  get amountAfterDiscount(): number {
    return this.subtotal - this.totalSavings;
  }

  get shippingCost(): number {
    if (!this.hasPhysicalItems()) return 0;
    const baseParaEnvio = this.subtotal;

    if (baseParaEnvio === 0) return 0;

    return baseParaEnvio >= 299 ? 0 : 129;
  }

  get finalTotal(): number {
    return this.amountAfterDiscount + this.shippingCost;
  }

  checkout(addressId: number | null, addressData: any = null, paymentMethod: string, paymentId: string): Observable<any> {
    const payload = {
      address_id: addressId,
      address_data: addressData,
      payment_method: paymentMethod,
      payment_id: paymentId,
      items: this.items.map(i => ({
        id: i.book.id,
        quantity: i.quantity,
        buy_type: i.buy_type,
        type: i.book.type
      }))
    };
    return this.http.post(`${environment.apiUrl}/user/orders`, payload).pipe(
      tap(() => this.clearCart())
    );
  }

  clearCart() {
    this.items = [];
    localStorage.removeItem('edumex_cart');
    this._cart.next([]);
  }

  private notify() {
    this._cart.next([...this.items]);
    localStorage.setItem('edumex_cart', JSON.stringify(this.items));
  }

  hasPhysicalItems(): boolean {
    return this._cart.getValue().some(item => item.book.type === 'physical');
  }
}
