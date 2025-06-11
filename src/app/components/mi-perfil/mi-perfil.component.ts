import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css'],
  imports: [CommonModule] 
})
export class MiPerfilComponent implements OnInit {
  usuario: any;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    const session = await this.authService.getSession();
    const email = session.data.session?.user.email;
    const users = await this.userService.getAllUsers();
    this.usuario = users.find(u => u.email === email);
  }
}
