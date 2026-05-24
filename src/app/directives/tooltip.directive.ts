import { Directive, ElementRef, HostListener, Input, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' = 'top';

  private tooltipElement: HTMLElement | null = null;
  private tooltipTimeout: any;
  private repositionTimeout: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipText) return;

    // Clear any pending hide timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }

    // Show tooltip immediately
    this.show();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    // Add a small delay before hiding to avoid flicker
    this.tooltipTimeout = setTimeout(() => {
      this.hide();
    }, 100);
  }

  private show(): void {
    if (this.tooltipElement) {
      this.renderer.addClass(this.tooltipElement, 'visible');
      this.repositionTooltip();
      return;
    }

    // Create tooltip element
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'app-tooltip');
    this.renderer.addClass(this.tooltipElement, `app-tooltip--${this.tooltipPosition}`);

    // Set content
    const text = this.renderer.createText(this.tooltipText || 'No internal notes');
    this.renderer.appendChild(this.tooltipElement, text);

    // Add to DOM (hidden initially)
    this.renderer.appendChild(document.body, this.tooltipElement);

    // Position tooltip before showing
    this.positionTooltip();

    // Add visible class after DOM has rendered (forces animation)
    requestAnimationFrame(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'visible');
      }
    });

    // Reposition on window resize
    window.addEventListener('resize', this.repositionTooltip.bind(this));
  }

  private hide(): void {
    if (this.tooltipElement) {
      this.renderer.removeClass(this.tooltipElement, 'visible');
    }
  }

  private repositionTooltip(): void {
    if (this.repositionTimeout) {
      clearTimeout(this.repositionTimeout);
    }
    
    this.repositionTimeout = requestAnimationFrame(() => {
      this.positionTooltip();
    });
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();

    let top: number, left: number;

    if (this.tooltipPosition === 'top') {
      top = hostPos.top - tooltipPos.height - 12;
      left = hostPos.left + hostPos.width / 2 - tooltipPos.width / 2;
    } else {
      top = hostPos.bottom + 12;
      left = hostPos.left + hostPos.width / 2 - tooltipPos.width / 2;
    }

    // Keep tooltip within viewport with padding
    const padding = 12;
    if (left < padding) {
      left = padding;
    } else if (left + tooltipPos.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipPos.width - padding;
    }

    // Ensure tooltip doesn't go off top/bottom
    if (top < padding) {
      top = padding;
    }

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  ngOnDestroy(): void {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
    }
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }
    if (this.repositionTimeout) {
      cancelAnimationFrame(this.repositionTimeout);
    }
  }
}
