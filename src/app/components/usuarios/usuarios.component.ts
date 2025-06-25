import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecaptchaModule } from 'ng-recaptcha';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TurnosService } from '../../services/turnos.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, RecaptchaModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioSeleccionado: any = null;

  tipoSeleccionado: string | null = null;
  form: any = {};
  imagen1: File | null = null;
  imagen2: File | null = null;
  mensaje: string = '';
  error: string = '';
  especialidadesDisponibles = ['Pediatría', 'Oftalmología', 'Cardiología', 'Traumatología', 'Dermatología'];
  mostrarCampoOtraEspecialidad = false;
  nuevaEspecialidad = '';
  especialidadesSeleccionadas: string[] = [];

  recaptchaToken: string = '';
  recaptchaResolved: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private turnosService: TurnosService 
  ) {}

  async ngOnInit() {
    const rol = localStorage.getItem('loggedInUserRole');
    if (rol !== 'admin') {
      this.router.navigateByUrl('/usuarios');
      return;
    }
    await this.cargarUsuarios();
  }

  async descargarExcelUsuario(usuario: any) {
    let turnos: any[] = [];
    if (usuario.rol === 'paciente') {
      turnos = await this.turnosService.obtenerTurnosPorUsuario(usuario.id, 'paciente');
    }
    const getNombreEspecialista = (id: string) => {
      const espec = this.usuarios.find(u => u.id === id);
      if (!espec) return id;
      return `${espec.nombre} ${espec.apellido}`;
    };

    let dataUsuario: any[] = [];
    let dataTurnos: any[] = [];

    if (usuario.rol === 'especialista') {
      dataUsuario = [{
        Nombre: usuario.nombre,
        Apellido: usuario.apellido,
        Email: usuario.email,
        Edad: usuario.edad,
        DNI: usuario.dni,
        Especialidades: usuario.especialidades ?? ''
      }];
    }
    else if (usuario.rol === 'paciente') {
      dataUsuario = [{
        Nombre: usuario.nombre,
        Apellido: usuario.apellido,
        Email: usuario.email,
        Edad: usuario.edad,
        DNI: usuario.dni,
        ObraSocial: usuario.obra_social ?? ''
      }];
      dataTurnos = turnos.map(t => ({
        Fecha: t.fecha,
        Hora: t.hora,
        Especialidad: t.especialidad,
        Estado: t.estado,
        Profesional: getNombreEspecialista(t.especialista_id)
      }));
    }
    else if (usuario.rol === 'admin') {
      dataUsuario = [{
        Nombre: usuario.nombre,
        Apellido: usuario.apellido,
        Email: usuario.email,
        Edad: usuario.edad,
        DNI: usuario.dni,
        Rol: usuario.rol
      }];
    }
    const ws1 = XLSX.utils.json_to_sheet(dataUsuario, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Datos');
    if (usuario.rol === 'paciente' && dataTurnos.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(dataTurnos, { skipHeader: false });
      XLSX.utils.book_append_sheet(wb, ws2, 'Turnos');
    }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `usuario_${usuario.nombre}_${usuario.apellido}.xlsx`);
  }

  descargarExcelGeneral() {
    const data = this.usuarios.map(u => ({
      Nombre: u.nombre,
      Apellido: u.apellido,
      Email: u.email,
      Edad: u.edad,
      Rol: u.rol,
      DNI: u.dni,
      Habilitado: u.habilitado ? 'Sí' : 'No',
      ObraSocial: u.obra_social ?? '',
      Especialidades: u.especialidades ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'usuarios_general.xlsx');
  }

  onCaptchaResolved(token: string | null) {
    if (token) {
      this.recaptchaResolved = true;
      this.recaptchaToken = token;
    } else {
      this.recaptchaResolved = false;
      this.recaptchaToken = '';
    }
  }

  toggleEspecialidad(especialidad: string, event: any) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.especialidadesSeleccionadas.includes(especialidad)) {
        this.especialidadesSeleccionadas.push(especialidad);
      }
    } else {
      this.especialidadesSeleccionadas = this.especialidadesSeleccionadas.filter(e => e !== especialidad);
    }
  }

  toggleOtraEspecialidad(event: any) {
    const checked = (event.target as HTMLInputElement).checked;
    this.mostrarCampoOtraEspecialidad = checked;
    if (!checked) {
      this.nuevaEspecialidad = '';
    }
  }

  async cargarUsuarios() {
    try {
      this.usuarios = await this.userService.getAllUsers();
    } catch (error: any) {
      alert('Error al cargar usuarios: ' + (error?.message || error));
    }
  }

  seleccionar(usuario: any) {
    this.usuarioSeleccionado = usuario;
  }

  async habilitar(usuario: any) {
    try {
      await this.userService.updateUser(usuario.id, { habilitado: true });
      usuario.habilitado = true;
    } catch (error: any) {
      alert('Error al habilitar especialista: ' + (error?.message || error));
    }
  }

  async deshabilitar(usuario: any) {
    try {
      await this.userService.updateUser(usuario.id, { habilitado: false });
      usuario.habilitado = false;
    } catch (error: any) {
      alert('Error al deshabilitar especialista: ' + (error?.message || error));
    }
  }

  seleccionarTipo(tipo: string) {
    this.tipoSeleccionado = tipo;
    this.form = {};
    this.imagen1 = null;
    this.imagen2 = null;
    this.error = '';
    this.mensaje = '';
    this.mostrarCampoOtraEspecialidad = false;
    this.nuevaEspecialidad = '';
    this.especialidadesSeleccionadas = [];
    this.recaptchaToken = '';
    this.recaptchaResolved = false;
  }

  cancelarRegistro() {
    this.tipoSeleccionado = null;
    this.form = {};
    this.imagen1 = null;
    this.imagen2 = null;
    this.mensaje = '';
    this.error = '';
    this.recaptchaToken = '';
    this.recaptchaResolved = false;
  }

  handleFileUpload(event: any, index: number = 1) {
    const file = event.target.files[0];
    if (index === 1) this.imagen1 = file;
    if (index === 2) this.imagen2 = file;
  }

  async registrar() {
    this.mensaje = '';
    this.error = '';

    if (!this.recaptchaToken) {
      this.error = 'Debe completar la verificación captcha';
      return;
    }

    if (this.tipoSeleccionado === 'paciente' && (!this.imagen1 || !this.imagen2)) {
      this.error = 'Debe seleccionar ambas imágenes';
      return;
    }
    if (this.tipoSeleccionado === 'especialista' && !this.imagen1) {
      this.error = 'Debe seleccionar una imagen';
      return;
    }

    if (this.tipoSeleccionado === 'especialista') {
      let especialidadesFinal: string[] = [...this.especialidadesSeleccionadas];

      if (this.mostrarCampoOtraEspecialidad && this.nuevaEspecialidad.trim()) {
        especialidadesFinal.push(this.nuevaEspecialidad.trim());
        if (!this.especialidadesDisponibles.includes(this.nuevaEspecialidad.trim())) {
          this.especialidadesDisponibles.push(this.nuevaEspecialidad.trim());
        }
      }
      if (especialidadesFinal.length === 0) {
        this.error = 'Debe seleccionar al menos una especialidad';
        return;
      }
      this.form.especialidades = especialidadesFinal.join(', ');
    }

    try {
      const result = await this.authService.signUp(this.form.email, this.form.password);
      if (result.error) throw result.error;

      const id = this.authService.getUserIdFromSignUpResult(result);
      if (!id) throw new Error('No se pudo obtener el ID del usuario');

      const { password, ...rest } = this.form;
      const userData = {
        id,
        ...rest,
        rol: this.tipoSeleccionado,
        habilitado: this.tipoSeleccionado === 'paciente'
      };

      await this.userService.addUser(userData, this.imagen1 ?? undefined, this.imagen2 ?? undefined);
      this.mensaje = 'Usuario registrado correctamente.';
      await this.cargarUsuarios();
      this.cancelarRegistro();
    } catch (error: any) {
      this.error = error.message || 'Error al registrar usuario';
    }
  }

  alClickearUsuario(usuario: any) {
    this.seleccionar(usuario);
    this.descargarExcelUsuario(usuario);
  }

}
