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

    // Show tooltip
    this.show();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    // Add a small delay before hiding to avoid flicker
    this.tooltipTimeout = setTimeout(() => {
      this.hide();
    }, 50);
  }

  private show(): void {
    if (this.tooltipElement) {
      this.renderer.addClass(this.tooltipElement, 'visible');
      return;
    }

    // Create tooltip element
    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'app-tooltip');
    this.renderer.addClass(this.tooltipElement, `app-tooltip--${this.tooltipPosition}`);
    this.renderer.addClass(this.tooltipElement, 'visible');

    // Set content
    const text = this.renderer.createText(this.tooltipText || 'No internal notes');
    this.renderer.appendChild(this.tooltipElement, text);

    // Add to DOM
    this.renderer.appendChild(document.body, this.tooltipElement);

    // Position tooltip
    this.positionTooltip();
  }

  private hide(): void {
    if (this.tooltipElement) {
      this.renderer.removeClass(this.tooltipElement, 'visible');
    }
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement.getBoundingClientRect();

    let top: number, left: number;

    if (this.tooltipPosition === 'top') {
      top = hostPos.top - tooltipPos.height - 10;
      left = hostPos.left + hostPos.width / 2 - tooltipPos.width / 2;
    } else {
      top = hostPos.bottom + 10;
      left = hostPos.left + hostPos.width / 2 - tooltipPos.width / 2;
    }

    // Keep tooltip within viewport
    const padding = 10;
    if (left < padding) {
      left = padding;
    } else if (left + tooltipPos.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipPos.width - padding;
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
  }
}
