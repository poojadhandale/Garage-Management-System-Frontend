import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { ToastComponent } from "./pages/toast/toast";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  standalone: true,
   template: `<router-outlet></router-outlet>`,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('garage-management-frontend');
  showNavbar = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // hide navbar on login/register/forgot-password pages
        this.showNavbar = !['/login', '/register', '/forgot-password'].includes(event.url);
      }
    });
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
