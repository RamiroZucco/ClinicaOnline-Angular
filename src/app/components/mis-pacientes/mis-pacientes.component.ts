import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-pacientes',
  templateUrl: './mis-pacientes.component.html',
  styleUrls: ['./mis-pacientes.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class MisPacientesComponent implements OnInit {
  pacientes: any[] = [];
  usuarioLogueado: any = null;
  pacienteSeleccionado: any = null;
  historiaTurnos: any[] = [];
  todosTurnos: any[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private turnosService: TurnosService
  ) {}

  async ngOnInit() {

    const session = await this.authService.getSession();
    const email = session.data.session?.user.email;
    const usuarios = await this.userService.getAllUsers();
    this.usuarioLogueado = usuarios.find(u => u.email === email);

    const turnos = await this.turnosService.obtenerTurnosPorUsuario(this.usuarioLogueado.id, 'especialista');
    this.todosTurnos = turnos.filter(t => t.estado === 'realizado');
    const pacienteIds = [...new Set(this.todosTurnos.map(t => t.paciente_id))];

    this.pacientes = usuarios.filter(u => pacienteIds.includes(u.id) && u.rol === 'paciente');
  }

  getUltimosTurnos(pacienteId: string) {
    const turnosPaciente = this.todosTurnos
      .filter(t => t.paciente_id === pacienteId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
    return turnosPaciente.slice(0, 3);
  }

  async verHistoriaClinica(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.historiaTurnos = this.todosTurnos
      .filter(t => t.paciente_id === paciente.id && t.estado === 'realizado')
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));
  }

  getExtraArray(extra: any): { clave: string, valor: string }[] {
    if (!extra) return [];
    return Object.entries(extra).map(([clave, valor]) => ({
      clave,
      valor: String(valor)
    }));
  }
}
