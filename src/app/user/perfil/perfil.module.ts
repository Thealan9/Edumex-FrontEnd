import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PerfilPageRoutingModule } from './perfil-routing.module';

import { PerfilPage } from './perfil.page';
import {EditComponent} from "./components/edit/edit.component";
import {ChangePasswordComponent} from "./components/change-password/change-password.component";
import {AddressComponent} from "./components/address/address.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [PerfilPage,EditComponent,ChangePasswordComponent,AddressComponent]
})
export class PerfilPageModule {}
