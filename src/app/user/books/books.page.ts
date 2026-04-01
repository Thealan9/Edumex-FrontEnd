import { Component, OnInit } from '@angular/core';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { Cart } from '../services/cart';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {Auth} from "../../core/auth";

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone: false
})
export class BooksPage implements OnInit {
  categories = ['General English', 'Grammar & Vocabulary', 'Exam Preparation', 'Business English', 'Readers', 'Teacher Resources'];
  authors: string[] = [];
  levels: string[] = [];

  filters = {
    searchText: '',
    category: 'Todos',
    author: 'Todos',
    level: 'Todos',
    type: 'Todos',
    onlyStock: true,
    maxPrice: 2000
  };

  maxPriceLimit = 2000;
  allBooks: any[] = [];
  books: any[] = [];
  loading: boolean = false;
  cart$: Observable<any[]>;
  user: any;
  constructor(
    private bookService: AdminBooks,
    private cartService: Cart,
    private toastCtrl: ToastController,
    private auth: Auth,
    private router: Router
  ) {this.cart$ = this.cartService.cart$;}

  ngOnInit() {
    this.auth.user$.subscribe(u => this.user = u);
    this.loadCatalog();
  }

  loadCatalog(event?: any) {
    this.loading = true;
    this.bookService.getBooks().subscribe({
      next: (res) => {
        this.allBooks = res.data;
        this.applyFilters();
        this.loading = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  applyFilters() {
    this.books = this.allBooks.filter(book => {
      const textMatch = book.title.toLowerCase().includes(this.filters.searchText.toLowerCase()) ||
        book.autor?.toLowerCase().includes(this.filters.searchText.toLowerCase());
      const categoryMatch = this.filters.category === 'Todos' || book.category === this.filters.category;
      const levelMatch = this.filters.level === 'Todos' || book.level === this.filters.level;
      const typeMatch = this.filters.type === 'Todos' || book.type === this.filters.type;
      const stockMatch = !this.filters.onlyStock || (book.type === 'ebook' || book.total_stock > 0);
      const priceMatch = Number(book.price_unit) <= this.filters.maxPrice;

      return textMatch && categoryMatch && levelMatch && typeMatch && stockMatch && priceMatch;
    });
  }
  resetFilters() {
    this.filters = {
      searchText: '',
      category: 'Todos',
      author: 'Todos',
      level: 'Todos',
      type: 'Todos',
      onlyStock: true,
      maxPrice: this.maxPriceLimit
    };
    this.applyFilters();
  }

  onPriceChange(event: any) {
    this.filters.maxPrice = event.detail.value;
    this.applyFilters();
  }

  onSearch(event: any) {
    this.filters.searchText = event.detail.value || '';
    this.applyFilters();
  }


  goToBook(book: any) {
    this.router.navigate(['home/libro', book.id], {
      queryParams: { type: book.type }
    });
  }
  async presentErrorToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }

}
