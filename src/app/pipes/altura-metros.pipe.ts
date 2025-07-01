import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'alturaMetros'
})
export class AlturaMetrosPipe implements PipeTransform {

  transform(valor: number | null | undefined): string {
    if (valor == null) return '-';
    const metros = (valor / 100).toFixed(2).replace('.', ',');
    return `${metros} m`;
  }

}
