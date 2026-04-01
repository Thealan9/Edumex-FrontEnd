import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { AdminLocation, Location } from 'src/app/admin/services/admin-location';
import { WarehouseInventory } from 'src/app/warehouseman/services/warehouse-inventory';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-create-movement',
  templateUrl: './create-movement.component.html',
  styleUrls: ['./create-movement.component.scss'],
  standalone: false
})
export class CreateMovementComponent  implements OnInit {
  @Input() type!: 'input' | 'output';

  books: Book[] = [];
  locations: Location[] = [];
  isSubmitting = false;

  distributions: { location_id: number, location_code: string, quantity: number }[] = [];

  form = this.fb.group({
    book_id: [null as number | null, [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    temp_location_id: [null as number | null],
    temp_quantity: [1, [Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private adminBooks: AdminBooks,
    private adminLocations: AdminLocation,
    private warehouseService: WarehouseInventory
  ) {}

  ngOnInit() {
    this.loadInitialData();

    this.form.get('book_id')?.valueChanges.subscribe(bookId => {
      this.distributions = [];
      if (bookId) this.loadLocations(bookId);
    });
  }

  get availableLocations(): Location[] {
    return this.locations.filter(loc =>
      !this.distributions.some(dist => dist.location_id === loc.id)
    );
  }

  get isFormReadyToSubmit(): boolean {
    const raw = this.form.getRawValue();
    const hasBook = !!raw.book_id;
    const hasDescription = !!raw.description && raw.description.length >= 5;

    return hasBook && hasDescription && this.distributions.length > 0;
  }

  loadInitialData() {
    this.adminBooks.getBooks().subscribe(res => this.books = res.data);
    if (this.type === 'input') {
      this.adminLocations.getLocations().subscribe(res => this.locations = res.data);
    }
  }

  loadLocations(bookId: number) {
    if (this.type === 'output') {
      this.warehouseService.getLocationsByBook(bookId).subscribe(res => this.locations = res.data);
    } else {
      this.adminLocations.getLocations().subscribe(res => this.locations = res.data);
    }
  }

  addDistribution() {
    const locId = this.form.get('temp_location_id')?.value;
    const qty = this.form.get('temp_quantity')?.value;
    const bookId = this.form.get('book_id')?.value;

    if (!bookId) {
      this.showAlert('Primero selecciona un libro', 'warning');
      return;
    }

    if (!locId || !qty || qty <= 0) return;

    const loc = this.locations.find(l => l.id === locId);
    if (!loc) return;

    if (this.type === 'output') {
      const stockAvailable = loc.current_stock || 0;
      if (qty > stockAvailable) {
        this.showAlert(`Stock insuficiente. Disponible: ${stockAvailable}`, 'warning');
        return;
      }
    }

    if (this.type === 'input') {
      const freeSpace = (loc.max_capacity || 0) - (loc.current_capacity || 0);
      if (qty > freeSpace) {
        this.showAlert(`Espacio insuficiente en ${loc.code}. Libre: ${freeSpace}`, 'warning');
        return;
      }
    }

    this.distributions.push({
      location_id: locId,
      location_code: loc.code,
      quantity: qty
    });

    this.form.patchValue({ temp_location_id: null, temp_quantity: 1 });
    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  }

  removeDistribution(index: number) {
    this.distributions.splice(index, 1);
    this.form.updateValueAndValidity();
  }

  submit() {
    if (!this.isFormReadyToSubmit || this.isSubmitting) return;

    this.isSubmitting = true;
    const rawData = this.form.getRawValue();

    const payload = {
      book_id: rawData.book_id,
      type: this.type,
      description: rawData.description,
      distributions: this.distributions
    };

    this.warehouseService.registerMovement(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          this.showAlert(res.message, 'success');
          this.close(true);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.showAlert(err.error?.message || 'Error al registrar movimiento', 'warning');
        }
      });
  }

  async showAlert(message: string, type: 'success' | 'error' | 'warning') {
    const modal = await this.modalCtrl.create({
      component: AlertComponent,
      componentProps: { message, type },
      cssClass: 'small-alert-modal'
    });
    await modal.present();
  }

  close(refresh = false) {
    this.modalCtrl.dismiss({ refresh });
  }
}
