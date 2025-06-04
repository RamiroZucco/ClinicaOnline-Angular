import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,  
  imports: [RouterModule, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']  
})
export class AppComponent implements OnInit {
  userEmail: string | null = null;
  userRole: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.authService.userEmail$.subscribe(email => {
      this.userEmail = email;
    });

    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
    });

    const storedEmail = localStorage.getItem('loggedInUserEmail');
    if (storedEmail) this.userEmail = storedEmail;

    const storedRole = localStorage.getItem('loggedInUserRole');
    if (storedRole) this.userRole = storedRole;
  }

  logout() {
    this.authService.signOut();
    this.userEmail = '';
    this.userRole = '';
    localStorage.clear();
    this.router.navigateByUrl('/');
  }
}