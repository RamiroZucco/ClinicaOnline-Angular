import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SolicitarTurnoComponent implements OnInit {
  especialistasAll: any[] = [];
  especialistasFiltrados: any[] = [];
  pacientes: any[] = [];

  especialidadesBase = [
    { nombre: 'Oftalmología', img: 'assets/oftalmologia.png' },
    { nombre: 'Cardiología', img: 'assets/cardiologia.png' },
    { nombre: 'Dermatología', img: 'assets/dermatologia.png' },
    { nombre: 'Pediatría', img: 'assets/pediatria.png' }
  ];
  especialidades: { nombre: string, img: string }[] = [];

  especialidadSeleccionada: string = '';
  especialistaSeleccionado: any = null;
  diaSeleccionado: string = '';
  horariosDisponibles: any[] = [];
  horarioSeleccionado: any = null;

  user: any;
  esAdmin: boolean = false;
  pacienteSeleccionado: any = null;
  mensaje: string = '';

  diasDisponibles: { fecha: string, label: string, diaSemana: string }[] = [];


  constructor(
    private authService: AuthService,
    private userService: UserService,
    private turnosService: TurnosService
  ) {}

  async ngOnInit() {
    const session = await this.authService.getSession();
    this.user = session.data.session?.user;

    const usuarios = await this.userService.getAllUsers();
    const usuario = usuarios.find((u: any) => u.email === this.user.email);

    this.esAdmin = usuario.rol === 'admin';
    this.pacienteSeleccionado = usuario;

    this.especialistasAll = usuarios.filter(u => u.rol === 'especialista' && u.habilitado);

    const especialidadesSet = new Map<string, string>();

    for (const esp of this.especialidadesBase) {
      especialidadesSet.set(esp.nombre, esp.img);
    }
    for (const esp of this.especialistasAll) {
      if (esp.especialidades) {
        const arr = (esp.especialidades as string).split(',').map(x => x.trim());
        for (const nombreEsp of arr) {
          if (!especialidadesSet.has(nombreEsp)) {
            especialidadesSet.set(nombreEsp, 'assets/default.png');
          }
        }
      }
    }
    this.especialidades = Array.from(especialidadesSet.entries()).map(([nombre, img]) => ({ nombre, img }));

    if (this.esAdmin) {
      this.pacientes = usuarios.filter(u => u.rol === 'paciente');
    }
  }

  seleccionarEspecialidad(esp: string) {
    this.especialidadSeleccionada = esp;
    this.especialistaSeleccionado = null;
    this.diaSeleccionado = '';
    this.horariosDisponibles = [];
    this.horarioSeleccionado = null;
    this.diasDisponibles = [];

    this.especialistasFiltrados = this.especialistasAll.filter(e =>
      (e.especialidades || '').split(',').map((x: string) => x.trim()).includes(esp)
    );
  }

  async seleccionarProfesional(prof: any) {
    this.especialistaSeleccionado = prof;
    this.diaSeleccionado = '';
    this.horarioSeleccionado = null;
    this.horariosDisponibles = [];
    this.diasDisponibles = [];

    const horarios = await this.turnosService.getHorariosDelEspecialista(
      prof.id,
      this.especialidadSeleccionada
    );

    const turnosExistentes = await this.turnosService.obtenerTurnosPorUsuario(
      prof.id, 'especialista'
    );
    const turnosOcupados = new Set<string>();
    for (const turno of turnosExistentes) {
      if (['pendiente', 'aceptado', 'realizado'].includes(turno.estado)) {
        const clave = `${turno.fecha}-${turno.hora.slice(0, 5)}`;
        turnosOcupados.add(clave);
      }
    }

    const hoy = new Date();
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let diasUnicos: { fecha: string, label: string, diaSemana: string }[] = [];

    for (let i = 0; i < 15; i++) {
      const dia = new Date();
      dia.setDate(hoy.getDate() + i);
      const nombreDia = diasSemana[dia.getDay()];
      const fechaStr = dia.toISOString().split('T')[0];
      const horariosDelDia = horarios.filter((h: any) => h.dia === nombreDia);
      if (horariosDelDia.length > 0) {
        const disponible = horariosDelDia.some((h: any) => {
          const clave = `${fechaStr}-${h.desde.slice(0, 5)}`;
          return !turnosOcupados.has(clave);
        });
        if (disponible) {
          diasUnicos.push({
            fecha: fechaStr,
            label: this.formatearFechaLarga(fechaStr),
            diaSemana: nombreDia
          });
        }
      }
    }
    this.diasDisponibles = diasUnicos;
  }

  async seleccionarDia(fecha: string, diaSemana: string) {
    this.diaSeleccionado = fecha;
    this.horarioSeleccionado = null;
    const horarios = await this.turnosService.getHorariosDelEspecialista(
      this.especialistaSeleccionado.id,
      this.especialidadSeleccionada
    );
    const horariosDelDia = horarios.filter((h: any) => h.dia === diaSemana);

    const turnosExistentes = await this.turnosService.obtenerTurnosPorUsuario(
      this.especialistaSeleccionado.id, 'especialista'
    );
    const turnosOcupados = new Set<string>();
    for (const turno of turnosExistentes) {
      if (['pendiente', 'aceptado', 'realizado'].includes(turno.estado)) {
        const clave = `${turno.fecha}-${turno.hora.slice(0, 5)}`;
        turnosOcupados.add(clave);
      }
    }

    this.horariosDisponibles = horariosDelDia.map((h: any) => {
      const hora = h.desde.slice(0, 5);
      const clave = `${fecha}-${hora}`;
      return {
        hora,
        ocupado: turnosOcupados.has(clave)
      };
    });
  }

  seleccionarHorario(h: any) {
    if (h.ocupado) return;
    this.horarioSeleccionado = h;
  }

  async solicitarTurno() {
    if (!this.horarioSeleccionado) return;

    const paciente = this.pacienteSeleccionado;
    const nuevoTurno = {
      paciente_id: paciente.id,
      especialista_id: this.especialistaSeleccionado.id,
      especialidad: this.especialidadSeleccionada,
      fecha: this.diaSeleccionado,
      hora: this.horarioSeleccionado.hora,
      estado: 'pendiente'
    };

    await this.turnosService.crearTurno(nuevoTurno);

    this.mensaje = 'Turno solicitado correctamente.';
    this.horarioSeleccionado = null;
    setTimeout(() => this.mensaje = '', 5000);
  }

  getEspecialidadImg(nombre: string): string {
    const esp = this.especialidades.find(e => e.nombre === nombre);
    return esp?.img || 'assets/default.png';
  }

  formatearFechaLarga(fecha: string): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const [year, mes, dia] = fecha.split('-');
    return `${dia} de ${meses[parseInt(mes, 10) - 1]}`;
  }
}
