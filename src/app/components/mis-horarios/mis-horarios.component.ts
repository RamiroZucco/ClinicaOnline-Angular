import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { HorariosService } from '../../services/horarios.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-horarios',
  templateUrl: './mis-horarios.component.html',
  styleUrls: ['./mis-horarios.component.css'],
  imports: [CommonModule, FormsModule]
})
export class MisHorariosComponent implements OnInit {
  usuario: any;
  horarios: string[] = [];
  dias_disponibles: string[] = [];
  disponibles = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  horariosInput: string = '';

  horariosGuardados: any[] = []; // Para mostrar los horarios ya existentes
  mensajeExito: string = '';
  mensajeError: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private horariosService: HorariosService
  ) {}

  async ngOnInit() {
    const session = await this.authService.getSession();
    const email = session.data.session?.user.email;
    const users = await this.userService.getAllUsers();
    this.usuario = users.find(u => u.email === email);

    this.horariosGuardados = await this.horariosService.obtenerHorariosPorEspecialista(this.usuario.id);

    this.dias_disponibles = [...new Set(this.horariosGuardados.map(h => h.dia))];
    this.horarios = [...new Set(this.horariosGuardados.map(h => h.desde))];
    this.horariosInput = this.horarios.join(', ');
  }

  toggleDia(dia: string) {
    if (this.dias_disponibles.includes(dia)) {
      this.dias_disponibles = this.dias_disponibles.filter(d => d !== dia);
    } else {
      this.dias_disponibles.push(dia);
    }
  }

  setHorarios() {
    this.mensajeExito = '';
    this.mensajeError = '';

    const horariosLimpios = this.horariosInput
      .split(',')
      .map(h => h.trim())
      .filter(h => h !== '');

    const horariosNormalizados: string[] = [];
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

    for (const hora of horariosLimpios) {
      const partes = hora.split(':');
      if (partes.length !== 2) {
        this.mensajeError = 'Formato de hora inválido. Use HH:MM (ej: 09:00, 10:30)';
        this.horarios = [];
        return;
      }

      const hh = partes[0].padStart(2, '0');
      const mm = partes[1].padStart(2, '0');
      const horaFormateada = `${hh}:${mm}`;

      if (!regexHora.test(horaFormateada)) {
        this.mensajeError = 'Formato de hora inválido. Use HH:MM (ej: 09:00, 10:30)';
        this.horarios = [];
        return;
      }

      horariosNormalizados.push(horaFormateada);
    }

    this.horarios = horariosNormalizados;
    this.mensajeExito = 'Horas cargadas correctamente.';
  }

  async guardar() {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.horarios.length === 0 || this.dias_disponibles.length === 0) {
      this.mensajeError = 'Debe seleccionar al menos un día y una hora válida.';
      return;
    }

    try {
      await this.horariosService.deleteHorariosDeEspecialista(this.usuario.id);

      const especialidades = this.usuario.especialidades?.split(',').map((e: string) => e.trim()) || [];

      for (const especialidad of especialidades) {
        for (const dia of this.dias_disponibles) {
          for (const hora of this.horarios) {
            await this.horariosService.insertarHorario({
              especialista_id: this.usuario.id,
              especialidad,
              dia,
              desde: hora,
              hasta: hora
            });
          }
        }
      }

      this.horariosGuardados = await this.horariosService.obtenerHorariosPorEspecialista(this.usuario.id);

      this.mensajeExito = 'Horarios guardados correctamente.';
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      this.mensajeError = 'Hubo un error al guardar los horarios.';
    }
  }
}
