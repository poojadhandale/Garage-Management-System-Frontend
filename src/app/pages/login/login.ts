import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth-service'; 

@Component({
  selector: 'app-login',
    standalone: true,
imports: [ReactiveFormsModule, RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class LoginComponent implements OnInit {
  showPassword = false;
  loginForm!: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private service: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;

    this.service.login(username, password).subscribe({
      next: (response) => {
        console.log('✅ Login success:', response);
        this.toastr.success('Welcome ' + username, 'Login Successful');
        setTimeout(() => this.router.navigate(['/dashboard']), 800);
      },
      error: (err) => {
        console.error('❌ Login failed:', err);
        this.errorMessage = 'Invalid username or password!';
        this.toastr.error('Invalid credentials', 'Login Failed');
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
