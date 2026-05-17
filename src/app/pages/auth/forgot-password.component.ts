import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, Mail, ArrowLeft, KeyRound } from 'lucide-angular';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly MailIcon = Mail;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly KeyRoundIcon = KeyRound;

  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  async onSubmit() {
    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electrónico.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.resetPassword(this.email);
      this.successMessage = 'Te hemos enviado un correo con instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 5000);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
        this.errorMessage = 'No se encontró una cuenta con ese correo electrónico o es inválido.';
      } else {
        this.errorMessage = 'Ocurrió un error al intentar enviar el correo. Intenta nuevamente.';
      }
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}
