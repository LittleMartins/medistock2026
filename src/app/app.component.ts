import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { ThemeService } from './services/theme.service';
import { ToastComponent } from './components/ui/toast/toast.component';
import { ModalComponent } from './components/ui/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeFade', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(6px)' }),
          animate('260ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  title = 'medistock';
  private themeService = inject(ThemeService); // Initialize theme
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Failsafe: Si detectamos parámetros de Webpay en la raíz, redirigir al checkout
    this.route.queryParams.subscribe(params => {
      if (params['status'] && params['token'] && window.location.pathname === '/') {
        console.log('Detectados parámetros de Webpay en la raíz, redirigiendo al checkout...');
        this.router.navigate(['/checkout'], { 
          queryParams: params,
          replaceUrl: true 
        });
      }
    });
  }
}
