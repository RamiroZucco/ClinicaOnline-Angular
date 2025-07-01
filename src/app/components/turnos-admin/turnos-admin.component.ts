import { Component, OnInit } from '@angular/core';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FechaFormatoEsPipe } from '../../pipes/fecha-formato-es.pipe';
import { HighlightEstadoDirective } from '../../directives/highlight-estado.directive';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  templateUrl: './turnos-admin.component.html',
  styleUrls: ['./turnos-admin.component.css'],
  imports: [CommonModule, FormsModule, FechaFormatoEsPipe,HighlightEstadoDirective]
})
export class TurnosAdminComponent implements OnInit {
  turnos: any[] = [];
  filtrado: any[] = [];
  filtro: string = '';
  turnoACancelar: any = null;
  motivoCancelacion: string = '';
  mensajeCancelacion: string = '';
  errorCancelacion: string = '';

  constructor(private turnosService: TurnosService, private authService: AuthService) {}

  async ngOnInit() {
    const session = await this.authService.getSession();
    const rol = localStorage.getItem('loggedInUserRole');
    if (rol !== 'admin') return;

    this.turnos = await this.turnosService.obtenerTodos();
    this.filtrado = [...this.turnos];
  }

  aplicarFiltro() {
    const filtroLower = this.filtro.toLowerCase();
    this.filtrado = this.turnos.filter(t =>
      t.especialidad.toLowerCase().includes(filtroLower) ||
      `${t.especialista?.nombre} ${t.especialista?.apellido}`.toLowerCase().includes(filtroLower)
    );
  }

  puedeCancelar(turno: any) {
    return !['aceptado', 'realizado', 'rechazado', 'cancelado'].includes(turno.estado);
  }
  
  mostrarFormularioCancelacion(turno: any) {
    this.turnoACancelar = turno;
    this.motivoCancelacion = '';
    this.mensajeCancelacion = '';
    this.errorCancelacion = '';
  }

  cancelarFormulario() {
    this.turnoACancelar = null;
    this.motivoCancelacion = '';
    this.mensajeCancelacion = '';
    this.errorCancelacion = '';
  }

  async confirmarCancelacion() {
    if (!this.motivoCancelacion.trim()) {
      this.errorCancelacion = 'Debe ingresar un motivo.';
      return;
    }

    try {
      await this.turnosService.actualizarTurno(this.turnoACancelar.id, {
        estado: 'cancelado',
        comentario_cancelacion: this.motivoCancelacion
      });

      this.mensajeCancelacion = 'Turno cancelado correctamente.';
      this.turnoACancelar.estado = 'cancelado';

      setTimeout(() => {
        this.cancelarFormulario();
      }, 3000);
    } catch (err) {
      this.errorCancelacion = 'Error al cancelar el turno.';
    }
  }
}
