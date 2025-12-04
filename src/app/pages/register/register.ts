import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})

export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private apiUrl = 'http://localhost:8080/api/auth/register';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    this.http.post(this.apiUrl, this.registerForm.value).subscribe({
      next: (res: any) => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        this.errorMessage = '';

        // redirect after 2 seconds
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        console.error(err);
        this.successMessage = '';
        this.errorMessage = err.error?.message || 'Registration failed. Try again!';
      }
    });
  }
}
