import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { StocksComponent } from './pages/stocks/stocks';
import { CustomersComponent } from './pages/customers/customers';
import { ServicingComponent } from './pages/servicing/servicing';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard', component: DashboardComponent },
  {path: 'stocks', component: StocksComponent },
  {path: 'customers', component: CustomersComponent},
  {path: 'servicing', component: ServicingComponent},
];
