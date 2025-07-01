import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[highlightEstado]',
  standalone: true
})
export class HighlightEstadoDirective implements OnInit {
  @Input('highlightEstado') estado: string = '';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    let color = '';
    switch (this.estado) {
      case 'pendiente':
        color = '#ffe082'; 
        break;
      case 'aceptado':
        color = '#b2fab4'; 
        break;
      case 'realizado':
        color = '#b3e5fc'; 
        break;
      case 'cancelado':
        color = '#ffcdd2';
        break;
      case 'rechazado':
        color = '#e0e0e0'; 
        break;
      default:
        color = '';
    }
    this.el.nativeElement.style.backgroundColor = color;
  }
}

