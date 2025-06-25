import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  imports: [FormsModule, CommonModule, RouterModule, RecaptchaModule]
})
export class RegistroComponent {
  tipo: string = '';
  form: any = {};
  imagen1: File | null = null;
  imagen2: File | null = null;
  mensaje: string = '';
  error: string = '';
  tipoSeleccionado: string | null = null;

  especialidadesDisponibles = [
    'Pediatría',
    'Oftalmología',
    'Cardiología',
    'Traumatología',
    'Dermatología'
  ];
  especialidadesSeleccionadas: string[] = [];
  mostrarCampoOtraEspecialidad = false;
  nuevaEspecialidad = '';

  recaptchaResolved = false;   
  recaptchaToken = '';           

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  handleFileUpload(event: any, index: number) {
    const file = event.target.files[0];
    if (index === 1) this.imagen1 = file;
    if (index === 2) this.imagen2 = file;
  }

  seleccionarTipo(tipo: string) {
    this.tipoSeleccionado = tipo;
    this.form = {};
    this.error = '';
    this.mensaje = '';
    this.imagen1 = null;
    this.imagen2 = null;
    this.mostrarCampoOtraEspecialidad = false;
    this.nuevaEspecialidad = '';
    this.especialidadesSeleccionadas = [];
    this.recaptchaResolved = false;
    this.recaptchaToken = '';
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

  onCaptchaResolved(token: string | null) {
    if (token) {
      this.recaptchaResolved = true;
      this.recaptchaToken = token;
    } else {
      this.recaptchaResolved = false;
      this.recaptchaToken = '';
    }
  }

  async registrar() {
    this.mensaje = '';
    this.error = '';

    if (!this.recaptchaResolved || !this.recaptchaToken) {
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

      this.mensaje = 'Usuario registrado exitosamente.';
      this.error = '';

      if (this.tipoSeleccionado === 'paciente') {
        const { error: signInError } = await this.authService.signIn(this.form.email, this.form.password);
        if (signInError) throw signInError;
        const usuarios = await this.userService.getAllUsers();
        const usuarioDB = usuarios.find((u: any) => u.email === this.form.email);
        if (usuarioDB) {
          localStorage.setItem('loggedInUserRole', usuarioDB.rol);
          localStorage.setItem('loggedInUser', usuarioDB.email);
          localStorage.setItem('nombreUsuario', usuarioDB.nombre);
          this.authService.setUserRole(usuarioDB.rol);
        }

        this.router.navigateByUrl('/home');
      }

      this.form = {};
      this.tipoSeleccionado = null;
      this.imagen1 = null;
      this.imagen2 = null;
      this.mostrarCampoOtraEspecialidad = false;
      this.nuevaEspecialidad = '';
      this.especialidadesSeleccionadas = [];
      this.recaptchaResolved = false;
      this.recaptchaToken = '';
    } catch (error: any) {
      this.error = error.message || 'Error al registrar usuario';
    }
  }
}
