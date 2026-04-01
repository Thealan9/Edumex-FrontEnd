import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import {CreateOrderComponent} from "./components/create-order/create-order.component";
import {CreateOutputComponent} from "./components/create-output/create-output.component";
import { BaseChartDirective } from 'ng2-charts';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    BaseChartDirective
  ],
  declarations: [HomePage,AlertComponent,CreateOrderComponent,CreateOutputComponent],
})
export class HomePageModule {}
