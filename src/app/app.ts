import { TuiRoot } from '@taiga-ui/core';
import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { HeaderComponent } from './components/header/header';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, TuiIcon, HeaderComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('demo_cp');
  readonly loading = signal(false);
  isLoginPage = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isLoginPage = e.urlAfterRedirects.startsWith('/login');
      });
  }
}
