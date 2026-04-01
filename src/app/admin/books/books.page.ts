import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminBooks, Book } from '../services/admin-books';
import {Subject, Subscription} from 'rxjs';
import {AlertController, LoadingController, ModalController} from '@ionic/angular';
import {CreateEditComponent} from "./components/create-edit/create-edit.component";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {CreateEditEbooksComponent} from "./components/create-edit-ebooks/create-edit-ebooks.component";

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone: false
})
export class BooksPage implements OnInit, OnDestroy {
  books: any[] = [];
  viewMode: 'physical' | 'ebook' = 'physical';

  currentPage: number = 1;
  lastPage: number = 1;

  searchTerm: string = '';
  loading: boolean = false;
  private searchSubject = new Subject<string>();
  private refreshSub!: Subscription;
  private searchSub!: Subscription;
  constructor(
    private bookService: AdminBooks,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
  private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.loadBooks();

    this.searchSub = this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchTerm = value;
      this.loadBooks();
    });

    this.refreshSub = this.bookService.refresh$.subscribe(() => {
      this.loadBooks();
    });
  }

  ngOnDestroy() {
    if (this.refreshSub) this.refreshSub.unsubscribe();
    if (this.searchSub) this.searchSub.unsubscribe();
  }

  async loadBooks(event?: any, page: number = 1) {
    this.loading = true;
    this.books = [];
    this.currentPage = page;

    const request = this.viewMode === 'physical'
      ? this.bookService.getBooks(this.searchTerm,page)
      : this.bookService.getEbooks(this.searchTerm,page);

    request.subscribe({
      next: (res) => {
        this.books = res.data;
        this.currentPage = res.current_page;
        this.lastPage = res.last_page;
        this.loading = false;
        if (event) event.target.complete();
      },
      error: async (err) => {
        this.loading = false;
        if (event) event.target.complete();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo cargar el catálogo.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  changePage(next: boolean) {
    const targetPage = next ? this.currentPage + 1 : this.currentPage - 1;
    this.loadBooks(null, targetPage);
  }
  async openCreateEdit(book?: Book) {
    const modal = await this.modalCtrl.create({
      component: CreateEditComponent,
      componentProps: { data: book },
      cssClass: 'book-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.loadBooks();
    }
  }
  async openEbookModal(ebook?: any) {
    const modal = await this.modalCtrl.create({
      component: CreateEditEbooksComponent,
      componentProps: { data: ebook },
      cssClass: 'book-modal'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data?.refresh) this.loadBooks();
  }

  triggerFileInput(id: number) {
    document.getElementById('file-input-' + id)?.click();
  }


  async onFileSelected(event: any, bookId: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen es muy pesada (máx 2MB)');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Subiendo portada...',
      spinner: 'crescent'
    });
    await loading.present();

    this.bookService.uploadImage(bookId, file).subscribe({
      next: () => {
        loading.dismiss();
        // El refresh$ del servicio hará que loadBooks() se dispare solo
      },
      error: (err) => {
        loading.dismiss();
        console.log(err);
      }
    });
  }


  onSearch(event: any) {
    const value = event.detail.value || '';
    this.currentPage = 1;
    this.searchSubject.next(value);
  }




  toggleStatus(item: any) {
    const newStatus = !item.active;
    const request = this.viewMode === 'physical'
      ? this.bookService.toggleBookStatus(item.id)
      : this.bookService.toggleEbookStatus(item.id);

    request.subscribe({
      next: () => item.active = newStatus,
      error: () => this.loadBooks()
    });
  }
}
