import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiIcon],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  showPassword = false;
  isLoading = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    const remembered = this.auth.getRememberedCredentials();
    this.form = this.fb.group({
      loginId: [remembered?.username ?? '', Validators.required],
      password: [remembered?.password ?? '', Validators.required],
      rememberMe: [!!remembered],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const { loginId, password, rememberMe } = this.form.value;
    const success = this.auth.login(loginId, password, rememberMe);

    if (success) {
      // Brief delay on success only — feels like a real auth handshake
      setTimeout(() => this.router.navigate(['/orders']), 500);
    } else {
      this.isLoading = false;
      this.loginError = 'Invalid username or password. Please try again.';
    
    }
  }

  hasError(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}
