import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AdminBooks, Book } from 'src/app/admin/services/admin-books';
import { AlertComponent } from 'src/app/components/alert/alert.component';

@Component({
  selector: 'app-create-edit',
  templateUrl: './create-edit.component.html',
  styleUrls: ['./create-edit.component.scss'],
  standalone: false,
})
export class CreateEditComponent implements OnInit {
  @Input() data?: Book;

  isEdit = false;
  isSubmitting = false;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // Niveles y Formatos para los selects
  levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  formats = ['Bolsillo', 'Tapa Blanda', 'Tapa Dura'];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    isbn: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
    level: ['', [Validators.required]],
    price_unit: [0, [Validators.required, Validators.min(1)]],
    units_per_package: [0, [Validators.required, Validators.min(1)]],
    price_package: [0, [Validators.min(1),Validators.required]], // Venta paquete
    stock_alert: [50, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.maxLength(1000),Validators.required]],
    autor: ['', [Validators.required]],
    active: [false],
    pages: [1, [Validators.required, Validators.min(1)]],
    year: [new Date().getFullYear(), [Validators.required]],
    edition: [1, [Validators.required,Validators.min(1)]],
    format: ['Tapa Blanda', [Validators.required]],
    size: ['', [Validators.required]],
    category:['', [Validators.required]],
    supplier: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private bookService: AdminBooks,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue(this.data);
      // El ISBN no suele editarse por integridad
      this.form.get('isbn')?.disable();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const rawValues: any = this.form.getRawValue();

    Object.keys(rawValues).forEach(key => {
      if (rawValues[key] !== null && rawValues[key] !== undefined) {
        let value = rawValues[key];

        if (key === 'active') {
          value = value ? '1' : '0';
        } else {
          value = value.toString();
        }

        formData.append(key, value);
      }
    });


    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    const request = this.isEdit
      ? this.bookService.updateBook(this.data!.id!, formData)
      : this.bookService.storeBook(formData);

    request.pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res: any) => {
          this.showAlert(res.message || 'Libro actualizado correctamente', 'success');
          this.close(true);
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Ocurrió un error inesperado';
          this.showAlert(errorMessage, 'warning');
        }
      });
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

  close(refresh = false) {
    this.modalCtrl.dismiss({ refresh });
  }
}
