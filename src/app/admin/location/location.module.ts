import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationPageRoutingModule } from './location-routing.module';

import { LocationPage } from './location.page';
import {CreateEditComponent} from "./components/create-edit/create-edit.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [LocationPage,CreateEditComponent],
})
export class LocationPageModule {}
