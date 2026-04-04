import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth-guard';
import { UserResolver } from './core/user.resolver';
import { RoleGuard } from './core/role-guard';
import { NavbarAdminComponent } from './components/navbar/navbar-admin/navbar-admin.component';
import {NavbarUserComponent} from "./components/navbar/navbar-user/navbar-user.component";
import {storeGuard} from "./core/store-guard";
import {store2Guard} from "./core/store2-guard";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [store2Guard],
    loadChildren: () => import('./auth/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    canActivate: [store2Guard],
    loadChildren: () => import('./auth/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'recuperar-contraseña',
    canActivate: [store2Guard],
    loadChildren: () => import('./auth/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
//----------------------------------User---------------------------------------
  {
  path: 'home',
    component: NavbarUserComponent,
    children: [
      {
        path: '',
        canActivate: [storeGuard],
        loadChildren: () =>
          import('./user/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'libros',
        canActivate: [storeGuard],
        loadChildren: () =>
          import('./user/books/books.module').then(m => m.BooksPageModule)
      },
      {
        path: 'pedidos',
        canMatch: [AuthGuard,RoleGuard],
        data: { roles: ['user'] },
        loadChildren: () => import('./user/my-orders/my-orders.module').then( m => m.MyOrdersPageModule)
      },
      {
        path: 'perfil',
        canMatch: [AuthGuard,RoleGuard],
        data: { roles: ['user'] },
        resolve: {
          user: UserResolver
        },
        loadChildren: () => import('./user/perfil/perfil.module').then( m => m.PerfilPageModule)
      },
      {
        path: 'libro/:id',
        canActivate: [storeGuard],
        loadChildren: () => import('./user/book-detail/book-detail.module').then( m => m.BookDetailPageModule)
      },
    ]
  },



  //------------------------ Admin------------------------------
 {
  path: 'admin',
  component: NavbarAdminComponent,
  canMatch: [AuthGuard, RoleGuard],
  data: { roles: ['admin'] },
  children: [
    {
      path: '',
      loadChildren: () =>
        import('./admin/home/home.module')
          .then(m => m.HomePageModule)
    },
    {
      path: 'users',
      loadChildren: () =>
        import('./admin/users/users.module')
          .then(m => m.UsersPageModule)
    },
    {
      path: 'books',
      loadChildren: () =>
        import('./admin/books/books.module')
          .then(m => m.BooksPageModule)
    },
    {
      path: 'location',
      loadChildren: () =>
        import('./admin/location/location.module')
          .then(m => m.LocationPageModule)
    },
    {
      path: 'reports',
      loadChildren: () =>
        import('./admin/reports/reports.module')
          .then(m => m.ReportsPageModule)
    },
    {
    path: 'profile',
    resolve: {
    user: UserResolver
    },
    loadChildren: () =>
      import('./admin/profile/profile.module').then( m => m.ProfilePageModule)
  },
  ]
},

  //warehouseman

  {
    path: 'warehouseman',
    canMatch: [AuthGuard,RoleGuard],
    data: { roles: ['warehouseman'] },
    loadChildren: () => import('./warehouseman/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'warehouseman/orders',
    canMatch: [AuthGuard,RoleGuard],
    data: { roles: ['warehouseman'] },
    loadChildren: () => import('./warehouseman/orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./auth/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },












];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
