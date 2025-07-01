import { Directive, Input, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[usuarioHover]',
  standalone: true // ¡IMPORTANTE!
})
export class UsuarioHoverDirective {
  @Input('usuarioHover') imagenes: string[] = [];
  private idx = 0;
  private intervalId: any;

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.imagenes.length <= 1) return;
    const img = this.el.nativeElement.querySelector('img');
    if (!img) return;
    this.idx = 0;
    this.intervalId = setInterval(() => {
      this.idx = (this.idx + 1) % this.imagenes.length;
      img.src = this.imagenes[this.idx];
    }, 1200);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    clearInterval(this.intervalId);
    this.idx = 0;
    const img = this.el.nativeElement.querySelector('img');
    if (img && this.imagenes.length) img.src = this.imagenes[0];
  }
}