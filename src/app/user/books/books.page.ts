import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminBooks } from 'src/app/admin/services/admin-books';
import { Cart } from '../services/cart';
import { ToastController } from '@ionic/angular';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Auth } from "../../core/auth";

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone: false
})
export class BooksPage implements OnInit, OnDestroy {
  categories = ['General English', 'Grammar & Vocabulary', 'Exam Preparation', 'Business English', 'Readers', 'Teacher Resources'];

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
  books: any[] = [];
  loading: boolean = false;
  cart$: Observable<any[]>;
  user: any;

  currentPage: number = 1;
  lastPage: number = 1;
  totalBooks: number = 0;

  // Buscador
  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  constructor(
    private bookService: AdminBooks,
    private cartService: Cart,
    private toastCtrl: ToastController,
    private auth: Auth,
    private router: Router
  ) {
    this.cart$ = this.cartService.cart$;
  }

  ngOnInit() {
    this.auth.user$.subscribe(u => this.user = u);

    this.searchSub = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.filters.searchText = value;
      this.applyFilters();
    });

    this.loadCatalog();
  }

  ngOnDestroy() {
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  loadCatalog(event?: any, page: number = 1) {
    this.loading = true;
    this.currentPage = page;

    this.bookService.getBooks(this.filters, page).subscribe({
      next: (res) => {
        this.books = res.data;
        this.currentPage = res.current_page;
        this.lastPage = res.last_page;
        this.totalBooks = res.total;

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
    this.loadCatalog(null, 1);
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

  onSearch(event: any) {
    this.searchSubject.next(event.detail.value || '');
  }

  changePage(next: boolean) {
    const targetPage = next ? this.currentPage + 1 : this.currentPage - 1;
    this.loadCatalog(null, targetPage);
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
