import { Directive, Input, ElementRef, Renderer2, DoCheck } from '@angular/core';
import { NgControl, NgForm } from '@angular/forms';

@Directive({
  selector: '[validaCampo]',
  standalone: true
})
export class ValidaCampoDirective implements DoCheck {
  @Input('validaCampo') form!: NgForm;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private control: NgControl
  ) {}

  ngDoCheck() {
    if (!this.form || !this.control) return;
    if (this.form.submitted && this.control.invalid) {
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid #ef5350');
      this.renderer.setStyle(this.el.nativeElement, 'background', '#fff3f3');
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'border');
      this.renderer.removeStyle(this.el.nativeElement, 'background');
    }
  }
}
