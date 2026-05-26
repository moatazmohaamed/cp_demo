import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TuiIcon, TuiButton } from '@taiga-ui/core';
import { TuiAvatar, TuiBadgeNotification, TuiBadgedContent } from '@taiga-ui/kit';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TuiIcon,
    TuiButton,
    TuiAvatar,
    TuiBadgeNotification,
    TuiBadgedContent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  readonly navItems = [
    { label: 'Orders', icon: '@tui.package', route: '/orders' },
    { label: 'Add Order', icon: '@tui.plus-circle', route: '/add-order' },
    { label: 'Tasks', icon: '@tui.check-square', route: '/tasks' },
    { label: 'Quality', icon: '@tui.shield', route: '/quality' },
    { label: 'Billings', icon: '@tui.credit-card', route: '/billings' },
    { label: 'CP Reports', icon: '@tui.bar-chart-2', route: '/cp-reports' },
    { label: 'Prospects', icon: '@tui.users', route: '/prospects' },
    { label: 'Employees', icon: '@tui.briefcase', route: '/employees' },
    { label: 'Marketing', icon: '@tui.trending-up', route: '/marketing' },
    { label: 'Revenue', icon: '@tui.dollar-sign', route: '/revenue' },
  ];

  constructor(public auth: AuthService) {}

  get username(): string {
    return this.auth.getUsername() ?? 'User';
  }

  get initials(): string {
    return this.username.slice(0, 2).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
