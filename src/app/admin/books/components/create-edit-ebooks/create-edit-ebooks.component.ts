import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AdminBooks, Ebook } from 'src/app/admin/services/admin-books';
import { AlertComponent } from 'src/app/components/alert/alert.component';

@Component({
  selector: 'app-create-edit-ebooks',
  templateUrl: './create-edit-ebooks.component.html',
  styleUrls: ['./create-edit-ebooks.component.scss'],
  standalone: false
})
export class CreateEditEbooksComponent implements OnInit {
  @Input() data?: any;

  isEdit = false;
  isSubmitting = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    isbn: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
    level: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(1)]],
    autor: ['', [Validators.required]],
    pages: [1, [Validators.required, Validators.min(1)]],
    year: [new Date().getFullYear(), [Validators.required]],
    edition: [1, [Validators.required,Validators.min(1)]],
    category: ['General English', [Validators.required]],
    supplier: ['', [Validators.required]],
    description: ['', [Validators.maxLength(1000),Validators.required]],
    active: [false],
    platform: ['Amazon Kindle', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private bookService: AdminBooks
  ) {}

  ngOnInit() {
    if (this.data) {
      this.isEdit = true;
      this.form.patchValue(this.data);
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
    // Obtenemos los valores
    const rawValues: any = this.form.getRawValue();

    // Al marcar rawValues como 'any', TypeScript te permitirá usar [key] sin quejarse
    Object.keys(rawValues).forEach(key => {
      if (rawValues[key] !== null && rawValues[key] !== undefined) {
        let value = rawValues[key];

        // Si el campo es 'active', lo convertimos a 1 o 0
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
      ? this.bookService.updateEbook(this.data.id, formData)
      : this.bookService.storeEbook(formData);

    request.pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          this.showAlert('Catálogo digital actualizado', 'success');
          this.close(true);
        },
        error: (err) => {
          this.showAlert(err.error?.message || 'Error al guardar', 'warning');
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
