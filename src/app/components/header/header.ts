import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiIcon, TuiButton } from '@taiga-ui/core';
import { TuiAvatar, TuiBadgeNotification, TuiBadgedContent } from '@taiga-ui/kit';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
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
    { label: 'Orders', icon: '@tui.package', active: true },
    { label: 'Add Order', icon: '@tui.plus-circle', active: false },
    { label: 'Tasks', icon: '@tui.check-square', active: false },
    { label: 'Quality', icon: '@tui.shield', active: false },
    { label: 'Billings', icon: '@tui.credit-card', active: false },
    { label: 'CP Reports', icon: '@tui.bar-chart-2', active: false },
    { label: 'Prospects', icon: '@tui.users', active: false },
    { label: 'Employees', icon: '@tui.briefcase', active: false },
    { label: 'Marketing', icon: '@tui.trending-up', active: false },
    { label: 'Revenue', icon: '@tui.dollar-sign', active: false },
  ];
}
