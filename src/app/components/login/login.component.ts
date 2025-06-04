import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule
  ]
})
export class LoginComponent {
  formLogin!: FormGroup;
  isLoading: boolean = false;
  errorMsg: string = '';
  emailError: string = '';
  passError: string = '';

  quickUsers = [
    { tipo: 'admin', img: 'assets/perfiles/admin.png', email: 'zuccoramiro@gmail.com', pass: '123456' },
    { tipo: 'paciente', img: 'assets/perfiles/marta.png', email: 'marta@gmail.com', pass: '123456' },
    { tipo: 'paciente', img: 'assets/perfiles/pedro.png', email: 'pedro@gmail.com', pass: '123456' },
    { tipo: 'paciente', img: 'assets/perfiles/mauro.png', email: 'mauro@gmail.com', pass: '123456' },
    { tipo: 'especialista', img: 'assets/perfiles/leandro.png', email: 'leandro@gmail.com', pass: '123456' },
    { tipo: 'especialista', img: 'assets/perfiles/marcela.png', email: 'marcela@gmail.com', pass: '123456' }
  ];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.formLogin.get('email')!;
  }

  get pass() {
    return this.formLogin.get('pass')!;
  }

  async login() {
    if (this.formLogin.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';
    this.emailError = '';
    this.passError = '';

    const { email, pass } = this.formLogin.value;

    try {
      const res: any = await this.authService.signIn(email, pass);
      const user = res?.data?.user;

      if (!user) {
        this.emailError = 'Correo o contraseña incorrectos';
        this.passError = 'Correo o contraseña incorrectos';
        return;
      }

      const usuarios = await this.userService.getAllUsers();
      const usuarioDB = usuarios.find((u: any) => u.email === email);

      if (!usuarioDB) {
        this.emailError = 'El correo no está registrado';
        return;
      }

      if (usuarioDB.rol === 'especialista' && !usuarioDB.habilitado) {
        await this.authService.signOut();
        this.passError = 'El especialista aún no fue habilitado por el administrador';
        return;
      }

      localStorage.setItem('loggedInUserRole', usuarioDB.rol);
      localStorage.setItem('loggedInUser', usuarioDB.email);
      localStorage.setItem('nombreUsuario', usuarioDB.nombre);
      this.authService.setUserRole(usuarioDB.rol);
      this.router.navigateByUrl('/home');
    } catch (error: any) {
      if (error?.message?.includes('Invalid login credentials')) {
        this.passError = 'Correo o contraseña incorrectos';
      } else {
        this.errorMsg = error?.message || 'Error inesperado';
      }
    } finally {
      this.isLoading = false;
    }
  }

  autocompletarUsuario(user: any) {
    this.formLogin.setValue({ email: user.email, pass: user.pass });
  }
}