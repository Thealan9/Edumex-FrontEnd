import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BooksPageRoutingModule } from './books-routing.module';

import { BooksPage } from './books.page';
import { CreateEditComponent } from './components/create-edit/create-edit.component';
import {CreateEditEbooksComponent} from "./components/create-edit-ebooks/create-edit-ebooks.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BooksPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BooksPage,CreateEditComponent,CreateEditEbooksComponent]
})
export class BooksPageModule {}
