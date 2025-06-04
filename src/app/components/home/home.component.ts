import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  userEmail: string = '';

  ngOnInit(): void {
    const user = localStorage.getItem('loggedInUser');
    this.userEmail = user ? user : 'usuario';
  }
}
