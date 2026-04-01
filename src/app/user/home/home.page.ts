import { Component, OnInit } from '@angular/core'
import { Auth } from 'src/app/core/auth';
import { Cart } from '../services/cart';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit{

  loading: boolean = false;
  cart$: Observable<any[]>;
  constructor(
    private auth: Auth,
    private cartService: Cart,
  ) {this.cart$ = this.cartService.cart$;}

ngOnInit() {

}


}
