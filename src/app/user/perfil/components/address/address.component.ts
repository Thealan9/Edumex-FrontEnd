import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  standalone: false
})
export class AddressComponent  implements OnInit {
@Input() address: any;

  form = {
    recipient_name: '',
    recipient_phone: '',
    postal_code: '',
    state: '',
    municipality: '',
    locality: '',
    neighborhood: '',
    street: '',
    external_number: '',
    internal_number: '',
    references: '',
    is_default: true
  };

  isEdit = false;

  constructor(private modalCtrl: ModalController, private http: HttpClient) {}

  ngOnInit() {
    if (this.address) {
      this.isEdit = true;
      this.form = { ...this.address };
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    const url = `${environment.apiUrl}/user/addresses`;
    const request = this.isEdit
      ? this.http.put(`${url}/${this.address.id}`, this.form)
      : this.http.post(url, this.form);

    request.subscribe({
      next: () => {
        this.modalCtrl.dismiss({ refresh: true });
      },
      error: (err) => console.error('Error al guardar dirección', err)
    });
  }
}
