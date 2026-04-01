import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  standalone: false,
})
export class AlertComponent{

  @Input() message!: string;
  @Input() type!: 'success' | 'error' | 'warning';
  constructor(private modalCtrl: ModalController) { }


  close() {
    this.modalCtrl.dismiss();
  }

  get icon() {
    return {
      success: 'checkmark-circle',
      error: 'close-circle',
      warning: 'warning'
    }[this.type];
  }

  get color() {
    return {
      success: 'success',
      error: 'danger',
      warning: 'warning'
    }[this.type];
  }

}
