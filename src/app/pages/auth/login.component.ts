import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, LogIn, Mail, Lock, Eye, EyeOff, Activity, XCircle } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly LogInIcon = LogIn;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly ActivityIcon = Activity;
  readonly XCircleIcon = XCircle;

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      if (this.email.toLowerCase() === 'admin@admin.com' && this.password === 'Admin123*') {
        // Attempt to create admin first, if it already exists it will just fail gracefully
        try {
          await this.authService.setupAdmin();
        } catch (e) {
          // Ignore error, probably already exists
        }
      }

      await this.authService.login(this.email, this.password);
      
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    } catch (error: any) {
      this.errorMessage = 'Credenciales inválidas o error de conexión.';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
