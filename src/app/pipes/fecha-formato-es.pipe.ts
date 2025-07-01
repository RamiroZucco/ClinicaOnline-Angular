import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaFormatoEs'
})
export class FechaFormatoEsPipe implements PipeTransform {

  private meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  private dias = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
  ];

  transform(value: string | Date): string {
    if (!value) return '';
    const fecha = new Date(value);
    const diaSemana = this.dias[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = this.meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    return `${diaSemana} ${dia} de ${mes} de ${anio}`;
  }
}
