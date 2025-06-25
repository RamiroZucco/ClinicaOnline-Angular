import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';

@Component({
  selector: 'app-finalizar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finalizar-turno.component.html',
  styleUrls: ['./finalizar-turno.component.css'],
})
export class FinalizarTurnoComponent {
  @Input() turno: any;
  @Output() cerrarModal = new EventEmitter<boolean>();

  altura: number | null = null;
  peso: number | null = null;
  temperatura: number | null = null;
  presion: string = '';
  comentario: string = '';
  camposDinamicos: { clave: string; valor: string }[] = [];

  errorMsg: string = '';
  successMsg: string = '';
  mostrarErrores = false;

  constructor(private turnosService: TurnosService) {}

  agregarCampoExtra() {
    if (this.camposDinamicos.length < 3) {
      this.camposDinamicos.push({ clave: '', valor: '' });
    }
  }

  cerrar(recargar: boolean = false) {
    document.body.style.overflow = 'auto';
    this.cerrarModal.emit(recargar);
  }

  esAlturaValida() {
    return this.altura != null && this.altura >= 0 && this.altura <= 300;
  }
  esPesoValido() {
    return this.peso != null && this.peso >= 0 && this.peso <= 700;
  }
  esTemperaturaValida() {
    return this.temperatura != null && this.temperatura >= 30 && this.temperatura <= 50;
  }
  esPresionValida() {
    // formato esperado: "120/80"
    if (!this.presion) return false;
    const match = this.presion.match(/^(\d{2,3})\/(\d{2,3})$/);
    if (!match) return false;
    const sistolica = parseInt(match[1], 10);
    const diastolica = parseInt(match[2], 10);
    return (
      sistolica >= 50 && sistolica <= 250 &&
      diastolica >= 30 && diastolica <= 150
    );
  }

  async guardar() {
    this.errorMsg = '';
    this.successMsg = '';
    this.mostrarErrores = true;

    if (
      !this.comentario ||
      !this.esAlturaValida() ||
      !this.esPesoValido() ||
      !this.esTemperaturaValida() ||
      !this.esPresionValida()
    ) {
      this.errorMsg = 'Revisá los campos marcados en rojo.';
      return;
    }

    const extra_dinamico: Record<string, string> = {};
    this.camposDinamicos.forEach(({ clave, valor }) => {
      if (clave && valor) extra_dinamico[clave] = valor;
    });

    await this.turnosService.actualizarTurno(this.turno.id, {
      altura: this.altura,
      peso: this.peso,
      temperatura: this.temperatura,
      presion: this.presion,
      extra_dinamico,
      comentario_especialista: this.comentario,
      estado: 'realizado'
    });

    this.successMsg = 'Historia clínica cargada correctamente.';

    setTimeout(() => this.cerrar(true), 1500); 
  }
}
