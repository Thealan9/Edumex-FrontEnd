import { Component, OnInit } from '@angular/core'
import { Auth } from 'src/app/core/auth';
import { Cart } from '../services/cart';
import { Observable } from 'rxjs';
import {Router} from "@angular/router";
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage{

  loading: boolean = false;
  constructor(private router: Router) {}




  goToCatalog() {
    this.router.navigate(['/home/libros']);
  }

}
