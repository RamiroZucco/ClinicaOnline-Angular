import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  imports: [FormsModule, CommonModule, RouterModule]
})
export class RegistroComponent {
  tipo: string = '';
  form: any = {};
  imagen1: File | null = null;
  imagen2: File | null = null;
  mensaje: string = ''; 
  error: string = '';
  tipoSeleccionado: string | null = null;
  especialidades = ['Pediatría', 'Oftalmología', 'Cardiología', 'Traumatología', 'Dermatología'];
  mostrarCampoOtraEspecialidad = false;
  nuevaEspecialidad = '';

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
  }

  async registrar() {
    this.mensaje = '';
    this.error = '';

    if (this.tipoSeleccionado === 'paciente' && (!this.imagen1 || !this.imagen2)) {
      this.error = 'Debe seleccionar ambas imágenes';
      return;
    }
    if (this.tipoSeleccionado === 'especialista' && !this.imagen1) {
      this.error = 'Debe seleccionar una imagen';
      return;
    }

    try {
      const result = await this.authService.signUp(this.form.email, this.form.password);
      if (result.error) throw result.error;

      const id = this.authService.getUserIdFromSignUpResult(result);
      if (!id) throw new Error('No se pudo obtener el ID del usuario');

      if (this.mostrarCampoOtraEspecialidad && this.nuevaEspecialidad.trim()) {
        this.form.especialidades = this.nuevaEspecialidad.trim();
        if (!this.especialidades.includes(this.nuevaEspecialidad.trim())) {
          this.especialidades.push(this.nuevaEspecialidad.trim());
        }
      }

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
        this.router.navigateByUrl('/home');
      }

      this.form = {};
      this.tipoSeleccionado = null;
      this.imagen1 = null;
      this.imagen2 = null;
      this.mostrarCampoOtraEspecialidad = false;
      this.nuevaEspecialidad = '';
    } catch (error: any) {
      this.error = error.message || 'Error al registrar usuario';
    }
  }
}
