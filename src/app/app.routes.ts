import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { MisTurnosPacienteComponent } from './components/mis-turnos-paciente/mis-turnos-paciente.component';
import { MisTurnosEspecialistaComponent } from './components/mis-turnos-especialista/mis-turnos-especialista.component';
import { TurnosAdminComponent } from './components/turnos-admin/turnos-admin.component';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { MisHorariosComponent } from './components/mis-horarios/mis-horarios.component';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'mis-turnos-paciente', component: MisTurnosPacienteComponent },
  { path: 'mis-turnos-especialista', component: MisTurnosEspecialistaComponent },
  { path: 'turnos-admin', component: TurnosAdminComponent },
  { path: 'solicitar-turno', component: SolicitarTurnoComponent },
  { path: 'mis-horarios', component: MisHorariosComponent },
  { path: 'mi-perfil', component: MiPerfilComponent }
];