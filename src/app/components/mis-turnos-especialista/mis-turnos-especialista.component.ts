import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TurnosService } from '../../services/turnos.service';
import { FinalizarTurnoComponent } from '../finalizar-turno/finalizar-turno.component';

@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrls: ['./mis-turnos-especialista.component.css'],
  imports: [CommonModule, FormsModule, FinalizarTurnoComponent]
})
export class MisTurnosEspecialistaComponent implements OnInit {
  turnos: any[] = [];
  filtrado: any[] = [];
  userId: string = '';
  filtro: string = '';
  turnoParaFinalizar: any = null; 
  turnoResenaVisible: any = null; 
  turnoParaCancelar: any = null;
  motivoCancelacion: string = '';
  turnoParaRechazar: any = null;
  motivoRechazo: string = '';

  constructor(
    private authService: AuthService,
    private turnosService: TurnosService
  ) {}

  async ngOnInit() {
    const res = await this.authService.getSession();
    const user = res.data.session?.user;

    if (user) {
      this.userId = user.id;
      this.turnos = await this.turnosService.obtenerTurnosPorUsuario(this.userId, 'especialista');
      this.filtrado = [...this.turnos];
    }
  }

  aplicarFiltro() {
    const f = this.filtro.toLowerCase();
    this.filtrado = this.turnos.filter(t => {
      let texto = [
        t.especialidad,
        t.paciente?.nombre,
        t.paciente?.apellido,
        t.fecha,
        t.hora,
        t.altura,
        t.peso,
        t.temperatura,
        t.presion,
        t.comentario_especialista,
        t.estado
      ]
        .map(x => x ?? '')
        .join(' ')
        .toLowerCase();

      if (t.extra_dinamico) {
        const din = Object.entries(t.extra_dinamico)
          .map(([clave, valor]) => `${clave} ${valor}`)
          .join(' ')
          .toLowerCase();
        texto += ' ' + din;
      }

      return texto.includes(f);
    });
  }

  async aceptar(turno: any) {
    await this.turnosService.actualizarTurno(turno.id, { estado: 'aceptado' });
    await this.ngOnInit();
  }

  async rechazar(turno: any, motivo: string) {
    await this.turnosService.actualizarTurno(turno.id, {
      estado: 'rechazado',
      comentario_especialista: motivo
    });
    await this.ngOnInit();
  }

  async cancelar(turno: any, motivo: string) {
    await this.turnosService.actualizarTurno(turno.id, {
      estado: 'cancelado',
      comentario_especialista: motivo
    });
    await this.ngOnInit();
  }

  rechazarConMotivo(turno: any) {
    this.turnoParaRechazar = turno;
    this.turnoParaCancelar = null;
    this.turnoParaFinalizar = null;
    this.turnoResenaVisible = null;
    this.motivoRechazo = '';
  }

  cancelarConMotivo(turno: any) {
    this.turnoParaCancelar = turno;
    this.turnoParaFinalizar = null;
    this.turnoResenaVisible = null;
    this.motivoCancelacion = '';
  }

  finalizarConComentario(turno: any) {
    this.turnoParaFinalizar = turno; 
    this.turnoResenaVisible = null;
  }

  mostrarComentario(turno: any) {
    this.turnoResenaVisible = turno;
    this.turnoParaFinalizar = null;
  }

  async confirmarCancelar(turno: any) {
    if (this.motivoCancelacion.trim()) {
      await this.cancelar(turno, this.motivoCancelacion);
      this.turnoParaCancelar = null;
      this.motivoCancelacion = '';
    }
  }
  async confirmarRechazo(turno: any) {
    if (this.motivoRechazo.trim()) {
      await this.rechazar(turno, this.motivoRechazo);
      this.turnoParaRechazar = null;
      this.motivoRechazo = '';
    }
  }

  cerrarCancelar() {
    this.turnoParaCancelar = null;
    this.motivoCancelacion = '';
  }
  cerrarRechazo() {
    this.turnoParaRechazar = null;
    this.motivoRechazo = '';
  }

  onCerrarFinalizarTurno(recargar: boolean) {
    this.turnoParaFinalizar = null;
    if (recargar) {
      this.ngOnInit(); 
    }
  }

}
