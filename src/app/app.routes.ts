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
import { MisPacientesComponent } from './components/mis-pacientes/mis-pacientes.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, data: { animation: 'Home' } },
  { path: 'home', component: HomeComponent, data: { animation: 'Home' } },
  { path: 'login', component: LoginComponent, data: { animation: 'Login' } },
  { path: 'registro', component: RegistroComponent, data: { animation: 'Registro' } },
  { path: 'usuarios', component: UsuariosComponent, data: { animation: 'Usuarios' } },
  { path: 'mis-turnos-paciente', component: MisTurnosPacienteComponent, data: { animation: 'TurnosPaciente' } },
  { path: 'mis-turnos-especialista', component: MisTurnosEspecialistaComponent, data: { animation: 'TurnosEspecialista' } },
  { path: 'turnos-admin', component: TurnosAdminComponent, data: { animation: 'TurnosAdmin' } },
  { path: 'solicitar-turno', component: SolicitarTurnoComponent, data: { animation: 'SolicitarTurno' } },
  { path: 'mis-horarios', component: MisHorariosComponent, data: { animation: 'MisHorarios' } },
  { path: 'mi-perfil', component: MiPerfilComponent },
  { path: 'mis-pacientes', component: MisPacientesComponent }
];