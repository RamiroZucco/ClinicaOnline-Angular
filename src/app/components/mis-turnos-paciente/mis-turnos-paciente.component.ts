import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-turnos-paciente',
  standalone: true,
  templateUrl: './mis-turnos-paciente.component.html',
  styleUrls: ['./mis-turnos-paciente.component.css'],
  imports: [CommonModule, FormsModule]
})
export class MisTurnosPacienteComponent implements OnInit {
  turnos: any[] = [];
  filtrado: any[] = [];
  inputBusqueda: string = '';
  userId: string = '';

  turnoParaCancelar: any = null;
  turnoParaEncuesta: any = null;
  turnoParaCalificar: any = null;

  motivoCancelacion: string = '';
  encuesta: string = '';
  calificacion: number = -1;
  mensaje: string = '';

  turnoResenaVisible: any = null;

  constructor(
    private turnosService: TurnosService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    const res = await this.authService.getSession();
    const user = res.data.session?.user;

    if (user) {
      this.userId = user.id;
      this.turnos = await this.turnosService.obtenerTurnosDelPaciente(this.userId);
      this.filtrado = [...this.turnos];
    }
  }

  filtrar() {
    const filtro = this.inputBusqueda.toLowerCase();
    this.filtrado = this.turnos.filter(turno => {
      let texto = [
        turno.especialidad,
        turno.especialista?.nombre,
        turno.especialista?.apellido,
        turno.fecha,
        turno.hora,
        turno.altura,
        turno.peso,
        turno.temperatura,
        turno.presion,
        turno.comentario_especialista,
        turno.estado,
        turno.comentario_cancelacion,
        turno.encuesta,
        turno.calificacion
      ]
        .map(x => x ?? '')
        .join(' ')
        .toLowerCase();

      if (turno.extra_dinamico) {
        const din = Object.entries(turno.extra_dinamico)
          .map(([clave, valor]) => `${clave} ${valor}`)
          .join(' ')
          .toLowerCase();
        texto += ' ' + din;
      }
      return texto.includes(filtro);
    });
  }

  puedeCancelar(t: any) {
    return !['realizado', 'cancelado', 'rechazado'].includes(t.estado);
  }

  puedeVerResena(t: any) {
    return !!t.comentario_especialista;
  }

  puedeEncuestar(t: any) {
    return t.estado === 'realizado' && !t.encuesta;
  }

  puedeCalificar(t: any) {
    return t.estado === 'realizado' && !t.calificacion;
  }

  iniciarCancelacion(turno: any) {
    this.turnoParaCancelar = turno;
    this.turnoParaEncuesta = null;
    this.turnoParaCalificar = null;
    this.motivoCancelacion = '';
    this.mensaje = '';
  }

  async confirmarCancelacion() {
    if (this.motivoCancelacion.trim()) {
      await this.turnosService.actualizarTurno(this.turnoParaCancelar.id, {
        estado: 'cancelado',
        comentario_cancelacion: this.motivoCancelacion
      });
      this.turnoParaCancelar.estado = 'cancelado';
      this.mensaje = 'Turno cancelado correctamente.';
    }
    this.turnoParaCancelar = null;
  }

  async enviarEncuesta(turno: any) {
    this.turnoParaEncuesta = turno;
    this.turnoParaCancelar = null;
    this.turnoParaCalificar = null;
    this.encuesta = '';
    this.mensaje = '';
  }

  async confirmarEncuesta() {
    if (this.encuesta.trim()) {
      await this.turnosService.actualizarTurno(this.turnoParaEncuesta.id, {
        encuesta: this.encuesta
      });
      this.turnoParaEncuesta.encuesta = this.encuesta;
      this.mensaje = 'Encuesta enviada.';
    }
    this.turnoParaEncuesta = null;
  }

  async calificar(turno: any) {
    this.turnoParaCalificar = turno;
    this.turnoParaEncuesta = null;
    this.turnoParaCancelar = null;
    this.calificacion = -1;
    this.mensaje = '';
  }

  async confirmarCalificacion() {
    if (this.calificacion > 0) {
      await this.turnosService.actualizarTurno(this.turnoParaCalificar.id, {
        calificacion: this.calificacion
      });
      this.turnoParaCalificar.calificacion = this.calificacion;
      this.mensaje = 'Calificacion enviada.';
    }
    this.turnoParaCalificar = null;
  }

  verResena(turno: any) {
    this.turnoResenaVisible = turno;
  }
}