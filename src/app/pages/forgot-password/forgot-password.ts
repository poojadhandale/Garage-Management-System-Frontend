import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})

export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  private apiUrl = 'http://localhost:8080/api/auth/forgot-password';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.http.post(this.apiUrl, this.forgotForm.value).subscribe({
      next: (res: any) => {
        this.toastr.success('Password reset link sent to your email!', 'Success', {
          timeOut: 3000,
          progressBar: true
        });
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(
          err.error?.message || 'Unable to send reset link. Please try again.',
          'Error',
          { timeOut: 3000, progressBar: true }
        );
      }
    });
  }
}
